import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    rooms: [],
    currentRoom: null,
    isLoading: false,
    error: null,
};
const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setRooms: (state, action) => {
            state.rooms = action.payload;
        },
        addRoom: (state, action) => {
            state.rooms.push(action.payload);
        },
        setCurrentRoom: (state, action) => {
            state.currentRoom = action.payload;
        },
        addMessage: (state, action) => {
            const room = state.rooms.find(r => r.id === action.payload.roomId);
            if (room) {
                room.messages.push(action.payload.message);
            }
            if (state.currentRoom?.id === action.payload.roomId) {
                state.currentRoom.messages.push(action.payload.message);
            }
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});
export const { setLoading, setRooms, addRoom, setCurrentRoom, addMessage, setError } = chatSlice.actions;
export default chatSlice.reducer;
