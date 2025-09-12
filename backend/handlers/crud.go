package handlers

import (
	"api/db"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Create - 汎用作成処理
func CreateResource[T ResourceEntity](c *gin.Context, entity T) {
	if err := c.ShouldBindJSON(&entity); err != nil {
		RespondWithError(c, http.StatusBadRequest, "invalid json format")
		return
	}

	// JWT認証からuser_idを取得
	uid, username, err := GetUserFromJWT(c)
	if err != nil {
		RespondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	entity.SetUserID(uid)
	entity.SetUsername(username)

	if err := db.SafeDB().Create(&entity).Error; err != nil {
		RespondWithError(c, http.StatusInternalServerError, fmt.Sprintf("failed to create %s", entity.GetResourceName()))
		return
	}

	RespondWithSuccess(c, http.StatusCreated, entity)
}

// Get - 汎用取得処理
func GetResource[T ResourceEntity](c *gin.Context, entity T) {
	id := c.Param("id")

	result := db.SafeDB().Where("id = ?", id).First(&entity)
	if result.Error != nil {
		RespondWithError(c, http.StatusNotFound, fmt.Sprintf("%s not found", entity.GetResourceName()))
		return
	}

	RespondWithSuccess(c, http.StatusOK, entity)
}

// Edit - 汎用更新処理
func EditResource[T ResourceEntity](c *gin.Context, entity T) {
	id := c.Param("id")

	// リソースを取得
	result := db.SafeDB().Where("id = ?", id).First(&entity)
	if result.Error != nil {
		RespondWithError(c, http.StatusNotFound, fmt.Sprintf("%s not found", entity.GetResourceName()))
		return
	}

	// リクエストボディから更新内容を取得
	if err := c.ShouldBindJSON(&entity); err != nil {
		RespondWithError(c, http.StatusBadRequest, "invalid json format")
		return
	}

	// 更新日時を現在の時刻に設定
	entity.SetUpdatedAt(time.Now())

	// 更新
	if err := db.SafeDB().Save(&entity).Error; err != nil {
		RespondWithError(c, http.StatusInternalServerError, fmt.Sprintf("failed to update %s", entity.GetResourceName()))
		return
	}

	RespondWithSuccess(c, http.StatusOK, gin.H{entity.GetResourceName(): entity})
}

// Delete - 汎用削除処理
func DeleteResource[T ResourceEntity](c *gin.Context, entity T) {
	id := c.Param("id")

	result := db.SafeDB().Where("id = ?", id).First(&entity)
	if result.Error != nil {
		RespondWithError(c, http.StatusNotFound, fmt.Sprintf("%s not found", entity.GetResourceName()))
		return
	}

	if err := db.SafeDB().Delete(&entity).Error; err != nil {
		RespondWithError(c, http.StatusInternalServerError, fmt.Sprintf("failed to delete %s", entity.GetResourceName()))
		return
	}

	RespondWithSuccess(c, http.StatusOK, SuccessResponse{
		Status:  "success",
		Message: fmt.Sprintf("%s deleted", entity.GetResourceName()),
	})
}
