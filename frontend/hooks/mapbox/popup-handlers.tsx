import React from 'react';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import { Post, Thread, Event } from '@/types/types';
import { likePost, likeThread, likeEvent, getPostLikeStatus, getThreadLikeStatus, getEventLikeStatus } from '@/lib/api';
import { createPostPopupHTML, createThreadPopupHTML, createEventPopupHTML, checkInitialLikeStatus, checkInitialThreadLikeStatus, checkInitialEventLikeStatus } from './popups';

// 投稿のいいね機能イベントリスナー設定関数
export const setupPostLikeHandler = (post: Post) => {
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
    
    const handleLikeClick = async (e: MouseEvent) => {
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
    const testClickHandler = (e: MouseEvent) => {
      console.log(`🧪 テストクリックハンドラー実行！投稿ID: ${post.id}`, e);
    };
    
    // イベントリスナーを追加（SVG要素対応）
    heartIcon.addEventListener('click', handleLikeClick, { once: false });
    heartIcon.addEventListener('click', testClickHandler, { once: false });
    
    // さらに確実にするため、親要素にも委譲イベントを追加
    const parentDiv = heartIcon.closest('[data-post-id]');
    if (parentDiv) {
      const delegatedHandler = (e: globalThis.Event) => {
        const target = e.target as Element;
        if (target && target.id === `heart-post-${post.id}`) {
          console.log(`🎯 委譲イベントでハートクリックを検出！投稿ID: ${post.id}`);
          handleLikeClick(e as MouseEvent);
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
export const setupThreadLikeHandler = (thread: Thread) => {
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
    
    const handleThreadLikeClick = async (e: MouseEvent) => {
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
    const testThreadClickHandler = (e: MouseEvent) => {
      console.log(`🧪 スレッドテストクリックハンドラー実行！スレッドID: ${thread.id}`, e);
    };
    
    // イベントリスナーを追加（SVG要素対応）
    heartIcon.addEventListener('click', handleThreadLikeClick, { once: false });
    heartIcon.addEventListener('click', testThreadClickHandler, { once: false });
    
    // さらに確実にするため、親要素にも委譲イベントを追加
    const parentDiv = heartIcon.closest('[data-thread-id]');
    if (parentDiv) {
      const delegatedHandler = (e: globalThis.Event) => {
        const target = e.target as Element;
        if (target && target.id === `heart-thread-${thread.id}`) {
          console.log(`🎯 委譲イベントでスレッドハートクリックを検出！スレッドID: ${thread.id}`);
          handleThreadLikeClick(e as MouseEvent);
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
export const setupThreadClickHandler = (thread: Thread, router: ReturnType<typeof useRouter>) => {
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

// ポップアップ作成とイベント設定の統合関数
export const createAndSetupPostPopup = (post: Post, coordinates: [number, number]) => {
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

export const createAndSetupThreadPopup = (thread: Thread, coordinates: [number, number], router: ReturnType<typeof useRouter>) => {
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

// イベントのいいね機能イベントリスナー設定関数
export const setupEventLikeHandler = (event: Event) => {
  console.log(`🔍 setupEventLikeHandler開始 - イベントID: ${event.id}`);
  
  setTimeout(() => {
    console.log(`🔍 DOM要素を検索中 - heart-event-${event.id}`);
    const heartIcon = document.getElementById(`heart-event-${event.id}`);
    
    if (!heartIcon) {
      console.error(`❌ イベントハートアイコンが見つかりません - heart-event-${event.id}`);
      console.log('🔍 現在のDOM内の全イベント要素をチェック:');
      const allElements = document.querySelectorAll(`[id*="event-${event.id}"]`);
      console.log('見つかった要素:', allElements);
      return;
    }
    
    console.log(`✅ イベントハートアイコンが見つかりました - heart-event-${event.id}`, heartIcon);
    
    // 既にイベントリスナーが設定されている場合はスキップ
    if (heartIcon.hasAttribute('data-listeners-set')) {
      console.log(`✅ イベント${event.id}のイベントリスナーは既に設定済み - スキップ`);
      return;
    }
    
    // processing フラグを設定
    heartIcon.setAttribute('data-processing', 'true');
    console.log(`🏷️ イベント${event.id}にprocessingフラグを設定`);
    
    // 一回だけ実行される強力なイベントリスナー
    let isProcessing = false;
    
    const handleEventLikeClick = async (e: MouseEvent) => {
      console.log(`🎯 イベントハートアイコンがクリックされました！イベントID: ${event.id}`);
      e.stopPropagation();
      e.preventDefault();
      
      if (isProcessing) {
        console.log(`⚠️ イベント${event.id}は既に処理中です（重複防止）`);
        return;
      }
      
      isProcessing = true;
      heartIcon.style.pointerEvents = 'none';
      heartIcon.style.opacity = '0.5';
      console.log(`🔒 イベント${event.id}の処理を開始（UI無効化）`);
      
      try {
        console.log(`❤️ イベント${event.id}のいいねボタンがクリックされました`);
        
        const result = await likeEvent(event.id);
        console.log(`✅ イベントいいねAPI結果:`, result);
        
        // いいね数の表示を更新
        const likeCountElement = document.getElementById(`like-count-event-${event.id}`);
        if (likeCountElement) {
          // アニメーション付きで数字を更新
          likeCountElement.style.transform = 'scale(1.3)';
          likeCountElement.style.transition = 'all 0.3s ease';
          
          // 即座に数値を更新
          likeCountElement.textContent = result.like_count.toString();
          
          setTimeout(() => {
            likeCountElement.style.transform = 'scale(1)';
          }, 150);
          
          console.log(`📊 イベントいいね数を更新: ${result.like_count}`);
        } else {
          console.error(`❌ イベントいいね数表示要素が見つかりません - like-count-event-${event.id}`);
          // DOM要素が見つからない場合は、少し遅延して再試行
          setTimeout(() => {
            const retryElement = document.getElementById(`like-count-event-${event.id}`);
            if (retryElement) {
              retryElement.textContent = result.like_count.toString();
              console.log(`🔄 遅延更新でイベントいいね数を更新: ${result.like_count}`);
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
          console.log(`💖 イベント${event.id}にいいねしました (${result.like_count})`);
        } else {
          // いいね解除状態：ハートと数字を白色に
          heartIcon.style.fill = 'white';
          if (likeCountElement) {
            likeCountElement.style.color = '#ffffff';
            likeCountElement.style.fontWeight = '500';
          }
          console.log(`💙 イベント${event.id}のいいねを解除しました (${result.like_count})`);
        }
        
        // 確実にDOMを更新するため、少し遅延して再確認
        setTimeout(() => {
          const finalCheckElement = document.getElementById(`like-count-event-${event.id}`);
          if (finalCheckElement && finalCheckElement.textContent !== result.like_count.toString()) {
            finalCheckElement.textContent = result.like_count.toString();
            console.log(`🔧 最終確認でイベントいいね数を修正: ${result.like_count}`);
          }
        }, 200);
        
      } catch (error) {
        console.error(`❌ イベント${event.id}のいいね処理エラー:`, error);
        console.warn('イベントいいね処理に失敗しました。ログインしているか確認してください。');
      } finally {
        setTimeout(() => {
          isProcessing = false;
          heartIcon.style.pointerEvents = 'auto';
          heartIcon.style.opacity = '1';
          console.log(`🔓 イベント${event.id}の処理完了（UI有効化）`);
        }, 1000);
      }
    };
    
    // テスト用のクリックハンドラーも追加
    const testEventClickHandler = (e: MouseEvent) => {
      console.log(`🧪 イベントテストクリックハンドラー実行！イベントID: ${event.id}`, e);
    };
    
    // イベントリスナーを追加（SVG要素対応）
    heartIcon.addEventListener('click', handleEventLikeClick, { once: false });
    heartIcon.addEventListener('click', testEventClickHandler, { once: false });
    
    // さらに確実にするため、親要素にも委譲イベントを追加
    const parentDiv = heartIcon.closest('[data-event-id]');
    if (parentDiv) {
      const delegatedHandler = (e: globalThis.Event) => {
        const target = e.target as Element;
        if (target && target.id === `heart-event-${event.id}`) {
          console.log(`🎯 委譲イベントでイベントハートクリックを検出！イベントID: ${event.id}`);
          handleEventLikeClick(e as MouseEvent);
        }
      };
      parentDiv.addEventListener('click', delegatedHandler);
      console.log(`📨 イベント${event.id}の親要素に委譲イベントも追加`);
    }
    
    // イベントリスナー設定完了のフラグを設定
    heartIcon.setAttribute('data-listeners-set', 'true');
    
    console.log(`🔗 イベント${event.id}のハートアイコンにクリックイベント追加完了`);
    console.log(`🔍 イベントイベントリスナー確認:`, {
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

// イベントクリックイベントリスナー設定関数
export const setupEventClickHandler = (event: Event, router: ReturnType<typeof useRouter>) => {
  setTimeout(() => {
    const popupElement = document.querySelector(`[data-event-id="${event.id}"]`);
    if (popupElement) {
      popupElement.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/events/${event.id}`);
      });
      console.log(`イベント${event.id}のポップアップにクリックイベント追加`);
    }
  }, 100);
};

// イベント用ポップアップ作成とイベント設定の統合関数
export const createAndSetupEventPopup = (event: Event, coordinates: [number, number], router: ReturnType<typeof useRouter>) => {
  // カテゴリが無効な場合はnullを返す
  const eventCategory = event.category || (event.tags && event.tags.length > 0 ? event.tags[0] : 'event');
  if (!eventCategory || eventCategory === 'other' || eventCategory === 'その他' || eventCategory === '') {
    console.log(`イベント${event.id}はカテゴリが無効のため表示をスキップ`);
    return null;
  }

  const popupHTML = createEventPopupHTML(event);
  if (!popupHTML) {
    console.log(`イベント${event.id}のHTML生成に失敗（カテゴリなし）`);
    return null;
  }

  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    closeOnMove: false,
    offset: 25,
    className: `event-popup event-${eventCategory}`
  })
  .setLngLat(coordinates)
  .setHTML(popupHTML);

  // ポップアップ表示後にイベントリスナーを設定（既存のリスナーがある場合はスキップ）
  setTimeout(() => {
    setupEventClickHandler(event, router);
    // イベントいいね機能のイベントリスナーを設定
    const heartIcon = document.getElementById(`heart-event-${event.id}`);
    if (heartIcon && !heartIcon.hasAttribute('data-listeners-set')) {
      setupEventLikeHandler(event);
    }
    // 初期いいね状態を確認して色を設定
    checkInitialEventLikeStatus(event);
  }, 300);

  return popup;
};