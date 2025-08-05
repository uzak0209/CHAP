import React from 'react';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import { Status, Post, Thread, Event } from '@/types/types';
import { createAndSetupPostPopup, createAndSetupThreadPopup, createAndSetupEventPopup, setupPostLikeHandler } from './popup-handlers';

// カテゴリに基づいてマーカーの色を決定するユーティリティ関数
export const getMarkerColor = (category: string) => {
  switch (category) {
    case 'entertainment': return '#ff6b6b';  // エンターテイメント（赤）
    case 'community': return '#4ecdc4';      // コミュニティ（青緑）
    case 'disaster': return '#ff4757';       // 災害（赤）
    default: return '#95a5a6';               // デフォルト（グレー）
  }
};

// カテゴリに基づいてRGBA色を取得する関数（ドロップシャドウ用）
const getCategoryRGBA = (category: string) => {
  switch (category) {
    case 'entertainment': return 'rgba(255, 107, 107, ';  // エンターテイメント（赤）
    case 'community': return 'rgba(78, 205, 196, ';       // コミュニティ（青緑）
    case 'disaster': return 'rgba(255, 71, 87, ';         // 災害（赤）
    default: return 'rgba(149, 165, 166, ';               // デフォルト（グレー）
  }
};

// カテゴリに基づくラベルを取得する関数
const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'entertainment': return 'エンターテイメント';
    case 'community': return '地域住民コミュニケーション';
    case 'disaster': return '災害情報';
    default: return 'その他';
  }
};

// カテゴリに基づくポップアップの色設定を取得する関数
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
    case 'disaster':
      return {
        background: 'linear-gradient(to bottom right, #fef2f2, #fee2e2)',
        border: '#fca5a5',
        iconBg: '#dc2626',
        textColor: '#991b1b',
        arrow: '#fef2f2'
      };
  }
};

