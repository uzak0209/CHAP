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
	// .envファイルから環境変数を読み込む（無くても動くが警告ログ）
	if err := godotenv.Load(".env"); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// 環境変数からDB接続情報を取得
	dbConf := DB_info{
		Host:     os.Getenv("DB_HOST"),
		Port:     5432, // 固定ポートならここでOK、可変なら別途envから読み込みも可
		User:     os.Getenv("DB_USER"),
		Password: os.Getenv("DB_PASS"),
		DBname:   os.Getenv("DB_NAME"),
	}

	// DSN（接続文字列）を生成
	dsn := dbConf.GetDBInfo()

	// DBに接続
	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}
}

// GetDB returns the gorm.DB instance
func GetDB() *gorm.DB {
	return db
}

// Initialize initializes the database connection
func Initialize() error {
	// init() function already handles the initialization
	// This is just to provide a consistent API
	if db == nil {
		return fmt.Errorf("database not initialized")
	}
	return nil
}
