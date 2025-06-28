import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Event } from '../types/types'

export interface EventsState {
  items: Event[]
  selectedEvent: Event | null
  loading: boolean
  error: string | null
}

const initialState: EventsState = {
  items: [],
  selectedEvent: null,
  loading: false,
  error: null
}

// Async Thunks
export const fetchAroundEvents = createAsyncThunk(
  'events/fetchAround',
  async (params: { lat: number; lng: number }) => {
    const response = await fetch('/api/v1/around/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })
    if (!response.ok) throw new Error('Failed to create event')
    return response.json()
  }
)

export const fetchEvent = createAsyncThunk(
  'events/fetchById',
  async (id: number) => {
    const response = await fetch(`/api/v1/event/${id}`)
    if (!response.ok) throw new Error('Failed to fetch event')
    return response.json()
  }
)

export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ id, data }: { id: number; data: Partial<Event> }) => {
    const response = await fetch(`/api/v1/update/event/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update event')
    return response.json()
  }
)

export const deleteEvent = createAsyncThunk(
  'events/delete',
  async (id: number) => {
    const response = await fetch(`/api/v1/delete/event/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete event')
    return { id }
  }
)

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setEvents: (state, action: PayloadAction<Event[]>) => {
      state.items = action.payload
      state.error = null
    },
    addEvent: (state, action: PayloadAction<Event>) => {
      state.items.unshift(action.payload)
    },
    updateEventLocal: (state, action: PayloadAction<Event>) => {
      const index = state.items.findIndex(e => e.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
    removeEvent: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(e => e.id !== action.payload)
    },
    setSelectedEvent: (state, action: PayloadAction<Event | null>) => {
      state.selectedEvent = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.loading = false
    },
    clearEvents: (state) => {
      state.items = []
      state.selectedEvent = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Around Events
      .addCase(fetchAroundEvents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAroundEvents.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchAroundEvents.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch events'
      })
      // Create Event
      .addCase(createEvent.pending, (state) => {
        state.loading = true
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.event) {
          state.items.unshift(action.payload.event)
        }
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create event'
      })
      // Fetch Event
      .addCase(fetchEvent.fulfilled, (state, action) => {
        state.selectedEvent = action.payload
      })
      // Update Event
      .addCase(updateEvent.fulfilled, (state, action) => {
        const index = state.items.findIndex(e => e.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        if (state.selectedEvent?.id === action.payload.id) {
          state.selectedEvent = action.payload
        }
      })
      // Delete Event
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.items = state.items.filter(e => e.id !== action.payload.id)
        if (state.selectedEvent?.id === action.payload.id) {
          state.selectedEvent = null
        }
      })
  }
})

export const eventsActions = eventsSlice.actions
export default eventsSlice.reducer
