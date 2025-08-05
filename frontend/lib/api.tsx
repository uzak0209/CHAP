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
  // HTTPS証明書の検証を緩和（自己署名証明書の場合）
  // 本番環境では適切なSSL証明書を使用してください
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

// // いいね機能
// export const likePost = async (postId: number): Promise<{ liked: boolean; like_count: number }> => {
//   const token = localStorage.getItem('authtoken'); // authSliceと一致するキー名に修正
  
//   console.log('🔍 いいねAPI呼び出し詳細:', {
//     postId,
//     hasToken: !!token,
//     apiUrl: `${API_BASE_URL}/post/${postId}/like`
//   });

//   const response = await fetch(`${API_BASE_URL}/api/v1/post/${postId}/like`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       ...(token && { 'Authorization': `Bearer ${token}` }),
//     },
//   });

//   console.log('🔍 いいねAPIレスポンス詳細:', {
//     status: response.status,
//     statusText: response.statusText,
//     ok: response.ok,
//     headers: Object.fromEntries(response.headers.entries())
//   });

//   if (!response.ok) {
//     let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
//     try {
//       // レスポンスのクローンを作成して、複数回読み込みを回避
//       const responseClone = response.clone();
//       const errorData = await responseClone.json();
//       console.error('❌ いいねAPIエラーレスポンス:', errorData);
//       errorMessage = errorData.error || errorMessage;
//     } catch (parseError) {
//       console.error('❌ エラーレスポンスのJSON解析に失敗:', parseError);
//       try {
//         const responseText = await response.text();
//         console.error('❌ レスポンステキスト:', responseText);
//         errorMessage = responseText || errorMessage;
//       } catch (textError) {
//         console.error('❌ レスポンステキストの取得にも失敗:', textError);
//       }
//     }
//     throw new Error(`Failed to toggle like: ${errorMessage}`);
//   }

//   return response.json();
// };

// export const getPostLikeStatus = async (postId: number): Promise<{ liked: boolean; like_count: number }> => {
//   const token = localStorage.getItem('authtoken'); // authSliceと一致するキー名に修正
//   const response = await fetch(`${API_BASE_URL}/api/v1/post/${postId}/like/status`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       ...(token && { 'Authorization': `Bearer ${token}` }),
//     },
//   });

//   if (!response.ok) {
//     throw new Error('Failed to get like status');
//   }

//   return response.json();
// };

// // スレッドのいいね機能API
// export const likeThread = async (threadId: number): Promise<{ liked: boolean; like_count: number }> => {
//   const token = localStorage.getItem('authtoken');
  
//   console.log('🔍 スレッドいいねAPI呼び出し詳細:', {
//     threadId,
//     hasToken: !!token,
//     apiUrl: `${API_BASE_URL}/api/v1/thread/${threadId}/like`
//   });

//   const response = await fetch(`${API_BASE_URL}/api/v1/thread/${threadId}/like`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       ...(token && { 'Authorization': `Bearer ${token}` }),
//     },
//   });

//   console.log('🔍 スレッドいいねAPIレスポンス詳細:', {
//     status: response.status,
//     statusText: response.statusText,
//     ok: response.ok
//   });

//   if (!response.ok) {
//     let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
//     try {
//       const responseClone = response.clone();
//       const errorData = await responseClone.json();
//       console.error('❌ スレッドいいねAPIエラーレスポンス:', errorData);
//       errorMessage = errorData.error || errorMessage;
//     } catch (parseError) {
//       console.error('❌ エラーレスポンスのJSON解析に失敗:', parseError);
//       try {
//         const responseText = await response.text();
//         console.error('❌ レスポンステキスト:', responseText);
//         errorMessage = responseText || errorMessage;
//       } catch (textError) {
//         console.error('❌ レスポンステキストの取得にも失敗:', textError);
//       }
//     }
//     throw new Error(`Failed to toggle thread like: ${errorMessage}`);
//   }

//   return response.json();
// };

// export const getThreadLikeStatus = async (threadId: number): Promise<{ liked: boolean; like_count: number }> => {
//   const token = localStorage.getItem('authtoken');
//   const response = await fetch(`${API_BASE_URL}/api/v1/thread/${threadId}/like/status`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       ...(token && { 'Authorization': `Bearer ${token}` }),
//     },
//   });

//   if (!response.ok) {
//     throw new Error('Failed to get thread like status');
//   }

//   return response.json();
// };

// // イベントのいいね機能API
// export const likeEvent = async (eventId: string): Promise<{ liked: boolean; like_count: number }> => {
//   const token = localStorage.getItem('authtoken');
  
//   console.log('🔍 イベントいいねAPI呼び出し詳細:', {
//     eventId,
//     hasToken: !!token,
//     apiUrl: `${API_BASE_URL}/api/v1/event/${eventId}/like`
//   });

//   const response = await fetch(`${API_BASE_URL}/api/v1/event/${eventId}/like`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       ...(token && { 'Authorization': `Bearer ${token}` }),
//     },
//   });

//   console.log('🔍 イベントいいねAPIレスポンス詳細:', {
//     status: response.status,
//     statusText: response.statusText,
//     ok: response.ok
//   });

//   if (!response.ok) {
//     let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
//     try {
//       const responseClone = response.clone();
//       const errorData = await responseClone.json();
//       console.error('❌ イベントいいねAPIエラーレスポンス:', errorData);
//       errorMessage = errorData.error || errorMessage;
//     } catch (parseError) {
//       console.error('❌ エラーレスポンスのJSON解析に失敗:', parseError);
//       try {
//         const responseText = await response.text();
//         console.error('❌ レスポンステキスト:', responseText);
//         errorMessage = responseText || errorMessage;
//       } catch (textError) {
//         console.error('❌ レスポンステキストの取得にも失敗:', textError);
//       }
//     }
//     throw new Error(`Failed to toggle event like: ${errorMessage}`);
//   }

//   return response.json();
// };

// export const getEventLikeStatus = async (eventId: string): Promise<{ liked: boolean; like_count: number }> => {
//   const token = localStorage.getItem('authtoken');
//   const response = await fetch(`${API_BASE_URL}/api/v1/event/${eventId}/like/status`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       ...(token && { 'Authorization': `Bearer ${token}` }),
//     },
//   });

//   if (!response.ok) {
//     throw new Error('Failed to get event like status');
//   }

//   return response.json();
// };
