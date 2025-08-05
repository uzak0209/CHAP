import React from 'react';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import { Post, Thread, Event } from '@/types/types';
import { likePost, getPostLikeStatus, likeThread, getThreadLikeStatus, likeEvent, getEventLikeStatus } from '@/lib/api';

// 投稿ポップアップのHTML生成関数
export const createPostPopupHTML = (post: Post) => {
  return `
    <div class="relative max-w-sm bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-lg rounded-2xl overflow-hidden" 
         data-post-id="${post.id}"
         style="max-width: 20rem; background: linear-gradient(to bottom right, #eff6ff, #e0e7ff); border: 1px solid #c3dafe; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-radius: 1rem; overflow: hidden; position: relative;">
      
      <!-- 吹き出しの矢印 -->
      <div class="absolute -bottom-2 left-5 w-0 h-0" 
           style="position: absolute; bottom: -8px; left: 20px; width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid #eff6ff;"></div>
      
      <!-- 投稿アイコン -->
      <div class="absolute top-2 left-2 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center"
           style="position: absolute; top: 8px; left: 8px; height: 24px; width: 24px; border-radius: 50%; background-color: #3b82f6; display: flex; align-items: center; justify-content: center;">
        <svg class="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24" style="height: 12px; width: 12px; color: white;">
          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
      </div>
      
      <!-- メッセージコンテンツ -->
      <div class="p-4 pt-8" style="padding: 1rem; padding-top: 2rem;">
        <p class="text-sm text-blue-900 leading-relaxed mb-3" 
           style="font-size: 0.875rem; color: #1e3a8a; line-height: 1.6; margin-bottom: 0.75rem;">
          ${post.content}
        </p>
        <div class="flex justify-between items-center text-xs" 
             style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem;">
          <div class="flex items-center gap-1">
            <svg id="heart-post-${post.id}" class="w-3 h-3 cursor-pointer hover:scale-110 transition-transform" fill="white" viewBox="0 0 24 24" style="width: 12px; height: 12px;">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span id="like-count-post-${post.id}" class="text-white font-medium" style="color: #efffff; font-weight: 500;">${post.like || 0}</span>
          </div>
          <div class="text-blue-600" style="color: #2563eb;">
            <span class="ml-2" style="margin-left: 0.5rem;">${new Date(post.created_time || '').toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  `;
};

// スレッドポップアップのHTML生成関数
export const createThreadPopupHTML = (thread: Thread) => {
  // 安全な日付処理
  const formatDate = () => {
    let dateStr = thread.created_time || thread.updated_at || (thread as any).timestamp;
    
    // Goのzero value日付をチェック
    if (!dateStr || dateStr === '' || dateStr === '0001-01-01T00:00:00Z') {
      return '日付不明';
    }
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime()) || date.getFullYear() <= 1) {
      return '日付不明';
    }
    
    return date.toLocaleDateString('ja-JP');
  };

  return `
    <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg shadow-lg max-w-xs cursor-pointer hover:shadow-xl transition-shadow" data-thread-id="${thread.id}">
      <div class="p-4">
        <div class="mb-3">
          <p class="text-gray-700 text-xs leading-relaxed">${thread.content ? thread.content.substring(0, 50) + (thread.content.length > 50 ? '...' : '') : ''}</p>
        </div>
        <div class="text-xs text-gray-500 border-t border-yellow-200 pt-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <svg id="heart-thread-${thread.id}" class="w-3 h-3 cursor-pointer hover:scale-110 transition-transform" fill="white" viewBox="0 0 24 24" style="width: 12px; height: 12px;">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span id="like-count-thread-${thread.id}" class="text-white font-medium" style="color: #efffff; font-weight: 500;">${thread.like || 0}</span>
            </div>
            <span class="ml-2">${formatDate()}</span>
          </div>
        </div>
      </div>
    </div>
  `;
};

