package handlers

import (
	"api/db"
	"api/types"

	"github.com/gin-gonic/gin"
)

func EditPost(c *gin.Context) {
	var post types.Post
	EditResource(c, &post)
}

// CreatePost handles POST /post
func CreatePost(c *gin.Context) {
	var post types.Post
	CreateResource(c, &post)
}

// GetPost handles GET /post/:id
func GetPost(c *gin.Context) {
	var post types.Post
	GetResource(c, &post)
}

func GetUpdatePost(c *gin.Context) {
	var posts []types.Post
	handleUpdateRetrieval(c, &posts, "post")
}

func DeletePost(c *gin.Context) {
	var post types.Post
	DeleteResource(c, &post)
}

func GetAllPosts(c *gin.Context) {
	var posts []types.Post
	dbConn := db.SafeDB()
	handleCoordinateFiltering(c, dbConn, &posts, "post")
}
