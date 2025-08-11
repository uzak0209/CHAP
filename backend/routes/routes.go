package routes

import (
	"api/handlers"
	"api/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all API routes
func SetupRoutes(r *gin.Engine) {
	// プリフライトリクエスト（OPTIONS）の明示的なハンドリング
	r.OPTIONS("/*path", func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Status(204)
	})

	// API v1グループ
	v1 := r.Group("/api/v1")
	{
		v1.GET("/thread/:id/details", handlers.GetThreadDetails)
		v1.GET("/comments/:thread_id", handlers.GetCommentsByThreadID)
		v1.POST("/auth/login", handlers.Login)
		v1.POST("/auth/register", handlers.Register)
		v1.POST("/auth/google", handlers.GoogleLogin)

		// ユーザー関連（認証不要）
		v1.GET("/user/:id", handlers.GetUserByID)

		v1.POST("/getall/post", handlers.GetAllPosts)
		v1.POST("/getall/event", handlers.GetAllEvents)
		v1.POST("/getall/thread", handlers.GetAllThreads)
		// 認証が必要なエンドポイント
		auth := v1.Group("")
		auth.Use(middleware.AuthMiddleware())
		{
			// 現在のユーザー情報取得
			auth.GET("/auth/me", handlers.GetCurrentUser)

			// ログアウト
			auth.POST("/auth/logout", handlers.Logout)

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

			// コメント関連
			auth.POST("/create/comment", handlers.CreateComment)
			// Replies for thread
			auth.POST("/thread/:id/reply", handlers.CreateComment)
			auth.DELETE("/delete/comment/:id", handlers.DeleteComment)
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
