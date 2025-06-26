package DB

import (
	"log"
	"os"

	"api/types"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func init() {
	var err error
	DB_conf := types.DB_info{
		Host:     os.Getenv("DB_HOST"),
		Port:     5432,
		User:     os.Getenv("DB_USER"),
		Password: os.Getenv("DB_PASS"),
		DBname:   os.Getenv("DB_NAME"),
	}
	dsn := DB_conf.GetDBInfo()
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return db
}
