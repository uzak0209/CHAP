import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_CONFIG } from '@/constants/map';

export const useMapbox = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [is3D, setIs3D] = useState(true);

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
    return new mapboxgl.Map({
      container,
      center: MAPBOX_CONFIG.CENTER,
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
        border-radius: 0 !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-width: none !important;
      }
      .mapboxgl-popup-tip {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        width: 0 !important;
        height: 0 !important;
      }
      .custom-marker {
        cursor: pointer;
        transition: transform 0.2s ease;
      }
      .custom-marker:hover {
        transform: scale(1.1);
      }
      /* すべてのMapboxポップアップの吹き出しを非表示 */
      .mapboxgl-popup-tip-top,
      .mapboxgl-popup-tip-bottom,
      .mapboxgl-popup-tip-left,
      .mapboxgl-popup-tip-right {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        width: 0 !important;
        height: 0 !important;
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

    // クリーンアップ関数
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
      removeStyles();
    };
  }, []);

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
    changeMapView
  };
};
