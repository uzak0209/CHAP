package handlers

import (
	"api/db"
	"api/types"
	"context"
	"encoding/json"
	"net/http"
	"os"
	"regexp"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

var (
	cachedHeatmapJSON string
	lastUpdate        time.Time
	cacheMutex        sync.Mutex
)

const cacheDuration = 24 * time.Hour // 1日
func GetSocialSensingHeatmap(c *gin.Context) {
	cacheMutex.Lock()
	defer cacheMutex.Unlock()

	// キャッシュが有効ならそれを返す
	if time.Since(lastUpdate) < cacheDuration && cachedHeatmapJSON != "" {
		c.Data(http.StatusOK, "application/json", []byte(cachedHeatmapJSON))
		return
	}

	// DBから取得
	var posts []types.Post
	if err := db.SafeDB().Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch posts"})
		return
	}

	// Geminiに投げる
	var heatmap []types.HeatmapPoint
	for _, p := range posts {
		heatmap = append(heatmap, types.HeatmapPoint{
			Lat:   p.Coordinate.Lat,
			Lng:   p.Coordinate.Lng,
			Value: 1,
		})
	}
	summary, geojson, err := getGeminiHeatmapSummaryAndGeoJSON(heatmap)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gemini error"})
		return
	}

	// キャッシュ更新
	response := map[string]interface{}{
		"summary": summary,
		"geojson": geojson,
	}
	respBytes, _ := json.Marshal(response)
	cachedHeatmapJSON = string(respBytes)
	lastUpdate = time.Now()
	println("Updated heatmap cache at", respBytes)

	c.Data(http.StatusOK, "application/json", respBytes)
}

func getGeminiHeatmapSummaryAndGeoJSON(heatmap []types.HeatmapPoint) (string, map[string]interface{}, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return "", nil, nil
	}
	prompt := `
以下の投稿データから、ヒートマップ表示に適したGeoJSON FeatureCollection形式のJSONを生成してください。
また、このヒートマップが何について分析したものか（例：降水量、人の流動量など）を一言で日本語で示してください。
可能な限り全国を埋め尽くすように、点の数を多くしてください。もし投稿データが少ない場合は、傾向を推測して適切に補間した点を追加しても構いません。具体的にいうと点は10000個以上を想定しています。またmagをかなり大きくしてもいいです。日本国内以外に点を置かないでください。投稿内容から何についてのヒートマップを作るか参考にしてほしいです。
各Featureは "geometry": { "type": "Point", "coordinates": [lng, lat] } とし、"properties": { "mag": value } で重みを表現してください。
出力例:
{
  "summary": "人の流動量",
  "geojson": {
    "type": "FeatureCollection",
    "features": [
      { "type": "Feature", "geometry": { "type": "Point", "coordinates": [139.7, 35.6] }, "properties": { "mag": 3 } }
    ]
  }
}
`
	data, _ := json.Marshal(heatmap)
	prompt += "投稿データ: " + string(data)

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return "", nil, err
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-2.0-flash-001")
	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", nil, err
	}

	// レスポンスからテキスト抽出
	raw := ""
	for _, part := range resp.Candidates {
		for _, content := range part.Content.Parts {
			if text, ok := content.(genai.Text); ok {
				raw += string(text)
			}
		}
	}

	// 正規表現でJSONオブジェクト部分だけ抽出
	re := regexp.MustCompile(`\{[\s\S]*\}`)
	jsonObj := re.FindString(raw)
	if jsonObj == "" {
		return "", nil, nil
	}

	// summaryとgeojsonをパース
	var result struct {
		Summary string                 `json:"summary"`
		GeoJSON map[string]interface{} `json:"geojson"`
	}
	if err := json.Unmarshal([]byte(jsonObj), &result); err != nil {
		return "", nil, err
	}
	return result.Summary, result.GeoJSON, nil
}
