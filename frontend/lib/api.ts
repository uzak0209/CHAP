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
    list: `${API_BASE_URL}/api/v1/getall/event`,
    create: `${API_BASE_URL}/api/v1/create/event`,
    get: (id: string) => `${API_BASE_URL}/api/v1/event/${id}`,
    update: (fromTimestamp: number) => `${API_BASE_URL}/api/v1/update/event/${fromTimestamp}`,
    edit: (id: string) => `${API_BASE_URL}/api/v1/edit/event/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/v1/delete/event/${id}`,
  },
  threads: {
    list: `${API_BASE_URL}/api/v1/getall/thread`,
    create: `${API_BASE_URL}/api/v1/create/thread`,
    get: (id: string) => `${API_BASE_URL}/api/v1/thread/${id}`,
    update: (fromTimestamp: number) => `${API_BASE_URL}/api/v1/update/thread/${fromTimestamp}`,
    edit: (id: string) => `${API_BASE_URL}/api/v1/edit/thread/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/v1/delete/thread/${id}`,
  },
  posts: {
    list: `${API_BASE_URL}/api/v1/getall/post`,
    create: `${API_BASE_URL}/api/v1/create/post`,
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
  social: {
    heatmap: `${API_BASE_URL}/api/v1/social-sensing/heatmap`,
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


