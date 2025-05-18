package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
)

// メッセージ用構造体
type MapObject struct {
	Lat         float64    `json:"lat"`
	Lng         float64    `json:"lng"`
	ID          int        `json:"id"`
	Type        ObjectType `json:"type"` // Replace with actual type if needed
	User        User       `json:"user"` // optional
	CreatedTime string     `json:"created_time"`
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
	db, err := sql.Open("postgres", os.Getenv("ELEPHANTSQL_URL"))
	if err != nil {
		log.Println(err)
		return err
	}
	defer db.Close()

	// Insert the object into the database
	query := `INSERT INTO messages (lat, lng, id, type, created_time, valid) VALUES ($1, $2, $3, $4, $5, $6)`
	_, err = db.Exec(query, obj.Lat, obj.Lng, obj.ID, obj.Type, obj.CreatedTime, obj.Valid)
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
		w.Header().Set("Access-Control-Allow-Origin", "https://localhost:8443")
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

	http.HandleFunc("/api/message", withCORS(func(w http.ResponseWriter, r *http.Request) {

		if r.Method != http.MethodPost {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}
		var obj MapObject
		if err := json.NewDecoder(r.Body).Decode(&obj); err != nil {
			http.Error(w, "Bad Request", http.StatusBadRequest)
			return
		}

	}))

	log.Println("APIサーバー起動中: https://localhost:1111")
	err := http.ListenAndServeTLS(":1111", "./keys/server.crt", "./keys/server.key", nil)
	if err != nil {
		log.Fatal(err)
	}
}
