package types

import (
	"time"

	"github.com/google/uuid"
)

const AROUND = 0.01 // 検索範囲の定数

// メッセージ用構造体
type Post struct {
	Coordinate  Coordinate `json:"coordinate" gorm:"embedded"`
	ID          int        `json:"id"`
	UserID      uuid.UUID  `json:"user_id" gorm:"type:uuid;not null"`
	CreatedTime string     `json:"created_time"`
	DeletedTime string     `json:"deleted_time"`
	UpdatedAt   time.Time  `json:"updated_at"`
	Content     string     `json:"content"`
	Valid       bool       `json:"valid"`
	Parent      int        `json:"parent"`
	Like        int        `json:"like"`
	Tags        []string   `gorm:"type:text[]"`
}
type Thread struct {
	Coordinate  Coordinate `json:"coordinate" gorm:"embedded"`
	ID          int        `json:"id"`
	UserID      uuid.UUID  `json:"user_id" gorm:"type:uuid;not null"`
	CreatedTime string     `json:"created_time"`
	DeletedTime string     `json:"deleted_time"`
	UpdatedAt   time.Time  `json:"updated_at"`
	Content     string     `json:"content"`
	Valid       bool       `json:"valid"`
	Like        int        `json:"like"`
	Tags        []string   `gorm:"type:text[]"`
}
type Event struct {
	Coordinate  Coordinate `json:"coordinate" gorm:"embedded"`
	ID          int        `json:"id"`
	UserID      uuid.UUID  `json:"user_id" gorm:"type:uuid;not null"`
	CreatedTime string     `json:"created_time"`
	DeletedTime string     `json:"deleted_time"`
	UpdatedAt   time.Time  `json:"updated_at"`
	Content     string     `json:"content"`
	Valid       bool       `json:"valid"`
	Like        int        `json:"like"`
	Tags        []string   `gorm:"type:text[]"`
}

type User struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Image    string `json:"image"`
	Likes    int    `json:"likes"`
}

type Coordinate struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}
