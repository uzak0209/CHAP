package handlers

import (
	"api/db"
	"api/types"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CreatePost handles POST /post
func CreatePost(c *gin.Context) {
	var post types.Post
	if err := c.ShouldBindJSON(&post); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json format"})
		return
	}

	// JWT認証からuser_idを取得
	userID := c.GetString("user_id")
	userIDInt, err := strconv.Atoi(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
		return
	}
	post.UserID = userIDInt

	// GORMでSupabaseのPostgreSQLに保存
	result := db.GetDB().Create(&post)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create post"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"post": post})
}

// GetPost handles GET /post/:id
func GetPost(c *gin.Context) {
	id := c.Param("id")
	var post types.Post

	result := db.GetDB().First(&post, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		return
	}

	c.JSON(http.StatusOK, post)
}

func GetAroundAllPost(c *gin.Context) {
	var req types.Coordinate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	var posts []types.Post
	dbConn := db.GetDB()
	if err := dbConn.Where("lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?",
		req.Lat-types.AROUND, req.Lat+types.AROUND,
		req.Lng-types.AROUND, req.Lng+types.AROUND,
	).Find(&posts).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "no posts found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch posts"})
		return
	}
	c.JSON(http.StatusOK, posts)
}
func GetUpdatePost(c *gin.Context) {
	from := c.Param("from")
	var posts []types.Post

	// from を数値に変換（例：Unix timestamp）
	fromTime, err := strconv.ParseInt(from, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid 'from' parameter"})
		return
	}

	// 条件に合う投稿を取得（updated_at > from）
	if err := db.GetDB().
		Where("updated_at > ?", time.Unix(fromTime, 0)).
		Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch updated posts"})
		return
	}

	c.JSON(http.StatusOK, posts)
}

func DeletePost(c *gin.Context) {
	id := c.Param("id")
	var post types.Post

	result := db.GetDB().First(&post, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		return
	}

	if err := db.GetDB().Delete(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "post deleted"})
}

func GetAround(c *gin.Context) {
	var req types.Coordinate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	var posts []types.Post

	// GORMで位置情報検索
	db.GetDB().Where(
		"coordinate_lat BETWEEN ? AND ? AND coordinate_lng BETWEEN ? AND ?",
		req.Lat-types.AROUND,
		req.Lat+types.AROUND,
		req.Lng-types.AROUND,
		req.Lng+types.AROUND,
	).Find(&posts)

	c.JSON(http.StatusOK, posts)
}