// マーカー追加関数の生成
export const createMarkerFunctions = (
  mapRef: React.MutableRefObject<mapboxgl.Map | null>,
  markersRef: React.MutableRefObject<mapboxgl.Marker[]>,
  threadMarkersRef: React.MutableRefObject<mapboxgl.Marker[]>,
  eventMarkersRef: React.MutableRefObject<mapboxgl.Marker[]>,
  currentLocationMarkerRef: React.MutableRefObject<mapboxgl.Marker | null>,
  restorePopupsRef: React.MutableRefObject<((event?: any) => void) | null>,
  posts: Post[],
  threads: Thread[],
  events: Event[],
  selectedCategory: string,
  location: { lat: number; lng: number },
  locationState: Status,
  router: ReturnType<typeof useRouter>
) => {
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
  };

  // 投稿マーカーを地図に追加する関数
  const addPostMarkers = () => {
    if (!mapRef.current || !posts.length) return;

    // 既存のマーカーを削除
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

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
        scale: 0.5
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


    validCategoryThreads.forEach((thread) => {
      if (!thread.coordinate || !thread.coordinate.lat || !thread.coordinate.lng) {
        console.warn('座標が無効なスレッドをスキップ:', thread.id);
        return;
      }

      const coordinates: [number, number] = [thread.coordinate.lng, thread.coordinate.lat];

      // スレッドマーカーを作成（黄色）
      const marker = new mapboxgl.Marker({ 
        color: '#ffd700',
        scale: 0.6 
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
      console.log('🔄 イベントマーカー追加をスキップ: マップまたはイベントデータなし');
      return;
    }

    console.log('🔄 イベントマーカー再作成開始:', {
      existingMarkers: eventMarkersRef.current.length,
      newEvents: events.length,
      timestamp: new Date().toISOString()
    });

    // 既存のイベントマーカーを削除
    eventMarkersRef.current.forEach((marker, index) => {
      console.log(`🗑️ 既存マーカー${index}を削除`);
      marker.remove();
    });
    eventMarkersRef.current = [];

    console.log('📌 新しいイベントマーカーを追加中:', events.length, '件');

    // デバッグ: 現在のフィルタ状態を確認
    console.log('🔍 イベントフィルタリング詳細:', {
      selectedCategory: selectedCategory,
      totalEvents: events.length,
      eventDetails: events.map(e => ({
        id: e.id,
        category: e.category,
        tags: e.tags,
        content: e.content?.substring(0, 30)
      }))
    });

    // 有効なカテゴリのイベントのみをフィルタリング
    const validCategoryEvents = events.filter((event) => {
      const category = event.category; 
      const isValidCategory = category !== 'other' && category !== 'その他';
      const matchesSelectedCategory = category === selectedCategory;
      
      console.log(`🔍 イベント${event.id}フィルタ詳細:`, {
        category: category,
        selectedCategory: selectedCategory,
        isValidCategory: isValidCategory,
        matchesSelectedCategory: matchesSelectedCategory,
        finalResult: isValidCategory && matchesSelectedCategory
      });
      
      return isValidCategory && matchesSelectedCategory;
    });

    console.log('🎯 フィルタリング結果:', {
      totalEvents: events.length,
      validCategoryEvents: validCategoryEvents.length,
      validEventIds: validCategoryEvents.map(e => e.id)
    });

    // 現在地を取得（ユーザーの位置情報）
    const userLocation = { lat: location.lat, lng: location.lng };

    validCategoryEvents.forEach((event, index) => {
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

      // イベントのカテゴリを決定（category フィールドまたは tags から取得）
      const eventCategory = event.category || (event.tags && event.tags.length > 0 ? event.tags[0] : 'event');
      
      // イベントマーカーを作成（カテゴリに基づく色、新規イベントは少し大きく）
      const marker = new mapboxgl.Marker({ 
        color: getMarkerColor(eventCategory),
        scale: isNewEvent ? 1.0 : 0.8,
        anchor: 'bottom'
      }).setLngLat(coordinates);

      // デバッグ: マーカーの座標を確認
      console.log(`📍 イベント${event.id}のマーカー座標:`, coordinates, 'アンカー: bottom');

      // マーカー要素にホバーエフェクトを追加
      const markerElement = marker.getElement();
      const shadowColor = getCategoryRGBA(eventCategory);
      markerElement.style.cursor = 'pointer';
      markerElement.style.position = 'absolute';
      markerElement.style.pointerEvents = 'auto';
      
      const baseFilter = isNewEvent 
        ? `drop-shadow(0 6px 12px ${shadowColor}0.5))` 
        : `drop-shadow(0 4px 8px ${shadowColor}0.3))`;
      markerElement.style.filter = baseFilter;
      
      // ホバーエフェクトを追加
      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.filter = `drop-shadow(0 10px 20px ${shadowColor}0.8))`;
        markerElement.style.zIndex = '1000';
      });
      
      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.filter = baseFilter;
        markerElement.style.zIndex = '1';
      });

      // 新しいイベントポップアップシステムを使用
      const popup = createAndSetupEventPopup(event, coordinates, router);
      
      if (!popup) {
        console.log(`イベント${event.id}はカテゴリが無効のため表示をスキップ`);
        return;
      }

      // マーカーにポップアップを設定してから地図に追加
      marker.setPopup(popup).addTo(mapRef.current!);

      // イベントマーカーをリストに追加
      eventMarkersRef.current.push(marker);

      console.log(`📌 イベントマーカー${eventMarkersRef.current.length}を作成: イベントID=${event.id}`);

      // ポップアップを即座に表示
      setTimeout(() => {
        try {
          popup.addTo(mapRef.current!);
          console.log(`✅ イベント${event.id}のポップアップを表示`);
          
          // マーカーのポップアップも確認
          setTimeout(() => {
            const markerPopup = marker.getPopup();
            if (markerPopup && !markerPopup.isOpen()) {
              marker.togglePopup();
            }
          }, 100);

          // 新規イベントの場合、現在地にカメラを移動
          if (isNewEvent && !event.coordinate) {
            mapRef.current!.flyTo({
              center: coordinates,
              zoom: 16,
              duration: 1500
            });
            console.log(`🎯 新規イベント${event.id}の現在地にカメラを移動`);
          }
        } catch (error) {
          console.error(`❌ イベント${event.id}のポップアップ表示エラー:`, error);
        }
      }, isNewEvent ? 100 : (350 + index * 30)); // 新規イベントは即座に表示
    });

    console.log('イベントマーカー追加完了:', eventMarkersRef.current.length, '個');
  };

  return {
    addCurrentLocationMarker,
    addPostMarkers,
    addThreadMarkers,
    addEventMarkers
  };
};