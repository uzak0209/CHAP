package handlers

import (
	"api/db"
	"api/types"

	"github.com/gin-gonic/gin"
)

func GetAllEvents(c *gin.Context) {

	dbConn := db.SafeDB()
	var events = getEventsByCoordinateFilter(c, dbConn)
}

func EditEvent(c *gin.Context) {
	var event types.Event
	EditResource(c, &event)
}

// GetEvent handles GET /event/:id
func GetEvent(c *gin.Context) {
	var event types.Event
	GetResource(c, &event)
}

// CreateEvent handles POST /event
func CreateEvent(c *gin.Context) {
	var event types.Event
	CreateResource(c, &event)
}

func DeleteEvent(c *gin.Context) {
	var event types.Event
	DeleteResource(c, &event)
}

func GetUpdateEvent(c *gin.Context) {
	var events []types.Event
	handleUpdateRetrieval(c, &events, "event")
}
