package db

import (
	"fmt"
	"log"
	"os"
	"time"

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

	if dsn == "" {
		log.Fatal("SUPABASE_DB_URL is not set")
	}

	// DBに接続（タイムアウト設定追加）
	fmt.Println("Attempting to connect to database...")
	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		PrepareStmt: false, // prepared statementを無効化
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	// コネクションプールの設定
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("failed to get database instance: %v", err)
	}

	// 既存のprepared statementをクリア
	sqlDB.Exec("DEALLOCATE ALL")

	// コネクションプールの設定
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	fmt.Println("Database connection successful!")

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
