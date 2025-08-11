import React from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import { Content } from '@/types/types';
import { Popup } from '@/components/Popup';

// Popupコンポーネント付きマーカーを作成する関数
const createMarkerWithPopup = (content: Content, selectedCategory: string = 'all'): mapboxgl.Marker => {

  if (!content.coordinate || typeof content.coordinate.lng !== 'number' || typeof content.coordinate.lat !== 'number') {
    console.error('Invalid coordinate data:', content);
    throw new Error('Valid coordinate data is required for marker creation');
  }

  // DOM要素を作成してReactコンポーネントをマウント
  const popupContainer = document.createElement('div');
  const root = createRoot(popupContainer);
  root.render(<Popup popup={content} selectedCategory={selectedCategory} />);
  
  // Mapbox GLのポップアップを作成
  const mapboxPopup = new mapboxgl.Popup({
    offset: 25,
    closeButton: false,
    closeOnClick: false,
    className: 'custom-popup'
  }).setDOMContent(popupContainer);

  // シンプルなマーカーを作成
  const markerElement = document.createElement('div');
  markerElement.className = 'custom-marker';
  markerElement.style.width = '20px';
  markerElement.style.height = '20px';
  markerElement.style.backgroundColor = '#3b82f6';
  markerElement.style.borderRadius = '50%';
  markerElement.style.border = '2px solid white';
  markerElement.style.cursor = 'pointer';
  // ドラッグ・ジェスチャの干渉を抑制
  (markerElement.style as any).touchAction = 'none';
  (markerElement.style as any).webkitUserSelect = 'none';
  (markerElement.style as any).userSelect = 'none';
  // コンテンツマーカーは前面に出す
  (markerElement.style as any).zIndex = '1';
  // markerElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

  // マーカーを作成
  const marker = new mapboxgl.Marker(markerElement)
    .setLngLat([content.coordinate.lng, content.coordinate.lat])
    .setPopup(mapboxPopup);

  return marker;
};

// 現在地マーカーを作成・管理する関数
export const addCurrentLocationMarker = (
  lat: number,
  lng: number,
  mapRef: React.RefObject<mapboxgl.Map | null>,
  currentLocationMarkerRef: React.RefObject<mapboxgl.Marker | null>
) => {
  if (!mapRef.current) return;

  // マップが正しく初期化されているかチェック
  if (!mapRef.current.getContainer()) {
    console.warn('Map container is not ready yet for current location marker');
    return;
  }

  // 既存の現在地マーカーを削除
  if (currentLocationMarkerRef.current) {
    currentLocationMarkerRef.current.remove();
  }

  // 現在地マーカー用の要素を作成
  const locationElement = document.createElement('div');
  locationElement.className = 'current-location-marker';
  locationElement.style.width = '15px';
  locationElement.style.height = '15px';
  locationElement.style.backgroundColor = '#10b981'; // 緑色
  locationElement.style.borderRadius = '50%';
  locationElement.style.border = '3px solid white';
  // 現在地マーカーは操作対象外にする（下のマーカーのドラッグを優先）
  locationElement.style.pointerEvents = 'none';
  (locationElement.style as any).zIndex = '0';
  // locationElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

  // 現在地マーカーを作成・追加
  const marker = new mapboxgl.Marker(locationElement)
    .setLngLat([lng, lat])
    .addTo(mapRef.current);

  currentLocationMarkerRef.current = marker;
};

// コンテンツマーカーを追加する関数
export const addContentMarker = (
  content: Content,
  mapRef: React.RefObject<mapboxgl.Map | null>,
  markersRef: React.RefObject<mapboxgl.Marker[]>,
  selectedCategory: string = 'all',
  currentUserId?: string | null,
  onEventMoved?: (args: { id: number; lat: number; lng: number }) => void,
) => {
  if (!mapRef.current || !markersRef.current) return;

  // マップが正しく初期化されているかチェック
  if (!mapRef.current.getContainer()) {
    console.warn('Map container is not ready yet');
    return;
  }

  // フィルタリング: 選択されたカテゴリに一致しない場合はマーカーを作成しない
  if (selectedCategory !== 'all' && content.category !== selectedCategory) {
    return;
  }

  try {
    const marker = createMarkerWithPopup(content, selectedCategory);

    // イベントで、かつ投稿者本人の場合のみドラッグ可能にする
    const isEventOwner = content.type === 'event' && !!currentUserId && content.user_id === currentUserId;
    if (isEventOwner) {
      marker.setDraggable(true);
      const el = marker.getElement();
      el.style.cursor = 'grab';

      const map = mapRef.current;
      const enableMapPan = () => map && map.dragPan.enable();
      const disableMapPan = () => map && map.dragPan.disable();

      const handlePointerDown = (ev: MouseEvent | TouchEvent) => {
        try {
          // 地図への伝播とデフォルト挙動を止める
          ev.stopPropagation();
          // touchstartでスクロールを止めるため
          if (ev.cancelable) ev.preventDefault();
        } catch {}
        disableMapPan();
      };
      const handlePointerUp = (ev: MouseEvent | TouchEvent) => {
        try {
          ev.stopPropagation();
          if (ev.cancelable) ev.preventDefault();
        } catch {}
        enableMapPan();
      };

      // キャプチャ段階で先に受け取り、map側に伝播しないようにする
      el.addEventListener('mousedown', handlePointerDown, { capture: true });
      el.addEventListener('touchstart', handlePointerDown, { passive: false, capture: true } as AddEventListenerOptions);
      // 要素外で放した場合にも復帰できるように document にも付与
      document.addEventListener('mouseup', handlePointerUp, { capture: true });
      document.addEventListener('touchend', handlePointerUp, { passive: false, capture: true } as AddEventListenerOptions);

      marker.on('dragstart', () => {
        el.style.cursor = 'grabbing';
      });
      marker.on('dragend', () => {
        const { lng, lat } = marker.getLngLat();
        el.style.cursor = 'grab';
        enableMapPan();
        onEventMoved?.({ id: (content as any).id, lat, lng });
      });

      // クリックでポップアップをトグルさせず、ドラッグ操作を優先する
      const preventClickToggle = (ev: MouseEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
        // aria-expandedのトグルを防止
        const target = ev.currentTarget as HTMLElement | null;
        if (target && target.getAttribute('aria-expanded')) {
          target.setAttribute('aria-expanded', target.getAttribute('aria-expanded') || 'true');
        }
      };
      el.addEventListener('click', preventClickToggle, { capture: true });
      el.addEventListener('keydown', (ev: KeyboardEvent) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          ev.stopPropagation();
        }
      }, { capture: true });
    }

    marker.addTo(mapRef.current);

    // ポップアップを即座に開く
    marker.togglePopup();

    markersRef.current.push(marker);
  } catch (error) {
    console.error('Failed to add content marker:', error, content);
  }
};

// すべてのマーカーをクリアする関数
export const clearAllMarkers = (
  markersRef: React.RefObject<mapboxgl.Marker[]>,
  currentLocationMarkerRef: React.RefObject<mapboxgl.Marker | null>
) => {
  // コンテンツマーカーをクリア
  if (markersRef.current) {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.length = 0;
  }

  // 現在地マーカーをクリア
  if (currentLocationMarkerRef.current) {
    currentLocationMarkerRef.current.remove();
    currentLocationMarkerRef.current = null;
  }
};