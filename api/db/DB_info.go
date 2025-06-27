package db

import "fmt"

type DB_info struct {
	Host     string
	Port     int
	User     string
	Password string
	DBname   string
}

// GetDBInfo returns the DSN string for PostgreSQL connection
func (db DB_info) GetDBInfo() string {
	return ("host=" + db.Host +
		" user=" + db.User +
		" password=" + db.Password +
		" dbname=" + db.DBname +
		" port=" + fmt.Sprintf("%d", db.Port) +
		" sslmode=disable")
}
