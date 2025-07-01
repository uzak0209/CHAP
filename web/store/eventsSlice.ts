import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Event } from '../types/types'

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

export const fetchAroundEvents = createAsyncThunk(
  'events/fetchAround',
  async (params: { lat: number; lng: number }) => {
    const response = await fetch('/api/v1/around/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    if (!response.ok) throw new Error('Failed to fetch events')
    return response.json()
  }
)

export const createEvent = createAsyncThunk(
  'events/create',
  async (eventData: Omit<Event, 'id' | 'created_time'>) => {
    const response = await fetch('/api/v1/create/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    })
    if (!response.ok) throw new Error('Failed to create event')
    const result = await response.json()
    return result.event || result
  }
)

export const updateEventById = createAsyncThunk(
  'events/update',
  async ({ id, data }: { id: number; data: Partial<Event> }) => {
    const response = await fetch(`/api/v1/update/event/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update event')
    return response.json()
  }
)

export const deleteEventById = createAsyncThunk(
  'events/delete',
  async (id: number): Promise<void> => {
    const response = await fetch(`/api/v1/delete/event/${id}`, {
      method: 'DELETE',
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

      .addCase(updateEventById.pending, (state) => {
        state.loading.update = true
        state.error.update = null
      })
      .addCase(updateEventById.fulfilled, (state, action) => {
        state.loading.update = false
        const index = state.items.findIndex(e => e.id === action.meta.arg.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updateEventById.rejected, (state, action) => {
        state.loading.update = false
        state.error.update = action.error.message || 'イベントの更新に失敗しました'
      })

      .addCase(deleteEventById.pending, (state) => {
        state.loading.delete = true
        state.error.delete = null
      })
      .addCase(deleteEventById.fulfilled, (state, action) => {
        state.loading.delete = false
        state.items = state.items.filter(e => e.id !== action.meta.arg)
      })
      .addCase(deleteEventById.rejected, (state, action) => {
        state.loading.delete = false
        state.error.delete = action.error.message || 'イベントの削除に失敗しました'
      })
  }
})

export const eventsActions = eventsSlice.actions
export default eventsSlice.reducer
