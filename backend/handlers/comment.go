package handlers

import (
	"api/db"
	"api/types"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetCommentsByThreadID(c *gin.Context) {
	threadIDStr := c.Param("thread_id")
	threadID, err := strconv.ParseUint(threadIDStr, 10, 64)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid thread_id"})
		return
	}
	var threadTable types.ThreadTable
	dbConn := db.SafeDB()
	if err := dbConn.Where("thread_id = ?", threadID).First(&threadTable).Error; err != nil {
		c.JSON(404, gin.H{"error": "Thread not found"})
		return
	}
	commentIDs := threadTable.CommentIDs
	if len(commentIDs) == 0 {
		c.JSON(200, gin.H{"comments": []types.Comment{}})
		return
	}
	var comments []types.Comment
	if err := dbConn.Where("id IN ?", commentIDs).Find(&comments).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to retrieve comments"})
		return
	}
	c.JSON(200, gin.H{"comments": comments})
}

func CreateComment(c *gin.Context) {
	var comment types.Comment
	if err := c.ShouldBindJSON(&comment); err != nil {
		c.JSON(400, gin.H{"error": "Invalid JSON format"})
		return
	}
	// If thread id from path exists, assign it
	if threadIDStr := c.Param("id"); threadIDStr != "" {
		if threadID, err := strconv.ParseUint(threadIDStr, 10, 64); err == nil {
			comment.ThreadID = uint(threadID)
		}
	}
	userID := c.GetString("user_id") // ユーザーIDを取得（認証済みであることを前提とする）
	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid user ID"})
		return
	}
	var user types.User
	if err := db.SafeDB().Where("id = ?", uid).Select("name").First(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user info"})
		return
	}
	comment.Username = user.Name

	comment.UserID = uid
	comment.Valid = true
	dbConn := db.SafeDB()
	if err := dbConn.Create(&comment).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to create comment"})
		return
	}
	c.JSON(201, gin.H{"message": "Comment created successfully", "comment": comment})
}

func DeleteComment(c *gin.Context) {
	comment_id := c.Param("comment_id")
	dbConn := db.SafeDB()
	if err := dbConn.Delete(&types.Comment{}, comment_id).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to delete comment"})
		return
	}
	c.JSON(200, gin.H{"message": "Comment deleted successfully"})
}
