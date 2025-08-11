// Redux Store の便利なエクスポート集約ファイル
export { default as store } from './store'
export type { RootState, AppDispatch } from './store'
export { useAppDispatch, useAppSelector } from './store'
export * from './store'

// 個別スライスの直接エクスポート
export { default as authSlice, authActions } from './authSlice'
export { default as locationSlice, locationActions, getCurrentLocation } from './locationSlice'
export { default as postsSlice, postsActions, fetchPosts, createPost, fetchPost, editPost, deletePost } from './postsSlice'
export { default as threadsSlice, threadsActions, fetchThreads, createThread, fetchThread, editThread, deleteThread } from './threadsSlice'
export { default as eventsSlice, eventsActions, fetchEvents, createEvent} from './eventsSlice'
export { default as filtersSlice, filtersActions } from './filtersSlice'
export { default as uiSlice, uiActions } from './uiSlice'

// 型定義
export * from '../types/types'
