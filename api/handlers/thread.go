package handlers

import (
	"api/db"
	"api/types"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetThread handles GET /thread/:id
func GetThread(c *gin.Context) {
	id := c.Param("id")
	var thread types.Thread

	result := db.GetDB().First(&thread, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "thread not found"})
		return
	}

	c.JSON(http.StatusOK, thread)
}

// CreateThread handles POST /thread
func CreateThread(c *gin.Context) {
	var thread types.Thread
	if err := c.ShouldBindJSON(&thread); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json format"})
		return
	}

	result := db.GetDB().Create(&thread)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create thread"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":    "success",
		"thread_id": thread.ID,
	})
}
func GetAroundAllThread(c *gin.Context) {
	var req types.Coordinate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	var threads []types.Thread
	dbConn := db.GetDB()
	if err := dbConn.Where("lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?",
		req.Lat-types.AROUND, req.Lat+types.AROUND,
		req.Lng-types.AROUND, req.Lng+types.AROUND,
	).Find(&threads).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "no threads found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch threads"})
		return
	}
	c.JSON(http.StatusOK, threads)
}
