package db

import (
	"api/types"
	"log"
)

func AutoMigrate() error {
	err := db.AutoMigrate(
		&types.Post{},
		&types.Thread{},
		&types.Event{},
		&types.User{},
	)

	if err != nil {
		log.Printf("Migration failed: %v", err)
		return err
	}

	log.Println("Database migration completed")
	return nil
}
