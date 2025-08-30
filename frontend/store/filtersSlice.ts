import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Category } from '@/types/types'

export interface FiltersState {
  contentType: 'MESSAGE' | 'THREAD' | 'EVENT' | 'ALL';
  searchRadius: number;
  timeRange: {
    from: Date | null;
    to: Date | null;
  };
  tags: string[];
  selectedCategories: Category[]; // 複数選択対応（空配列=全表示）
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
  selectedCategories: [], // 何も選択されていなければ全カテゴリ表示
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
    setSelectedCategories: (state, action: PayloadAction<Category[]>) => {
      state.selectedCategories = action.payload
    },
    toggleCategory: (state, action: PayloadAction<Category>) => {
      const c = action.payload
      if (state.selectedCategories.includes(c)) {
        state.selectedCategories = state.selectedCategories.filter(x => x !== c)
      } else {
        state.selectedCategories.push(c)
      }
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
