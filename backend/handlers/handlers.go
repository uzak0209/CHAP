package handlers

import (
	"api/db"
	"api/types"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// 座標フィルタリングハンドラー（抽象化済み）
func HandleEventsCoordinateFiltering(c *gin.Context) {
	var userCoordinate types.Coordinate
	dbConn := db.SafeDB()

	if err := c.ShouldBindJSON(&userCoordinate); err != nil {
		respondWithError(c, http.StatusBadRequest, "invalid json format")
	} else {
		// 座標フィルタリング処理
		result := getEventsByCoordinateFilter(dbConn, userCoordinate)
		if result.IsErr() {
			respondWithError(c, http.StatusInternalServerError, "failed to fetch events")
			return
		}
		respondWithSuccess(c, http.StatusOK, result.Unwrap())
	}
}

func HandleThreadsCoordinateFiltering(c *gin.Context) {
	var userCoordinate types.Coordinate
	dbConn := db.SafeDB()

	if err := c.ShouldBindJSON(&userCoordinate); err != nil {
		respondWithError(c, http.StatusBadRequest, "invalid json format")
	} else {
		result := getThreadsByCoordinateFilter(dbConn, userCoordinate)
		if result.IsErr() {
			respondWithError(c, http.StatusInternalServerError, "failed to fetch threads")
			return
		}
		respondWithSuccess(c, http.StatusOK, result.Unwrap())
	}
}

func HandlePostsCoordinateFiltering(c *gin.Context) {
	var userCoordinate types.Coordinate
	dbConn := db.SafeDB()

	if err := c.ShouldBindJSON(&userCoordinate); err != nil {
		respondWithError(c, http.StatusBadRequest, "invalid json format")
	} else {
		result := getPostsByCoordinateFilter(dbConn, userCoordinate)
		if result.IsErr() {
			respondWithError(c, http.StatusInternalServerError, "failed to fetch posts")
			return
		}
		respondWithSuccess(c, http.StatusOK, result.Unwrap())
	}
}

// 更新取得処理（抽象化済み）
func HandleEventsUpdateRetrieval(c *gin.Context) {
	from := c.Param("from")
	fromTime, err := strconv.ParseInt(from, 10, 64)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, "invalid 'from' parameter")
		return
	}

	result := getUpdatedEvents(db.SafeDB(), time.Unix(fromTime, 0))
	if result.IsErr() {
		respondWithError(c, http.StatusInternalServerError, "failed to fetch updated events")
		return
	}
	respondWithSuccess(c, http.StatusOK, result.Unwrap())
}

func HandleThreadsUpdateRetrieval(c *gin.Context) {
	fromTime := getParamFrom(c)
	if fromTime.IsErr() {
		respondWithError(c, http.StatusBadRequest, "invalid 'from' parameter")
		return
	}
	result := getUpdatedThreads(db.SafeDB(), time.Unix(fromTime.Unwrap().Unix(), 0))
	if result.IsErr() {
		respondWithError(c, http.StatusInternalServerError, "failed to fetch updated threads")
		return
	}
	respondWithSuccess(c, http.StatusOK, result.Unwrap())
}

func HandlePostsUpdateRetrieval(c *gin.Context) {
	fromTime := getParamFrom(c)
	if fromTime.IsErr() {
		respondWithError(c, http.StatusBadRequest, "invalid 'from' parameter")
		return
	} else {
		result := getUpdatedPosts(db.SafeDB(), time.Unix(fromTime.Unwrap().Unix(), 0))
		if result.IsErr() {
			respondWithError(c, http.StatusInternalServerError, "failed to fetch updated posts")
			return
		}
		respondWithSuccess(c, http.StatusOK, result.Unwrap())
	}
}
