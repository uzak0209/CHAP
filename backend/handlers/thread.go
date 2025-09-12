package handlers

import (
	"api/db"
	"api/types"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func EditThread(c *gin.Context) {
	var thread types.Thread
	EditResource(c, &thread)
}

// GetThread handles GET /thread/:id
func GetThread(c *gin.Context) {
	var thread types.Thread
	GetResource(c, &thread)
}

// CreateThread handles POST /thread
func CreateThread(c *gin.Context) {
	var thread types.Thread
	CreateResource(c, &thread)
}

// GetThreadDetails returns a thread with its replies (comments)
// GET /thread/:id/details
func GetThreadDetails(c *gin.Context) {
	id := c.Param("id")

	// Fetch thread
	var thread types.Thread
	if err := db.SafeDB().Where("id = ?", id).First(&thread).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "thread not found"})
		return
	}

	// Fetch replies (comments) by foreign key
	var replies []types.Comment
	// If conversion to uint is needed for safety
	if _, err := strconv.ParseUint(id, 10, 64); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid thread id"})
		return
	}
	if err := db.SafeDB().Where("thread_id = ?", id).Order("created_at ASC").Find(&replies).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load replies"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"thread":  thread,
		"replies": replies,
	})
}
func GetAllThreads(c *gin.Context) {
	var threads []types.Thread
	dbConn := db.SafeDB()
	handleCoordinateFiltering(c, dbConn, &threads, "thread")
}
func GetUpdateThread(c *gin.Context) {
	var threads []types.Thread
	handleUpdateRetrieval(c, &threads, "thread")
}
func DeleteThread(c *gin.Context) {
	var thread types.Thread
	DeleteResource(c, &thread)
}
