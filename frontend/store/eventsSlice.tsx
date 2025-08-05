import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Event } from '../types/types'
import { getAuthToken } from './authSlice';
import { Lateef } from 'next/font/google';
import { Status,LocationState } from '../types/types';
import { apiClient, API_ENDPOINTS } from '../lib/api';
export interface EventsState {
  items: Event[];
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

const initialState: EventsState = {
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

export const fetchAroundEvents = createAsyncThunk<Event[], { lat: number; lng: number }>(
  'events/fetchAround',
  async (params) => {
    return await apiClient.post<Event[]>(`${API_ENDPOINTS.events.around}`, params);
  }
)
export const fetchEvent = createAsyncThunk<Event, string>(
  'events/fetch',
  async (id) => {
    return await apiClient.get<Event>(API_ENDPOINTS.events.get(id));
  }
)
export const createEvent = createAsyncThunk(
  'events/create',
  async (eventData: Omit<Event, 'id' | 'created_time'>) => {
    const token=getAuthToken();
    const headers={
      'Content-Type':'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` } )
    }
    const response = await fetch('http://localhost:8080/api/v1/create/event', {
      method: 'POST',
      headers,
      body: JSON.stringify(eventData),
    })
    if (!response.ok) throw new Error('Failed to create event')
    const result = await response.json()
    return result.event || result
  }
)

export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ id, data }: { id: string; data: Partial<Event> }) => {
    const response = await fetch(`http://localhost:8080/api/v1/update/event/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update event')
    return response.json()
  }
)

export const deleteEvent= createAsyncThunk(
  'events/delete',
  async (id: string): Promise<void> => {
    const token = getAuthToken();
    const response = await fetch(`http://localhost:8080/api/v1/delete/event/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      }
    })
    if (!response.ok) throw new Error('Failed to delete event')
  }
)

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearEventErrors: (state) => {
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
      .addCase(fetchAroundEvents.pending, (state) => {
        state.loading.fetch = true
        state.error.fetch = null
      })
      .addCase(fetchAroundEvents.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.items = action.payload
      })
      .addCase(fetchAroundEvents.rejected, (state, action) => {
        state.loading.fetch = false
        state.error.fetch = action.error.message || 'イベントの取得に失敗しました'
      })

      .addCase(createEvent.pending, (state) => {
        state.loading.create = true
        state.error.create = null
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading.create = false
        if (action.payload) {
          state.items.unshift(action.payload)
        }
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading.create = false
        state.error.create = action.error.message || 'イベントの作成に失敗しました'
      })

      .addCase(updateEvent.pending, (state) => {
        state.loading.update = true
        state.error.update = null
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading.update = false
        const index = state.items.findIndex(e => e.id === action.meta.arg.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading.update = false
        state.error.update = action.error.message || 'イベントの更新に失敗しました'
      })

      .addCase(deleteEvent.pending, (state) => {
        state.loading.delete = true
        state.error.delete = null
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading.delete = false
        state.items = state.items.filter(e => e.id !== action.meta.arg)
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading.delete = false
        state.error.delete = action.error.message || 'イベントの削除に失敗しました'
      })
  }
})

export const eventsActions = eventsSlice.actions
export default eventsSlice.reducer
