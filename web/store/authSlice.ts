import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '../types/types'

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: null,
  loading: false,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
    },
    clearAuth: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.token = null
      state.error = null
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.loading = false
    }
  }
})

export const authActions = authSlice.actions
export default authSlice.reducer
