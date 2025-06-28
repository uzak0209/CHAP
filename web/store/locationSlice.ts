import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Coordinate } from '../types/types'

export interface LocationState {
  current: Coordinate | null
  permission: 'granted' | 'denied' | 'prompt' | null
  loading: boolean
  error: string | null
}

const initialState: LocationState = {
  current: null,
  permission: null,
  loading: false,
  error: null
}

// Async Thunk
export const getCurrentLocation = createAsyncThunk(
  'location/getCurrent',
  async () => {
    return new Promise<Coordinate>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`))
        }
      )
    })
  }
)

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setCurrentLocation: (state, action: PayloadAction<Coordinate>) => {
      state.current = action.payload
      state.error = null
    },
    setPermission: (state, action: PayloadAction<'granted' | 'denied' | 'prompt'>) => {
      state.permission = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.loading = false
    }
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
        state.error = action.error.message || 'Failed to get location'
        state.permission = 'denied'
      })
  }
})

export const locationActions = locationSlice.actions
export default locationSlice.reducer
