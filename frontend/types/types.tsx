// Goのtypes.goに合わせた正しい型定義
export type PostCategory = 'entertainment' | 'community' | 'information' | 'disaster';
export type EventCategory = 'entertainment' | 'community' | 'information' | 'disaster' | 'food' | 'event';

export interface Post {
  ID: number;           // 自動インクリメントのID
  User_id: string;      // UUIDの文字列
  Coordinate: {
    Lat: number;
    Lng: number;
  };
  Created_at: string;
  Deleted_at?: string;
  Updated_at?: string;
  Content: string;
  Category: string;     // カテゴリフィールド（必須）
  Valid: boolean;
  Like: number;         // int
  Tags: string[];
}

export interface Thread {
  id: number;
  user_id: string;      // UUIDの文字列
  coordinate: {
    lat: number;
    lng: number;
  };
  created_at: string;
  deleted_at?: string;
  updated_at?: string;
  content: string;
  category: string;    // カテゴリフィールドを追加（必須）
  valid: boolean;
  like: number;         // int
  tags: string[];
}

export interface Event {
  id: number;
  user_id: string;      // UUIDの文字列
  coordinate: {
    lat: number;
    lng: number;
  };
  Created_at: string;
  Deleted_at?: string;
  Updated_at?: string;
  Content: string;
  Category: string;    // カテゴリフィールド（必須）
  Valid: boolean;
  Like: number;         // int
  Tags: string[];
}
export interface Comment{
  id: number;
  user_id: string;      // UUIDの文字列
  content: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  thread_id: number;

}
export interface User {
  ID: string;           // UUIDの文字列
  Name: string;
}

// いいね関連
export interface PostLikes {
  User_id: string;      // UUIDの文字列
  Post_id:  number;    
}

export interface ThreadLikes {
  User_id: string;      // UUIDの文字列
  Thread_id: number;  
}

export interface EventLikes {
  User_id: string;      // UUIDの文字列
  Event_id: number;     
}

export interface Coordinate {
  Lat: number;
  Lng: number;
}

export type LatLng = { Lat: number; Lng: number };

// Immerと互換性のある型定義に修正
export type LocationState = {
  state: Status;
  location: LatLng;
  error: string | undefined;
};
export enum Permission {
  GRANTED = "granted",
  DENIED = "denied",
  PROMPT = "prompt",
  UNKNOWN = "unknown",
}

export enum Status {
  LOADING = "loading",
  LOADED = "loaded",
  ERROR = "error",
  IDLE = "idle",
}
