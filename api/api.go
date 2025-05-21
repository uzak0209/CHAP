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

var DB_conf = DB_info{
	host:     os.Getenv("DB_HOST"),
	port:     5432,
	user:     os.Getenv("DB_USER"),
	password: os.Getenv("DB_PASS"),
	dbname:   os.Getenv("DB_NAME"),
}

var psqlInfo = fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
	DB_conf.host, DB_conf.port, DB_conf.user, DB_conf.password, DB_conf.dbname)

// db
func Search_userid(UserID int) (User, error) {
	// create sql.DB instance for PostgreSQL service
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Println(err)
		return User{}, err
	}
	defer db.Close()
	query := `SELECT * FROM users WHERE id = $1`
	rows, err := db.Query(query, UserID)
	if err != nil {
		log.Println(err)
		return User{}, err
	}
	defer rows.Close()
	var user User
	err = rows.Scan(&user.ID, &user.Name, &user.Email, &user.Password)
	if err != nil {
		log.Println(err)
		return User{}, err
	}

	return user, nil
}
func Search_around(lat float64, lng float64) ([]MapObject, error) {
	// create sql.DB instance for PostgreSQL service
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	defer db.Close()

	query := `SELECT * FROM posts WHERE lat BETWEEN $1 AND $2 AND lng BETWEEN $3 AND $4`
	rows, err := db.Query(query, lat-AROUND, lat+AROUND, lng-AROUND, lng+AROUND)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	defer rows.Close()

	var objs []MapObject
	var obj MapObject
	for rows.Next() {
		err = rows.Scan(&obj.ID, &obj.Content, &obj.CreatedTime, &obj.Lat, &obj.Lng)
		if err != nil {
			log.Println(err)
			return nil, err
		}
		objs = append(objs, obj)
	}

	if err = rows.Err(); err != nil {
		log.Println(err)
		return nil, err
	}
	return objs, nil
}
func InsertDB(obj MapObject) error {
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

func main() {

	http.HandleFunc("/message", func(w http.ResponseWriter, r *http.Request) {

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
	})
	http.HandleFunc("/search_around_post", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}
		var lat, lng float64
		if err := json.NewDecoder(r.Body).Decode(&Coordinate{Lat: lat, Lng: lng}); err != nil {
			http.Error(w, "Bad Request", http.StatusBadRequest)
			return
		}
		objs, err := Search_around(lat, lng)

		if err != nil {
			log.Fatal(err)
		}
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(objs); err != nil {
			log.Println("Error encoding response:", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

	})
	http.HandleFunc("/search_userid", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}
		var userID int
		if err := json.NewDecoder(r.Body).Decode(&userID); err != nil {
			http.Error(w, "Bad Request", http.StatusBadRequest)
			return
		}
		user, err := Search_userid(userID)
		if err != nil {
			log.Println("Error searching user:", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(user); err != nil {
			log.Println("Error encoding response:", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
	})
	log.Println("APIサーバー起動中: http://localhost:3000")
	err := http.ListenAndServe(":3000", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}

}
