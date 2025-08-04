package db

import (
	"api/types"
	"log"
)

func AutoMigrate() error {
	// 既存のLikesテーブルを削除（構造変更のため）
	log.Println("Dropping existing likes tables for schema update...")
	db.Exec("DROP TABLE IF EXISTS post_likes CASCADE;")
	db.Exec("DROP TABLE IF EXISTS thread_likes CASCADE;")
	db.Exec("DROP TABLE IF EXISTS event_likes CASCADE;")

	err := db.AutoMigrate(
		&types.Post{},
		&types.Thread{},
		&types.Event{},
		&types.User{},
		&types.PostLikes{},
		&types.ThreadLikes{},
		&types.EventLikes{},
		&types.EmailLogin{},
		&types.GoogleLogin{},
	)

	if err != nil {
		log.Printf("Migration failed: %v", err)
		return err
	}

	log.Println("Database migration completed with schema updates")
	return nil
}
