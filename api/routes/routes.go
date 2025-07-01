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
		v1.POST("/around/thread", handlers.GetAroundAllThread)
		v1.POST("/around/event", handlers.GetAroundAllEvent)

		// 投稿関連
		v1.POST("/create/post", handlers.CreatePost)
		v1.GET("/post/:id", handlers.GetPost)
		v1.GET("/update/post/:id", handlers.GetUpdatePost)
		v1.DELETE("/delete/post/:id", handlers.DeletePost)
		v1.PUT("/edit/post/:id", handlers.EditPost)

		// スレッド関連
		v1.POST("/create/thread", handlers.CreateThread)
		v1.GET("/thread/:id", handlers.GetThread)
		v1.GET("/update/thread/:id", handlers.GetUpdateThread)
		v1.DELETE("/delete/thread/:id", handlers.DeleteThread)
		v1.PUT("/edit/thread/:id", handlers.EditThread)

		// イベント関連
		v1.POST("/create/event", handlers.CreateEvent)
		v1.GET("/event/:id", handlers.GetEvent)
		v1.GET("/update/event/:id", handlers.GetUpdateEvent)
		v1.DELETE("/delete/event/:id", handlers.DeleteEvent)
		v1.PUT("/edit/event/:id", handlers.EditEvent)
	}

	// ヘルスチェック
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "API server is running",
		})
	})
}
