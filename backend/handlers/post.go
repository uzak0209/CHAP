package handlers

import (
	"api/db"
	"api/types"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func EditPost(c *gin.Context) {
	id := c.Param("id")
	var post types.Post

	// GORMで投稿を取得
	result := db.SafeDB().First(&post, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		return
	}

	// リクエストボディから更新内容を取得
	if err := c.ShouldBindJSON(&post); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json format"})
		return
	}

	// 更新日時を現在の時刻に設定
	post.UpdatedAt = time.Now()

	// GORMで更新
	if err := db.SafeDB().Save(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"post": post})
}

// CreatePost handles POST /post
func CreatePost(c *gin.Context) {
	var post types.Post
	log.Printf("[CreatePost] Received request")

	if err := c.ShouldBindJSON(&post); err != nil {
		log.Printf("[CreatePost] JSON bind error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json format"})
		return
	}
	log.Printf("[CreatePost] Parsed post data: %+v", post)

	// JWT認証からuser_idを取得
	userID := c.GetString("user_id")
	log.Printf("[CreatePost] User ID from JWT: %s", userID)

	uid, err := uuid.Parse(userID)
	if err != nil {
		log.Printf("[CreatePost] UUID parse error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id format"})
		return
	}
	var user types.User
	if err := db.SafeDB().Where("id = ?", uid).Select("name").First(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user info"})
		return
	}
	post.Username = user.Name

	post.UserID = uid
	post.ID = 0 // 自動インクリメント用に0に設定
	log.Printf("[CreatePost] Final post data before save: %+v", post)

	// GORMでSupabaseのPostgreSQLに保存
	result := db.SafeDB().Create(&post)
	if result.Error != nil {
		log.Printf("[CreatePost] Database save error: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create post"})
		return
	}

	log.Printf("[CreatePost] Post created successfully with ID: %d", post.ID)
	c.JSON(http.StatusCreated, post)
}

// GetPost handles GET /post/:id
func GetPost(c *gin.Context) {
	id := c.Param("id")
	var post types.Post

	result := db.SafeDB().First(&post, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		return
	}

	c.JSON(http.StatusOK, post)
}

func GetUpdatePost(c *gin.Context) {
	from := c.Param("from")
	var posts []types.Post

	// from を数値に変換（例：Unix timestamp）
	fromTime, err := strconv.ParseInt(from, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid 'from' parameter"})
		return
	}

	// 条件に合う投稿を取得（updated_at > from）
	if err := db.SafeDB().
		Where("updated_at > ? or created_at > ?", time.Unix(fromTime, 0), time.Unix(fromTime, 0)).
		Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch updated posts"})
		return
	}

	c.JSON(http.StatusOK, posts)
}

func DeletePost(c *gin.Context) {
	id := c.Param("id")
	var post types.Post

	result := db.GetDB().First(&post, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		return
	}

	if err := db.GetDB().Delete(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "post deleted"})
}

func GetAllPosts(c *gin.Context) {
	var posts []types.Post
	var userCoordinate types.Coordinate
	dbConn := db.SafeDB()

	if err := c.ShouldBindJSON(&userCoordinate); err != nil {
		// coordinateが提供されない場合、entertainment/disasterのみをDBから取得
		if err := dbConn.Where("category IN (?)", []string{"entertainment", "disaster"}).Find(&posts).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch posts"})
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
		).Find(&posts).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch posts"})
			return
		}
	}
	c.JSON(http.StatusOK, posts)
}
