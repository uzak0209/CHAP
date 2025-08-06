// API Base URL Configuration
const API_BASE_URL =  'https://api.chap-app.com'; 
const USE_HTTPS = process.env.NEXT_PUBLIC_USE_HTTPS === 'true';

console.log('🌟 API Configuration:', { 
  API_BASE_URL, 
  USE_HTTPS,
  env: process.env.NEXT_PUBLIC_API_BASE_URL 
});

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/api/v1/auth/login`,
    register: `${API_BASE_URL}/api/v1/auth/register`,
    googleLogin: `${API_BASE_URL}/api/v1/auth/google`,
    logout: `${API_BASE_URL}/api/v1/auth/logout`,
    verify: `${API_BASE_URL}/api/v1/auth/me`,
  },
  events: {
    list: `${API_BASE_URL}/api/v1/events`,
    create: `${API_BASE_URL}/api/v1/create/event`,
    around: `${API_BASE_URL}/api/v1/around/event`,
    get: (id: string) => `${API_BASE_URL}/api/v1/event/${id}`,
    update: (fromTimestamp: number) => `${API_BASE_URL}/api/v1/update/event/${fromTimestamp}`,
    edit: (id: string) => `${API_BASE_URL}/api/v1/edit/event/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/v1/delete/event/${id}`,
  },
  threads: {
    around: `${API_BASE_URL}/api/v1/around/thread`,
    list: `${API_BASE_URL}/api/v1/threads`,
    create: `${API_BASE_URL}/api/v1/create/thread`,
    get: (id: string) => `${API_BASE_URL}/api/v1/thread/${id}`,
    update: (fromTimestamp: number) => `${API_BASE_URL}/api/v1/update/thread/${fromTimestamp}`,
    edit: (id: string) => `${API_BASE_URL}/api/v1/edit/thread/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/v1/delete/thread/${id}`,
  },
  posts: {
    list: `${API_BASE_URL}/api/v1/posts`,
    create: `${API_BASE_URL}/api/v1/create/post`,
    around: `${API_BASE_URL}/api/v1/around/post`,
    get: (id: string) => `${API_BASE_URL}/api/v1/post/${id}`,
    update: (fromTimestamp: number) => `${API_BASE_URL}/api/v1/update/post/${fromTimestamp}`,
    edit: (id: string) => `${API_BASE_URL}/api/v1/edit/post/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/v1/delete/post/${id}`,
  },
  comments: {
    get: (threadId: string) => `${API_BASE_URL}/api/v1/comments/${threadId}`,
    create: `${API_BASE_URL}/api/v1/create/comment`,
    delete: (id: string) => `${API_BASE_URL}/api/v1/delete/comment/${id}`,
  },
  health: `${API_BASE_URL}/health`,
  // 位置情報検索エンドポイント
  around: {
    posts: `${API_BASE_URL}/api/v1/around/post`,
    threads: `${API_BASE_URL}/api/v1/around/thread`,
    events: `${API_BASE_URL}/api/v1/around/event`,
  },
};

// Default fetch options for HTTPS
export const defaultFetchOptions: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// API Client with token support
export class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authtoken') : null;
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

    console.log('🌐 API Request:', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body ? JSON.parse(config.body as string) : null,
    });

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        console.error('❌ API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          url,
        });
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API Success:', { url, status: response.status });
      return data;
    } catch (error) {
      console.error('💥 API Request failed:', error);
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


