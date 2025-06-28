import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Thread } from '../types/types'

export interface ThreadsState {
  items: Thread[]
  selectedThread: Thread | null
  loading: boolean
  error: string | null
}

const initialState: ThreadsState = {
  items: [],
  selectedThread: null,
  loading: false,
  error: null
}

// Async Thunks
export const fetchAroundThreads = createAsyncThunk(
  'threads/fetchAround',
  async (params: { lat: number; lng: number }) => {
    const response = await fetch('/api/v1/around/thread', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(threadData),
    })
    if (!response.ok) throw new Error('Failed to create thread')
    return response.json()
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update thread')
    return response.json()
  }
)

export const deleteThread = createAsyncThunk(
  'threads/delete',
  async (id: number) => {
    const response = await fetch(`/api/v1/delete/thread/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete thread')
    return { id }
  }
)

const threadsSlice = createSlice({
  name: 'threads',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setThreads: (state, action: PayloadAction<Thread[]>) => {
      state.items = action.payload
      state.error = null
    },
    addThread: (state, action: PayloadAction<Thread>) => {
      state.items.unshift(action.payload)
    },
    updateThreadLocal: (state, action: PayloadAction<Thread>) => {
      const index = state.items.findIndex(t => t.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
    removeThread: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(t => t.id !== action.payload)
    },
    setSelectedThread: (state, action: PayloadAction<Thread | null>) => {
      state.selectedThread = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.loading = false
    },
    clearThreads: (state) => {
      state.items = []
      state.selectedThread = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Around Threads
      .addCase(fetchAroundThreads.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAroundThreads.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchAroundThreads.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch threads'
      })
      // Create Thread
      .addCase(createThread.pending, (state) => {
        state.loading = true
      })
      .addCase(createThread.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.thread) {
          state.items.unshift(action.payload.thread)
        }
      })
      .addCase(createThread.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create thread'
      })
      // Fetch Thread
      .addCase(fetchThread.fulfilled, (state, action) => {
        state.selectedThread = action.payload
      })
      // Update Thread
      .addCase(updateThread.fulfilled, (state, action) => {
        const index = state.items.findIndex(t => t.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        if (state.selectedThread?.id === action.payload.id) {
          state.selectedThread = action.payload
        }
      })
      // Delete Thread
      .addCase(deleteThread.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t.id !== action.payload.id)
        if (state.selectedThread?.id === action.payload.id) {
          state.selectedThread = null
        }
      })
  }
})

export const threadsActions = threadsSlice.actions
export default threadsSlice.reducer
