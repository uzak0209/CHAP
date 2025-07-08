package handlers

import (
	"api/db"
	"api/types"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetUserByID handles GET /user/:id
func GetUserByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	var user types.User
	result := db.GetDB().First(&user, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}
