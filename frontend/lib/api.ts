// API Base URL Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://56.155.98.63:8080';
const USE_HTTPS = process.env.NEXT_PUBLIC_USE_HTTPS === 'true';

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/api/v1/auth/login`,
    register: `${API_BASE_URL}/api/v1/auth/register`,
    googleLogin: `${API_BASE_URL}/api/v1/auth/google`,
    logout: `${API_BASE_URL}/api/v1/auth/logout`,
    verify: `${API_BASE_URL}/api/v1/auth/verify`,
  },
  events: {
    list: `${API_BASE_URL}/api/v1/events`,
    create: `${API_BASE_URL}/api/v1/events`,
    get: (id: string) => `${API_BASE_URL}/api/v1/events/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/v1/events/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/v1/events/${id}`,
  },
  threads: {
    list: `${API_BASE_URL}/api/v1/threads`,
    create: `${API_BASE_URL}/api/v1/threads`,
    get: (id: string) => `${API_BASE_URL}/api/v1/threads/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/v1/threads/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/v1/threads/${id}`,
  },
  posts: {
    list: `${API_BASE_URL}/api/v1/posts`,
    create: `${API_BASE_URL}/api/v1/posts`,
    get: (id: string) => `${API_BASE_URL}/api/v1/posts/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/v1/posts/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/v1/posts/${id}`,
  },
  health: `${API_BASE_URL}/health`,
};

// Default fetch options for HTTPS
export const defaultFetchOptions: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
  // HTTPS証明書の検証を緩和（自己署名証明書の場合）
  // 本番環境では適切なSSL証明書を使用してください
};

// API Client with token support
export class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const config: RequestInit = {
      ...defaultFetchOptions,
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // GET request
  async get<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'GET' });
  }

  // POST request
  async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

export default API_BASE_URL;
