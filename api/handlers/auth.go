package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"
)

type SignUpRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SupabaseResponse struct {
	User  interface{} `json:"user"`
	Error interface{} `json:"error"`
}

func SignUp(email, password string) (*SupabaseResponse, error) {
	apiKey := os.Getenv("SUPABASE_ANON_KEY")             // Supabaseの.envにある
	url := os.Getenv("SUPABASE_URL") + "/auth/v1/signup" // SupabaseのURL
	reqBody := SignUpRequest{Email: email, Password: password}
	body, _ := json.Marshal(reqBody)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result SupabaseResponse
	err = json.NewDecoder(resp.Body).Decode(&result)
	return &result, err
}

// Login handles user login via Supabase Auth
func Login(email, password string) (*SupabaseResponse, error) {
	url := os.Getenv("SUPABASE_URL") + "/auth/v1/token?grant_type=password"
	apiKey := os.Getenv("SUPABASE_ANON_KEY")

	reqBody := SignUpRequest{Email: email, Password: password}
	body, _ := json.Marshal(reqBody)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result SupabaseResponse
	err = json.NewDecoder(resp.Body).Decode(&result)
	return &result, err
}
