import { createSlice } from '@reduxjs/toolkit';
const initialState = {
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
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setPosts: (state, action) => {
            state.posts = action.payload;
        },
        addPost: (state, action) => {
            state.posts.unshift(action.payload);
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setSortBy: (state, action) => {
            state.sortBy = action.payload;
        },
        setFilter: (state, action) => {
            state.filter = { ...state.filter, ...action.payload };
        },
    },
});
export const { setLoading, setPosts, addPost, setError, setSortBy, setFilter } = postsSlice.actions;
export default postsSlice.reducer;
