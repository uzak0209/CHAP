package routes

import (
	"api/handlers"
	"api/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all API routes
func SetupRoutes(r *gin.Engine) {
	// API v1グループ
	v1 := r.Group("/api/v1")
	{
		// 認証関連（認証不要）
		v1.POST("/auth/login", handlers.Login)
		v1.POST("/auth/register", handlers.Register)

		// ユーザー関連（認証不要）
		v1.GET("/user/:id", handlers.GetUserByID)

		// 位置情報検索（認証不要）
		v1.POST("/around/post", handlers.GetAroundAllPost)
		v1.POST("/around/thread", handlers.GetAroundAllThread)
		v1.POST("/around/event", handlers.GetAroundAllEvent)

		// 個別取得（認証不要）
		v1.GET("/post/:id", handlers.GetPost)
		v1.GET("/thread/:id", handlers.GetThread)
		v1.GET("/event/:id", handlers.GetEvent)

		// 認証が必要なエンドポイント
		auth := v1.Group("")
		auth.Use(middleware.AuthMiddleware())
		{
			// 現在のユーザー情報取得
			auth.GET("/auth/me", handlers.GetCurrentUser)

			// 投稿関連
			auth.POST("/create/post", handlers.CreatePost)
			auth.GET("/update/post/:id", handlers.GetUpdatePost)
			auth.PUT("/edit/post/:id", handlers.EditPost)
			auth.DELETE("/delete/post/:id", handlers.DeletePost)

			// スレッド関連
			auth.POST("/create/thread", handlers.CreateThread)
			auth.GET("/update/thread/:id", handlers.GetUpdateThread)
			auth.PUT("/edit/thread/:id", handlers.EditThread)
			auth.DELETE("/delete/thread/:id", handlers.DeleteThread)

			// イベント関連
			auth.POST("/create/event", handlers.CreateEvent)
			auth.GET("/update/event/:id", handlers.GetUpdateEvent)
			auth.PUT("/edit/event/:id", handlers.EditEvent)
			auth.DELETE("/delete/event/:id", handlers.DeleteEvent)
		}
	}

	// ヘルスチェック
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "API server is running",
		})
	})
}
