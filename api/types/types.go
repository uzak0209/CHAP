package types

const AROUND = 0.01 // 検索範囲の定数

// メッセージ用構造体
type Post struct {
	Coordinate  Coordinate `json:"coordinate"`
	ID          int        `json:"id"`
	UserID      int        `json:"user_id"`
	CreatedTime string     `json:"created_time"`
	DeletedTime string     `json:"deleted_time"`
	Content     string     `json:"content"`
	Valid       bool       `json:"valid"`
	Parent      int        `json:"parent"`
	Like        int        `json:"like"`
	Tags        []string   `json:"tags"`
}
type Thread struct {
	Coordinate  Coordinate `json:"coordinate"`
	ID          int        `json:"id"`
	UserID      int        `json:"user_id"`
	CreatedTime string     `json:"created_time"`
	DeletedTime string     `json:"deleted_time"`
	Content     string     `json:"content"`
	Valid       bool       `json:"valid"`
	Like        int        `json:"like"`
	Tags        []string   `json:"tags"`
}
type Event struct {
	Coordinate  Coordinate `json:"coordinate"`
	ID          int        `json:"id"`
	UserID      int        `json:"user_id"`
	CreatedTime string     `json:"created_time"`
	DeletedTime string     `json:"deleted_time"`
	Content     string     `json:"content"`
	Valid       bool       `json:"valid"`
	Like        int        `json:"like"`
	Tags        []string   `json:"tags"`
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
