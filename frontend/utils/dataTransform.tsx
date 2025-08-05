import { Post, Thread, Event } from '@/types/types';

/**
 * データベースから取得したデータの正規化ユーティリティ
 * 大文字プロパティを小文字に変換してTypeScript型定義に合わせる
 */

// 投稿データの正規化
export const normalizePostData = (rawPost: any): Post => {
  return {
    id: rawPost.id || rawPost.ID,
    user_id: rawPost.user_id || rawPost.User_id,
    coordinate: {
      lat: rawPost.Coordinate?.Lat || rawPost.coordinate?.lat,
      lng: rawPost.Coordinate?.Lng || rawPost.coordinate?.lng,
    },
    created_at: rawPost.created_at,
    deleted_at: rawPost.deleted_at,
    updated_at: rawPost.updated_at,
    content: rawPost.Content || rawPost.content,
    category: rawPost.Category || rawPost.category,
    valid: rawPost.Valid !== undefined ? rawPost.Valid : rawPost.valid,
    like: rawPost.Like !== undefined ? rawPost.Like : rawPost.like,
    tags: rawPost.Tags || rawPost.tags || [],
  };
};

// スレッドデータの正規化
export const normalizeThreadData = (rawThread: any): Thread => {
  return {
    id: rawThread.id || rawThread.ID,
    user_id: rawThread.user_id || rawThread.User_id,
    coordinate: {
      lat: rawThread.Coordinate?.Lat || rawThread.coordinate?.lat,
      lng: rawThread.Coordinate?.Lng || rawThread.coordinate?.lng,
    },
    created_at: rawThread.created_at,
    deleted_at: rawThread.deleted_at,
    updated_at: rawThread.updated_at,
    content: rawThread.Content || rawThread.content,
    category: rawThread.Category || rawThread.category,
    valid: rawThread.Valid !== undefined ? rawThread.Valid : rawThread.valid,
    like: rawThread.Like !== undefined ? rawThread.Like : rawThread.like,
    tags: rawThread.Tags || rawThread.tags || [],
  };
};

// イベントデータの正規化
export const normalizeEventData = (rawEvent: any): Event => {
  return {
    id: rawEvent.id || rawEvent.ID,
    user_id: rawEvent.user_id || rawEvent.User_id,
    coordinate: {
      lat: rawEvent.Coordinate?.Lat || rawEvent.coordinate?.lat,
      lng: rawEvent.Coordinate?.Lng || rawEvent.coordinate?.lng,
    },
    created_at: rawEvent.created_at,
    deleted_at: rawEvent.deleted_at,
    updated_at: rawEvent.updated_at,
    content: rawEvent.Content || rawEvent.content,
    category: rawEvent.Category || rawEvent.category,
    valid: rawEvent.Valid !== undefined ? rawEvent.Valid : rawEvent.valid,
    like: rawEvent.Like !== undefined ? rawEvent.Like : rawEvent.like,
    tags: rawEvent.Tags || rawEvent.tags || [],
  };
};

// 複数の投稿データを一括正規化
export const normalizePostsData = (rawPosts: any[]): Post[] => {
  return rawPosts.map(normalizePostData);
};

// 複数のスレッドデータを一括正規化
export const normalizeThreadsData = (rawThreads: any[]): Thread[] => {
  return rawThreads.map(normalizeThreadData);
};

// 複数のイベントデータを一括正規化
export const normalizeEventsData = (rawEvents: any[]): Event[] => {
  return rawEvents.map(normalizeEventData);
};

// デバッグ用：正規化前後のデータを比較表示
export const logDataTransformation = (rawData: any, normalizedData: any, type: string) => {
  console.group(`🔄 ${type}データ正規化`);
  console.log('正規化前:', rawData);
  console.log('正規化後:', normalizedData);
  console.groupEnd();
};