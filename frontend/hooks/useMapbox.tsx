import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_CONFIG } from '@/constants/map';
import { useAppSelector } from '@/store';
import { Status, Post, Thread } from '@/types/types';

export const useMapbox = () => {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [is3D, setIs3D] = useState(true);
  
  // Redux storeから位置情報とフィルタ状態を取得
  const { location, state: locationState } = useAppSelector(state => state.location);
  const { items: posts } = useAppSelector(state => state.posts);
  const { items: threads } = useAppSelector(state => state.threads);
  const { selectedCategory } = useAppSelector(state => state.filters);

  // 投稿とスレッドマーカーの参照を保持
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const threadMarkersRef = useRef<mapboxgl.Marker[]>([]);
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

    console.log('現在地マーカーを追加（ポップアップなし）:', [location.lng, location.lat]);
  };

  // 投稿マーカーを地図に追加する関数
  const addPostMarkers = () => {
    if (!mapRef.current || !posts.length) return;

    // 既存のマーカーを削除
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    console.log('投稿マーカーを追加中:', posts.length, '件');
    console.log('選択されたカテゴリ:', selectedCategory);

    // 有効なカテゴリのポストのみをフィルタリング
    const validCategoryPosts = posts.filter((post) => {
      const category = post.category || 'other';
      // 'other'カテゴリは除外（フィルタに対応するカテゴリがないため）
      const isValidCategory = category !== 'other' && category !== 'その他';
      
      // 選択されたカテゴリでフィルタリング
      const matchesSelectedCategory = category === selectedCategory;
      
      const shouldShow = isValidCategory && matchesSelectedCategory;
      
      if (isValidCategory) {
        console.log(`投稿ID:${post.id}, カテゴリ:${category}, 選択:${selectedCategory}, 表示:${shouldShow}`);
      }
      
      return shouldShow;
    });

    console.log('有効なカテゴリの投稿:', validCategoryPosts.length, '件');

    validCategoryPosts.forEach((post) => {
      if (!post.coordinate || !post.coordinate.lat || !post.coordinate.lng) {
        console.warn('座標が無効な投稿をスキップ:', post.id);
        return;
      }

      // カテゴリに基づいて色を決定
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

      // マーカーを作成
      const marker = new mapboxgl.Marker({ 
        color: getMarkerColor(post.category),
        scale: 0.8
      })
        .setLngLat([post.coordinate.lng, post.coordinate.lat]);

      // カテゴリを日本語に変換
      const getCategoryName = (category: string) => {
        switch (category) {
          case 'entertainment': return 'エンターテイメント';
          case 'community': return 'コミュニティ';
          case 'information': return '情報';
          case 'disaster': return '災害';
          case 'food': return '食事';
          case 'event': return 'イベント';
          default: return category;
        }
      };

      // ポップアップを個別に作成
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,   // 閉じるボタンを非表示
        closeOnClick: false,  // クリックで閉じることを無効
        closeOnMove: false,   // 地図移動で閉じることを無効
        anchor: 'bottom'      // アンカー位置を明示的に指定
      })
      .setLngLat([post.coordinate.lng, post.coordinate.lat])
      .setHTML(`
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
              <span class="text-red-500 font-medium" style="color: #ef4444; font-weight: 500;">❤️ ${post.like || 0}</span>
              <div class="text-blue-600" style="color: #2563eb;">
                <span class="ml-2" style="margin-left: 0.5rem;">${new Date(post.created_time || '').toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      `);

      // マーカーにポップアップを設定してから地図に追加
      marker.setPopup(popup).addTo(mapRef.current!);

      // マーカーをリストに追加
      markersRef.current.push(marker);

      console.log(`📌 マーカー${markersRef.current.length}を作成: 投稿ID=${post.id}`);

      // ポップアップを即座に表示
      setTimeout(() => {
        try {
          // ポップアップを地図に直接追加して表示
          popup.addTo(mapRef.current!);
          console.log(` 投稿${post.id}のポップアップを直接表示`);
          
          // さらにマーカーのポップアップも確認
          setTimeout(() => {
            const markerPopup = marker.getPopup();
            if (markerPopup && !markerPopup.isOpen()) {
              marker.togglePopup();
              console.log(`投稿${post.id}のマーカーポップアップも表示`);
            }
          }, 100);
          
        } catch (error) {
          console.error(`投稿${post.id}のポップアップ表示エラー:`, error);
        }
      }, post === posts[0] ? 200 : 200 + markersRef.current.length * 50); // マーカーごとに少しずつ遅延
    });

    console.log('投稿マーカー追加完了:', markersRef.current.length, '個');
  };

  // スレッドマーカーを地図に追加する関数
  const addThreadMarkers = () => {
    if (!mapRef.current) {
      console.log('地図が初期化されていません（スレッド）');
      return;
    }
    
    if (!threads || threads.length === 0) {
      console.log('スレッドデータがありません:', threads);
      return;
    }

    // 既存のスレッドマーカーを削除
    threadMarkersRef.current.forEach(marker => marker.remove());
    threadMarkersRef.current = [];


    // 有効なカテゴリのスレッドのみをフィルタリング
    const validCategoryThreads = threads.filter((thread) => {
      // タグからカテゴリを取得（最初のタグをカテゴリとして扱う）
      const category = thread.tags && thread.tags.length > 0 ? thread.tags[0] : '';
      // 'other'カテゴリは除外（フィルタに対応するカテゴリがないため）
      const isValidCategory = category !== 'other' && category !== 'その他' && category !== '';
      
      // 選択されたカテゴリでフィルタリング
      const matchesSelectedCategory = category === selectedCategory;
      
      const shouldShow = isValidCategory && matchesSelectedCategory;
      
      if (isValidCategory) {
        console.log(`スレッドID:${thread.id}, カテゴリ:${category}, 選択:${selectedCategory}, 表示:${shouldShow}`);
      }
      
      return shouldShow;
    });

    console.log('有効なカテゴリのスレッド:', validCategoryThreads.length, '件');

    validCategoryThreads.forEach((thread) => {
      if (!thread.coordinate || !thread.coordinate.lat || !thread.coordinate.lng) {
        console.warn('座標が無効なスレッドをスキップ:', thread.id);
        return;
      }

      // スレッドデータの日付情報をデバッグ
      console.log('🔍 スレッドデータの詳細:', {
        id: thread.id,
        created_time: thread.created_time,
        created_time_type: typeof thread.created_time,
        updated_at: thread.updated_at,
        all_props: Object.keys(thread)
      });

      // スレッドマーカーを作成（黄色）
      const marker = new mapboxgl.Marker({ 
        color: '#ffd700', // 黄色
        scale: 0.8 
      })
      .setLngLat([thread.coordinate.lng, thread.coordinate.lat]);

      // カテゴリ名を日本語に変換する関数
      const getCategoryName = (category: string) => {
        switch (category) {
          case 'entertainment': return 'エンターテイメント';
          case 'community': return 'コミュニティ';
          case 'information': return '情報';
          case 'disaster': return '災害情報';
          default: return category;
        }
      };

      // タグからカテゴリを取得（最初のタグをカテゴリとして扱う）
      const category = thread.tags && thread.tags.length > 0 ? thread.tags[0] : '';

      // スレッド用のポップアップを作成
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        closeOnMove: false,
        offset: 25,
        className: 'thread-popup thread-popup-yellow'
      })
      .setHTML(`
        <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg shadow-lg max-w-xs cursor-pointer hover:shadow-xl transition-shadow" data-thread-id="${thread.id}">
          <div class="p-4">
            <div class="mb-3">
              <p class="text-gray-700 text-xs leading-relaxed">${thread.content ? thread.content.substring(0, 50) + (thread.content.length > 50 ? '...' : '') : ''}</p>
            </div>
            <div class="text-xs text-gray-500 border-t border-yellow-200 pt-2">
              <div class="flex items-center justify-between">
                <span class="text-red-500 font-medium" style="color: #ef4444; font-weight: 500;">❤️ ${thread.like || 0}</span>
                <span class="ml-2">${(() => {
                  // 安全な日付処理
                  let dateStr = thread.created_time || thread.updated_at || (thread as any).timestamp;
                  console.log('📅 日付処理:', { dateStr, id: thread.id });
                  
                  // Goのzero value日付をチェック
                  if (!dateStr || dateStr === '' || dateStr === '0001-01-01T00:00:00Z') {
                    return '日付不明';
                  }
                  
                  const date = new Date(dateStr);
                  if (isNaN(date.getTime()) || date.getFullYear() <= 1) {
                    return '日付不明';
                  }
                  
                  return date.toLocaleDateString('ja-JP');
                })()}</span>
              </div>
            </div>
          </div>
        </div>
      `);

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
          // ポップアップを地図に直接追加して表示
          popup.addTo(mapRef.current!);
          console.log(`スレッド${thread.id}のポップアップを直接表示`);
          
          // ポップアップのクリックイベントリスナーを追加
          const popupElement = document.querySelector(`[data-thread-id="${thread.id}"]`);
          if (popupElement) {
            popupElement.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/threads/${thread.id}`);
            });
            console.log(`スレッド${thread.id}のポップアップにクリックイベント追加`);
          }
          
          // さらにマーカーのポップアップも確認
          setTimeout(() => {
            const markerPopup = marker.getPopup();
            if (markerPopup && !markerPopup.isOpen()) {
              marker.togglePopup();
              console.log(`スレッド${thread.id}のマーカーポップアップも表示`);
            }
          }, 100);
          
        } catch (error) {
          console.error(`スレッド${thread.id}のポップアップ表示エラー:`, error);
        }
      }, 250 + threadMarkersRef.current.length * 50); // スレッドマーカーごとに少しずつ遅延
    });

    console.log('スレッドマーカー追加完了:', threadMarkersRef.current.length, '個');
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
  }, [posts, threads, selectedCategory]); // threadsも依存関係に追加

  // ポップアップを定期的にチェックして常時表示を維持
  useEffect(() => {
    const popupInterval = setInterval(() => {
      if (!mapRef.current || (markersRef.current.length === 0 && threadMarkersRef.current.length === 0)) return;

      console.log('🔄 ポップアップ状態を定期チェック中...');
      
      // 投稿マーカーのポップアップをチェック
      markersRef.current.forEach((marker, index) => {
        try {
          const popup = marker.getPopup();
          if (popup && !popup.isOpen()) {
            console.log(`📌 投稿マーカー${index}のポップアップが閉じています - 再表示`);
            marker.togglePopup();
          }
        } catch (error) {
          console.error(`📌 投稿マーカー${index}のポップアップチェックエラー:`, error);
        }
      });

      // スレッドマーカーのポップアップをチェック
      threadMarkersRef.current.forEach((marker, index) => {
        try {
          const popup = marker.getPopup();
          if (popup && !popup.isOpen()) {
            console.log(`スレッドマーカー${index}のポップアップが閉じています - 再表示`);
            marker.togglePopup();
          }
        } catch (error) {
          console.error(`スレッドマーカー${index}のポップアップチェックエラー:`, error);
        }
      });
    }, 3000); // 3秒ごとにチェック

    return () => {
      clearInterval(popupInterval);
    };
  }, [posts, locationState]); // postsと位置情報の状態に依存

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
    addCurrentLocationMarker,
    createGeoJSONFromPosts
  };
};
