package main

import (
	"html/template"
	"log"
	"net/http"
)

type Location struct {
	Lat float64
	Lng float64
}

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		tmpl := template.Must(template.ParseFiles("templates/index.html"))
		loc := Location{Lat: 35.681236, Lng: 139.767125} // 東京駅
		tmpl.Execute(w, loc)
	})

	err := http.ListenAndServeTLS(":8443", "./keys/cert.pem", "./keys/key.pem", nil)
	if err != nil {
		log.Fatal(err)
	}
}
