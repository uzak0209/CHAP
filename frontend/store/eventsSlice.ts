import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Event  ,Status, LocationState} from '@/types/types'
import { apiClient, API_ENDPOINTS } from '@/lib/api';

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

export const fetchEvents = createAsyncThunk<Event[], void>(
  'events/fetchEvents',
  async () => {
    return await apiClient.get<Event[]>(API_ENDPOINTS.events.list);
  }
)

export const fetchAroundEvents = createAsyncThunk<Event[], { lat: number; lng: number }>(
  'events/fetchAround',
  async (params) => {
    // 位置情報検索用の別エンドポイント
    return await apiClient.post<Event[]>(API_ENDPOINTS.events.around, params);
  }
)
export const fetchEvent = createAsyncThunk<Event, string>(
  'events/fetch',
  async (id) => {
    return await apiClient.get<Event>(API_ENDPOINTS.events.get(id));
  }
)
export const createEvent = createAsyncThunk<Event, Omit<Event, 'id' | 'user_id' | 'created_time' | 'updated_at'>>(
  'events/create',
  async (eventData) => {
    return await apiClient.post<Event>(API_ENDPOINTS.events.create, eventData);
  }
)

export const updateEvent = createAsyncThunk<Event, { id: string; data: Partial<Event> }>(
  'events/update',
  async ({ id, data }) => {
    return await apiClient.put<Event>(API_ENDPOINTS.events.update(id), data);
  }
)

export const deleteEvent = createAsyncThunk<string, string>(
  'events/delete',
  async (id: string) => {
    await apiClient.delete(API_ENDPOINTS.events.delete(id));
    return id;
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
      .addCase(fetchAroundEvents.pending, (state) => {
        state.loading.fetch = true
        state.error.fetch = null
      })
      .addCase(fetchAroundEvents.fulfilled, (state, action) => {
        state.loading.fetch = false
        console.log("位置情報周辺のイベントを取得しました", action.payload);
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
        const index = state.items.findIndex(e => String(e.id )=== action.meta.arg.id)
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
        state.items = state.items.filter(e => String(e.id) !== action.meta.arg)
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading.delete = false
        state.error.delete = action.error.message || 'イベントの削除に失敗しました'
      })
  }
})

export const eventsActions = eventsSlice.actions
export default eventsSlice.reducer