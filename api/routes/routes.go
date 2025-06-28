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

		// 位置情報検索
		v1.POST("/around/post", handlers.GetAroundAllPost)

		// 投稿関連
		v1.POST("/create/post", handlers.CreatePost)
		v1.GET("/post/:id", handlers.GetPost)

		// スレッド関連
		v1.POST("/create/thread", handlers.CreateThread)
		v1.GET("/thread/:id", handlers.GetThread)

		// イベント関連
		v1.POST("/create/event", handlers.CreateEvent)
		v1.GET("/event/:id", handlers.GetEvent)
	}

	// ヘルスチェック
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "API server is running",
		})
	})
}
