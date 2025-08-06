package handlers

import (
	"api/db"
	"api/types"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token string     `json:"token"`
	User  types.User `json:"user"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	// データベースからユーザーを検索
	var user types.User
	result := db.SafeDB().Where("email = ?", req.Email).First(&user)
	if result.Error != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	// LoginTypeに応じてログイン処理を分岐
	switch user.LoginType {
	case "email":
		// Emailログインの場合、パスワード検証
		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
			return
		}

		// EmailLoginテーブルでも確認（追加セキュリティ）
		var emailLogin types.EmailLogin
		if err := db.SafeDB().Where("user_id = ? AND email = ?", user.ID, user.Email).First(&emailLogin).Error; err != nil {
			fmt.Printf("Warning: EmailLogin record not found for user %s\n", user.ID)
		}

	case "google":
		// Googleログインの場合は、パスワード認証をスキップ
		// 実際のGoogle OAuth認証は別途実装が必要
		c.JSON(http.StatusBadRequest, gin.H{"error": "Google login not supported via this endpoint"})
		return
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "unsupported login type"})
		return
	}

	// JWTトークン生成
	token, err := generateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	user.Password = ""

	// JWTをHttpOnly Cookieに設定
	c.SetCookie("token", token, 60*60*24*7, "/", "", false, true) // 7日間有効、HttpOnly

	c.JSON(http.StatusOK, AuthResponse{
		Token: token,
		User:  user,
	})
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	fmt.Println("Register request:", req) // デバッグ用ログ出力

	// メールアドレスの重複チェック
	var existingUser types.User
	if err := db.SafeDB().Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email already exists"})
		return
	}

	// パスワードハッシュ化
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	// 新規ユーザー作成
	user := types.User{
		ID:        uuid.New(), // UUIDを自動生成
		Name:      req.Name,
		Email:     req.Email,
		Password:  string(hashedPassword),
		Valid:     true,
		LoginType: "email", // デフォルトのログインタイプ
	}
	fmt.Printf("Creating user: %+v\n", user) // デバッグ用ログ出力
	result := db.SafeDB().Create(&user)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
		return
	}

	// EmailLoginテーブルにも記録（Emailログインの場合）
	emailLogin := types.EmailLogin{
		UserID:   user.ID,
		Email:    user.Email,
		Password: string(hashedPassword),
	}
	if err := db.SafeDB().Create(&emailLogin).Error; err != nil {
		// EmailLoginの作成に失敗した場合はログに記録するが、続行
		fmt.Printf("Warning: Failed to create EmailLogin record: %v\n", err)
	}

	// JWTトークン生成
	token, err := generateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	// JWTをHttpOnly Cookieに設定
	c.SetCookie("token", token, 60*60*24*7, "/", "", false, true) // 7日間有効、HttpOnly

	// パスワードをレスポンスから除外
	user.Password = ""

	c.JSON(http.StatusCreated, AuthResponse{
		Token: token,
		User:  user,
	})
}

func generateJWT(userID uuid.UUID) (string, error) {
	// JWT Secretの確認
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return "", fmt.Errorf("JWT_SECRET environment variable is not set")
	}

	// JWT Claims作成
	claims := jwt.MapClaims{
		"user_id": userID.String(),
		"exp":     time.Now().Add(time.Hour * 24 * 7).Unix(), // 7日間有効
		"iat":     time.Now().Unix(),
	}

	// JWTトークン作成
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// 署名してトークン文字列を生成
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func GetCurrentUser(c *gin.Context) {
	// ミドルウェアでセットされたユーザーIDを取得
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	var user types.User
	result := db.SafeDB().Where("id = ?", userID).First(&user)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	// パスワードは返さない
	user.Password = ""

	c.JSON(http.StatusOK, gin.H{"user": user})
}

func Logout(c *gin.Context) {
	// Cookieからトークンを削除
	c.SetCookie("token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "logged out successfully"})
}

// GoogleLoginRequest for Google OAuth login
type GoogleLoginRequest struct {
	AccessToken string `json:"access_token" binding:"required"`
	Email       string `json:"email" binding:"required"`
	Name        string `json:"name" binding:"required"`
}

// GoogleLogin handles Google OAuth login
func GoogleLogin(c *gin.Context) {
	var req GoogleLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	var user types.User
	result := db.SafeDB().Where("email = ? AND login_type = ?", req.Email, "google").First(&user)

	if result.Error != nil {
		// ユーザーが存在しない場合、新規登録
		user = types.User{
			ID:        uuid.New(),
			Name:      req.Name,
			Email:     req.Email,
			Valid:     true,
			LoginType: "google",
			Password:  "", // Googleログインの場合はパスワード不要
		}

		createResult := db.SafeDB().Create(&user)
		if createResult.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
			return
		}

		// GoogleLogin テーブルにも記録
		googleLogin := types.GoogleLogin{
			UserID:      user.ID,
			AccessToken: req.AccessToken,
			Email:       req.Email,
			Name:        req.Name,
		}
		db.SafeDB().Create(&googleLogin)
	} else {
		// 既存ユーザーの場合、GoogleLogin テーブルのアクセストークンを更新
		var googleLogin types.GoogleLogin
		if err := db.SafeDB().Where("user_id = ?", user.ID).First(&googleLogin).Error; err != nil {
			// GoogleLogin レコードが存在しない場合は作成
			googleLogin = types.GoogleLogin{
				UserID:      user.ID,
				AccessToken: req.AccessToken,
				Email:       req.Email,
				Name:        req.Name,
			}
			db.SafeDB().Create(&googleLogin)
		} else {
			// 既存のGoogleLogin レコードを更新
			googleLogin.AccessToken = req.AccessToken
			db.SafeDB().Save(&googleLogin)
		}
	}

	// JWTトークン生成
	token, err := generateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	// パスワードをレスポンスから除外
	user.Password = ""

	// JWTをHttpOnly Cookieに設定
	c.SetCookie("token", token, 60*60*24*7, "/", "", false, true) // 7日間有効、HttpOnly

	c.JSON(http.StatusOK, AuthResponse{
		Token: token,
		User:  user,
	})
}
