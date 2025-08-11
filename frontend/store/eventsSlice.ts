import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Event } from '../types/types'
import { apiClient, API_ENDPOINTS } from '@/lib/api'

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

// Async Thunks
export const fetchEvents = createAsyncThunk<Event[], { lat: number; lng: number }>(
  'events/fetchEvents',
  async (params: { lat: number; lng: number }) => {
    return await apiClient.post<Event[]>(API_ENDPOINTS.events.list, params);
  }
)

export const createEvent = createAsyncThunk<Event, Omit<Event, 'id' | 'user_id' | 'Created_at' | 'Updated_at'>>(
  'events/create',
  async (eventData) => {
    return await apiClient.post<Event>(API_ENDPOINTS.events.create, eventData);
  }
)

// 修正: 指定したタイムスタンプ以降に更新されたイベントを取得
export const fetchUpdatedEvents = createAsyncThunk<Event[], number>(
  'events/fetchUpdated',
  async (fromTimestamp: number) => {
    return await apiClient.get<Event[]>(API_ENDPOINTS.events.update(fromTimestamp));
  }
)

// 修正: イベント編集用の関数
export const editEvent = createAsyncThunk<Event, { id: number; data: Partial<Event> }>(
  'events/edit',
  async ({ id, data }) => {
    return await apiClient.put<Event>(API_ENDPOINTS.events.edit(id.toString()), data);
  }
)

export const deleteEvent = createAsyncThunk<string, number>(
  'events/delete',
  async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.events.delete(id.toString()));
    return id.toString();
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
      // fetchAroundEvents
      .addCase(fetchEvents.pending, (state) => {
        state.loading.fetch = true
        state.error.fetch = null
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading.fetch = false

        state.items = action.payload
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading.fetch = false
        state.error.fetch = action.error.message || 'イベントの取得に失敗しました'
      })

      // createEvent
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


      // fetchUpdatedEvents（新規追加）
      .addCase(fetchUpdatedEvents.pending, (state) => {
        state.loading.update = true
        state.error.update = null
      })
      .addCase(fetchUpdatedEvents.fulfilled, (state, action) => {
        state.loading.update = false
        // 更新されたイベントをマージ
        action.payload.forEach(updatedEvent => {
          const index = state.items.findIndex(e => e.id === updatedEvent.id)
          if (index !== -1) {
            state.items[index] = updatedEvent
          } else {
            state.items.push(updatedEvent)
          }
        })
      })
      .addCase(fetchUpdatedEvents.rejected, (state, action) => {
        state.loading.update = false
        state.error.update = action.error.message || '更新されたイベントの取得に失敗しました'
      })

      // editEvent
      .addCase(editEvent.pending, (state) => {
        state.loading.update = true
        state.error.update = null
      })
      .addCase(editEvent.fulfilled, (state, action) => {
        state.loading.update = false
        const index = state.items.findIndex(e => e.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(editEvent.rejected, (state, action) => {
        state.loading.update = false
        state.error.update = action.error.message || 'イベントの編集に失敗しました'
      })

      // deleteEvent
      .addCase(deleteEvent.pending, (state) => {
        state.loading.delete = true
        state.error.delete = null
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading.delete = false
        state.items = state.items.filter(e => String(e.id) !== action.payload)
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading.delete = false
        state.error.delete = action.error.message || 'イベントの削除に失敗しました'
      })
  }
})

export const eventsActions = eventsSlice.actions
export default eventsSlice.reducer