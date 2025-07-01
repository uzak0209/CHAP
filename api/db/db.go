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
	if dsn == "" {
		// フォールバック：個別の環境変数から構築
		host := os.Getenv("DB_HOST")
		if host == "" {
			host = "127.0.0.1"
		}

		port := os.Getenv("DB_PORT")
		if port == "" {
			port = "54322"
		}

		user := os.Getenv("DB_USER")
		if user == "" {
			user = "postgres"
		}

		password := os.Getenv("DB_PASS")
		if password == "" {
			password = "postgres"
		}

		dbname := os.Getenv("DB_NAME")
		if dbname == "" {
			dbname = "postgres"
		}

		dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
			host, user, password, dbname, port)
	}

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
