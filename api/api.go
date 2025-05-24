package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/lib/pq"

	. "api/types"
)

var DB_conf = DB_info{
	Host:     os.Getenv("DB_HOST"),
	Port:     5432,
	User:     os.Getenv("DB_USER"),
	Password: os.Getenv("DB_PASS"),
	DBname:   os.Getenv("DB_NAME"),
}
var psqlInfo = DB_conf.GetDBInfo()

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
func Search_around(lat float64, lng float64, typ ObjectType) ([]MapObject, error) {

	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	var query string
	defer db.Close()
	switch typ {
	case MESSAGE:
		query = `SELECT * FROM posts WHERE lat BETWEEN $1 AND $2 AND lng BETWEEN $3 AND $4`
	case THREAD:
		query = `SELECT * FROM threads WHERE lat BETWEEN $1 AND $2 AND lng BETWEEN $3 AND $4`
	case EVENT:
		query = `SELECT * FROM events WHERE lat BETWEEN $1 AND $2 AND lng BETWEEN $3 AND $4`
	default:
		return nil, fmt.Errorf("invalid type: %s", typ)
	}
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
func handleInsertMessage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	var obj MapObject
	if err := json.NewDecoder(r.Body).Decode(&obj); err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}
	if err := InsertDB(obj); err != nil {
		log.Println("InsertDB error:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	fmt.Println("Received object:", obj)
}
func handleSearchAround(typ ObjectType) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}
		var coord Coordinate
		if err := json.NewDecoder(r.Body).Decode(&coord); err != nil {
			http.Error(w, "Bad Request", http.StatusBadRequest)
			return
		}
		objs, err := Search_around(coord.Lat, coord.Lng, typ)
		if err != nil {
			log.Println("Search_around error:", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(objs)
	}
}
func handleSearchUserByID(w http.ResponseWriter, r *http.Request) {
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
		log.Println("Search_userid error:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}
func main() {
	http.HandleFunc("/message", handleInsertMessage)
	http.HandleFunc("/search_userid", handleSearchUserByID)
	http.HandleFunc("/search_around_post", handleSearchAround(MESSAGE))
	http.HandleFunc("/search_around_thread", handleSearchAround(THREAD))
	http.HandleFunc("/search_around_event", handleSearchAround(EVENT))
	log.Println("APIサーバー起動中: http://localhost:3000")
	if err := http.ListenAndServe(":3000", nil); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
