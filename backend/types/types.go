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
	UserID     uuid.UUID      `json:"User_id" `
	User       User           `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE;"`
	Coordinate Coordinate     `json:"Coordinate" gorm:"embedded"`
	Content    string         `json:"Content"`
	Category   string         `json:"Category" gorm:"default:'other'"`
	Valid      bool           `json:"Valid"`
	Like       int            `json:"Like"`
	Tags       pq.StringArray `json:"Tags" gorm:"type:text[]"`
}
type Comment struct {
	gorm.Model
	UserID     uuid.UUID      `json:"User_id" `
	User       User           `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE;"`
	Coordinate Coordinate     `json:"Coordinate" gorm:"embedded"`
	Content    string         `json:"Content"`
	Valid      bool           `json:"Valid"`
	Thread     Thread         `json:"Thread" gorm:"foreignKey:ThreadID;constraint:OnUpdate:CASCADE;"`
	ThreadID   uint           `json:"Thread_id"`
	Like       int            `json:"Like"`
	Tags       pq.StringArray `json:"Tags" gorm:"type:text[]"`
}

type Thread struct {
	gorm.Model
	UserID     uuid.UUID      `json:"User_id" `
	User       User           `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE;"`
	Coordinate Coordinate     `json:"Coordinate" gorm:"embedded"`
	Category   string         `json:"Category" gorm:"default:'other'"`
	Content    string         `json:"Content"`
	Valid      bool           `json:"Valid"`
	Like       int            `json:"Like"`
	Tags       pq.StringArray `json:"Tags" gorm:"type:text[]"`
}
type Event struct {
	gorm.Model
	UserID     uuid.UUID      `json:"User_id" `
	User       User           `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE;"`
	Coordinate Coordinate     `json:"Coordinate" gorm:"embedded"`
	Category   string         `json:"Category" gorm:"default:'other'"`
	Content    string         `json:"Content"`
	Valid      bool           `json:"Valid"`
	Like       int            `json:"Like"`
	Tags       pq.StringArray `json:"Tags" gorm:"type:text[]"`
}

type User struct {
	ID        uuid.UUID `json:"ID" gorm:"type:uuid;primaryKey"`
	Name      string    `json:"Name" gorm:"not null"`
	Image     string    `json:"Image"`
	Email     string    `json:"Email" gorm:"not null;unique"`
	CreatedAt time.Time `json:"Created_at" gorm:"autoCreateTime"`
	Valid     bool      `json:"Valid" gorm:"default:true"`
	Password  string    `json:"Password" gorm:"not null"`
	LoginType string    `json:"Login_type" gorm:"default:'email'"`
}
type PostLikes struct {
	UserID uuid.UUID `json:"User_id" `
	PostID uint      `json:"Post_id" `
	User   User      `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE;"`
	Post   Post      `gorm:"foreignKey:PostID;constraint:OnUpdate:CASCADE;"`
}
type ThreadLikes struct {
	UserID   uuid.UUID `json:"User_id" `
	ThreadID uint      `json:"Thread_id" `
	User     User      `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE;"`
	Thread   Thread    `gorm:"foreignKey:ThreadID;constraint:OnUpdate:CASCADE;"`
}
type EventLikes struct {
	UserID  uuid.UUID `json:"User_id" `
	User    User      `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE;"`
	EventID uint      `json:"Event_id" `
	Event   Event     `gorm:"foreignKey:EventID;constraint:OnUpdate:CASCADE;"`
}

type Coordinate struct {
	Lat float64 `json:"Lat"`
	Lng float64 `json:"Lng"`
}
type EmailLogin struct {
	UserID   uuid.UUID `json:"User_id" `
	User     User      `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE;"`
	Email    string    `json:"Email" gorm:"not null;unique"`
	Password string    `json:"Password" gorm:"not null"`
}
type GoogleLogin struct {
	User        User      `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE;"`
	UserID      uuid.UUID `json:"User_id"`
	AccessToken string    `json:"Access_token" gorm:"not null"`
	Email       string    `json:"Email" gorm:"not null;unique"`
	Name        string    `json:"Name" gorm:"not null"`
}
type ThreadTable struct {
	Thread_id  uint   `json:"Thread_id" gorm:"primaryKey"`
	Thread     Thread `gorm:"foreignKey:Thread_id;constraint:OnUpdate:CASCADE;"`
	CommentIDs []uint `json:"Comment_ids" gorm:"type:integer[]"`
}
