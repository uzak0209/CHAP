import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface UIState {
  activeTab: 'map' | 'list' | 'profile';
  mapZoom: number;
  mapCenter: {
    lat: number;
    lng: number;
  };
  sidebarOpen: boolean;
  notifications: Notification[];
  theme: 'light' | 'dark';
  loading: {
    global: boolean;
  };
}

const initialState: UIState = {
  activeTab: 'map',
  mapZoom: 15,
  mapCenter: {
    lat: 35.6762,
    lng: 139.6503, // Tokyo default
  },
  sidebarOpen: false,
  notifications: [],
  theme: 'light',
  loading: {
    global: false,
  },
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
    setMapCenter: (state, action: PayloadAction<{ lat: number; lng: number }>) => {
      state.mapCenter = action.payload
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
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
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload
    },
  },
})

export const uiActions = uiSlice.actions
export default uiSlice.reducer
