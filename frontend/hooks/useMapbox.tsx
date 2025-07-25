import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_CONFIG } from '@/constants/map';
import { useAppSelector } from '@/store';
import { Status, Post } from '@/types/types';

export const useMapbox = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [is3D, setIs3D] = useState(true);
  
  // Redux storeから位置情報を取得
  const { location, state: locationState } = useAppSelector(state => state.location);
  const { items: posts } = useAppSelector(state => state.posts);

  // 投稿マーカーの参照を保持
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const currentLocationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const restorePopupsRef = useRef<((event?: any) => void) | null>(null);

  // 現在地マーカーを追加する関数
  const addCurrentLocationMarker = () => {
    if (!mapRef.current || locationState !== Status.LOADED) return;

    // 既存の現在地マーカーを削除
    if (currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current.remove();
    }

    // 現在地マーカーを作成
    currentLocationMarkerRef.current = new mapboxgl.Marker({ 
      color: '#ff0000',
      scale: 1.2
    })
      .setLngLat([location.lng, location.lat])
      .setPopup(
        new mapboxgl.Popup({ 
          offset: 25,
          closeButton: false,   // 閉じるボタンを非表示
          closeOnClick: false,  // クリックで閉じることを無効
          closeOnMove: false    // 地図移動で閉じることを無効
        })
          .setHTML(`
            <div class="relative max-w-xs bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 shadow-lg rounded-2xl overflow-hidden" 
                 style="max-width: 18rem; background: linear-gradient(to bottom right, #fef2f2, #fdf2f8); border: 1px solid #fecaca; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-radius: 1rem; overflow: hidden; position: relative;">
              <!-- 吹き出しの矢印 -->
              <div class="absolute -bottom-2 left-5 w-0 h-0" 
                   style="position: absolute; bottom: -8px; left: 20px; width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid #fef2f2;"></div>
              
              <!-- 現在地アイコン -->
              <div class="absolute top-2 left-2 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center"
                   style="position: absolute; top: 8px; left: 8px; height: 24px; width: 24px; border-radius: 50%; background-color: #ef4444; display: flex; align-items: center; justify-content: center;">
                <svg class="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24" style="height: 12px; width: 12px; color: white;">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              
              <!-- コンテンツ -->
              <div class="p-4 pt-8" style="padding: 1rem; padding-top: 2rem;">
                <p class="text-sm text-red-900 leading-relaxed mb-2 font-semibold" 
                   style="font-size: 0.875rem; color: #7f1d1d; line-height: 1.6; margin-bottom: 0.5rem; font-weight: 600;">
                  📍 現在地
                </p>
                <div class="text-xs text-red-600" style="font-size: 0.75rem; color: #dc2626;">
                  <div style="margin-bottom: 0.25rem;">緯度: ${location.lat.toFixed(6)}</div>
                  <div>経度: ${location.lng.toFixed(6)}</div>
                </div>
              </div>
            </div>
          `)
      )
      .addTo(mapRef.current!);

    // 現在地ポップアップも常時表示
    setTimeout(() => {
      try {
        const popup = currentLocationMarkerRef.current?.getPopup();
        if (popup) {
          if (!popup.isOpen()) {
            currentLocationMarkerRef.current?.togglePopup();
            console.log('📍 現在地ポップアップを表示');
          } else {
            console.log('📍 現在地ポップアップは既に表示済み');
          }
          
          // 状態確認
          setTimeout(() => {
            const isStillOpen = popup.isOpen();
            console.log(`📍 現在地ポップアップ状態確認: ${isStillOpen ? '表示中' : '非表示'}`);
            if (!isStillOpen) {
              console.warn('📍 現在地ポップアップが閉じられました - 再表示を試行');
              try {
                currentLocationMarkerRef.current?.togglePopup();
              } catch (retryError) {
                console.error('📍 現在地ポップアップ再表示エラー:', retryError);
              }
            }
          }, 200);
        } else {
          console.error('📍 現在地ポップアップオブジェクトが見つかりません');
        }
      } catch (error) {
        console.error('📍 現在地ポップアップ表示エラー:', error);
      }
    }, 600); // 投稿ポップアップより遅く表示

    console.log('現在地マーカーを追加:', [location.lng, location.lat]);
  };

  // 投稿マーカーを地図に追加する関数
  const addPostMarkers = () => {
    if (!mapRef.current || !posts.length) return;

    // 既存のマーカーを削除
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    console.log('投稿マーカーを追加中:', posts.length, '件');

    posts.forEach((post) => {
      if (!post.coordinate || !post.coordinate.lat || !post.coordinate.lng) {
        console.warn('座標が無効な投稿をスキップ:', post.id);
        return;
      }

      // カテゴリに基づいて色を決定
      const getMarkerColor = (category: string) => {
        switch (category) {
          case 'food': return '#ff6b6b';
          case 'event': return '#4ecdc4';
          case 'question': return '#45b7d1';
          case 'announcement': return '#96ceb4';
          case 'other': 
          default: return '#feca57';
        }
      };

      // マーカーを作成
      const marker = new mapboxgl.Marker({ 
        color: getMarkerColor(post.category || 'other'),
        scale: 0.8
      })
        .setLngLat([post.coordinate.lng, post.coordinate.lat]);

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
          
          <!-- スレッドアイコン -->
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
              <span class="text-red-500 font-medium" style="color: #ef4444; font-weight: 500;">❤️ ${post.like || 0} いいね</span>
              <div class="text-blue-600" style="color: #2563eb;">
                <span class="font-medium" style="font-weight: 500;">${post.category || 'その他'}</span>
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
          console.log(`✅ 投稿${post.id}のポップアップを直接表示`);
          
          // さらにマーカーのポップアップも確認
          setTimeout(() => {
            const markerPopup = marker.getPopup();
            if (markerPopup && !markerPopup.isOpen()) {
              marker.togglePopup();
              console.log(`� 投稿${post.id}のマーカーポップアップも表示`);
            }
          }, 100);
          
        } catch (error) {
          console.error(`❌ 投稿${post.id}のポップアップ表示エラー:`, error);
        }
      }, post === posts[0] ? 200 : 200 + markersRef.current.length * 50); // マーカーごとに少しずつ遅延
    });

    console.log('投稿マーカー追加完了:', markersRef.current.length, '個');
  };

  // 投稿データをGeoJSONに変換
  const createGeoJSONFromPosts = (posts: Post[]): GeoJSON.FeatureCollection => {
    console.log('GeoJSONに変換する投稿データ:', posts.length, '件');
    
    const validFeatures = posts
      .filter((post) => {
        const isValid = !!(post.coordinate && post.coordinate.lat && post.coordinate.lng);
        if (!isValid) {
          console.warn('座標データが不正な投稿をスキップ:', {
            id: post.id,
            content: post.content?.substring(0, 20),
            coordinate: post.coordinate
          });
        }
        return isValid;
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
        background: white !important;
        border: 1px solid #ccc !important;
        border-radius: 8px !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
        padding: 0 !important;
        max-width: 300px !important;
      }
      .mapboxgl-popup-tip {
        border-top-color: white !important;
        border-bottom-color: white !important;
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
      console.log(`🔄 地図変更検出 (${eventType}) - ポップアップを強制復元中...`);
      
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
              console.log(`📌 投稿マーカー${index}のポップアップを強制復元`);
            }
          } catch (error) {
            console.error(`📌 投稿マーカー${index}のポップアップ復元エラー:`, error);
          }
        });

        // 現在地マーカーのポップアップを強制復元
        if (currentLocationMarkerRef.current) {
          try {
            const popup = currentLocationMarkerRef.current.getPopup();
            if (popup) {
              // 強制的に閉じてから開く
              if (popup.isOpen()) {
                popup.remove();
              }
              currentLocationMarkerRef.current.togglePopup();
              restoredCount++;
              console.log('📍 現在地マーカーのポップアップを強制復元');
            }
          } catch (error) {
            console.error('📍 現在地マーカーのポップアップ復元エラー:', error);
          }
        }
        
        console.log(`✅ ポップアップ復元完了: ${restoredCount}個 (${eventType})`);
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
              console.log(`🔁 投稿マーカー${index}のポップアップを追加復元`);
            }
          } catch (error) {
            console.error(`🔁 投稿マーカー${index}の追加復元エラー:`, error);
          }
        });

        if (currentLocationMarkerRef.current) {
          try {
            const popup = currentLocationMarkerRef.current.getPopup();
            if (popup && !popup.isOpen()) {
              currentLocationMarkerRef.current.togglePopup();
              doubleCheckCount++;
              console.log('🔁 現在地マーカーのポップアップを追加復元');
            }
          } catch (error) {
            console.error('🔁 現在地マーカーの追加復元エラー:', error);
          }
        }
        
        if (doubleCheckCount > 0) {
          console.log(`🔁 追加復元完了: ${doubleCheckCount}個`);
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
    
    console.log('🎯 地図イベントリスナーを設定完了（強化版）');

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
  }, [posts]);

  // ポップアップを定期的にチェックして常時表示を維持
  useEffect(() => {
    const popupInterval = setInterval(() => {
      if (!mapRef.current || markersRef.current.length === 0) return;

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

      // 現在地マーカーのポップアップをチェック
      if (currentLocationMarkerRef.current) {
        try {
          const popup = currentLocationMarkerRef.current.getPopup();
          if (popup && !popup.isOpen()) {
            console.log('📍 現在地マーカーのポップアップが閉じています - 再表示');
            currentLocationMarkerRef.current.togglePopup();
          }
        } catch (error) {
          console.error('📍 現在地マーカーのポップアップチェックエラー:', error);
        }
      }
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
