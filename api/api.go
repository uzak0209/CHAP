package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

// メッセージ用構造体
type Message struct {
	Message string `json:"message"`
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
		fmt.Println("APIサーバー起動中: https://localhost:1111")
		if r.Method != http.MethodPost {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}
		var msg Message
		if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
			http.Error(w, "Bad Request", http.StatusBadRequest)
			return
		}
		fmt.Print(msg.Message)
		json.NewEncoder(w).Encode(msg)
	}))

	log.Println("APIサーバー起動中: https://localhost:1111")
	err := http.ListenAndServeTLS(":1111", "./keys/server.crt", "./keys/server.key", nil)
	if err != nil {
		log.Fatal(err)
	}
}
