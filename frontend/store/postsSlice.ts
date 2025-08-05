import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Post } from '../types/types'
import { apiClient, API_ENDPOINTS } from '../lib/api'

export interface PostsState {
  items: Post[];
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

const initialState: PostsState = {
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
export const fetchPosts = createAsyncThunk<Post[], void>(
  'posts/fetchPosts',
  async () => {
    return await apiClient.get<Post[]>(API_ENDPOINTS.posts.list);
  }
)

export const fetchAroundPosts = createAsyncThunk<Post[], { lat: number; lng: number }>(
  'posts/fetchAround',
  async (params: { lat: number; lng: number }) => {
    // 位置情報検索用の既存エンドポイント
    return await apiClient.post<Post[]>(API_ENDPOINTS.around.posts, params);
  }
)

export const createPost = createAsyncThunk<Post, Omit<Post, 'id' | 'user_id' | 'created_time' | 'updated_at'>>(
  'posts/create',
  async (postData) => {
    return await apiClient.post<Post>(API_ENDPOINTS.posts.create, postData);
  }
)

export const fetchPost = createAsyncThunk<Post, number>(
  'posts/fetch',
  async (id: number) => {
    return await apiClient.get<Post>(API_ENDPOINTS.posts.get(id.toString()));
  }
)

export const updatePost = createAsyncThunk<Post, { id: number; data: Partial<Post> }>(
  'posts/update',
  async ({ id, data }) => {
    return await apiClient.put<Post>(API_ENDPOINTS.posts.update(id.toString()), data);
  }
)

export const deletePost = createAsyncThunk<number, number>(
  'posts/delete',
  async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.posts.delete(id.toString()));
    return id;
  }
)

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearPostErrors: (state) => {
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

      // fetchAroundPosts
      .addCase(fetchAroundPosts.pending, (state) => {
        state.loading.fetch = true
        state.error.fetch = null
      })
      .addCase(fetchAroundPosts.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.items = action.payload
      })
      .addCase(fetchAroundPosts.rejected, (state, action) => {
        state.loading.fetch = false
        state.error.fetch = action.error.message || '投稿の取得に失敗しました'
      })

      // createPost
      .addCase(createPost.pending, (state) => {
        state.loading.create = true
        state.error.create = null
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading.create = false
        if (action.payload) {
          state.items.unshift(action.payload)
        }
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading.create = false
        state.error.create = action.error.message || '投稿の作成に失敗しました'
      })

      // fetchPost
      .addCase(fetchPost.pending, (state) => {
        state.loading.fetch = true
        state.error.fetch = null
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.loading.fetch = false
        const index = state.items.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        } else {
          state.items.push(action.payload)
        }
      })
      .addCase(fetchPost.rejected, (state, action) => {
        state.loading.fetch = false
        state.error.fetch = action.error.message || '投稿の取得に失敗しました'
      })

      // updatePost
      .addCase(updatePost.pending, (state) => {
        state.loading.update = true
        state.error.update = null
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading.update = false
        const index = state.items.findIndex(p => p.id === action.meta.arg.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading.update = false
        state.error.update = action.error.message || '投稿の更新に失敗しました'
      })

      // deletePost
      .addCase(deletePost.pending, (state) => {
        state.loading.delete = true
        state.error.delete = null
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading.delete = false
        state.items = state.items.filter(p => p.id !== action.payload)
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading.delete = false
        state.error.delete = action.error.message || '投稿の削除に失敗しました'
      })
  }
})

export const postsActions = postsSlice.actions
export default postsSlice.reducer