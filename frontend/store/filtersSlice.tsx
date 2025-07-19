import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PostCategory } from '@/types/thread'

export interface FiltersState {
  contentType: 'MESSAGE' | 'THREAD' | 'EVENT' | 'ALL';
  searchRadius: number;
  timeRange: {
    from: Date | null;
    to: Date | null;
  };
  tags: string[];
  selectedCategory: PostCategory;
  showValid: boolean;
}

const initialState: FiltersState = {
  contentType: 'ALL',
  searchRadius: 1000, // meters
  timeRange: {
    from: null,
    to: null,
  },
  tags: [],
  selectedCategory: 'entertainment', // デフォルトは娯楽目的
  showValid: true,
}

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setContentType: (state, action: PayloadAction<'MESSAGE' | 'THREAD' | 'EVENT' | 'ALL'>) => {
      state.contentType = action.payload
    },
    setSearchRadius: (state, action: PayloadAction<number>) => {
      state.searchRadius = action.payload
    },
    setTimeRange: (state, action: PayloadAction<{ from: Date | null; to: Date | null }>) => {
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
    setSelectedCategory: (state, action: PayloadAction<PostCategory>) => {
      console.log('Redux: Setting category to', action.payload);
      state.selectedCategory = action.payload
    },
    setShowValid: (state, action: PayloadAction<boolean>) => {
      state.showValid = action.payload
    },
    resetFilters: (state) => {
      return initialState
    },
  },
})

export const filtersActions = filtersSlice.actions
export default filtersSlice.reducer
