import mapboxgl from 'mapbox-gl';
import { MAPBOX_CONFIG, LABEL_LAYERS } from '@/constants/map';

export const initializeMapboxToken = () => {
  const accessToken = process.env.NEXT_PUBLIC_MAP_API_TOKEN;
  
  console.log('Access token:', accessToken ? 'Found' : 'Not found');
  console.log('Token length:', accessToken ? accessToken.length : 0);
  
  if (!accessToken) {
    console.error('Mapbox access token is not defined. Please check your .env.local file.');
    return false;
  }
  
  mapboxgl.accessToken = accessToken;
  return true;
};

export const createMapInstance = (container: HTMLDivElement) => {
  return new mapboxgl.Map({
    container,
    center: MAPBOX_CONFIG.CENTER,
    zoom: MAPBOX_CONFIG.ZOOM,
    pitch: MAPBOX_CONFIG.PITCH,
    bearing: MAPBOX_CONFIG.BEARING,
    style: MAPBOX_CONFIG.STYLE,
    minZoom: MAPBOX_CONFIG.MIN_ZOOM,
    maxZoom: MAPBOX_CONFIG.MAX_ZOOM,
    localIdeographFontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
    language: MAPBOX_CONFIG.LANGUAGE
  });
};

export const setupMapLabels = (map: mapboxgl.Map) => {
  // すべてのラベルレイヤーを日本語に設定
  LABEL_LAYERS.forEach(layerId => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'text-field', ['get', 'name_ja']);
    }
  });

  // フォールバック設定：日本語名がない場合は英語名を使用
  LABEL_LAYERS.forEach(layerId => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'text-field', [
        'coalesce',
        ['get', 'name_ja'],
        ['get', 'name_jp'],
        ['get', 'name'],
        ['get', 'name_en']
      ]);
    }
  });
};

export const setupMapStyle = (map: mapboxgl.Map) => {
  // 地図の照明を夕暮れモードに変更
  map.setConfigProperty('basemap', 'lightPreset', MAPBOX_CONFIG.LIGHT_PRESET);
};

export const hideRoadLayers = (map: mapboxgl.Map) => {
  const style = map.getStyle();
  const allLayers = style.layers.map(layer => layer.id);
  console.log('All layers:', allLayers);
  
  // 道路関連のレイヤーを幅広く検索して非表示にする
  allLayers.forEach(layerId => {
    if (layerId.includes('road') || 
        layerId.includes('street') || 
        layerId.includes('highway') ||
        layerId.includes('motorway') ||
        layerId.includes('primary') ||
        layerId.includes('secondary') ||
        layerId.includes('tertiary') ||
        layerId.includes('trunk') ||
        layerId.includes('bridge') ||
        layerId.includes('tunnel') ||
        layerId.includes('path') ||
        layerId.includes('pedestrian') ||
        layerId.includes('rail') ||
        layerId.includes('transit')) {
      try {
        map.setLayoutProperty(layerId, 'visibility', 'none');
        console.log(`Hidden layer: ${layerId}`);
      } catch (error) {
        console.warn(`Could not hide layer: ${layerId}`, error);
      }
    }
  });
};

export const createMapStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .custom-popup .mapboxgl-popup-content {
      background: transparent !important;
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      padding: 0 !important;
      max-width: none !important;
    }
    .custom-popup .mapboxgl-popup-tip {
      display: none !important;
    }
    .detail-popup .mapboxgl-popup-content {
      max-width: 500px !important;
      max-height: 600px !important;
    }
  `;
  document.head.appendChild(style);
  
  return () => {
    document.head.removeChild(style);
  };
};
