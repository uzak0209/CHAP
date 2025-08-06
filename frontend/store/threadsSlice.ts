import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Thread } from '../types/types'
import { apiClient, API_ENDPOINTS } from '@/lib/api'

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
export const fetchAroundThreads = createAsyncThunk<Thread[], { lat: number; lng: number }>(
  'threads/fetchAround',
  async (params: { lat: number; lng: number }) => {
    return await apiClient.post<Thread[]>(API_ENDPOINTS.threads.around, params);
  }
)

export const createThread = createAsyncThunk<Thread, Omit<Thread, 'id' | 'user_id' | 'Created_at' | 'Updated_at'>>(
  'threads/create',
  async (threadData) => {
    return await apiClient.post<Thread>(API_ENDPOINTS.threads.create, threadData);
  }
)

export const fetchThread = createAsyncThunk<Thread, number>(
  'threads/fetch',
  async (id: number) => {
    return await apiClient.get<Thread>(API_ENDPOINTS.threads.get(id.toString()));
  }
)

// 修正: 指定したタイムスタンプ以降に更新されたスレッドを取得
export const fetchUpdatedThreads = createAsyncThunk<Thread[], number>(
  'threads/fetchUpdated',
  async (fromTimestamp: number) => {
    return await apiClient.get<Thread[]>(API_ENDPOINTS.threads.update(fromTimestamp));
  }
)

// 修正: スレッド編集用の関数
export const editThread = createAsyncThunk<Thread, { id: number; data: Partial<Thread> }>(
  'threads/edit',
  async ({ id, data }) => {
    return await apiClient.put<Thread>(API_ENDPOINTS.threads.edit(id.toString()), data);
  }
)

export const deleteThread = createAsyncThunk<string, number>(
  'threads/delete',
  async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.threads.delete(id.toString()));
    return id.toString();
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

      // fetchThread
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

      // fetchUpdatedThreads（新規追加）
      .addCase(fetchUpdatedThreads.pending, (state) => {
        state.loading.update = true
        state.error.update = null
      })
      .addCase(fetchUpdatedThreads.fulfilled, (state, action) => {
        state.loading.update = false
        // 更新されたスレッドをマージ
        action.payload.forEach(updatedThread => {
          const index = state.items.findIndex(t => t.id === updatedThread.id)
          if (index !== -1) {
            state.items[index] = updatedThread
          } else {
            state.items.push(updatedThread)
          }
        })
      })
      .addCase(fetchUpdatedThreads.rejected, (state, action) => {
        state.loading.update = false
        state.error.update = action.error.message || '更新されたスレッドの取得に失敗しました'
      })

      // editThread
      .addCase(editThread.pending, (state) => {
        state.loading.update = true
        state.error.update = null
      })
      .addCase(editThread.fulfilled, (state, action) => {
        state.loading.update = false
        const index = state.items.findIndex(t => t.id === action.payload.id)
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
        state.items = state.items.filter(t => String(t.id) !== action.payload)
      })
      .addCase(deleteThread.rejected, (state, action) => {
        state.loading.delete = false
        state.error.delete = action.error.message || 'スレッドの削除に失敗しました'
      })
  }
})

export const threadsActions = threadsSlice.actions
export default threadsSlice.reducer