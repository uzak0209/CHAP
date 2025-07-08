// API client with automatic JWT token attachment
import { store } from '@/store/store';

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

export async function apiRequest(url: string, options: RequestOptions = {}) {
  const state = store.getState();
  const token = state.auth.token;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // JWT トークンが存在する場合、Authorizationヘッダーに付与
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const mergedOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, mergedOptions);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
}

// 便利なヘルパー関数
export const api = {
  get: (url: string, headers?: Record<string, string>) =>
    apiRequest(url, { method: 'GET', headers }),

  post: (url: string, data?: any, headers?: Record<string, string>) =>
    apiRequest(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    }),

  put: (url: string, data?: any, headers?: Record<string, string>) =>
    apiRequest(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    }),

  patch: (url: string, data?: any, headers?: Record<string, string>) =>
    apiRequest(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    }),

  delete: (url: string, headers?: Record<string, string>) =>
    apiRequest(url, { method: 'DELETE', headers }),
};
