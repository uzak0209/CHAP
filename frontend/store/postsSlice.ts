import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
// Update the import path to the correct location of your Post type
import { Post } from '../types/types'

import { apiClient, API_ENDPOINTS } from '@/lib/api'

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
export const fetchPosts = createAsyncThunk<Post[],  { lat: number; lng: number } >(
  'posts/fetchPosts',
  async (params:{ lat:number, lng:number }) => {
    return await apiClient.post<Post[]>(API_ENDPOINTS.posts.list,  params );
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


export const fetchUpdatedPosts = createAsyncThunk<Post[], number>(
  'posts/fetchUpdated',
  async (fromTimestamp: number) => {
    return await apiClient.get<Post[]>(API_ENDPOINTS.posts.update(fromTimestamp));
  }
)


export const editPost = createAsyncThunk<Post, { id: number; data: Partial<Post> }>(
  'posts/edit',
  async ({ id, data }) => {
    return await apiClient.put<Post>(API_ENDPOINTS.posts.edit(id.toString()), data);
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

      // fetchAroundEvents
      .addCase(fetchPosts.pending, (state) => {
        state.loading.fetch = true
        state.error.fetch = null
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading.fetch = false

        state.items = action.payload
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading.fetch = false
        state.error.fetch = action.error.message || 'イベントの取得に失敗しました'
      })


      // fetchUpdatedPosts（新規追加）
      .addCase(fetchUpdatedPosts.pending, (state) => {
        state.loading.update = true
        state.error.update = null
      })
      .addCase(fetchUpdatedPosts.fulfilled, (state, action) => {
        state.loading.update = false
        action.payload.forEach(updatedPost => {
          const index = state.items.findIndex(p => p.id === updatedPost.id)
          if (index !== -1) {
            state.items[index] = updatedPost
          } else {
            state.items.push(updatedPost)
          }
        })
      })
      .addCase(fetchUpdatedPosts.rejected, (state, action) => {
        state.loading.update = false
        state.error.update = action.error.message || '更新された投稿の取得に失敗しました'
      })

      // editPost（投稿編集用）
      .addCase(editPost.pending, (state) => {
        state.loading.update = true
        state.error.update = null
      })
      .addCase(editPost.fulfilled, (state, action) => {
        state.loading.update = false
        const index = state.items.findIndex((p: Post) => p.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(editPost.rejected, (state, action) => {
        state.loading.update = false
        state.error.update = action.error.message || '投稿の編集に失敗しました'
      })


      // deletePost
      .addCase(deletePost.pending, (state) => {
        state.loading.delete = true
        state.error.delete = null
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading.delete = false
        state.items = state.items.filter((p: Post) => p.id !== action.payload)
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading.delete = false
        state.error.delete = action.error.message || '投稿の削除に失敗しました'
      })
  }
})

export const postsActions = postsSlice.actions
export default postsSlice.reducer