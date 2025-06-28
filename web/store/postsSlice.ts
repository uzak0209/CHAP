import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Post } from '../types/types'

export interface PostsState {
  items: Post[]
  selectedPost: Post | null
  loading: boolean
  error: string | null
  pagination: {
    hasMore: boolean
    lastUpdated: number
  }
}

const initialState: PostsState = {
  items: [],
  selectedPost: null,
  loading: false,
  error: null,
  pagination: {
    hasMore: true,
    lastUpdated: 0
  }
}

// Async Thunks
export const fetchAroundPosts = createAsyncThunk(
  'posts/fetchAround',
  async (params: { lat: number; lng: number }) => {
    const response = await fetch('/api/v1/around/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
    if (!response.ok) throw new Error('Failed to fetch posts')
    return response.json()
  }
)

export const createPost = createAsyncThunk(
  'posts/create',
  async (postData: Omit<Post, 'id' | 'created_time'>) => {
    const response = await fetch('/api/v1/create/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })
    if (!response.ok) throw new Error('Failed to create post')
    return response.json()
  }
)

export const fetchPost = createAsyncThunk(
  'posts/fetchById',
  async (id: number) => {
    const response = await fetch(`/api/v1/post/${id}`)
    if (!response.ok) throw new Error('Failed to fetch post')
    return response.json()
  }
)

export const updatePost = createAsyncThunk(
  'posts/update',
  async ({ id, data }: { id: number; data: Partial<Post> }) => {
    const response = await fetch(`/api/v1/update/post/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update post')
    return response.json()
  }
)

export const deletePost = createAsyncThunk(
  'posts/delete',
  async (id: number) => {
    const response = await fetch(`/api/v1/delete/post/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete post')
    return { id }
  }
)

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.items = action.payload
      state.error = null
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.items.unshift(action.payload)
    },
    updatePostLocal: (state, action: PayloadAction<Post>) => {
      const index = state.items.findIndex(p => p.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
    removePost: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(p => p.id !== action.payload)
    },
    setSelectedPost: (state, action: PayloadAction<Post | null>) => {
      state.selectedPost = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.loading = false
    },
    updatePagination: (state, action: PayloadAction<{hasMore: boolean, lastUpdated: number}>) => {
      state.pagination = action.payload
    },
    clearPosts: (state) => {
      state.items = []
      state.selectedPost = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Around Posts
      .addCase(fetchAroundPosts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAroundPosts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchAroundPosts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch posts'
      })
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.loading = true
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.post) {
          state.items.unshift(action.payload.post)
        }
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create post'
      })
      // Fetch Post
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.selectedPost = action.payload
      })
      // Update Post
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        if (state.selectedPost?.id === action.payload.id) {
          state.selectedPost = action.payload
        }
      })
      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload.id)
        if (state.selectedPost?.id === action.payload.id) {
          state.selectedPost = null
        }
      })
  }
})

export const postsActions = postsSlice.actions
export default postsSlice.reducer
