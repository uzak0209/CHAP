import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Coordinate, Notification } from '../types/types'

export interface UIState {
  activeTab: 'map' | 'list' | 'profile'
  mapZoom: number
  mapCenter: Coordinate | null
  sidebarOpen: boolean
  notifications: Notification[]
  theme: 'light' | 'dark'
}

const initialState: UIState = {
  activeTab: 'map',
  mapZoom: 15,
  mapCenter: null,
  sidebarOpen: false,
  notifications: [],
  theme: 'light'
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<'map' | 'list' | 'profile'>) => {
      state.activeTab = action.payload
    },
    setMapZoom: (state, action: PayloadAction<number>) => {
      state.mapZoom = action.payload
    },
    setMapCenter: (state, action: PayloadAction<Coordinate>) => {
      state.mapCenter = action.payload
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now()
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    }
  }
})

export const uiActions = uiSlice.actions
export default uiSlice.reducer
