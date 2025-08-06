package db

import (
	"fmt"
	"log"
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

	dsn := "host=terraform-20250725215706850000000002.cta6geu24oet.ap-northeast-3.rds.amazonaws.com user=uzak password=Skakki0209 dbname=appdb port=5432 sslmode=require"
	fmt.Println("Using DSN:", dsn)

	// DBに接続（タイムアウト設定追加）
	fmt.Println("Attempting to connect to database...")
	var err error

	// PostgreSQLドライバーの設定を強化
	config := postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true, // Simple protocolを使用してprepared statementを回避
	}

	db, err = gorm.Open(postgres.New(config), &gorm.Config{
		PrepareStmt:                              false, // prepared statementを無効化
		DisableForeignKeyConstraintWhenMigrating: true,
		SkipDefaultTransaction:                   true, // デフォルトトランザクションをスキップ
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
	if _, err := sqlDB.Exec("DEALLOCATE ALL"); err != nil {
		log.Printf("Warning: Failed to deallocate prepared statements: %v", err)
	}

	// PostgreSQL固有の設定でprepared statementを無効化
	if _, err := sqlDB.Exec("SET SESSION prepared_statements = false"); err != nil {
		log.Printf("Warning: Failed to disable prepared statements: %v", err)
	}

	// コネクションプールの詳細設定
	sqlDB.SetMaxIdleConns(2)                   // アイドル接続数をさらに減らす
	sqlDB.SetMaxOpenConns(5)                   // 最大接続数をさらに制限
	sqlDB.SetConnMaxLifetime(time.Minute * 15) // 接続の生存時間をさらに短く
	sqlDB.SetConnMaxIdleTime(time.Minute * 2)  // アイドル時間をさらに短く

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

// SafeDB は prepared statement エラーを回避するためのヘルパー関数
func SafeDB() *gorm.DB {
	return db.Session(&gorm.Session{
		PrepareStmt:            false,
		SkipDefaultTransaction: true,
	})
}

// SafeTransaction は安全なトランザクションを実行する
func SafeTransaction(fn func(*gorm.DB) error) error {
	tx := SafeDB().Begin()
	if tx.Error != nil {
		return tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := fn(tx); err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}
