// Goのtypes.goに合わせた正しい型定義
export interface Post {
  id: string;           // UUIDの文字列
  user_id: string;      // UUIDの文字列
  coordinate: {
    lat: number;
    lng: number;
  };
  created_time: string;
  deleted_time?: string;
  updated_at: string;
  content: string;
  valid: boolean;
  parent?: number;      // int
  like: number;         // int
  tags: string[];
}

export interface Thread {
  id: string;           // UUIDの文字列
  user_id: string;      // UUIDの文字列
  coordinate: {
    lat: number;
    lng: number;
  };
  created_time: string;
  deleted_time?: string;
  updated_at: string;
  content: string;
  valid: boolean;
  like: number;         // int
  tags: string[];
}

export interface Event {
  id: string;           // UUIDの文字列
  user_id: string;      // UUIDの文字列
  coordinate: {
    lat: number;
    lng: number;
  };
  created_time: string;
  deleted_time?: string;
  updated_at: string;
  content: string;
  valid: boolean;
  like: number;         // int
  tags: string[];
}

export interface User {
  id: string;           // UUIDの文字列
  name: string;
  image?: string;
}

// いいね関連
export interface PostLikes {
  user_id: string;      // UUIDの文字列
  post_id: string;      // UUIDの文字列
}

export interface ThreadLikes {
  user_id: string;      // UUIDの文字列
  thread_id: string;    // UUIDの文字列
}

export interface EventLikes {
  user_id: string;      // UUIDの文字列
  event_id: string;     // UUIDの文字列
}

export interface Coordinate {
  lat: number;
  lng: number;
}
