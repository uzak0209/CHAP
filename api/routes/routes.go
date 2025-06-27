package routes

import (
	"api/handlers"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all API routes
func SetupRoutes(r *gin.Engine) {
	// API v1グループ
	v1 := r.Group("/api/v1")
	{
		// ユーザー関連
		v1.GET("/user/:id", handlers.GetUserByID)

		// 投稿関連
		v1.GET("/around", handlers.GetAround)
		v1.POST("/post", handlers.CreatePost)
	}

	// ヘルスチェック
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "API server is running",
		})
	})
}
