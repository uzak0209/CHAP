import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  type: 'text' | 'image' | 'stamp';
  timestamp: string;
}

interface ChatRoom {
  id: string;
  title: string;
  createdAt: string;
  expiresAt: string;
  location: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  participants: string[];
  messages: ChatMessage[];
}

interface ChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  rooms: [],
  currentRoom: null,
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setRooms: (state, action: PayloadAction<ChatRoom[]>) => {
      state.rooms = action.payload;
    },
    addRoom: (state, action: PayloadAction<ChatRoom>) => {
      state.rooms.push(action.payload);
    },
    setCurrentRoom: (state, action: PayloadAction<ChatRoom | null>) => {
      state.currentRoom = action.payload;
    },
    addMessage: (state, action: PayloadAction<{ roomId: string; message: ChatMessage }>) => {
      const room = state.rooms.find(r => r.id === action.payload.roomId);
      if (room) {
        room.messages.push(action.payload.message);
      }
      if (state.currentRoom?.id === action.payload.roomId) {
        state.currentRoom.messages.push(action.payload.message);
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setLoading, setRooms, addRoom, setCurrentRoom, addMessage, setError } = chatSlice.actions;
export default chatSlice.reducer; 