import mapboxgl from 'mapbox-gl';
import { MAPBOX_CONFIG } from '@/constants/map';
import { Status } from '@/types/types';

// Mapboxトークンを初期化する関数
export const initializeMapboxToken = () => {
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
export const createMapInstance = (container: HTMLDivElement, location: { lat: number; lng: number }, locationState: Status) => {
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
export const setupMapLabels = (map: mapboxgl.Map) => {
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
export const setupMapStyle = (map: mapboxgl.Map) => {
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
export const hideRoadLayers = (map: mapboxgl.Map) => {
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
export const createMapStyles = () => {
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

// ポップアップ復元関数を作成
export const createRestorePopupsFunction = (
  markersRef: React.MutableRefObject<mapboxgl.Marker[]>,
  threadMarkersRef: React.MutableRefObject<mapboxgl.Marker[]>,
  eventMarkersRef: React.MutableRefObject<mapboxgl.Marker[]>
) => {
  // ポップアップの状態を保存する変数
  let savedPopupStates: Map<string, boolean> = new Map();

  // ポップアップの状態を保存する関数
  const savePopupStates = () => {
    savedPopupStates.clear();
    
    [...markersRef.current, ...threadMarkersRef.current, ...eventMarkersRef.current].forEach((marker, index) => {
      try {
        const popup = marker.getPopup();
        if (popup) {
          savedPopupStates.set(`marker-${index}`, popup.isOpen());
        }
      } catch (error) {
        console.warn(`マーカー${index}のポップアップ状態保存エラー:`, error);
      }
    });
    
    console.log(`💾 ポップアップ状態を保存: ${savedPopupStates.size}個`);
  };

  return (event?: any) => {
    const eventType = event?.type || 'unknown';
    
    // 頻繁なイベントの場合は処理をスキップ
    if (['render', 'idle', 'sourcedata', 'styledata'].includes(eventType)) {
      return;
    }

    // ズーム開始時は状態を保存
    if (eventType === 'zoomstart') {
      savePopupStates();
      return;
    }
    
    // 保存された状態に基づく確実なポップアップ復元処理
    setTimeout(() => {
      let restoredCount = 0;
      console.log(`🔄 ポップアップ復元開始 (${eventType}) - 保存状態: ${savedPopupStates.size}個`);
      
      // 全マーカーを統一的に処理
      const allMarkers = [...markersRef.current, ...threadMarkersRef.current, ...eventMarkersRef.current];
      
      allMarkers.forEach((marker, index) => {
        try {
          const popup = marker.getPopup();
          if (!popup) return;
          
          const markerKey = `marker-${index}`;
          const shouldBeOpen = savedPopupStates.get(markerKey);
          const isCurrentlyOpen = popup.isOpen();
          
          // 保存された状態がある場合はそれに基づいて復元、ない場合はデフォルトで開く
          const targetState = shouldBeOpen !== undefined ? shouldBeOpen : true;
          
          if (targetState && !isCurrentlyOpen) {
            // 開くべきだが閉じている場合
            marker.togglePopup();
            restoredCount++;
            console.log(`🔄 マーカー${index}のポップアップを復元（保存状態: ${shouldBeOpen}）`);
          } else if (!targetState && isCurrentlyOpen) {
            // 閉じるべきだが開いている場合
            marker.togglePopup();
            console.log(`🔒 マーカー${index}のポップアップを閉じる（保存状態: ${shouldBeOpen}）`);
          }
        } catch (error) {
          console.warn(`⚠️ マーカー${index}の復元エラー:`, error instanceof Error ? error.message : String(error));
          
          // エラーが発生した場合はフォールバックとして強制的に開く
          try {
            const popup = marker.getPopup();
            if (popup && !popup.isOpen()) {
              marker.togglePopup();
              restoredCount++;
              console.log(`🔄 マーカー${index}のポップアップをフォールバック復元`);
            }
          } catch (fallbackError) {
            console.error(`❌ マーカー${index}のフォールバック復元も失敗:`, fallbackError);
          }
        }
      });
      
    }, 300); // 300msに調整してより確実に
    
    // // 最終確認として強制的にポップアップを表示（ズーム操作の場合のみ）
    // if (eventType === 'zoomend') {
    //   setTimeout(() => {
    //     let finalCheckCount = 0;
        
    //     const allMarkers = [...markersRef.current, ...threadMarkersRef.current, ...eventMarkersRef.current];
    //     const totalMarkers = allMarkers.length;
        
    //     if (totalMarkers > 0) {
    //       console.log(`🔍 最終確認開始（ズーム後）: ${totalMarkers}個のマーカーをチェック`);
          
    //       allMarkers.forEach((marker, index) => {
    //         try {
    //           const popup = marker.getPopup();
    //           const markerKey = `marker-${index}`;
    //           const shouldBeOpen = savedPopupStates.get(markerKey);
              
    //           // ズーム後は保存状態に関係なく、デフォルトで全て表示
    //           const targetState = shouldBeOpen !== undefined ? shouldBeOpen : true;
              
    //           if (popup && targetState && !popup.isOpen()) {
    //             marker.togglePopup();
    //             finalCheckCount++;
    //             console.log(`🔄 最終復元: マーカー${index}`);
    //           }
    //         } catch (error) {
    //           console.warn(`⚠️ マーカー${index}の最終復元エラー:`, error instanceof Error ? error.message : String(error));
    //         }
    //       });
          
    //       if (finalCheckCount > 0) {
    //         console.log(`✅ 最終復元完了: ${finalCheckCount}個/${totalMarkers}個`);
    //       } else {
    //         console.log(`✨ 最終確認OK: 全${totalMarkers}個のポップアップが正常表示中`);
    //       }
    //     }
    //   }, 600); // より遅延させて確実に
    // }
  };
};