import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface LocationState {
  current: {
    lat: number | null;
    lng: number | null;
  };
  permission: 'granted' | 'denied' | 'prompt' | null;
  loading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  current: {
    lat: null,
    lng: null,
  },
  permission: null,
  loading: false,
  error: null,
}

// Async Thunk
export const getCurrentLocation = createAsyncThunk(
  'location/getCurrent',
  async () => {
    console.log('getCurrentLocation called');
    // Check if geolocation is supported
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          reject(new Error(error.message))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      )
    })
  }
)

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (state, action: PayloadAction<{ lat: number; lng: number }>) => {
      state.current = action.payload
    },
    setPermission: (state, action: PayloadAction<'granted' | 'denied' | 'prompt'>) => {
      state.permission = action.payload
    },
    clearLocationError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCurrentLocation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCurrentLocation.fulfilled, (state, action) => {
        state.loading = false
        state.current = action.payload
        state.permission = 'granted'
      })
      .addCase(getCurrentLocation.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || '位置情報の取得に失敗しました'
        state.permission = 'denied'
      })
  }
})

export const locationActions = locationSlice.actions
export default locationSlice.reducer
