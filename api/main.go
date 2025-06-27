package main

import (
	"api/db"
	"api/routes"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// データベース初期化
	if err := db.Initialize(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Ginエンジンの作成
	r := gin.Default()

	// ルートの設定
	routes.SetupRoutes(r)

	// サーバー起動
	log.Println("Starting server on :8080...")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
