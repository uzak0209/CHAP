import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Thread } from '../types/types'
import { getAuthToken } from './authSlice';

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
    const response = await fetch('http://localhost:8080/api/v1/around/thread', {
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
  async (threadData: Omit<Thread, 'id' | 'created_time' | 'updated_at'>) => {
    const token=getAuthToken();
          
      const headers={
        'Content-Type':'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` } )
      }
    const response = await fetch('http://localhost:8080/api/v1/create/thread', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(threadData),
    })
    if (!response.ok) throw new Error('Failed to create thread')
    const result = await response.json()
    return result.thread || result
  }
)
export const fetchThread = createAsyncThunk(
  'threads/fetch',
  async (id: string) => { // string に変更
    const response = await fetch(`http://localhost:8080/api/v1/thread/${id}`)
    if (!response.ok) throw new Error('Failed to fetch thread')
    return response.json()
  }
)

export const updateThread = createAsyncThunk(
  'threads/update',
  async (id: string) => { // string に変更
    const response = await fetch(`http://localhost:8080/api/v1/update/thread/${id}`)
    if (!response.ok) throw new Error('Failed to get thread update data')
    return response.json()
  }
)

export const editThread = createAsyncThunk(
  'threads/edit',
  async ({ id, data }: { id: string; data: Partial<Thread> }) => { // string に変更
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await fetch(`http://localhost:8080/api/v1/edit/thread/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to edit thread')
    return response.json()
  }
)

export const deleteThread = createAsyncThunk(
  'threads/delete',
  async (id: string): Promise<string> => { // string に変更
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await fetch(`http://localhost:8080/api/v1/delete/thread/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) throw new Error('Failed to delete thread')
    return id
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
      // fetchAroundThreads
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

      // createThread
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

      // fetchThreadById
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

      // updateThread
      .addCase(updateThread.pending, (state) => {
        state.loading.fetch = true
        state.error.fetch = null
      })
      .addCase(updateThread.fulfilled, (state, action) => {
        state.loading.fetch = false
        // 更新用データは既存アイテムには反映しない
      })
      .addCase(updateThread.rejected, (state, action) => {
        state.loading.fetch = false
        state.error.fetch = action.error.message || '更新データの取得に失敗しました'
      })

      // editThread
      .addCase(editThread.pending, (state) => {
        state.loading.update = true
        state.error.update = null
      })
      .addCase(editThread.fulfilled, (state, action) => {
        state.loading.update = false
        const index = state.items.findIndex(t => t.id === action.meta.arg.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(editThread.rejected, (state, action) => {
        state.loading.update = false
        state.error.update = action.error.message || 'スレッドの編集に失敗しました'
      })

      // deleteThread
      .addCase(deleteThread.pending, (state) => {
        state.loading.delete = true
        state.error.delete = null
      })
      .addCase(deleteThread.fulfilled, (state, action) => {
        state.loading.delete = false
        state.items = state.items.filter(t => t.id !== action.payload)
      })
      .addCase(deleteThread.rejected, (state, action) => {
        state.loading.delete = false
        state.error.delete = action.error.message || 'スレッドの削除に失敗しました'
      })
  }
})

export const threadsActions = threadsSlice.actions
export default threadsSlice.reducer
