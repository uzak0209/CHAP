package main

const AROUND = 0.01

// メッセージ用構造体
type MapObject struct {
	Lat         float64    `json:"lat"`
	Lng         float64    `json:"lng"`
	ID          int        `json:"id"`
	Type        ObjectType `json:"type"`
	UserID      int        `json:"user_id"` // optional
	CreatedTime string     `json:"created_time"`
	Content     string     `json:"content"`
	Valid       bool       `json:"valid"`
}
type ObjectType string

const (
	MESSAGE ObjectType = "MESSAGE"
	THREAD  ObjectType = "THREAD"
	EVENT   ObjectType = "EVENT"
)

type User struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}
type DB_info struct {
	host     string
	port     int
	user     string
	password string
	dbname   string
}

type Coordinate struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}
