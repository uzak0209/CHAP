// マップインスタンスを作成する関数
import mapboxgl from 'mapbox-gl';
import { MAPBOX_CONFIG } from '@/constants/map';
import { Status } from '@/types/types';

export const createMapInstance = (container: HTMLDivElement, location: { lat: number; lng: number }, locationState: Status) => {
  // 位置情報が取得済みの場合は現在地を、そうでなければデフォルト位置を使用
  const center: [number, number] = locationState === Status.LOADED 
    ? [location.lng, location.lat] 
    : MAPBOX_CONFIG.CENTER;
    
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
