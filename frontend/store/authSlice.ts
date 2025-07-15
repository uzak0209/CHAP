import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User } from '../types/types'

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: {
    login: boolean;
    logout: boolean;
    register: boolean;
    refresh: boolean;
  };
  error: {
    login: string | null;
    logout: string | null;
    register: string | null;
    refresh: string | null;
  };
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  loading: {
    login: false,
    logout: false,
    register: false,
    refresh: false,
  },
  error: {
    login: null,
    logout: null,
    register: null,
    refresh: null,
  },
}

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await fetch('http://15.168.15.237:8080/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!response.ok) throw new Error('ログインに失敗しました')
    return response.json()
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, display_name, logintype }: { email: string; password: string; display_name: string; logintype: string }) => {
    const response = await fetch('http://15.168.15.237:8080/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email,
        password,
        name: display_name,  // ← display_name を name として送信
        login_type: logintype // ← logintype を login_type として送信
      })
    })
    
    if (!response.ok) {
      // エラーレスポンスの内容を詳しく確認
      const errorText = await response.text()
      console.error('Register error:', errorText)
      throw new Error(`登録に失敗しました: ${response.status}`)
    }
    console.log('Register request sent:', { email, password, display_name }) // デバッグ用
    
    const data = await response.json()
    console.log('Register response:', data) // デバッグ用

    return data
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    const response = await fetch('http://15.168.15.237:8080/api/v1/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) throw new Error('ログアウトに失敗しました')
    return response.json()
  }
)
export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authtoken') || null;
  }
  return null;
}
export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async () => {
    console.log('Verifying token...');
    const token = typeof window !== 'undefined' ? localStorage.getItem('authtoken') : null;
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch('http://15.168.15.237:8080/api/v1/auth/me', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      // トークンが無効な場合はlocalStorageから削除
      localStorage.removeItem('authtoken');
      throw new Error('Token verification failed');
    }
    
    return response.json();
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthErrors: (state) => {
      state.error = {
        login: null,
        logout: null,
        register: null,
        refresh: null,
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.token = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken')
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading.login = true
        state.error.login = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading.login = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        // トークンをlocal storageに保存
        if (typeof window !== 'undefined' && action.payload.token) {
          localStorage.setItem('authtoken', action.payload.token)
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading.login = false
        state.error.login = action.error.message || 'ログインに失敗しました'
      })

      .addCase(register.pending, (state) => {
        state.loading.register = true
        state.error.register = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading.register = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        // トークンをlocal storageに保存
        if (typeof window !== 'undefined' && action.payload.token) {
          localStorage.setItem('authtoken', action.payload.token)
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.loading.register = false
        state.error.register = action.error.message || '登録に失敗しました'
      })

      .addCase(logout.pending, (state) => {
        state.loading.logout = true
        state.error.logout = null
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading.logout = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        // local storageからトークンを削除
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authtoken')
        }
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading.logout = false
        state.error.logout = action.error.message || 'ログアウトに失敗しました'
      })

      .addCase(verifyToken.pending, (state) => {
        state.loading.refresh = true
        state.error.refresh = null
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.loading.refresh = false
        state.user = action.payload.user || action.payload
        state.isAuthenticated = true
        console.log('Token verified successfully:', state.isAuthenticated)
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.loading.refresh = false
        state.error.refresh = action.error.message || 'Token verification failed'
        state.user = null
        state.token = null
        state.isAuthenticated = false
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authtoken')
        }
      })
  }
})

export const authActions = authSlice.actions
export const { clearAuthErrors, setUser, clearUser } = authSlice.actions
export default authSlice.reducer
