import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Post } from '../types/types'
import { get } from 'http';

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
export const fetchAroundPosts = createAsyncThunk(
  'posts/fetchAround',
  async (params: { lat: number; lng: number }) => {
    const response = await fetch('http://localhost:8080/api/v1/around/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    if (!response.ok) throw new Error('Failed to fetch posts')
    return response.json()
  }
)
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || null;
  }
  return null;
}
export const createPost = createAsyncThunk(
  'posts/create',
  async (postData: Omit<Post, 'id' | 'user_id' | 'created_time' | 'updated_at'>) => {
    const token=getAuthToken();
    const headers={
      'Content-Type':'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` } )
    }
    const response = await fetch('http://localhost:8080/api/v1/create/post', {
      method: 'POST',
      headers,
      body: JSON.stringify(postData),
    })
    if (!response.ok) throw new Error('Failed to create post')
    const result = await response.json()
    return result.post || result
  }
)

export const fetchPost= createAsyncThunk(
  'posts/fetch',
  async (id: number) => { // string に変更
    const response = await fetch(`http://localhost:8080/api/v1/post/${id}`)
    if (!response.ok) throw new Error('Failed to fetch post')
    return response.json()
  }
)

export const updatePost = createAsyncThunk(
  'posts/update',
  async (id: number) => { // string に変更
    const response = await fetch(`http://localhost:8080/api/v1/update/post/${id}`)
    if (!response.ok) throw new Error('Failed to get post update data')
    return response.json()
  }
)

export const editPost = createAsyncThunk(
  'posts/edit',
  async ({ id, data }: { id: number; data: Partial<Post> }) => { // string に変更
    const response = await fetch(`http://localhost:8080/api/v1/edit/post/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to edit post')
    return response.json()
  }
)

export const deletePost = createAsyncThunk(
  'posts/delete',
  async (id: number): Promise<number> => { // string に変更
    const response = await fetch(`http://localhost:8080/api/v1/delete/post/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete post')
    return id
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
        state.loading.fetch = true
        state.error.fetch = null
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading.fetch = false
        // 更新用データは既存アイテムには反映しない
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading.fetch = false
        state.error.fetch = action.error.message || '更新データの取得に失敗しました'
      })

      // editPost
      .addCase(editPost.pending, (state) => {
        state.loading.update = true
        state.error.update = null
      })
      .addCase(editPost.fulfilled, (state, action) => {
        state.loading.update = false
        const index = state.items.findIndex(p => p.id === action.meta.arg.id)
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
