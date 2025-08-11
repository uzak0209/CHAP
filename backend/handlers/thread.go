package handlers

import (
	"api/db"
	"api/types"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func EditThread(c *gin.Context) {
	id := c.Param("id")
	var thread types.Thread

	// GORMでスレッドを取得
	result := db.SafeDB().Where("id = ?", id).First(&thread)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "thread not found"})
		return
	}

	// リクエストボディから更新内容を取得
	if err := c.ShouldBindJSON(&thread); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json format"})
		return
	}

	// 更新日時を現在の時刻に設定
	thread.UpdatedAt = time.Now()

	// GORMで更新
	if err := db.SafeDB().Save(&thread).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update thread"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"thread": thread})
}

// GetThread handles GET /thread/:id
func GetThread(c *gin.Context) {
	id := c.Param("id")
	var thread types.Thread

	result := db.SafeDB().Where("id = ?", id).First(&thread)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "thread not found"})
		return
	}

	c.JSON(http.StatusOK, thread)
}

// CreateThread handles POST /thread
func CreateThread(c *gin.Context) {
	var thread types.Thread
	if err := c.ShouldBindJSON(&thread); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json format"})
		return
	}

	// JWT認証からuser_idを取得
	userID := c.GetString("user_id")
	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id format"})
		return
	}

	// ThreadのUserIDを設定（他のフィールドはリクエストから取得）
	thread.UserID = uid
	thread.ID = 0       // 自動インクリメント用に0に設定
	thread.Valid = true // デフォルトで有効に設定
	// 明示的に現在時刻を設定（gormタグと併用で確実に）
	if thread.CreatedAt.IsZero() {
		thread.CreatedAt = time.Now()
	}
	if thread.UpdatedAt.IsZero() {
		thread.UpdatedAt = time.Now()
	}
	// UsersテーブルからユーザーIDに該当するusernameを取得
	var user types.User
	if err := db.SafeDB().Where("id = ?", uid).Select("name").First(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user info"})
		return
	}
	thread.Username = user.Name

	// GORMでSupabaseのPostgreSQLに保存
	result := db.SafeDB().Create(&thread)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create thread"})
		return
	}

	c.JSON(http.StatusCreated, thread)
}

// GetThreadDetails returns a thread with its replies (comments)
// GET /thread/:id/details
func GetThreadDetails(c *gin.Context) {
	id := c.Param("id")

	// Fetch thread
	var thread types.Thread
	if err := db.SafeDB().Where("id = ?", id).First(&thread).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "thread not found"})
		return
	}

	// Fetch replies (comments) by foreign key
	var replies []types.Comment
	// If conversion to uint is needed for safety
	if _, err := strconv.ParseUint(id, 10, 64); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid thread id"})
		return
	}
	if err := db.SafeDB().Where("thread_id = ?", id).Order("created_at ASC").Find(&replies).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load replies"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"thread":  thread,
		"replies": replies,
	})
}
func GetAllThreads(c *gin.Context) {
	var threads []types.Thread
	var userCoordinate types.Coordinate
	dbConn := db.SafeDB()
	if err := c.ShouldBindJSON(&userCoordinate); err != nil {
		// coordinateが提供されない場合、entertainment/disasterのみをDBから取得
		if err := dbConn.Where("category IN (?)", []string{"entertainment", "disaster"}).Find(&threads).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch threads"})
			return
		}
	} else {
		// データベース側でカテゴリ別フィルタリング処理
		if err := dbConn.Where(`
            category IN ('entertainment', 'disaster') OR 
            (category = 'communication' AND 
             lat BETWEEN ? AND ? AND 
             lng BETWEEN ? AND ?)
        `,
			userCoordinate.Lat-types.AROUND, userCoordinate.Lat+types.AROUND,
			userCoordinate.Lng-types.AROUND, userCoordinate.Lng+types.AROUND,
		).Find(&threads).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch posts"})
			return
		}
	}
	c.JSON(http.StatusOK, threads)
}
func GetUpdateThread(c *gin.Context) {
	from := c.Param("from")
	var threads []types.Thread

	// from を数値に変換（例：Unix timestamp）
	fromTime, err := strconv.ParseInt(from, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid 'from' parameter"})
		return
	}

	// 条件に合う投稿を取得（updated_at > from）
	if err := db.SafeDB().
		Where("updated_at > ?", time.Unix(fromTime, 0)).
		Find(&threads).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch updated threads"})
		return
	}

	c.JSON(http.StatusOK, threads)
}
func DeleteThread(c *gin.Context) {
	id := c.Param("id")
	var thread types.Thread

	result := db.SafeDB().Where("id = ?", id).First(&thread)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "thread not found"})
		return
	}

	if err := db.SafeDB().Delete(&thread).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete thread"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "thread deleted"})
}
