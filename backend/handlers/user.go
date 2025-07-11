package handlers

import (
	"api/db"
	"api/types"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetUserByID handles GET /user/:id
func GetUserByID(c *gin.Context) {
	idStr := c.Param("id")

	var user types.User
	result := db.SafeDB().Where("id = ?", idStr).First(&user)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	// パスワードをレスポンスから除外
	user.Password = ""

	c.JSON(http.StatusOK, user)
}
