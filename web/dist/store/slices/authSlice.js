import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    inviteCode: '',
};
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setInviteCode: (state, action) => {
            state.inviteCode = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
        },
    },
});
export const { setLoading, setUser, setError, setInviteCode, logout } = authSlice.actions;
export default authSlice.reducer;
