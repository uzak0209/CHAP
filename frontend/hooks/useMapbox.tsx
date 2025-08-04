import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_CONFIG } from '@/constants/map';
import { useAppSelector } from '@/store';
import { Status, Post, Thread } from '@/types/types';
import { likePost, getPostLikeStatus, likeThread, getThreadLikeStatus } from '@/lib/api';

// カテゴリを日本語に変換するユーティリティ関数
const getCategoryName = (category: string) => {
  switch (category) {
    case 'entertainment': return 'エンターテイメント';
    case 'community': return 'コミュニティ';
    case 'information': return '情報';
    case 'disaster': return '災害';
    case 'event': return 'イベント';
    default: return category;
  }
};

// カテゴリに基づいてマーカーの色を決定するユーティリティ関数
const getMarkerColor = (category: string) => {
  switch (category) {
    case 'entertainment': return '#ff6b6b';  // エンターテイメント（赤）
    case 'community': return '#4ecdc4';      // コミュニティ（青緑）
    case 'information': return '#45b7d1';    // 情報（青）
    case 'disaster': return '#ff4757';       // 災害（赤）
    case 'food': return '#feca57';           // 食事（黄）
    case 'event': return '#96ceb4';          // イベント（緑）
    default: return '#95a5a6';               // デフォルト（グレー）
  }
};

