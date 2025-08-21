package handlers

import (
	"api/db"
	"api/types"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func GetAllEvents(c *gin.Context) {
	var events []types.Event
	var userCoordinate types.Coordinate
	dbConn := db.SafeDB()

	if err := c.ShouldBindJSON(&userCoordinate); err != nil {
		// coordinateが提供されない場合、entertainment/disasterのみをDBから取得
		if err := dbConn.Where("category IN (?)", []string{"entertainment", "disaster"}).Find(&events).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch events"})
			return
		}
	} else {
		// データベース側でカテゴリ別フィルタリング処理
		if err := dbConn.Where(`
            category IN ('entertainment', 'disaster') OR 
            (category = 'community' AND 
             lat BETWEEN ? AND ? AND 
             lng BETWEEN ? AND ?)
        `,
			userCoordinate.Lat-types.AROUND, userCoordinate.Lat+types.AROUND,
			userCoordinate.Lng-types.AROUND, userCoordinate.Lng+types.AROUND,
		).Find(&events).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch events"})
			return
		}
	}
	c.JSON(http.StatusOK, events)
}

func EditEvent(c *gin.Context) {
	id := c.Param("id")
	var event types.Event

	// GORMでイベントを取得
	result := db.SafeDB().Where("id = ?", id).First(&event)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
		return
	}

	// リクエストボディから更新内容を取得
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json format"})
		return
	}

	// 更新日時を現在の時刻に設定
	event.UpdatedAt = time.Now()

	// GORMで更新
	if err := db.SafeDB().Save(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update event"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"event": event})
}

// GetEvent handles GET /event/:id
func GetEvent(c *gin.Context) {
	id := c.Param("id")
	var event types.Event

	result := db.SafeDB().Where("id = ?", id).First(&event)
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
	// JWT認証からuser_idを取得
	userID := c.GetString("user_id")
	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id format"})
		return
	}
	var user types.User
	if err := db.SafeDB().Where("id = ?", uid).Select("name").First(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user info"})
		return
	}
	event.Username = user.Name

	event.UserID = uid
	db.SafeDB().Where("id = ?", uid).Select("username").Find(&event.Username)
	result := db.SafeDB().Create(&event)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create event"})
		return
	}

	c.JSON(http.StatusCreated,
		event,
	)
}

func GetAroundAllEvent(c *gin.Context) {
	var req types.Coordinate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	var events []types.Event
	dbConn := db.SafeDB()
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

	result := db.SafeDB().Where("id = ?", id).First(&event)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
		return
	}

	if err := db.SafeDB().Delete(&event).Error; err != nil {
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
	if err := db.SafeDB().
		Where("updated_at > ?", time.Unix(fromTime, 0)).
		Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch updated events"})
		return
	}
	c.JSON(http.StatusOK, events)
}
