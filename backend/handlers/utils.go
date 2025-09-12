package handlers

import (
	"api/types"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ResourceEntity interface {
	GetID() uint
	SetUserID(uuid.UUID)
	SetUsername(string)
	SetUpdatedAt(time.Time)
	GetTableName() string
	GetResourceName() string
}

// 共通のレスポンス形式
type ErrorResponse struct {
	Error string `json:"error"`
}

type SuccessResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

// 共通のエラーハンドリング
func respondWithError(c *gin.Context, statusCode int, message string) {
	c.JSON(statusCode, ErrorResponse{Error: message})
}

func respondWithSuccess(c *gin.Context, statusCode int, data interface{}) {
	c.JSON(statusCode, data)
}
func getParamFrom(c *gin.Context) types.Result[time.Time] {
	from := c.Param("from")
	fromTime, err := strconv.ParseInt(from, 10, 64)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, "invalid 'from' parameter")
		return types.Err[time.Time](err)
	}
	return types.Ok(time.Unix(fromTime, 0))
}

// 座標による検索の共通処理
func getByCoordinateFilter[T any](dbConn *gorm.DB, userCoordinate types.Coordinate) types.Result[[]T] {
	var results []T
	err := dbConn.Where(`
        category IN ('entertainment', 'disaster') OR 
        (category = 'community' AND 
         lat BETWEEN ? AND ? AND 
         lng BETWEEN ? AND ?)
    `,
		userCoordinate.Lat-types.AROUND, userCoordinate.Lat+types.AROUND,
		userCoordinate.Lng-types.AROUND, userCoordinate.Lng+types.AROUND,
	).Find(&results).Error

	if err != nil {
		return types.Err[[]T](err)
	}
	return types.Ok(results)
}

// 更新取得の共通処理
func getByUpdateTime[T any](dbConn *gorm.DB, fromTime time.Time) types.Result[[]T] {
	var results []T
	err := dbConn.Where("updated_at > ?", fromTime).Find(&results).Error

	if err != nil {
		return types.Err[[]T](err)
	}
	return types.Ok(results)
}
