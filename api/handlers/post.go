package handlers

import (
	"api/db"
	"api/types"
	"net/http"

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

func UpdatePost(c *gin.Context) {
	from := c.Param("from")
	var post types.Post

	if err := c.ShouldBindJSON(&post); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json format"})
		return
	}

	result := db.GetDB().Model(&post).Where("id = ?", from).Updates(post)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success"})
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
