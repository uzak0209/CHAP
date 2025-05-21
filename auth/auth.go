package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var googleOauthConfig = &oauth2.Config{
	ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
	ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
	RedirectURL:  "https://localhost/auth/google/callback",
	Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
	Endpoint:     google.Endpoint,
}

var oauthStateString = "randomState"

func handleGoogleLogin(w http.ResponseWriter, r *http.Request) {
	url := googleOauthConfig.AuthCodeURL(oauthStateString)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func handleGoogleCallback(w http.ResponseWriter, r *http.Request) {
	state := r.FormValue("state")
	if state != oauthStateString {
		http.Error(w, "Invalid state", http.StatusBadRequest)
		return
	}

	code := r.FormValue("code")
	token, err := googleOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		http.Error(w, "Code exchange failed", http.StatusInternalServerError)
		return
	}

	client := googleOauthConfig.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		http.Error(w, "Failed to get user info", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var userInfo map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		http.Error(w, "Failed to decode user info", http.StatusInternalServerError)
		return
	}
	fmt.Println("User Info:", userInfo)
	jwtToken := generateJWT(userInfo)
	http.SetCookie(w, &http.Cookie{
		Name:     "jwt",
		Value:    jwtToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   true, // 開発時は false にしてもOK
		SameSite: http.SameSiteLaxMode,
	})
	http.Redirect(w, r, "https://localhost", http.StatusTemporaryRedirect)
}
func generateJWT(userInfo map[string]interface{}) string {
	claims := jwt.MapClaims{
		"email": userInfo["email"],
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, _ := token.SignedString([]byte("your-secret-key"))
	return signed
}
func main() {
	http.HandleFunc("/google", handleGoogleLogin)
	http.HandleFunc("/google/callback", handleGoogleCallback)
	fmt.Println("Listening on https://localhost:4000/")
	log.Fatal(http.ListenAndServe(":4000", nil))
}
