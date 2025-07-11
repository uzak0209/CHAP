package handlers

import (
	"api/db"
	"api/types"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
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
	thread.UpdatedTime = time.Now()

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
	thread.ID = 0 // 自動インクリメント用に0に設定
	// GORMでSupabaseのPostgreSQLに保存
	result := db.SafeDB().Create(&thread)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create thread"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"thread": thread})
}
func GetAroundAllThread(c *gin.Context) {
	var req types.Coordinate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	var threads []types.Thread
	dbConn := db.SafeDB()
	if err := dbConn.Where("lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?",
		req.Lat-types.AROUND, req.Lat+types.AROUND,
		req.Lng-types.AROUND, req.Lng+types.AROUND,
	).Find(&threads).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "no threads found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch threads"})
		return
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