// カテゴリに基づく色設定を取得する関数
const getCategoryColors = (category: string) => {
  switch (category) {
    case 'entertainment':
      return {
        background: 'linear-gradient(to bottom right, #fef2f2, #fecaca)',
        border: '#fca5a5',
        iconBg: '#ef4444',
        textColor: '#991b1b',
        arrow: '#fef2f2'
      };
    case 'community':
      return {
        background: 'linear-gradient(to bottom right, #f0fdfa, #ccfbf1)',
        border: '#5eead4',
        iconBg: '#14b8a6',
        textColor: '#134e4a',
        arrow: '#f0fdfa'
      };
    case 'information':
      return {
        background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)', 
        border: '#93c5fd',
        iconBg: '#3b82f6',
        textColor: '#1e3a8a',
        arrow: '#eff6ff'
      };
    case 'disaster':
      return {
        background: 'linear-gradient(to bottom right, #fef2f2, #fee2e2)',
        border: '#fca5a5',
        iconBg: '#dc2626',
        textColor: '#991b1b',
        arrow: '#fef2f2'
      };
    case 'food':
      return {
        background: 'linear-gradient(to bottom right, #fffbeb, #fef3c7)',
        border: '#fcd34d',
        iconBg: '#f59e0b',
        textColor: '#92400e',
        arrow: '#fffbeb'
      };
    case 'event':
    default:
      return {
        background: 'linear-gradient(to bottom right, #ecfdf5, #d1fae5)',
        border: '#86efac',
        iconBg: '#10b981',
        textColor: '#064e3b',
        arrow: '#ecfdf5'
      };
  }
};

// カテゴリに基づくラベルを取得する関数
const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'entertainment': return 'エンターテイメント';
    case 'community': return '地域住民コミュニケーション';
    case 'information': return '情報';
    case 'disaster': return '災害情報';
    case 'food': return '食事';
    case 'event': return 'イベント';
    default: return 'その他';
  }
};

// イベントポップアップのHTML生成関数
export const createEventPopupHTML = (event: Event) => {
  // イベントのカテゴリを決定（category フィールドまたは tags から取得）
  const eventCategory = event.category || (event.tags && event.tags.length > 0 ? event.tags[0] : 'event');
  
  // カテゴリが無効な場合はnullを返して表示しない
  if (!eventCategory || eventCategory === 'other' || eventCategory === 'その他' || eventCategory === '') {
    return null;
  }

  // カテゴリに基づく色設定を取得
  const colors = getCategoryColors(eventCategory);

  // 新しく作成されたイベントかどうかを判定（作成から5分以内）
  const isNewEvent = event.created_time && 
    (Date.now() - new Date(event.created_time).getTime()) < 5 * 60 * 1000;

  // 安全な日付処理
  const formatDate = () => {
    let dateStr = event.created_time || event.updated_at;
    
    // Goのzero value日付をチェック
    if (!dateStr || dateStr === '' || dateStr === '0001-01-01T00:00:00Z') {
      return '日付不明';
    }
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime()) || date.getFullYear() <= 1) {
      return '日付不明';
    }
    
    return date.toLocaleDateString('ja-JP');
  };

  return `
    <div class="relative max-w-sm shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
         data-event-id="${event.id}"
         data-category="${eventCategory}"
         style="max-width: 20rem; background: ${colors.background}; border: 1px solid ${colors.border}; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-radius: 1rem; overflow: hidden; position: relative;">
      
      <!-- 吹き出しの矢印 -->
      <div class="absolute -bottom-2 left-5 w-0 h-0" 
           style="position: absolute; bottom: -8px; left: 20px; width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid ${colors.arrow};"></div>
      
      <!-- イベントアイコン -->
      <div class="absolute top-2 left-2 h-6 w-6 rounded-full flex items-center justify-center"
           style="position: absolute; top: 8px; left: 8px; height: 24px; width: 24px; border-radius: 50%; background-color: ${colors.iconBg}; display: flex; align-items: center; justify-content: center;">
        <svg class="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24" style="height: 12px; width: 12px; color: white;">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
        </svg>
      </div>
      
      ${isNewEvent ? `
      <!-- 新規イベント表示 -->
      <div class="absolute top-2 right-2 text-white text-xs px-2 py-1 rounded-full"
           style="position: absolute; top: 8px; right: 8px; background-color: ${colors.iconBg}; color: white; font-size: 0.75rem; padding: 4px 8px; border-radius: 9999px;">
        NEW!
      </div>
      ` : ''}
      
      <!-- メッセージコンテンツ -->
      <div class="p-4 pt-8" style="padding: 1rem; padding-top: 2rem;">
        <h3 class="font-bold mb-2 text-lg" style="color: ${colors.textColor}; font-size: 1.125rem; margin-bottom: 0.5rem; font-weight: bold;">
          ${event.content ? event.content.substring(0, 30) + (event.content.length > 30 ? '...' : '') : 'イベント'}
        </h3>
        <p class="text-sm mb-3" style="color: ${colors.textColor}; font-size: 0.875rem; margin-bottom: 0.75rem; opacity: 0.8;">
          📅 ${getCategoryLabel(eventCategory)}
        </p>
        <div class="flex justify-between items-center text-xs" 
             style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem;">
          <div class="flex items-center gap-1">
            <svg id="heart-event-${event.id}" class="w-3 h-3 cursor-pointer hover:scale-110 transition-transform" fill="white" viewBox="0 0 24 24" style="width: 12px; height: 12px;">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span id="like-count-event-${event.id}" class="text-white font-medium" style="color: #efffff; font-weight: 500;">${event.like || 0}</span>
          </div>
          <div style="color: ${colors.textColor}; opacity: 0.7;">
            <span class="font-medium" style="font-weight: 500;">📍 ${!event.coordinate ? '現在地' : 'イベント'}</span>
            <span class="ml-2" style="margin-left: 0.5rem;">${formatDate()}</span>
          </div>
        </div>
      </div>
    </div>
  `;
};

