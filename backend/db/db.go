package db

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func init() {
	// .envファイルから環境変数を読み込む
	if err := godotenv.Load(".env"); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Supabaseの接続文字列を直接使用
	dsn := os.Getenv("SUPABASE_DB_URL")
	fmt.Println("Using DSN:", dsn)
	// DBに接続
	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	log.Println("Successfully connected to Supabase database via GORM")
}

// GetDB returns the gorm.DB instance
func GetDB() *gorm.DB {
	return db
}

// Initialize initializes the database connection
func Initialize() error {
	AutoMigrate()
	if db == nil {
		return fmt.Errorf("database not initialized")
	}
	return nil
}
