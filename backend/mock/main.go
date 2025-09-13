package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

type OpenAIRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OpenAIResponse struct {
	Choices []Choice `json:"choices"`
}

type Choice struct {
	Message Message `json:"message"`
}

type MockData struct {
	Type       string     `json:"type"`
	Content    string     `json:"content"`
	Category   string     `json:"category"`
	Coordinate Coordinate `json:"coordinate"`
	Like       int        `json:"like"`
	Tags       []string   `json:"tags"`
	Valid      bool       `json:"valid"`
	CreatedAt  string     `json:"created_at"`
	UpdatedAt  string     `json:"updated_at"`
	EventDate  *string    `json:"event_date,omitempty"`
}

type Coordinate struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

func main() {
	// .envファイルを読み込み
	err := godotenv.Load("./.env")
	if err != nil {
		log.Fatal("Error loading .env file:", err)
	}

	// Gemini API Key（環境変数から取得）
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Fatal("GEMINI_API_KEY environment variable is required")
	}

	// データベース接続
	db, err := connectDB()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// ダミーユーザーを作成
	userID, username, err := createDummyUser(db)
	if err != nil {
		log.Fatal("Failed to create dummy user:", err)
	}

	// LLMからモックデータを生成
	mockDataList, err := generateMockData(apiKey)
	if err != nil {
		log.Fatal("Failed to generate mock data:", err)
	}

	// データベースに保存
	err = saveMockDataToDB(db, mockDataList, userID, username)
	if err != nil {
		log.Fatal("Failed to save mock data to database:", err)
	}

	fmt.Printf("Successfully saved %d mock data entries to AWS RDS\n", len(mockDataList))
}

func connectDB() (*sql.DB, error) {
	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=require",
		host, user, password, dbname, port)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}

	err = db.Ping()
	if err != nil {
		return nil, err
	}

	fmt.Println("Successfully connected to AWS RDS")
	return db, nil
}

func createDummyUser(db *sql.DB) (uuid.UUID, string, error) {
	userID := uuid.New()
	username := "MockDataUser"
	email := "mockuser@example.com"
	now := time.Now()
	zeroTime := time.Time{}

	// まず既存のユーザーを確認
	var existingID uuid.UUID
	checkQuery := `SELECT id FROM users WHERE email = $1 LIMIT 1`
	err := db.QueryRow(checkQuery, email).Scan(&existingID)

	if err == sql.ErrNoRows {
		// ユーザーが存在しない場合は作成
		insertQuery := `
            INSERT INTO users (id, name, email, password, login_type, created_at, updated_at, valid, deleted_at, image)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `

		_, err = db.Exec(insertQuery,
			userID,
			username,
			email,
			"$2a$10$dummy.hash.for.mock.data.only",
			"email",
			now,
			now,
			true,
			zeroTime,
			"",
		)

		if err != nil {
			return uuid.Nil, "", fmt.Errorf("failed to create user: %v", err)
		}

		fmt.Printf("Created new dummy user: %s (ID: %s)\n", username, userID)
		return userID, username, nil
	} else if err != nil {
		return uuid.Nil, "", fmt.Errorf("error checking existing user: %v", err)
	} else {
		// 既存のユーザーを使用
		fmt.Printf("Using existing dummy user (ID: %s)\n", existingID)
		return existingID, username, nil
	}
}

func generateMockData(apiKey string) ([]MockData, error) {
	prompt := `
日本のSNSアプリ用のモックデータを50件生成してください。

【要求事項】
- event、post、threadを均等に配分
- カテゴリ: entertainment、disaster、communicationを均等配分
- 位置: 日本全国
- 日付: 2025年8月〜11月の範囲
- 必ず有効なJSON配列で回答

【出力形式】
[
{"type": "event", "content": "夏祭り開催", "category": "entertainment", "coordinate": {"lat": 35.6762, "lng": 139.6503}, "like": 15, "tags": ["祭り", "夏"], "valid": true, "created_at": "2025-08-20T10:00:00Z", "updated_at": "2025-08-20T10:00:00Z", "event_date": "2025-09-15T14:00:00Z"},
{"type": "post", "content": "今日は晴れです", "category": "communication", "coordinate": {"lat": 34.6937, "lng": 135.5023}, "like": 8, "tags": ["天気", "日常"], "valid": true, "created_at": "2025-08-25T18:30:00Z", "updated_at": "2025-08-25T18:30:00Z"},
{"type": "thread", "content": "防災について話しましょう", "category": "disaster", "coordinate": {"lat": 43.0642, "lng": 141.3469}, "like": 25, "tags": ["防災", "安全"], "valid": true, "created_at": "2025-08-15T09:00:00Z", "updated_at": "2025-08-15T09:00:00Z"}
]

50件すべて生成し、有効なJSON配列のみ返してください。
`

	reqBody := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]string{
					{"text": prompt},
				},
			},
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=%s", apiKey)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}

	var geminiResp map[string]interface{}
	err = json.Unmarshal(body, &geminiResp)
	if err != nil {
		return nil, err
	}

	// Geminiのレスポンスから生成されたテキストを抽出
	candidates, ok := geminiResp["candidates"].([]interface{})
	if !ok || len(candidates) == 0 {
		return nil, fmt.Errorf("no candidates in response")
	}

	candidate := candidates[0].(map[string]interface{})
	content := candidate["content"].(map[string]interface{})
	parts := content["parts"].([]interface{})
	part := parts[0].(map[string]interface{})
	generatedText := part["text"].(string)

	fmt.Println("Generated text length:", len(generatedText))
	fmt.Println("Generated text preview:", generatedText[:min(200, len(generatedText))])

	// 生成されたJSONをパース
	var mockDataList []MockData
	cleanJSON := extractJSON(generatedText)

	// デバッグ用に常にファイルに保存
	os.WriteFile("debug_response.txt", []byte(generatedText), 0644)
	os.WriteFile("debug_clean.json", []byte(cleanJSON), 0644)

	err = json.Unmarshal([]byte(cleanJSON), &mockDataList)
	if err != nil {
		fmt.Printf("Raw response saved to debug_response.txt\n")
		fmt.Printf("Cleaned JSON saved to debug_clean.json\n")
		return nil, fmt.Errorf("failed to parse generated JSON: %v", err)
	}

	fmt.Printf("Successfully parsed %d mock data entries\n", len(mockDataList))
	return mockDataList, nil
}

