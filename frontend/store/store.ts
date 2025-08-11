import { configureStore } from '@reduxjs/toolkit'

// Import all reducers
import authReducer, { AuthState } from './authSlice'
import locationReducer from './locationSlice'
import postsReducer, { PostsState } from './postsSlice'
import threadsReducer, { ThreadsState } from './threadsSlice'
import eventsReducer, { EventsState } from './eventsSlice'
import filtersReducer, { FiltersState } from './filtersSlice'
import uiReducer, { UIState } from './uiSlice'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import { LocationState } from '@/types/types'
// Re-export actions
export { authActions } from './authSlice'
export { locationActions, getCurrentLocation } from './locationSlice'
export { postsActions, fetchPosts, createPost, fetchPost, fetchUpdatedPosts, deletePost } from './postsSlice'
export { threadsActions, fetchThreads, createThread, fetchThread, fetchUpdatedThreads, deleteThread } from './threadsSlice'
export { eventsActions, fetchEvents, createEvent,  fetchUpdatedEvents, deleteEvent } from './eventsSlice'
export { filtersActions } from './filtersSlice'
export { uiActions } from './uiSlice'

// Re-export types
export * from '@/types/types'

// Store Configuration
export const store = configureStore({
  reducer: {
    auth: authReducer,
    location: locationReducer,
    posts: postsReducer,
    threads: threadsReducer,
    events: eventsReducer,
    filters: filtersReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['filters/setTimeRange'],
        ignoredPaths: ['filters.timeRange.from', 'filters.timeRange.to'],
      },
    }),
})

// Export types
export type RootState = {
  auth: AuthState
  location: LocationState
  posts: PostsState
  threads: ThreadsState
  events: EventsState
  filters: FiltersState
  ui: UIState
}

export type AppDispatch = typeof store.dispatch

// Export selectors
export const selectAuth = (state: RootState) => state.auth
export const selectLocation = (state: RootState) => state.location
export const selectPosts = (state: RootState) => state.posts
export const selectThreads = (state: RootState) => state.threads
export const selectEvents = (state: RootState) => state.events
export const selectFilters = (state: RootState) => state.filters
export const selectUI = (state: RootState) => state.ui
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export default store
