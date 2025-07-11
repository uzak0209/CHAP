package types

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

const AROUND = 0.01 // 検索範囲の定数

// メッセージ用構造体
type Post struct {
	ID          uint           `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID      uuid.UUID      `json:"user_id" gorm:"type:uuid;not null"`
	Coordinate  Coordinate     `json:"coordinate" gorm:"embedded"`
	CreatedTime time.Time      `json:"created_time" gorm:"autoCreateTime"`
	UpdatedTime time.Time      `json:"updated_time" gorm:"autoUpdateTime"`
	DeletedTime *time.Time     `json:"deleted_time,omitempty"`
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
	ID          string         `json:"id" gorm:"primaryKey;autoIncrement"`
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
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primaryKey"`
	Name      string    `json:"name" gorm:"not null"`
	Image     string    `json:"image"`
	Email     string    `json:"email" gorm:"not null;unique"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	Valid     bool      `json:"valid" gorm:"default:true"`
	Password  string    `json:"password" gorm:"not null"`
	LoginType string    `json:"login_type " gorm:"default:'email'"`
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
type EmailLogin struct {
	UserID   uuid.UUID `json:"user_id" gorm:"type:uuid;primaryKey"`
	Email    string    `json:"email" gorm:"not null;unique"`
	Password string    `json:"password" gorm:"not null"`
}
type GoogleLogin struct {
	UserID      uuid.UUID `json:"user_id" gorm:"type:uuid;primaryKey"`
	AccessToken string    `json:"access_token" gorm:"not null"`
	Email       string    `json:"email" gorm:"not null;unique"`
	Name        string    `json:"name" gorm:"not null"`
}
