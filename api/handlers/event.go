package handlers

import (
	"api/db"
	"api/types"
	"net/http"
	"strconv"
	"time"

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

func DeleteEvent(c *gin.Context) {
	id := c.Param("id")
	var event types.Event

	result := db.GetDB().First(&event, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
		return
	}

	if err := db.GetDB().Delete(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete event"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "event deleted"})
}

func GetUpdateEvent(c *gin.Context) {
	from := c.Param("from")
	var events []types.Event

	// from を数値に変換（例：Unix timestamp）
	fromTime, err := strconv.ParseInt(from, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid 'from' parameter"})
		return
	}

	// 条件に合う投稿を取得（updated_at > from）
	if err := db.GetDB().
		Where("updated_at > ?", time.Unix(fromTime, 0)).
		Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch updated events"})
		return
	}

	c.JSON(http.StatusOK, events)
}
