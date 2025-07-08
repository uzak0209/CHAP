package types

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

const AROUND = 0.01 // 検索範囲の定数

// メッセージ用構造体
type Post struct {
	Coordinate  Coordinate     `json:"coordinate" gorm:"embedded"`
	ID          string         `json:"id" gorm:"primaryKey"`
	UserID      uuid.UUID      `json:"user_id" gorm:"type:uuid;not null"`
	CreatedTime time.Time      `json:"created_time"`
	DeletedTime time.Time      `json:"deleted_time"`
	UpdatedTime time.Time      `json:"updated_time"`
	Content     string         `json:"content"`
	Valid       bool           `json:"valid"`
	Parent      int            `json:"parent"`
	Like        int            `json:"like"`
	Tags        pq.StringArray `json:"tags" gorm:"type:text[]"`
}
type Thread struct {
	Coordinate  Coordinate     `json:"coordinate" gorm:"embedded"`
	ID          string         `json:"id" gorm:"primaryKey"`
	UserID      uuid.UUID      `json:"user_id" gorm:"type:uuid;not null"`
	CreatedTime time.Time      `json:"created_time"`
	DeletedTime time.Time      `json:"deleted_time"`
	UpdatedTime time.Time      `json:"updated_time"`
	Content     string         `json:"content"`
	Valid       bool           `json:"valid"`
	Like        int            `json:"like"`
	Tags        pq.StringArray `json:"tags" gorm:"type:text[]"`
}
type Event struct {
	Coordinate  Coordinate     `json:"coordinate" gorm:"embedded"`
	ID          string         `json:"id" gorm:"primaryKey"`
	UserID      uuid.UUID      `json:"user_id" gorm:"type:uuid;not null"`
	CreatedTime time.Time      `json:"created_time"`
	DeletedTime time.Time      `json:"deleted_time"`
	UpdatedTime time.Time      `json:"updated_time"`
	Content     string         `json:"content"`
	Valid       bool           `json:"valid"`
	Like        int            `json:"like"`
	Tags        pq.StringArray `json:"tags" gorm:"type:text[]"`
}

type User struct {
	ID           uuid.UUID `json:"id" gorm:"type:uuid;primaryKey"`
	Name         string    `json:"name" gorm:"not null"`
	Image        string    `json:"image"`
	Email        string    `json:"email" gorm:"not null;unique"`
	CreatedAt    time.Time `json:"created_at" gorm:"autoCreateTime"`
	Valid        bool      `json:"valid" gorm:"default:true"`
	Password     string    `json:"password" gorm:"not null"`
	LoginService string    `json:"login_service"`
}
type PostLikes struct {
	UserID uuid.UUID `json:"user_id" gorm:"type:uuid;not null;primaryKey"`
	PostID uuid.UUID `json:"post_id" gorm:"type:uuid;not null;primaryKey"`
}
type ThreadLikes struct {
	UserID   uuid.UUID `json:"user_id" gorm:"type:uuid;not null;primaryKey"`
	ThreadID uuid.UUID `json:"thread_id" gorm:"type:uuid;not null;primaryKey"`
}
type EventLikes struct {
	UserID  uuid.UUID `json:"user_id" gorm:"type:uuid;not null;primaryKey"`
	EventID uuid.UUID `json:"event_id" gorm:"type:uuid;not null;primaryKey"`
}

type Coordinate struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}
