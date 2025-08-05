package types

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

const AROUND = 0.01 // 検索範囲の定数

// メッセージ用構造体
type Post struct {
	gorm.Model
	UserID     uuid.UUID      `json:"user_id" `
	User       User           `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE;"`
	Coordinate Coordinate     `json:"coordinate" gorm:"embedded"`
	Content    string         `json:"content"`
	Category   string         `json:"category" gorm:"default:'other'"`
	Valid      bool           `json:"valid"`
	Like       int            `json:"like"`
	Tags       pq.StringArray `json:"tags" gorm:"type:text[]"`
}
type Comment struct {
	gorm.Model
	UserID     uuid.UUID      `json:"user_id" `
	User       User           `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE;"`
	Coordinate Coordinate     `json:"coordinate" gorm:"embedded"`
	Content    string         `json:"content"`
	Valid      bool           `json:"valid"`
	Thread     Thread         `json:"thread" gorm:"foreignKey:ThreadID;constraint:OnUpdate:CASCADE;"`
	ThreadID   uint           `json:"thread_id"`
	Like       int            `json:"like"`
	Tags       pq.StringArray `json:"tags" gorm:"type:text[]"`
}

type Thread struct {
	gorm.Model
	UserID     uuid.UUID      `json:"user_id" `
	User       User           `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE;"`
	Coordinate Coordinate     `json:"coordinate" gorm:"embedded"`
	Category   string         `json:"category" gorm:"default:'other'"`
	Content    string         `json:"content"`
	Valid      bool           `json:"valid"`
	Like       int            `json:"like"`
	Tags       pq.StringArray `json:"tags" gorm:"type:text[]"`
}
type Event struct {
	gorm.Model
	UserID     uuid.UUID      `json:"user_id" `
	User       User           `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE;"`
	Coordinate Coordinate     `json:"coordinate" gorm:"embedded"`
	Category   string         `json:"category" gorm:"default:'other'"`
	Content    string         `json:"content"`
	Valid      bool           `json:"valid"`
	Like       int            `json:"like"`
	Tags       pq.StringArray `json:"tags" gorm:"type:text[]"`
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
	UserID uuid.UUID `json:"user_id" `
	PostID uint      `json:"post_id" `
	User   User      `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE;"`
	Post   Post      `gorm:"foreignKey:PostID;constraint:OnUpdate:CASCADE;"`
}
type ThreadLikes struct {
	UserID   uuid.UUID `json:"user_id" `
	ThreadID uint      `json:"thread_id" `
	User     User      `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE;"`
	Thread   Thread    `gorm:"foreignKey:ThreadID;constraint:OnUpdate:CASCADE;"`
}
type EventLikes struct {
	UserID  uuid.UUID `json:"user_id" `
	User    User      `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE;"`
	EventID uint      `json:"event_id" `
	Event   Event     `gorm:"foreignKey:EventID;constraint:OnUpdate:CASCADE;"`
}

type Coordinate struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}
type EmailLogin struct {
	UserID   uuid.UUID `json:"user_id" `
	User     User      `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE;"`
	Email    string    `json:"email" gorm:"not null;unique"`
	Password string    `json:"password" gorm:"not null"`
}
type GoogleLogin struct {
	User        User      `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE;"`
	UserID      uuid.UUID `json:"user_id"`
	AccessToken string    `json:"access_token" gorm:"not null"`
	Email       string    `json:"email" gorm:"not null;unique"`
	Name        string    `json:"name" gorm:"not null"`
}
type ThreadTable struct {
	Thread_id  uint   `json:"thread_id" gorm:"primaryKey"`
	Thread     Thread `gorm:"foreignKey:Thread_id;constraint:OnUpdate:CASCADE;"`
	CommentIDs []uint `json:"comment_ids" gorm:"type:integer[]"`
}
