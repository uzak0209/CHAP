export type Category = 'entertainment' | 'community'| 'disaster';
export type Content=Post | Thread | Event;
export type ContentType = 'thread' | 'post' | 'event';
export interface Post {
  id: number;           // 自動インクリメントのID
  user_id: string;      // UUIDの文字列
  coordinate: {
    lat: number;
    lng: number;
  };
  created_at: string;
  deleted_at?: string;
  updated_at?: string;
  content: string;
  category: Category;     // カテゴリフィールド（必須）
  valid: boolean;
  like: number;         // int
  tags: string[];
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
  category: Category;    // カテゴリフィールドを追加（必須）
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
  created_at: string;
  deleted_at?: string;
  updated_at?: string;
  content: string;
  category: Category;    // カテゴリフィールド（必須）
  valid: boolean;
  like: number;         // int
  tags: string[];
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
  id: string;           // UUIDの文字列
  name: string;
}

// いいね関連
export interface PostLikes {
  user_id: string;      // UUIDの文字列
  post_id:  number;    
}

export interface ThreadLikes {
  user_id: string;      // UUIDの文字列
  thread_id: number;  
}

export interface EventLikes {
  user_id: string;      // UUIDの文字列
  event_id: number;     
}

export interface Coordinate {
  lat: number;
  lng: number;
}

export type LatLng = { lat: number; lng: number };

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

// マーカー関連の型定義
export interface MarkerRefs {
  markersRef: React.RefObject<mapboxgl.Marker[]>;
  threadMarkersRef: React.RefObject<mapboxgl.Marker[]>;
  eventMarkersRef: React.RefObject<mapboxgl.Marker[]>;
  currentLocationMarkerRef: React.RefObject<mapboxgl.Marker | null>;
}

// マーカー追加関数の型
export interface MarkerFunctions {
  addPostMarkers: () => void;
  addThreadMarkers: () => void;
  addEventMarkers: () => void;
  addCurrentLocationMarker: () => void;
}

// マップ制御関数の型
export interface MapControlFunctions {
  toggle3D: () => void;
  changeMapView: (view: number) => void;
}