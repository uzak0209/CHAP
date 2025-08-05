import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Thread } from '../types/types'
import { apiClient, API_ENDPOINTS } from '../lib/api'

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
export const fetchThreads = createAsyncThunk<Thread[], void>(
  'threads/fetchThreads',
  async () => {
    return await apiClient.get<Thread[]>(API_ENDPOINTS.threads.list);
  }
)

export const fetchAroundThreads = createAsyncThunk<Thread[], { lat: number; lng: number }>(
  'threads/fetchAround',
  async (params: { lat: number; lng: number }) => {
    // 位置情報検索用の既存エンドポイント
    return await apiClient.post<Thread[]>(API_ENDPOINTS.threads.around, params);
  }
)

export const createThread = createAsyncThunk<Thread, Omit<Thread, 'id' | 'created_time' | 'updated_at'>>(
  'threads/create',
  async (threadData) => {
    return await apiClient.post<Thread>(API_ENDPOINTS.threads.create, threadData);
  }
)

export const fetchThread = createAsyncThunk<Thread, string>(
  'threads/fetch',
  async (id: string) => {
    return await apiClient.get<Thread>(API_ENDPOINTS.threads.get(id));
  }
)

export const updateThread = createAsyncThunk<Thread, { id: string; data: Partial<Thread> }>(
  'threads/update',
  async ({ id, data }) => {
    return await apiClient.put<Thread>(API_ENDPOINTS.threads.update(id), data);
  }
)

export const deleteThread = createAsyncThunk<string, string>(
  'threads/delete',
  async (id: string) => {
    await apiClient.delete(API_ENDPOINTS.threads.delete(id));
    return id;
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
        const index = state.items.findIndex(t => t.ID === action.payload.ID)
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

      // deleteThread
      .addCase(deleteThread.pending, (state) => {
        state.loading.delete = true
        state.error.delete = null
      })
      .addCase(deleteThread.fulfilled, (state, action) => {
        state.loading.delete = false
        state.items = state.items.filter(t => String(t.ID) !== action.payload)
      })
      .addCase(deleteThread.rejected, (state, action) => {
        state.loading.delete = false
        state.error.delete = action.error.message || 'スレッドの削除に失敗しました'
      })
  }
})

export const threadsActions = threadsSlice.actions
export default threadsSlice.reducer