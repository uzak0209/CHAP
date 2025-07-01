import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Thread } from '../types/types'

export interface ThreadsState {
  items: Thread[];
  loading: {
    fetch: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  error: {
    fetch: string | null;
    create: string | null;
    update: string | null;
    delete: string | null;
  };
}

const initialState: ThreadsState = {
  items: [],
  loading: {
    fetch: false,
    create: false,
    update: false,
    delete: false,
  },
  error: {
    fetch: null,
    create: null,
    update: null,
    delete: null,
  },
}

// Async Thunks
export const fetchAroundThreads = createAsyncThunk(
  'threads/fetchAround',
  async (params: { lat: number; lng: number }) => {
    const response = await fetch('/api/v1/around/thread', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    if (!response.ok) throw new Error('Failed to fetch threads')
    return response.json()
  }
)

export const createThread = createAsyncThunk(
  'threads/create',
  async (threadData: Omit<Thread, 'id' | 'created_time'>) => {
    const response = await fetch('/api/v1/create/thread', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(threadData),
    })
    if (!response.ok) throw new Error('Failed to create thread')
    const result = await response.json()
    return result.thread || result
  }
)

export const fetchThread = createAsyncThunk(
  'threads/fetchById',
  async (id: number) => {
    const response = await fetch(`/api/v1/thread/${id}`)
    if (!response.ok) throw new Error('Failed to fetch thread')
    return response.json()
  }
)

export const updateThread = createAsyncThunk(
  'threads/update',
  async ({ id, data }: { id: number; data: Partial<Thread> }) => {
    const response = await fetch(`/api/v1/update/thread/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update thread')
    return response.json()
  }
)

export const deleteThread = createAsyncThunk(
  'threads/delete',
  async (id: number): Promise<void> => {
    const response = await fetch(`/api/v1/delete/thread/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete thread')
  }
)

const threadsSlice = createSlice({
  name: 'threads',
  initialState,
  reducers: {
    clearThreadErrors: (state) => {
      state.error = {
        fetch: null,
        create: null,
        update: null,
        delete: null,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Around Threads
      .addCase(fetchAroundThreads.pending, (state) => {
        state.loading.fetch = true
        state.error.fetch = null
      })
      .addCase(fetchAroundThreads.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.items = action.payload
      })
      .addCase(fetchAroundThreads.rejected, (state, action) => {
        state.loading.fetch = false
        state.error.fetch = action.error.message || 'スレッドの取得に失敗しました'
      })
      // Create Thread
      .addCase(createThread.pending, (state) => {
        state.loading.create = true
        state.error.create = null
      })
      .addCase(createThread.fulfilled, (state, action) => {
        state.loading.create = false
        if (action.payload) {
          state.items.unshift(action.payload)
        }
      })
      .addCase(createThread.rejected, (state, action) => {
        state.loading.create = false
        state.error.create = action.error.message || 'スレッドの作成に失敗しました'
      })
      // Fetch Thread
      .addCase(fetchThread.pending, (state) => {
        state.loading.fetch = true
        state.error.fetch = null
      })
      .addCase(fetchThread.fulfilled, (state, action) => {
        state.loading.fetch = false
        const index = state.items.findIndex(t => t.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        } else {
          state.items.push(action.payload)
        }
      })
      .addCase(fetchThread.rejected, (state, action) => {
        state.loading.fetch = false
        state.error.fetch = action.error.message || 'スレッドの取得に失敗しました'
      })
      // Update Thread
      .addCase(updateThread.pending, (state) => {
        state.loading.update = true
        state.error.update = null
      })
      .addCase(updateThread.fulfilled, (state, action) => {
        state.loading.update = false
        const index = state.items.findIndex(t => t.id === action.meta.arg.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updateThread.rejected, (state, action) => {
        state.loading.update = false
        state.error.update = action.error.message || 'スレッドの更新に失敗しました'
      })
      // Delete Thread
      .addCase(deleteThread.pending, (state) => {
        state.loading.delete = true
        state.error.delete = null
      })
      .addCase(deleteThread.fulfilled, (state, action) => {
        state.loading.delete = false
        state.items = state.items.filter(t => t.id !== action.meta.arg)
      })
      .addCase(deleteThread.rejected, (state, action) => {
        state.loading.delete = false
        state.error.delete = action.error.message || 'スレッドの削除に失敗しました'
      })
  }
})

export const threadsActions = threadsSlice.actions
export default threadsSlice.reducer
