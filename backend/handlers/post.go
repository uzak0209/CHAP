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
	"gorm.io/gorm"
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
	post.UpdatedTime = time.Now()

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

	// PostのIDは自動インクリメントなので設定しない
	// UserIDのみ設定（他のフィールドはリクエストから取得）
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
	c.JSON(http.StatusCreated, gin.H{"post": post})
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

func GetAroundAllPost(c *gin.Context) {
	var req types.Coordinate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	var posts []types.Post
	dbConn := db.SafeDB()
	if err := dbConn.Where("lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?",
		req.Lat-types.AROUND, req.Lat+types.AROUND,
		req.Lng-types.AROUND, req.Lng+types.AROUND,
	).Find(&posts).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "no posts found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch posts"})
		return
	}
	c.JSON(http.StatusOK, posts)
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

func GetAround(c *gin.Context) {
	var req types.Coordinate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	var posts []types.Post

	// GORMで位置情報検索
	db.GetDB().Where(
		"coordinate_lat BETWEEN ? AND ? AND coordinate_lng BETWEEN ? AND ?",
		req.Lat-types.AROUND,
		req.Lat+types.AROUND,
		req.Lng-types.AROUND,
		req.Lng+types.AROUND,
	).Find(&posts)

	c.JSON(http.StatusOK, posts)
}

// GetAllPosts - デバッグ用：全ての投稿を取得
func GetAllPosts(c *gin.Context) {
	var posts []types.Post
	log.Printf("[GetAllPosts] Fetching all posts from database")

	if err := db.SafeDB().Find(&posts).Error; err != nil {
		log.Printf("[GetAllPosts] Database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch posts"})
		return
	}

	log.Printf("[GetAllPosts] Found %d posts", len(posts))
	c.JSON(http.StatusOK, gin.H{"posts": posts, "count": len(posts)})
}

// LikePost handles POST /post/:id/like
func LikePost(c *gin.Context) {
	postID := c.Param("id")
	userID := c.GetString("user_id")

	log.Printf("[LikePost] 開始 - PostID: %s, UserID: %s", postID, userID)

	// UUIDをパース
	uid, err := uuid.Parse(userID)
	if err != nil {
		log.Printf("[LikePost] UUIDパースエラー: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id format"})
		return
	}

	// Post IDを数値に変換
	pid, err := strconv.ParseUint(postID, 10, 32)
	if err != nil {
		log.Printf("[LikePost] PostIDパースエラー: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post_id format"})
		return
	}

	// 投稿が存在するかチェック
	var post types.Post
	if err := db.SafeDB().Where("id = ?", pid).First(&post).Error; err != nil {
		log.Printf("[LikePost] 投稿が見つかりません: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		return
	}

	log.Printf("[LikePost] 投稿発見 - 現在のいいね数: %d", post.Like)

	// 既にいいねしているかチェック
	var existingLike types.PostLikes
	err = db.SafeDB().Where("user_id = ? AND post_id = ?", uid, pid).First(&existingLike).Error

	dbConn := db.SafeDB()
	if err == gorm.ErrRecordNotFound {
		// いいねが存在しない場合は新規作成
		log.Printf("[LikePost] いいね追加処理開始")
		newLike := types.PostLikes{
			UserID: uid,
			PostID: uint(pid), // pidをuintに変換
		}

		// トランザクション開始
		tx := dbConn.Begin()

		// いいね作成
		if err := tx.Create(&newLike).Error; err != nil {
			log.Printf("[LikePost] いいね作成エラー: %v", err)
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create like"})
			return
		}

		// 投稿のいいね数を+1
		newLikeCount := post.Like + 1
		if err := tx.Model(&post).Update("like", newLikeCount).Error; err != nil {
			log.Printf("[LikePost] いいね数更新エラー: %v", err)
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update like count"})
			return
		}

		tx.Commit()
		log.Printf("[LikePost] いいね追加完了 - 新しいいいね数: %d", newLikeCount)
		c.JSON(http.StatusOK, gin.H{"liked": true, "like_count": newLikeCount})

	} else if err == nil {
		// 既にいいねしている場合は削除（いいね取り消し）
		log.Printf("[LikePost] いいね削除処理開始")
		tx := dbConn.Begin()

		// いいね削除
		if err := tx.Delete(&existingLike).Error; err != nil {
			log.Printf("[LikePost] いいね削除エラー: %v", err)
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove like"})
			return
		}

		// 投稿のいいね数を-1（0以下にはならないように）
		newLikeCount := post.Like - 1
		if newLikeCount < 0 {
			newLikeCount = 0
		}
		if err := tx.Model(&post).Update("like", newLikeCount).Error; err != nil {
			log.Printf("[LikePost] いいね数更新エラー: %v", err)
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update like count"})
			return
		}

		tx.Commit()
		log.Printf("[LikePost] いいね削除完了 - 新しいいいね数: %d", newLikeCount)
		c.JSON(http.StatusOK, gin.H{"liked": false, "like_count": newLikeCount})

	} else {
		// その他のエラー
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
}

// GetPostLikeStatus handles GET /post/:id/like/status
func GetPostLikeStatus(c *gin.Context) {
	postID := c.Param("id")
	userID := c.GetString("user_id")

	// UUIDをパース
	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id format"})
		return
	}

	// Post IDを数値に変換
	pid, err := strconv.ParseUint(postID, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post_id format"})
		return
	}

	// いいね状態をチェック
	var like types.PostLikes
	err = db.SafeDB().Where("user_id = ? AND post_id = ?", uid, pid).First(&like).Error

	liked := err == nil // エラーがない場合はいいね済み

	// 投稿のいいね数も取得
	var post types.Post
	if err := db.SafeDB().Where("id = ?", pid).First(&post).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"liked":      liked,
		"like_count": post.Like,
	})
}
