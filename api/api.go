package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/lib/pq"
)

// メッセージ用構造体
type MapObject struct {
	Lat         float64    `json:"lat"`
	Lng         float64    `json:"lng"`
	ID          int        `json:"id"`
	Type        ObjectType `json:"type"`    // Replace with actual type if needed
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

// db
func SearchDB() error {
	// create sql.DB instance for PostgreSQL service
	db, err := sql.Open("postgres", os.Getenv("ELEPHANTSQL_URL"))
	if err != nil {
		log.Println(err)
		return err
	}
	defer db.Close()

	return nil
}
func InsertDB(obj MapObject) error {
	// create sql.DB instance for PostgreSQL service
	DB_info := DB_info{
		host:     os.Getenv("DB_HOST"),
		port:     5432,
		user:     os.Getenv("DB_USER"),
		password: os.Getenv("DB_PASS"),
		dbname:   os.Getenv("DB_NAME"),
	}
	fmt.Printf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		DB_info.host, DB_info.port, DB_info.user, DB_info.password, DB_info.dbname)
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		DB_info.host, DB_info.port, DB_info.user, DB_info.password, DB_info.dbname)

	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Println(err)
		return err
	}
	defer db.Close()
	// Insert the object into the database
	query := `INSERT INTO posts (user_id,content,created_at,lat,lng) VALUES ($1, $2, $3, $4, $5)`
	_, err = db.Exec(query, obj.ID, obj.Content, obj.CreatedTime, obj.Lat, obj.Lng)
	if err != nil {
		log.Println(err)
		return err
	}
	return nil
}

// CORSミドルウェア
func withCORS(handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// CORSヘッダーを追加
		w.Header().Set("Access-Control-Allow-Origin", "https://localhost")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Credentials", "true") // 必要なら

		// プリフライトリクエスト対応（OPTIONS）
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		// 通常の処理へ
		handler(w, r)
	}
}

func main() {

	http.HandleFunc("/message", withCORS(func(w http.ResponseWriter, r *http.Request) {

		if r.Method != http.MethodPost {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}
		var obj MapObject
		if err := json.NewDecoder(r.Body).Decode(&obj); err != nil {
			http.Error(w, "Bad Request", http.StatusBadRequest)
			return
		}
		InsertDB(obj)

		fmt.Println("Received object:", obj)
	}))

	log.Println("APIサーバー起動中: http://localhost:3000")
	err := http.ListenAndServe(":3000", nil)
	if err != nil {
		log.Fatal(err)
	}
}
