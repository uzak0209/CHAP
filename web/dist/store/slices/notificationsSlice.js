import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
};
const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setNotifications: (state, action) => {
            state.notifications = action.payload;
            state.unreadCount = action.payload.filter(n => !n.isRead).length;
        },
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            if (!action.payload.isRead) {
                state.unreadCount += 1;
            }
        },
        markAsRead: (state, action) => {
            const notification = state.notifications.find(n => n.id === action.payload);
            if (notification && !notification.isRead) {
                notification.isRead = true;
                state.unreadCount -= 1;
            }
        },
        markAllAsRead: (state) => {
            state.notifications.forEach(n => n.isRead = true);
            state.unreadCount = 0;
        },
    },
});
export const { setLoading, setNotifications, addNotification, markAsRead, markAllAsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