// 初期いいね状態の確認と色設定関数（投稿用）
export const checkInitialLikeStatus = async (post: Post) => {
  try {
    console.log(`🔍 投稿${post.id}の初期いいね状態を確認中...`);
    
    // 認証状態をチェック
    const token = localStorage.getItem('authtoken');
    if (!token) {
      console.log(`⚠️ 認証トークンが見つからないため、いいね状態を確認できません`);
      return;
    }
    
    const status = await getPostLikeStatus(post.id);
    console.log(`📊 投稿${post.id}のAPI取得いいね状態:`, status);
    
    const heartIcon = document.getElementById(`heart-post-${post.id}`);
    const likeCountElement = document.getElementById(`like-count-post-${post.id}`);
    
    if (heartIcon && likeCountElement) {
      if (status.liked) {
        // いいね済み：赤色に設定
        heartIcon.style.fill = '#ef4444';
        likeCountElement.style.color = '#ef4444';
        likeCountElement.style.fontWeight = 'bold';
        console.log(`💖 投稿${post.id}は既にいいね済み (${status.like_count})`);
      } else {
        // 未いいね：白色に設定
        heartIcon.style.fill = 'white';
        likeCountElement.style.color = '#ffffff';
        likeCountElement.style.fontWeight = '500';
        console.log(`🤍 投稿${post.id}は未いいね (${status.like_count})`);
      }
      
      // いいね数を確実に更新（APIから取得した値を使用）
      likeCountElement.textContent = status.like_count.toString();
      console.log(`📊 投稿${post.id}のいいね数を更新: ${status.like_count}`);
    } else {
      console.warn(`⚠️ 投稿${post.id}のDOM要素が見つかりません`);
      console.log(`🔍 検索した要素ID: heart-post-${post.id}, like-count-post-${post.id}`);
    }
  } catch (error) {
    console.warn(`⚠️ 投稿${post.id}の初期いいね状態確認に失敗:`, error);
    // エラーの場合はデフォルト状態（未いいね）に設定
    const heartIcon = document.getElementById(`heart-post-${post.id}`);
    const likeCountElement = document.getElementById(`like-count-post-${post.id}`);
    
    if (heartIcon && likeCountElement) {
      heartIcon.style.fill = 'white';
      likeCountElement.style.color = '#ffffff';
      likeCountElement.style.fontWeight = '500';
      // エラー時は初期値を使用
      likeCountElement.textContent = (post.like || 0).toString();
    }
  }
};

