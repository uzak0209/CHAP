import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ContentType } from '../types/types'

export interface FiltersState {
  contentType: ContentType
  searchRadius: number
  timeRange: {
    from: Date | null
    to: Date | null
  }
  tags: string[]
  showValid: boolean
}

const initialState: FiltersState = {
  contentType: 'ALL',
  searchRadius: 0.01,
  timeRange: {
    from: null,
    to: null
  },
  tags: [],
  showValid: true
}

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setContentType: (state, action: PayloadAction<ContentType>) => {
      state.contentType = action.payload
    },
    setSearchRadius: (state, action: PayloadAction<number>) => {
      state.searchRadius = action.payload
    },
    setTimeRange: (state, action: PayloadAction<{from: Date | null, to: Date | null}>) => {
      state.timeRange = action.payload
    },
    addTag: (state, action: PayloadAction<string>) => {
      if (!state.tags.includes(action.payload)) {
        state.tags.push(action.payload)
      }
    },
    removeTag: (state, action: PayloadAction<string>) => {
      state.tags = state.tags.filter(tag => tag !== action.payload)
    },
    clearTags: (state) => {
      state.tags = []
    },
    setShowValid: (state, action: PayloadAction<boolean>) => {
      state.showValid = action.payload
    },
    resetFilters: (state) => {
      return initialState
    }
  }
})

export const filtersActions = filtersSlice.actions
export default filtersSlice.reducer
