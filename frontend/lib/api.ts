// API Base URL Configuration
const API_BASE_URL =  'http://localhost:8080';
const USE_HTTPS = process.env.NEXT_PUBLIC_USE_HTTPS === 'true';

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
    get: (id: string) => `${API_BASE_URL}/api/v1/events/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/v1/events/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/v1/events/${id}`,
    
  },
  threads: {
    around: `${API_BASE_URL}/api/v1/around/thread`,
    list: `${API_BASE_URL}/api/v1/threads`,
    create: `${API_BASE_URL}/api/v1/create/thread`,
    get: (id: string) => `${API_BASE_URL}/api/v1/threads/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/v1/threads/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/v1/threads/${id}`,
  },
  posts: {
    list: `${API_BASE_URL}/api/v1/posts`,
    create: `${API_BASE_URL}/api/v1/create/post`,
    around: `${API_BASE_URL}/api/v1/around/post`,
    get: (id: string) => `${API_BASE_URL}/api/v1/posts/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/v1/posts/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/v1/posts/${id}`,
  },
  comments:{
    get: (id: string) => `${API_BASE_URL}/api/v1/comments/${id}`,
    create: `${API_BASE_URL}/api/v1/comments/create`,
     delete: (id: string) => `${API_BASE_URL}/api/v1/comments/delete`,
  },
  health: `${API_BASE_URL}/health`,
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