func extractJSON(text string) string {
	// 複数の方法でJSONを抽出を試行

	// 方法1: 通常の[]で囲まれた部分を抽出
	start := strings.Index(text, "[")
	end := strings.LastIndex(text, "]")

	if start != -1 && end != -1 && end > start {
		jsonStr := text[start : end+1]

		// 改行や余分な空白を削除
		jsonStr = strings.ReplaceAll(jsonStr, "\n", "")
		jsonStr = strings.ReplaceAll(jsonStr, "\r", "")

		// JSONブロック内の```を削除
		jsonStr = strings.ReplaceAll(jsonStr, "```", "")
		jsonStr = strings.ReplaceAll(jsonStr, "json", "")

		return jsonStr
	}

	// 方法2: ```json ブロックを探す
	jsonStart := strings.Index(text, "```json")
	if jsonStart != -1 {
		jsonStart = strings.Index(text[jsonStart:], "[") + jsonStart
		jsonEnd := strings.LastIndex(text, "]")
		if jsonStart != -1 && jsonEnd != -1 && jsonEnd > jsonStart {
			return text[jsonStart : jsonEnd+1]
		}
	}

	// 方法3: そのまま返す
	return text
}

func saveMockDataToDB(db *sql.DB, mockDataList []MockData, userID uuid.UUID, username string) error {
	for _, data := range mockDataList {
		// タグをPostgreSQL配列形式に変換
		tagsArray := fmt.Sprintf("{%s}", strings.Join(data.Tags, ","))

		// created_atとupdated_atをパース
		createdAt, err := time.Parse(time.RFC3339, data.CreatedAt)
		if err != nil {
			createdAt = time.Now()
		}

		updatedAt, err := time.Parse(time.RFC3339, data.UpdatedAt)
		if err != nil {
			updatedAt = time.Now()
		}

		zeroTime := time.Time{}

		switch data.Type {
		case "event":
			var eventDate time.Time
			if data.EventDate != nil {
				parsedEventDate, err := time.Parse(time.RFC3339, *data.EventDate)
				if err == nil {
					eventDate = parsedEventDate
				} else {
					eventDate = time.Now().AddDate(0, 0, 7) // デフォルトで1週間後
				}
			} else {
				eventDate = time.Now().AddDate(0, 0, 7)
			}

			query := `
                INSERT INTO events (type, created_at, updated_at, username, user_id, lat, lng, category, content, valid, "like", tags, event_date, deleted_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            `
			_, err = db.Exec(query,
				"event",
				createdAt,
				updatedAt,
				username,
				userID,
				data.Coordinate.Lat,
				data.Coordinate.Lng,
				data.Category,
				data.Content,
				data.Valid,
				data.Like,
				tagsArray,
				eventDate,
				zeroTime,
			)

		case "post":
			query := `
                INSERT INTO posts (type, created_at, updated_at, user_id, username, lat, lng, category, content, valid, "like", tags, deleted_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            `
			_, err = db.Exec(query,
				"post",
				createdAt,
				updatedAt,
				userID,
				username,
				data.Coordinate.Lat,
				data.Coordinate.Lng,
				data.Category,
				data.Content,
				data.Valid,
				data.Like,
				tagsArray,
				zeroTime,
			)

		case "thread":
			query := `
                INSERT INTO threads (type, created_at, updated_at, username, user_id, lat, lng, category, content, valid, "like", tags, deleted_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            `
			_, err = db.Exec(query,
				"thread",
				createdAt,
				updatedAt,
				username,
				userID,
				data.Coordinate.Lat,
				data.Coordinate.Lng,
				data.Category,
				data.Content,
				data.Valid,
				data.Like,
				tagsArray,
				zeroTime,
			)
		}

		if err != nil {
			fmt.Printf("Failed to insert %s: %v\n", data.Type, err)
			continue
		}

		fmt.Printf("✓ Inserted %s: %s\n", data.Type, data.Content[:min(30, len(data.Content))])
	}

	return nil
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
