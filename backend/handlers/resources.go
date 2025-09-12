package handlers

import (
	"api/types"
	"time"

	"gorm.io/gorm"
)

// 型別の更新取得関数
func getUpdatedEvents(dbConn *gorm.DB, fromTime time.Time) types.Result[[]types.Event] {
	return getByUpdateTime[types.Event](dbConn, fromTime)
}

func getUpdatedThreads(dbConn *gorm.DB, fromTime time.Time) types.Result[[]types.Thread] {
	return getByUpdateTime[types.Thread](dbConn, fromTime)
}

func getUpdatedPosts(dbConn *gorm.DB, fromTime time.Time) types.Result[[]types.Post] {
	return getByUpdateTime[types.Post](dbConn, fromTime)
}

// 型別の座標フィルタリング関数
func getEventsByCoordinateFilter(dbConn *gorm.DB, userCoordinate types.Coordinate) types.Result[[]types.Event] {
	return getByCoordinateFilter[types.Event](dbConn, userCoordinate)
}

func getThreadsByCoordinateFilter(dbConn *gorm.DB, userCoordinate types.Coordinate) types.Result[[]types.Thread] {
	return getByCoordinateFilter[types.Thread](dbConn, userCoordinate)
}

func getPostsByCoordinateFilter(dbConn *gorm.DB, userCoordinate types.Coordinate) types.Result[[]types.Post] {
	return getByCoordinateFilter[types.Post](dbConn, userCoordinate)
}