// 投稿ポップアップのHTML生成関数
const createPostPopupHTML = (post: Post) => {
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
const createThreadPopupHTML = (thread: Thread) => {
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



// 初期いいね状態の確認と色設定関数（投稿用）
const checkInitialLikeStatus = async (post: Post) => {
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
const checkInitialThreadLikeStatus = async (thread: Thread) => {
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

// ポップアップ作成とイベント設定の統合関数
const createAndSetupPostPopup = (post: Post, coordinates: [number, number]) => {
  const popup = new mapboxgl.Popup({ 
    offset: 25,
    closeButton: false,
    closeOnClick: false,
    closeOnMove: false,
    anchor: 'bottom'
  })
  .setLngLat(coordinates)
  .setHTML(createPostPopupHTML(post));

  // ポップアップ表示後にイベントリスナーを設定（既存のリスナーがある場合はスキップ）
  setTimeout(() => {
    const heartIcon = document.getElementById(`heart-post-${post.id}`);
    if (heartIcon && !heartIcon.hasAttribute('data-listeners-set')) {
      setupPostLikeHandler(post);
    }
    // 初期いいね状態を確認して色を設定
    checkInitialLikeStatus(post);
  }, 300);

  return popup;
};

const createAndSetupThreadPopup = (thread: Thread, coordinates: [number, number], router: ReturnType<typeof useRouter>) => {
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    closeOnMove: false,
    offset: 25,
    className: 'thread-popup thread-popup-yellow'
  })
  .setHTML(createThreadPopupHTML(thread));

  // ポップアップ表示後にイベントリスナーを設定（既存のリスナーがある場合はスキップ）
  setTimeout(() => {
    setupThreadClickHandler(thread, router);
    // スレッドいいね機能のイベントリスナーを設定
    const heartIcon = document.getElementById(`heart-thread-${thread.id}`);
    if (heartIcon && !heartIcon.hasAttribute('data-listeners-set')) {
      setupThreadLikeHandler(thread);
    }
    // 初期いいね状態を確認して色を設定
    checkInitialThreadLikeStatus(thread);
  }, 300);

  return popup;
};

// 投稿のいいね機能イベントリスナー設定関数
const setupPostLikeHandler = (post: Post) => {
  console.log(`🔍 setupPostLikeHandler開始 - 投稿ID: ${post.id}`);
  
  setTimeout(() => {
    console.log(`🔍 DOM要素を検索中 - heart-post-${post.id}`);
    const heartIcon = document.getElementById(`heart-post-${post.id}`);
    
    if (!heartIcon) {
      console.error(`❌ ハートアイコンが見つかりません - heart-post-${post.id}`);
      console.log('🔍 現在のDOM内の全要素をチェック:');
      const allElements = document.querySelectorAll(`[id*="post-${post.id}"]`);
      console.log('見つかった要素:', allElements);
      return;
    }
    
    console.log(`✅ ハートアイコンが見つかりました - heart-post-${post.id}`, heartIcon);
    
    // 既にイベントリスナーが設定されている場合はスキップ
    if (heartIcon.hasAttribute('data-listeners-set')) {
      console.log(`✅ 投稿${post.id}のイベントリスナーは既に設定済み - スキップ`);
      return;
    }
    
    // processing フラグを設定
    heartIcon.setAttribute('data-processing', 'true');
    console.log(`🏷️ 投稿${post.id}にprocessingフラグを設定`);
    
    // 一回だけ実行される強力なイベントリスナー
    let isProcessing = false;
    
    const handleLikeClick = async (e: Event) => {
      console.log(`🎯 ハートアイコンがクリックされました！投稿ID: ${post.id}`);
      e.stopPropagation();
      e.preventDefault();
      
      if (isProcessing) {
        console.log(`⚠️ 投稿${post.id}は既に処理中です（重複防止）`);
        return;
      }
      
      isProcessing = true;
      heartIcon.style.pointerEvents = 'none';
      heartIcon.style.opacity = '0.5';
      
      try {
        console.log(`❤️ 投稿${post.id}のいいねボタンがクリックされました`);
        
        const result = await likePost(post.id);
        console.log(`✅ いいねAPI結果:`, result);
        

        
        // いいね数の表示を更新
        const likeCountElement = document.getElementById(`like-count-post-${post.id}`);
        if (likeCountElement) {
          // アニメーション付きで数字を更新
          likeCountElement.style.transform = 'scale(1.3)';
          likeCountElement.style.transition = 'all 0.3s ease';
          
          // 即座に数値を更新
          likeCountElement.textContent = result.like_count.toString();
          
          setTimeout(() => {
            likeCountElement.style.transform = 'scale(1)';
          }, 150);
          
          console.log(`📊 いいね数を更新: ${result.like_count}`);
        } else {
          console.error(`❌ いいね数表示要素が見つかりません - like-count-post-${post.id}`);
          // DOM要素が見つからない場合は、少し遅延して再試行
          setTimeout(() => {
            const retryElement = document.getElementById(`like-count-post-${post.id}`);
            if (retryElement) {
              retryElement.textContent = result.like_count.toString();
              console.log(`🔄 遅延更新でいいね数を更新: ${result.like_count}`);
            }
          }, 100);
        }
        
        // ハートアイコンの色とアニメーション（バウンス効果）
        heartIcon.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        heartIcon.style.transform = 'scale(1.3)';
        
        // バウンス効果でハートを元のサイズに戻す
        setTimeout(() => {
          heartIcon.style.transform = 'scale(1)';
        }, 200);
        
        // 少し遅れて数字もバウンス
        setTimeout(() => {
          if (likeCountElement) {
            likeCountElement.style.transform = 'scale(1.2)';
            setTimeout(() => {
              likeCountElement.style.transform = 'scale(1)';
            }, 150);
          }
        }, 100);
        
        if (result.liked) {
          // いいね状態：ハートと数字を赤色に
          heartIcon.style.fill = '#ef4444';
          if (likeCountElement) {
            likeCountElement.style.color = '#ef4444';
            likeCountElement.style.fontWeight = 'bold';
          }
          console.log(`💖 投稿${post.id}にいいねしました (${result.like_count})`);
        } else {
          // いいね解除状態：ハートと数字を白色に
          heartIcon.style.fill = 'white';
          if (likeCountElement) {
            likeCountElement.style.color = '#ffffff';
            likeCountElement.style.fontWeight = '500';
          }
          console.log(`💙 投稿${post.id}のいいねを解除しました (${result.like_count})`);
        }
        
        // 確実にDOMを更新するため、少し遅延して再確認
        setTimeout(() => {
          const finalCheckElement = document.getElementById(`like-count-post-${post.id}`);
          if (finalCheckElement && finalCheckElement.textContent !== result.like_count.toString()) {
            finalCheckElement.textContent = result.like_count.toString();
            console.log(`🔧 最終確認でいいね数を修正: ${result.like_count}`);
          }
        }, 200);
        
      } catch (error) {
        console.error(`❌ 投稿${post.id}のいいね処理エラー:`, error);
        console.warn('いいね処理に失敗しました。ログインしているか確認してください。');
      } finally {
        setTimeout(() => {
          isProcessing = false;
          heartIcon.style.pointerEvents = 'auto';
          heartIcon.style.opacity = '1';
          console.log(`🔓 投稿${post.id}の処理完了（UI有効化）`);
        }, 1000);
      }
    };
    
    // テスト用のクリックハンドラーも追加
    const testClickHandler = (e: Event) => {
      console.log(`🧪 テストクリックハンドラー実行！投稿ID: ${post.id}`, e);
    };
    
    // イベントリスナーを追加（SVG要素対応）
    heartIcon.addEventListener('click', handleLikeClick, { once: false });
    heartIcon.addEventListener('click', testClickHandler, { once: false });
    
    // さらに確実にするため、親要素にも委譲イベントを追加
    const parentDiv = heartIcon.closest('[data-post-id]');
    if (parentDiv) {
      const delegatedHandler = (e: Event) => {
        const target = e.target as Element;
        if (target && target.id === `heart-post-${post.id}`) {
          console.log(`🎯 委譲イベントでハートクリックを検出！投稿ID: ${post.id}`);
          handleLikeClick(e);
        }
      };
      parentDiv.addEventListener('click', delegatedHandler);
      console.log(`📨 投稿${post.id}の親要素に委譲イベントも追加`);
    }
    
    // イベントリスナー設定完了のフラグを設定
    heartIcon.setAttribute('data-listeners-set', 'true');
    
    console.log(`🔗 投稿${post.id}のハートアイコンにクリックイベント追加完了`);
    console.log(`🔍 イベントリスナー確認:`, {
      element: heartIcon,
      id: heartIcon.id,
      tagName: heartIcon.tagName,
      hasClickListener: true,
      hasListenersFlag: heartIcon.hasAttribute('data-listeners-set'),
      parentElement: heartIcon.parentElement,
      boundingBox: heartIcon.getBoundingClientRect()
    });
    

    
  }, 500);
};

// スレッドのいいね機能イベントリスナー設定関数
const setupThreadLikeHandler = (thread: Thread) => {
  console.log(`🔍 setupThreadLikeHandler開始 - スレッドID: ${thread.id}`);
  
  setTimeout(() => {
    console.log(`🔍 DOM要素を検索中 - heart-thread-${thread.id}`);
    const heartIcon = document.getElementById(`heart-thread-${thread.id}`);
    
    if (!heartIcon) {
      console.error(`❌ スレッドハートアイコンが見つかりません - heart-thread-${thread.id}`);
      console.log('🔍 現在のDOM内の全スレッド要素をチェック:');
      const allElements = document.querySelectorAll(`[id*="thread-${thread.id}"]`);
      console.log('見つかった要素:', allElements);
      return;
    }
    
    console.log(`✅ スレッドハートアイコンが見つかりました - heart-thread-${thread.id}`, heartIcon);
    
    // 既にイベントリスナーが設定されている場合はスキップ
    if (heartIcon.hasAttribute('data-listeners-set')) {
      console.log(`✅ スレッド${thread.id}のイベントリスナーは既に設定済み - スキップ`);
      return;
    }
    
    // processing フラグを設定
    heartIcon.setAttribute('data-processing', 'true');
    console.log(`🏷️ スレッド${thread.id}にprocessingフラグを設定`);
    
    // 一回だけ実行される強力なイベントリスナー
    let isProcessing = false;
    
    const handleThreadLikeClick = async (e: Event) => {
      console.log(`🎯 スレッドハートアイコンがクリックされました！スレッドID: ${thread.id}`);
      e.stopPropagation();
      e.preventDefault();
      
      if (isProcessing) {
        console.log(`⚠️ スレッド${thread.id}は既に処理中です（重複防止）`);
        return;
      }
      
      isProcessing = true;
      heartIcon.style.pointerEvents = 'none';
      heartIcon.style.opacity = '0.5';
      console.log(`🔒 スレッド${thread.id}の処理を開始（UI無効化）`);
      
      try {
        console.log(`❤️ スレッド${thread.id}のいいねボタンがクリックされました`);
        
        const threadId = typeof thread.id === 'string' ? parseInt(thread.id) : thread.id;
        const result = await likeThread(threadId);
        console.log(`✅ スレッドいいねAPI結果:`, result);
        
        // いいね数の表示を更新
        const likeCountElement = document.getElementById(`like-count-thread-${thread.id}`);
        if (likeCountElement) {
          // アニメーション付きで数字を更新
          likeCountElement.style.transform = 'scale(1.3)';
          likeCountElement.style.transition = 'all 0.3s ease';
          
          // 即座に数値を更新
          likeCountElement.textContent = result.like_count.toString();
          
          setTimeout(() => {
            likeCountElement.style.transform = 'scale(1)';
          }, 150);
          
          console.log(`📊 スレッドいいね数を更新: ${result.like_count}`);
        } else {
          console.error(`❌ スレッドいいね数表示要素が見つかりません - like-count-thread-${thread.id}`);
          // DOM要素が見つからない場合は、少し遅延して再試行
          setTimeout(() => {
            const retryElement = document.getElementById(`like-count-thread-${thread.id}`);
            if (retryElement) {
              retryElement.textContent = result.like_count.toString();
              console.log(`🔄 遅延更新でスレッドいいね数を更新: ${result.like_count}`);
            }
          }, 100);
        }
        
        // ハートアイコンの色とアニメーション（バウンス効果）
        heartIcon.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        heartIcon.style.transform = 'scale(1.3)';
        
        // バウンス効果でハートを元のサイズに戻す
        setTimeout(() => {
          heartIcon.style.transform = 'scale(1)';
        }, 200);
        
        // 少し遅れて数字もバウンス
        setTimeout(() => {
          if (likeCountElement) {
            likeCountElement.style.transform = 'scale(1.2)';
            setTimeout(() => {
              likeCountElement.style.transform = 'scale(1)';
            }, 150);
          }
        }, 100);
        
        if (result.liked) {
          // いいね状態：ハートと数字を赤色に
          heartIcon.style.fill = '#ef4444';
          if (likeCountElement) {
            likeCountElement.style.color = '#ef4444';
            likeCountElement.style.fontWeight = 'bold';
          }
          console.log(`💖 スレッド${thread.id}にいいねしました (${result.like_count})`);
        } else {
          // いいね解除状態：ハートと数字を白色に
          heartIcon.style.fill = 'white';
          if (likeCountElement) {
            likeCountElement.style.color = '#ffffff';
            likeCountElement.style.fontWeight = '500';
          }
          console.log(`💙 スレッド${thread.id}のいいねを解除しました (${result.like_count})`);
        }
        
        // 確実にDOMを更新するため、少し遅延して再確認
        setTimeout(() => {
          const finalCheckElement = document.getElementById(`like-count-thread-${thread.id}`);
          if (finalCheckElement && finalCheckElement.textContent !== result.like_count.toString()) {
            finalCheckElement.textContent = result.like_count.toString();
            console.log(`🔧 最終確認でスレッドいいね数を修正: ${result.like_count}`);
          }
        }, 200);
        
      } catch (error) {
        console.error(`❌ スレッド${thread.id}のいいね処理エラー:`, error);
        console.warn('スレッドいいね処理に失敗しました。ログインしているか確認してください。');
      } finally {
        setTimeout(() => {
          isProcessing = false;
          heartIcon.style.pointerEvents = 'auto';
          heartIcon.style.opacity = '1';
          console.log(`🔓 スレッド${thread.id}の処理完了（UI有効化）`);
        }, 1000);
      }
    };
    
    // テスト用のクリックハンドラーも追加
    const testThreadClickHandler = (e: Event) => {
      console.log(`🧪 スレッドテストクリックハンドラー実行！スレッドID: ${thread.id}`, e);
    };
    
    // イベントリスナーを追加（SVG要素対応）
    heartIcon.addEventListener('click', handleThreadLikeClick, { once: false });
    heartIcon.addEventListener('click', testThreadClickHandler, { once: false });
    
    // さらに確実にするため、親要素にも委譲イベントを追加
    const parentDiv = heartIcon.closest('[data-thread-id]');
    if (parentDiv) {
      const delegatedHandler = (e: Event) => {
        const target = e.target as Element;
        if (target && target.id === `heart-thread-${thread.id}`) {
          console.log(`🎯 委譲イベントでスレッドハートクリックを検出！スレッドID: ${thread.id}`);
          handleThreadLikeClick(e);
        }
      };
      parentDiv.addEventListener('click', delegatedHandler);
      console.log(`📨 スレッド${thread.id}の親要素に委譲イベントも追加`);
    }
    
    // イベントリスナー設定完了のフラグを設定
    heartIcon.setAttribute('data-listeners-set', 'true');
    
    console.log(`🔗 スレッド${thread.id}のハートアイコンにクリックイベント追加完了`);
    console.log(`🔍 スレッドイベントリスナー確認:`, {
      element: heartIcon,
      id: heartIcon.id,
      tagName: heartIcon.tagName,
      hasClickListener: true,
      hasListenersFlag: heartIcon.hasAttribute('data-listeners-set'),
      parentElement: heartIcon.parentElement,
      boundingBox: heartIcon.getBoundingClientRect()
    });
    

    
  }, 500);
};

// スレッドクリックイベントリスナー設定関数
const setupThreadClickHandler = (thread: Thread, router: ReturnType<typeof useRouter>) => {
  setTimeout(() => {
    const popupElement = document.querySelector(`[data-thread-id="${thread.id}"]`);
    if (popupElement) {
      popupElement.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/threads/${thread.id}`);
      });
      console.log(`スレッド${thread.id}のポップアップにクリックイベント追加`);
    }
  }, 100);
};



export const useMapbox = () => {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [is3D, setIs3D] = useState(true);
  
  // Redux storeから位置情報とフィルタ状態を取得
  const { location, state: locationState } = useAppSelector(state => state.location);
  const { items: posts } = useAppSelector(state => state.posts);
  const { items: threads } = useAppSelector(state => state.threads);
  const { items: events } = useAppSelector(state => state.events);
  const { selectedCategory } = useAppSelector(state => state.filters);
  const { isAuthenticated } = useAppSelector(state => state.auth);

  // 投稿とスレッドマーカーの参照を保持
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const threadMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const eventMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const currentLocationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const restorePopupsRef = useRef<((event?: any) => void) | null>(null);

  // 現在地マーカーを追加する関数
  const addCurrentLocationMarker = () => {
    if (!mapRef.current || locationState !== Status.LOADED) return;

    // 既存の現在地マーカーを削除
    if (currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current.remove();
    }

    // 現在地マーカーを作成（ポップアップなし）
    currentLocationMarkerRef.current = new mapboxgl.Marker({ 
      color: '#ff0000',
      scale: 1.2
    })
      .setLngLat([location.lng, location.lat])
      .addTo(mapRef.current!);

    console.log('現在地マーカーを追加:', [location.lng, location.lat]);
  };

  // 投稿マーカーを地図に追加する関数
  const addPostMarkers = () => {
    if (!mapRef.current || !posts.length) return;

    // 既存のマーカーを削除
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    console.log('投稿マーカーを追加中:', posts.length, '件');

    // 有効なカテゴリのポストのみをフィルタリング
    const validCategoryPosts = posts.filter((post) => {
      const category = post.category || 'other';
      const isValidCategory = category !== 'other' && category !== 'その他';
      const matchesSelectedCategory = category === selectedCategory;
      return isValidCategory && matchesSelectedCategory;
    });


    validCategoryPosts.forEach((post) => {
      if (!post.coordinate || !post.coordinate.lat || !post.coordinate.lng) {
        console.warn('座標が無効な投稿をスキップ:', post.id);
        return;
      }

      const coordinates: [number, number] = [post.coordinate.lng, post.coordinate.lat];

      // マーカーを作成
      const marker = new mapboxgl.Marker({ 
        color: getMarkerColor(post.category),
        scale: 0.8
      }).setLngLat(coordinates);

      // ポップアップを作成・設定
      const popup = createAndSetupPostPopup(post, coordinates);
      marker.setPopup(popup).addTo(mapRef.current!);

      // マーカーをリストに追加
      markersRef.current.push(marker);

      // ポップアップを即座に表示
      setTimeout(() => {
        try {
          popup.addTo(mapRef.current!);
          console.log(`✅ 投稿${post.id}のポップアップを表示`);
          
          // マーカーのポップアップも確認
          setTimeout(() => {
            const markerPopup = marker.getPopup();
            if (markerPopup && !markerPopup.isOpen()) {
              marker.togglePopup();
            }
          }, 100);
        } catch (error) {
          console.error(`❌ 投稿${post.id}のポップアップ表示エラー:`, error);
        }
      }, post === posts[0] ? 200 : 200 + markersRef.current.length * 50);
    });

    console.log('投稿マーカー追加完了:', markersRef.current.length, '個');
  };

  // スレッドマーカーを地図に追加する関数
  const addThreadMarkers = () => {
    if (!mapRef.current || !threads || threads.length === 0) {
      return;
    }

    // 既存のスレッドマーカーを削除
    threadMarkersRef.current.forEach(marker => marker.remove());
    threadMarkersRef.current = [];

    // 有効なカテゴリのスレッドのみをフィルタリング
    const validCategoryThreads = threads.filter((thread) => {
      const category = thread.tags && thread.tags.length > 0 ? thread.tags[0] : '';
      const isValidCategory = category !== 'other' && category !== 'その他' && category !== '';
      const matchesSelectedCategory = category === selectedCategory;
      return isValidCategory && matchesSelectedCategory;
    });

    console.log('有効なカテゴリのスレッド:', validCategoryThreads.length, '件');

    validCategoryThreads.forEach((thread) => {
      if (!thread.coordinate || !thread.coordinate.lat || !thread.coordinate.lng) {
        console.warn('座標が無効なスレッドをスキップ:', thread.id);
        return;
      }

      const coordinates: [number, number] = [thread.coordinate.lng, thread.coordinate.lat];

      // スレッドマーカーを作成（黄色）
      const marker = new mapboxgl.Marker({ 
        color: '#ffd700',
        scale: 0.8 
      }).setLngLat(coordinates);

      // ポップアップを作成・設定
      const popup = createAndSetupThreadPopup(thread, coordinates, router);

      // マーカーにクリックイベントを追加（スレッドページに遷移）
      marker.getElement().addEventListener('click', () => {
        router.push(`/threads/${thread.id}`);
      });

      // マーカーにポップアップを設定してから地図に追加
      marker.setPopup(popup).addTo(mapRef.current!);

      // スレッドマーカーをリストに追加
      threadMarkersRef.current.push(marker);

      // ポップアップを即座に表示
      setTimeout(() => {
        try {
          popup.addTo(mapRef.current!);
          console.log(`スレッド${thread.id}のポップアップを表示`);
          
          // マーカーのポップアップも確認
          setTimeout(() => {
            const markerPopup = marker.getPopup();
            if (markerPopup && !markerPopup.isOpen()) {
              marker.togglePopup();
            }
          }, 100);
          
        } catch (error) {
          console.error(`スレッド${thread.id}のポップアップ表示エラー:`, error);
        }
      }, 250 + threadMarkersRef.current.length * 50);
    });

    console.log('スレッドマーカー追加完了:', threadMarkersRef.current.length, '個');
  };

  // イベントマーカーを地図に追加する関数
  const addEventMarkers = () => {
    if (!mapRef.current || !events || events.length === 0) {
      return;
    }

    // 既存のイベントマーカーを削除
    eventMarkersRef.current.forEach(marker => marker.remove());
    eventMarkersRef.current = [];

    console.log('イベントマーカーを追加中:', events.length, '件');

    // 現在地を取得（ユーザーの位置情報）
    const userLocation = { lat: location.lat, lng: location.lng };

    events.forEach((event, index) => {
      let coordinates: [number, number];
      
      // イベントに座標がない場合（新規作成時）は現在地を使用
      if (!event.coordinate || !event.coordinate.lat || !event.coordinate.lng) {
        if (userLocation && userLocation.lat && userLocation.lng) {
          coordinates = [userLocation.lng, userLocation.lat];
          console.log(`💡 イベント${event.id}の座標が無いため現在地を使用:`, coordinates);
        } else {
          console.warn('現在地も取得できないため、イベントをスキップ:', event.id);
          return;
        }
      } else {
        coordinates = [event.coordinate.lng, event.coordinate.lat];
      }

      // 新しく作成されたイベントかどうかを判定（作成から5分以内）
      const isNewEvent = event.created_time && 
        (Date.now() - new Date(event.created_time).getTime()) < 5 * 60 * 1000;

      // イベントマーカーを作成（オレンジ色、新規イベントは少し大きく）
      const marker = new mapboxgl.Marker({ 
        color: '#ea580c',
        scale: isNewEvent ? 1.0 : 0.8 
      }).setLngLat(coordinates);

      // マーカー要素にホバーエフェクトを追加
      const markerElement = marker.getElement();
      markerElement.style.cursor = 'pointer';
      markerElement.style.transition = 'all 0.3s ease';
      markerElement.style.filter = isNewEvent 
        ? 'drop-shadow(0 6px 12px rgba(234, 88, 12, 0.5))' 
        : 'drop-shadow(0 4px 8px rgba(234, 88, 12, 0.3))';
      
      // 新規イベントには脈打つアニメーション
      if (isNewEvent) {
        markerElement.style.animation = 'pulse 2s infinite';
        markerElement.style.setProperty('--tw-scale', '1.05');
      }
      
      // ホバーエフェクトのイベントリスナーを追加
      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.transform = 'scale(1.2)';
        markerElement.style.filter = 'drop-shadow(0 8px 16px rgba(234, 88, 12, 0.5))';
        markerElement.style.zIndex = '1000';
      });
      
      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.transform = 'scale(1)';
        markerElement.style.filter = isNewEvent 
          ? 'drop-shadow(0 6px 12px rgba(234, 88, 12, 0.5))' 
          : 'drop-shadow(0 4px 8px rgba(234, 88, 12, 0.3))';
        markerElement.style.zIndex = '1';
      });

      // イベント用ポップアップを作成（ポストと同じUIスタイル）
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        closeOnMove: false,
        offset: 25,
        className: `event-popup ${isNewEvent ? 'new-event' : ''}`
      })
      .setHTML(`
        <div class="relative max-w-sm bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
             data-event-id="${event.id}"
             style="max-width: 20rem; background: linear-gradient(to bottom right, #fff7ed, #fef3c7); border: 1px solid #fed7aa; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-radius: 1rem; overflow: hidden; position: relative; ${isNewEvent ? 'animation: fadeInBounce 0.8s ease-out;' : ''}">
          <!-- 吹き出しの矢印 -->
          <div class="absolute -bottom-2 left-5 w-0 h-0" 
               style="position: absolute; bottom: -8px; left: 20px; width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid #fff7ed;"></div>
          
          <!-- イベントアイコン -->
          <div class="absolute top-2 left-2 h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center ${isNewEvent ? 'animate-pulse' : ''}"
               style="position: absolute; top: 8px; left: 8px; height: 24px; width: 24px; border-radius: 50%; background-color: #ea580c; display: flex; align-items: center; justify-content: center;">
            <svg class="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24" style="height: 12px; width: 12px; color: white;">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
          </div>
          
          ${isNewEvent ? `
          <!-- 新規イベント表示 -->
          <div class="absolute top-2 right-2 bg-orange-600 text-white text-xs px-2 py-1 rounded-full animate-bounce"
               style="position: absolute; top: 8px; right: 8px; background-color: #ea580c; color: white; font-size: 0.75rem; padding: 4px 8px; border-radius: 9999px;">
            NEW!
          </div>
          ` : ''}
          
          <!-- メッセージコンテンツ -->
          <div class="p-4 pt-8" style="padding: 1rem; padding-top: 2rem;">
            <h3 class="font-bold mb-2 text-orange-900 text-lg" style="color: #9a3412; font-size: 1.125rem; margin-bottom: 0.5rem;">
              ${event.content || 'イベント'}
            </h3>
            <p class="text-orange-700 text-sm mb-3" style="color: #c2410c; font-size: 0.875rem; margin-bottom: 0.75rem;">
              📅 イベント詳細
            </p>
            <div class="flex justify-between items-center text-xs" 
                 style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem;">
              <span class="text-red-500 font-medium" style="color: #ef4444; font-weight: 500;">❤️ ${event.like || 0} いいね</span>
              <div class="text-orange-600" style="color: #ea580c;">
                <span class="font-medium" style="font-weight: 500;">📍 ${!event.coordinate ? '現在地' : 'イベント'}</span>
                <span class="ml-2" style="margin-left: 0.5rem;">${new Date(event.created_time || '').toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      `);

      // マーカーにポップアップを設定してから地図に追加
      marker.setPopup(popup).addTo(mapRef.current!);

      // イベントマーカーをリストに追加
      eventMarkersRef.current.push(marker);

      console.log(`📌 イベントマーカー${eventMarkersRef.current.length}を作成: イベントID=${event.id}`);

      // ポップアップを即座に表示（新規イベントは優先的に表示）
      setTimeout(() => {
        try {
          popup.addTo(mapRef.current!);
          console.log(`✅ イベント${event.id}のポップアップを直接表示`);
          
          // 新規イベントの場合、現在地にカメラを移動
          if (isNewEvent && !event.coordinate) {
            mapRef.current!.flyTo({
              center: coordinates,
              zoom: 16,
              duration: 1500
            });
            console.log(`🎯 新規イベント${event.id}の現在地にカメラを移動`);
          }
          
          // マーカーのポップアップも確認
          setTimeout(() => {
            const markerPopup = marker.getPopup();
            if (markerPopup && !markerPopup.isOpen()) {
              marker.togglePopup();
              console.log(`🟠 イベント${event.id}のマーカーポップアップも表示`);
            }
          }, 100);
          
        } catch (error) {
          console.error(`❌ イベント${event.id}のポップアップ表示エラー:`, error);
        }
      }, isNewEvent ? 100 : (350 + index * 50)); // 新規イベントは即座に表示
    });

    console.log('イベントマーカー追加完了:', eventMarkersRef.current.length, '個');
  };

  // 投稿データをGeoJSONに変換
  const createGeoJSONFromPosts = (posts: Post[]): GeoJSON.FeatureCollection => {
    console.log('GeoJSONに変換する投稿データ:', posts.length, '件');
    
    const validFeatures = posts
      .filter((post) => {
        // 座標の有効性チェック
        const isValidCoordinate = !!(post.coordinate && post.coordinate.lat && post.coordinate.lng);
        if (!isValidCoordinate) {
          console.warn('座標データが不正な投稿をスキップ:', {
            id: post.id,
            content: post.content?.substring(0, 20),
            coordinate: post.coordinate
          });
          return false;
        }
        
        // カテゴリのチェック（otherカテゴリは除外）
        const category = post.category || 'other';
        const isValidCategory = category !== 'other' && category !== 'その他';
        if (!isValidCategory) {
          console.warn('otherカテゴリの投稿をスキップ:', {
            id: post.id,
            category: category
          });
          return false;
        }
        
        return true;
      })
      .map((post) => ({
        type: 'Feature' as const,
        properties: {
          id: post.id,
          content: post.content,
          category: post.category || 'other',
          likes: post.like,
          created_time: post.created_time,
          user_id: post.user_id,
          tags: post.tags || []
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [post.coordinate.lng, post.coordinate.lat]
        }
      }));
    
    console.log(`有効な投稿: ${validFeatures.length}/${posts.length}`);
    return {
      type: 'FeatureCollection',
      features: validFeatures
    };
  };

  // Mapboxトークンを初期化する関数
  const initializeMapboxToken = () => {
    const token = process.env.NEXT_PUBLIC_MAP_API_TOKEN;
    if (!token) {
      console.error('Mapbox access token is required. Please set NEXT_PUBLIC_MAP_API_TOKEN in .env.local');
      return false;
    }
    console.log('Mapbox token found, initializing...');
    mapboxgl.accessToken = token;
    return true;
  };

  // マップインスタンスを作成する関数
  const createMapInstance = (container: HTMLDivElement) => {
    // 位置情報が取得済みの場合は現在地を、そうでなければデフォルト位置を使用
    const center: [number, number] = locationState === Status.LOADED 
      ? [location.lng, location.lat] 
      : MAPBOX_CONFIG.CENTER;
    
    console.log('地図作成時の中心座標:', center);
    
    return new mapboxgl.Map({
      container,
      center,
      zoom: MAPBOX_CONFIG.ZOOM,
      pitch: MAPBOX_CONFIG.PITCH,
      bearing: MAPBOX_CONFIG.BEARING,
      style: MAPBOX_CONFIG.STYLE,
      minZoom: MAPBOX_CONFIG.MIN_ZOOM || 10,
      maxZoom: MAPBOX_CONFIG.MAX_ZOOM || 20,
      localIdeographFontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
      language: MAPBOX_CONFIG.LANGUAGE || 'ja'
    });
  };

  // マップラベルを設定する関数
  const setupMapLabels = (map: mapboxgl.Map) => {
    const labelLayers = [
      'country-label',
      'state-label',
      'settlement-major-label',
      'settlement-minor-label',
      'place-label',
      'poi-label',
      'transit-label',
      'road-label'
    ];

    labelLayers.forEach(layerId => {
      try {
        // レイヤーが存在するかチェック
        const layer = map.getLayer(layerId);
        if (layer) {
          // デフォルトラベルを非表示にしてカスタムコメントとの競合を防ぐ
          map.setLayoutProperty(layerId, 'visibility', 'none');
          console.log(`Hidden default label layer: ${layerId}`);
        } else {
          console.warn(`Layer ${layerId} does not exist in the current style`);
        }
      } catch (error) {
        console.warn(`Could not hide labels for ${layerId}:`, error);
      }
    });
  };

  // マップスタイルを設定する関数
  const setupMapStyle = (map: mapboxgl.Map) => {
    try {
      // ビルディングレイヤーが存在するかチェック
      const buildingLayer = map.getLayer('building');
      if (buildingLayer) {
        map.setPaintProperty('building', 'fill-color', '#d6d6d6');
        map.setPaintProperty('building', 'fill-opacity', 0.8);
        console.log('Successfully applied building style');
      } else {
        console.warn('Building layer does not exist in the current style');
      }
    } catch (error) {
      console.warn('Could not set building style:', error);
    }
  };

  // 道路レイヤーを非表示にする関数
  const hideRoadLayers = (map: mapboxgl.Map) => {
    const roadLayers = [
      'road-motorway',
      'road-trunk',
      'road-primary',
      'road-secondary',
      'road-street',
      'road-path'
    ];

    roadLayers.forEach(layerId => {
      try {
        // レイヤーが存在するかチェック
        const layer = map.getLayer(layerId);
        if (layer) {
          map.setLayoutProperty(layerId, 'visibility', 'none');
          console.log(`Successfully hid road layer ${layerId}`);
        } else {
          console.warn(`Road layer ${layerId} does not exist in the current style`);
        }
      } catch (error) {
        console.warn(`Could not hide layer ${layerId}:`, error);
      }
    });
  };

  // カスタムスタイルを作成する関数
  const createMapStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
      .mapboxgl-popup-content {
        background: transparent !important;
        border: none !important;
        border-radius: 8px !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-width: 300px !important;
      }
      .mapboxgl-popup-tip {
        border-top-color: transparent !important;
        border-bottom-color: transparent !important;
        display: none !important;
      }
      .custom-marker {
        cursor: pointer;
        transition: transform 0.2s ease;
      }
      .custom-marker:hover {
        transform: scale(1.1);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  };

  useEffect(() => {
    if (!initializeMapboxToken()) return;
    if (!mapContainerRef.current) {
      console.error('Map container ref is not available');
      return;
    }

    // カスタムスタイルを追加
    const removeStyles = createMapStyles();

    // マップインスタンスを作成
    mapRef.current = createMapInstance(mapContainerRef.current);

    mapRef.current.on('style.load', () => {
      if (!mapRef.current) return;
      
      // デバッグ用：利用可能なレイヤーを表示
      const style = mapRef.current.getStyle();
      if (style && style.layers) {
        console.log('Available layers:', style.layers.map(layer => layer.id));
      }
      
      setupMapLabels(mapRef.current);
      setupMapStyle(mapRef.current);
    });

    // ズーム・移動・スタイル変更時にポップアップを再表示
    const restorePopups = (event?: any) => {
      const eventType = event?.type || 'unknown';
    
      
      // 短い遅延でまず試行
      setTimeout(() => {
        let restoredCount = 0;
        
        // 投稿マーカーのポップアップを強制復元
        markersRef.current.forEach((marker, index) => {
          try {
            const popup = marker.getPopup();
            if (popup) {
              // 強制的に閉じてから開く
              if (popup.isOpen()) {
                popup.remove();
              }
              marker.togglePopup();
              restoredCount++;
            
            }
          } catch (error) {
            console.error(`📌 投稿マーカー${index}のポップアップ復元エラー:`, error);
          }
        });

        // スレッドマーカーのポップアップを強制復元
        threadMarkersRef.current.forEach((marker, index) => {
          try {
            const popup = marker.getPopup();
            if (popup) {
              // 強制的に閉じてから開く
              if (popup.isOpen()) {
                popup.remove();
              }
              marker.togglePopup();
              restoredCount++;
            
            }
          } catch (error) {
            console.error(`スレッドマーカー${index}のポップアップ復元エラー:`, error);
          }
        });

        // イベントマーカーのポップアップを強制復元
        eventMarkersRef.current.forEach((marker, index) => {
          try {
            const popup = marker.getPopup();
            if (popup) {
              // 強制的に閉じてから開く
              if (popup.isOpen()) {
                popup.remove();
              }
              marker.togglePopup();
              restoredCount++;
            }
          } catch (error) {
            console.error(`イベントマーカー${index}のポップアップ復元エラー:`, error);
          }
        });
        
        console.log(`ポップアップ復元完了: ${restoredCount}個 (${eventType})`);
      }, 100);
      
      // 追加の確認とダブル復元（確実性を高める）
      setTimeout(() => {
        let doubleCheckCount = 0;
        
        markersRef.current.forEach((marker, index) => {
          try {
            const popup = marker.getPopup();
            if (popup && !popup.isOpen()) {
              marker.togglePopup();
              doubleCheckCount++;
              console.log(`投稿マーカー${index}のポップアップを追加復元`);
            }
          } catch (error) {
            console.error(`投稿マーカー${index}の追加復元エラー:`, error);
          }
        });

        threadMarkersRef.current.forEach((marker, index) => {
          try {
            const popup = marker.getPopup();
            if (popup && !popup.isOpen()) {
              marker.togglePopup();
              doubleCheckCount++;
              console.log(`スレッドマーカー${index}のポップアップを追加復元`);
            }
          } catch (error) {
            console.error(`スレッドマーカー${index}の追加復元エラー:`, error);
          }
        });

        eventMarkersRef.current.forEach((marker, index) => {
          try {
            const popup = marker.getPopup();
            if (popup && !popup.isOpen()) {
              marker.togglePopup();
              doubleCheckCount++;
              console.log(`イベントマーカー${index}のポップアップを追加復元`);
            }
          } catch (error) {
            console.error(`イベントマーカー${index}の追加復元エラー:`, error);
          }
        });
        
        if (doubleCheckCount > 0) {
          console.log(`追加復元完了: ${doubleCheckCount}個`);
        }
      }, 500);
    };

    // refに関数を保存
    restorePopupsRef.current = restorePopups;

    // 地図イベントリスナーを追加（更多のイベントを監視）
    mapRef.current.on('zoomend', restorePopups);
    mapRef.current.on('moveend', restorePopups);
    mapRef.current.on('styledata', restorePopups);
    mapRef.current.on('sourcedata', restorePopups);
    mapRef.current.on('render', restorePopups);  // レンダリング完了時
    mapRef.current.on('idle', restorePopups);    // 地図がアイドル状態になった時
    mapRef.current.on('load', restorePopups);    // 地図の読み込み完了時
    

    // クリーンアップ関数
    return () => {
      // 投稿マーカーを削除
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      // スレッドマーカーを削除
      threadMarkersRef.current.forEach(marker => marker.remove());
      threadMarkersRef.current = [];
      
      // イベントマーカーを削除
      eventMarkersRef.current.forEach(marker => marker.remove());
      eventMarkersRef.current = [];
      
      // 現在地マーカーを削除
      if (currentLocationMarkerRef.current) {
        currentLocationMarkerRef.current.remove();
        currentLocationMarkerRef.current = null;
      }
      
      if (mapRef.current) {
        // イベントリスナーを削除
        mapRef.current.off('zoomend', restorePopups);
        mapRef.current.off('moveend', restorePopups);
        mapRef.current.off('styledata', restorePopups);
        mapRef.current.off('sourcedata', restorePopups);
        mapRef.current.off('render', restorePopups);
        mapRef.current.off('idle', restorePopups);
        mapRef.current.off('load', restorePopups);
        
        mapRef.current.remove();
      }
      removeStyles();
    };
  }, []);

  // 位置情報が更新された時に地図の中心を移動
  useEffect(() => {
    if (mapRef.current && locationState === Status.LOADED) {
      console.log('位置情報更新により地図中心を移動:', [location.lng, location.lat]);
      mapRef.current.easeTo({
        center: [location.lng, location.lat],
        duration: 1000
      });
      
      // 現在地マーカーも更新
      addCurrentLocationMarker();
      
      // スレッドマーカーも更新
      if (threads.length > 0) {
        addThreadMarkers();
      }
      
      // イベントマーカーも更新
      if (events.length > 0) {
        addEventMarkers();
      }
    }
  }, [location, locationState]);

  // 投稿データが更新された時にマーカーを更新
  useEffect(() => {
    if (mapRef.current && posts.length > 0) {
      console.log('投稿データが更新されました。マーカーを更新中...');
      addPostMarkers();
      
      // マーカー追加後に確実にポップアップを表示
      setTimeout(() => {
        console.log('📌 投稿データ更新後のポップアップ強制表示');
        restorePopupsRef.current?.({ type: 'data-update' });
      }, 800);
    }
    
    // スレッドマーカーも追加
    if (mapRef.current && threads.length > 0) {
      console.log('スレッドデータが更新されました。スレッドマーカーを更新中...');
      addThreadMarkers();
    }
    
    // イベントマーカーも追加
    if (mapRef.current && events.length > 0) {
      console.log('イベントデータが更新されました。イベントマーカーを更新中...');
      addEventMarkers();
    }
  }, [posts, threads, events, selectedCategory]); // eventsも依存関係に追加

  // 認証状態が変更された時にいいね状態を再確認
  useEffect(() => {
    if (isAuthenticated && mapRef.current) {
      console.log('🔐 認証状態が変更されました。いいね状態を再確認中...');
      
      // 少し遅延させてからいいね状態を確認（個別に処理）
      setTimeout(() => {
        posts.forEach((post, index) => {
          if (post.coordinate && post.coordinate.lat && post.coordinate.lng) {
            setTimeout(() => {
              console.log(`🔐 認証後: 投稿${post.id}のいいね状態を確認中 (${index + 1}/${posts.length})`);
              checkInitialLikeStatus(post);
            }, index * 100); // 100msずつ遅延（200msから短縮）
          }
        });
        
        threads.forEach((thread, index) => {
          if (thread.coordinate && thread.coordinate.lat && thread.coordinate.lng) {
            setTimeout(() => {
              console.log(`🔐 認証後: スレッド${thread.id}のいいね状態を確認中 (${index + 1}/${threads.length})`);
              checkInitialThreadLikeStatus(thread);
            }, index * 100); // 100msずつ遅延（200msから短縮）
          }
        });
      }, 500); // 1000msから短縮
    }
  }, [isAuthenticated]);

  // 定期的なチェックを削除 - ユーザーのフィードバックに基づいて不要な負荷を削減
  // ポップアップの更新は以下のイベントで適切に処理される：
  // - ズームによりマップが更新されるとき
  // - ページを再読み込みするとき
  // - いいねされるとき
  // - 新しく投稿がされるとき

  const toggle3D = () => {
    if (!mapRef.current) return;
    
    if (is3D) {
      mapRef.current.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1000
      });
    } else {
      mapRef.current.easeTo({
        pitch: MAPBOX_CONFIG.PITCH,
        bearing: MAPBOX_CONFIG.BEARING,
        duration: 1000
      });
    }
    setIs3D(!is3D);
  };

  const changeMapView = (view: number) => {
    if (!mapRef.current || !mapContainerRef.current) return;
    
    mapRef.current.remove();
    
    switch(view) {
      case 1:
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          center: MAPBOX_CONFIG.CENTER,
          zoom: MAPBOX_CONFIG.ZOOM,
          pitch: MAPBOX_CONFIG.PITCH,
          bearing: MAPBOX_CONFIG.BEARING,
          style: MAPBOX_CONFIG.STYLE,
          minZoom: 15,
          maxZoom: 16,
          localIdeographFontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
          language: MAPBOX_CONFIG.LANGUAGE
        });
        break;
      case 2:
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          center: MAPBOX_CONFIG.CENTER,
          zoom: 5.100,
          pitch: MAPBOX_CONFIG.PITCH,
          bearing: MAPBOX_CONFIG.BEARING,
          style: MAPBOX_CONFIG.STYLE,
          minZoom: 5,
          maxZoom: 100,
          localIdeographFontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
          language: MAPBOX_CONFIG.LANGUAGE
        });

        mapRef.current.on('style.load', () => {
          if (!mapRef.current) return;
          hideRoadLayers(mapRef.current);
        });
        break;
      case 3:
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          center: MAPBOX_CONFIG.CENTER,
          zoom: MAPBOX_CONFIG.ZOOM,
          pitch: MAPBOX_CONFIG.PITCH,
          bearing: MAPBOX_CONFIG.BEARING,
          style: MAPBOX_CONFIG.STYLE,
          minZoom: 15,
          maxZoom: 16,
          localIdeographFontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
          language: MAPBOX_CONFIG.LANGUAGE
        });
        break;
    }
  };

  return {
    mapContainerRef,
    mapRef,
    is3D,
    toggle3D,
    changeMapView,
    addPostMarkers,
    addThreadMarkers,
    addEventMarkers,
    addCurrentLocationMarker,
    createGeoJSONFromPosts
  };
};
