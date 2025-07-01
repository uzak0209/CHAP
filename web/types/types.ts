// 共通の型定義
export interface User {
  id: number
  name: string
  email: string
  image: string
  likes: number
}

export interface Coordinate {
  lat: number
  lng: number
}

export interface Post {
  id: number
  user_id: number
  content: string
  coordinate: Coordinate
  created_time: string
  deleted_time: string
  valid: boolean
  parent: number
  like: number
  tags: string[]
}

export interface Thread {
  id: number
  user_id: number
  content: string
  coordinate: Coordinate
  created_time: string
  deleted_time: string
  valid: boolean
  like: number
  tags: string[]
}

export interface Event {
  id: number
  user_id: number
  content: string
  coordinate: Coordinate
  created_time: string
  deleted_time: string
  valid: boolean
  like: number
  tags: string[]
}

export type ContentType = 'MESSAGE' | 'THREAD' | 'EVENT' | 'ALL'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  timestamp: number
}
