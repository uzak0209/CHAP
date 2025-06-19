import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Post {
  id: string;
  userId: string;
  content: string;
  images?: string[];
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  tags: string[];
  category: string;
  createdAt: string;
  distance?: number;
  reactions: {
    likes: number;
    comments: number;
  };
}

interface PostsState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  sortBy: 'time' | 'distance';
  filter: {
    tags: string[];
    category: string;
    radius: number;
  };
}

const initialState: PostsState = {
  posts: [],
  isLoading: false,
  error: null,
  sortBy: 'time',
  filter: {
    tags: [],
    category: '',
    radius: 5, // km
  },
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'time' | 'distance'>) => {
      state.sortBy = action.payload;
    },
    setFilter: (state, action: PayloadAction<Partial<PostsState['filter']>>) => {
      state.filter = { ...state.filter, ...action.payload };
    },
  },
});

export const { setLoading, setPosts, addPost, setError, setSortBy, setFilter } = postsSlice.actions;
export default postsSlice.reducer; 