// 初期いいね状態の確認と色設定関数（スレッド用）
export const checkInitialThreadLikeStatus = async (thread: Thread) => {
  try {
    console.log(`🔍 スレッド${thread.id}の初期いいね状態を確認中...`);
    
    // 認証状態をチェック
    const token = localStorage.getItem('authtoken');
    if (!token) {
      console.log(`⚠️ 認証トークンが見つからないため、スレッドいいね状態を確認できません`);
      return;
    }
    
    const threadId = typeof thread.id === 'string' ? parseInt(thread.id) : thread.id;
    const status = await getThreadLikeStatus(threadId);
    console.log(`📊 スレッド${thread.id}のAPI取得いいね状態:`, status);
    
    const heartIcon = document.getElementById(`heart-thread-${thread.id}`);
    const likeCountElement = document.getElementById(`like-count-thread-${thread.id}`);
    
    if (heartIcon && likeCountElement) {
      if (status.liked) {
        // いいね済み：赤色に設定
        heartIcon.style.fill = '#ef4444';
        likeCountElement.style.color = '#ef4444';
        likeCountElement.style.fontWeight = 'bold';
        console.log(`💖 スレッド${thread.id}は既にいいね済み (${status.like_count})`);
      } else {
        // 未いいね：白色に設定
        heartIcon.style.fill = 'white';
        likeCountElement.style.color = '#ffffff';
        likeCountElement.style.fontWeight = '500';
        console.log(`🤍 スレッド${thread.id}は未いいね (${status.like_count})`);
      }
      
      // いいね数を確実に更新（APIから取得した値を使用）
      likeCountElement.textContent = status.like_count.toString();
      console.log(`📊 スレッド${thread.id}のいいね数を更新: ${status.like_count}`);
    } else {
      console.warn(`⚠️ スレッド${thread.id}のDOM要素が見つかりません`);
      console.log(`🔍 検索した要素ID: heart-thread-${thread.id}, like-count-thread-${thread.id}`);
    }
  } catch (error) {
    console.warn(`⚠️ スレッド${thread.id}の初期いいね状態確認に失敗:`, error);
    // エラーの場合はデフォルト状態（未いいね）に設定
    const heartIcon = document.getElementById(`heart-thread-${thread.id}`);
    const likeCountElement = document.getElementById(`like-count-thread-${thread.id}`);
    
    if (heartIcon && likeCountElement) {
      heartIcon.style.fill = 'white';
      likeCountElement.style.color = '#ffffff';
      likeCountElement.style.fontWeight = '500';
      // エラー時は初期値を使用
      likeCountElement.textContent = (thread.like || 0).toString();
    }
  }
};

// 初期いいね状態の確認と色設定関数（イベント用）
export const checkInitialEventLikeStatus = async (event: Event) => {
  try {
    console.log(`🔍 イベント${event.id}の初期いいね状態を確認中...`);
    
    // 認証状態をチェック
    const token = localStorage.getItem('authtoken');
    if (!token) {
      console.log(`⚠️ 認証トークンが見つからないため、イベントいいね状態を確認できません`);
      return;
    }
    
    const status = await getEventLikeStatus(event.id);
    console.log(`📊 イベント${event.id}のAPI取得いいね状態:`, status);
    
    const heartIcon = document.getElementById(`heart-event-${event.id}`);
    const likeCountElement = document.getElementById(`like-count-event-${event.id}`);
    
    if (heartIcon && likeCountElement) {
      if (status.liked) {
        // いいね済み：赤色に設定
        heartIcon.style.fill = '#ef4444';
        likeCountElement.style.color = '#ef4444';
        likeCountElement.style.fontWeight = 'bold';
        console.log(`💖 イベント${event.id}は既にいいね済み (${status.like_count})`);
      } else {
        // 未いいね：白色に設定
        heartIcon.style.fill = 'white';
        likeCountElement.style.color = '#ffffff';
        likeCountElement.style.fontWeight = '500';
        console.log(`🤍 イベント${event.id}は未いいね (${status.like_count})`);
      }
      
      // いいね数を確実に更新（APIから取得した値を使用）
      likeCountElement.textContent = status.like_count.toString();
      console.log(`📊 イベント${event.id}のいいね数を更新: ${status.like_count}`);
    } else {
      console.warn(`⚠️ イベント${event.id}のDOM要素が見つかりません`);
      console.log(`🔍 検索した要素ID: heart-event-${event.id}, like-count-event-${event.id}`);
    }
  } catch (error) {
    console.warn(`⚠️ イベント${event.id}の初期いいね状態確認に失敗:`, error);
    // エラーの場合はデフォルト状態（未いいね）に設定
    const heartIcon = document.getElementById(`heart-event-${event.id}`);
    const likeCountElement = document.getElementById(`like-count-event-${event.id}`);
    
    if (heartIcon && likeCountElement) {
      heartIcon.style.fill = 'white';
      likeCountElement.style.color = '#ffffff';
      likeCountElement.style.fontWeight = '500';
      // エラー時は初期値を使用
      likeCountElement.textContent = (event.like || 0).toString();
    }
  }
};

