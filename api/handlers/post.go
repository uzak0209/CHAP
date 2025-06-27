package handlers

import (
	"api/db"
	"api/types"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

const AROUND = 0.01 // 検索範囲の定数

// GetAround handles GET /around?lat=...&lng=...&type=...
func GetAround(c *gin.Context) {
	lat, err1 := strconv.ParseFloat(c.Query("lat"), 64)
	lng, err2 := strconv.ParseFloat(c.Query("lng"), 64)
	typ := c.Query("type")

	if err1 != nil || err2 != nil || typ == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid query parameters"})
		return
	}

	var tableName string
	switch types.ObjectType(typ) {
	case "MESSAGE":
		tableName = "posts"
	case "THREAD":
		tableName = "threads"
	case "EVENT":
		tableName = "events"
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid object type"})
		return
	}

	var objs []types.MapObject
	result := db.GetDB().Table(tableName).
		Where("lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?",
			lat-AROUND, lat+AROUND, lng-AROUND, lng+AROUND).
		Find(&objs)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database query failed"})
		return
	}

	c.JSON(http.StatusOK, objs)
}

// CreatePost handles POST /post
func CreatePost(c *gin.Context) {
	var post types.Post
	if err := c.ShouldBindJSON(&post); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json format"})
		return
	}

	result := db.GetDB().Create(&post)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create post"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"post_id": post.ID,
	})
}
