package handlers

import (
	"api/db"
	"api/types"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetEvent handles GET /event/:id
func GetEvent(c *gin.Context) {
	id := c.Param("id")
	var event types.Event

	result := db.GetDB().First(&event, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
		return
	}

	c.JSON(http.StatusOK, event)
}

// CreateEvent handles POST /event
func CreateEvent(c *gin.Context) {
	var event types.Event
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json format"})
		return
	}

	result := db.GetDB().Create(&event)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create event"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":   "success",
		"event_id": event.ID,
	})
}
func GetAroundAllEvent(c *gin.Context) {
	var req types.Coordinate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	var events []types.Event
	dbConn := db.GetDB()
	if err := dbConn.Where("lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?",
		req.Lat-types.AROUND, req.Lat+types.AROUND,
		req.Lng-types.AROUND, req.Lng+types.AROUND,
	).Find(&events).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "no events found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch events"})
		return
	}
	c.JSON(http.StatusOK, events)
}
