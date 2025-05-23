package main

import (
	"log"
	"net/http"
	"strings"
)

func main() {
	// 静的ファイルサーバーの定義
	fs := http.FileServer(http.Dir("./templates"))

	// すべてのリクエストに対してハンドラ関数を定義
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// .jsファイルの場合はMIMEタイプを明示的に設定
		if strings.HasSuffix(r.URL.Path, ".js") {
			w.Header().Set("Content-Type", "application/javascript")
			w.Header().Set("Cache-Control", "no-cache")
		}
		fs.ServeHTTP(w, r)

	})

	log.Println("Server running on https://localhost")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}
