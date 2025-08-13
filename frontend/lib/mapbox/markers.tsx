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
  if (!mapRef.current || !markersRef.current) {
    console.warn('[markers] early return: missing refs', { hasMap: !!mapRef.current, hasMarkersRef: !!markersRef.current });
    return;
  }

  // マップが正しく初期化されているかチェック
  if (!mapRef.current.getContainer()) {
    console.warn('Map container is not ready yet');
    return;
  }

  // フィルタリング: 選択されたカテゴリに一致しない場合はマーカーを作成しない
  if (selectedCategory !== 'all' && content.category !== selectedCategory) {
    console.log('[markers] skip addContentMarker by category filter', {
      id: (content as any).id,
      type: (content as any).type,
      contentCategory: content.category,
      selectedCategory,
    });
    return;
  }

  try {
    console.log('[markers] addContentMarker called', {
      id: (content as any).id,
      type: (content as any).type,
      userId: (content as any).user_id,
      currentUserId: currentUserId ?? null,
      coordinate: content.coordinate,
    });
    const marker = createMarkerWithPopup(content, selectedCategory);
    console.log('[markers] marker created');

    // イベントで、かつ投稿者本人の場合のみドラッグ可能にする
    const isEventOwner = content.type === 'event' && !!currentUserId && content.user_id === currentUserId;
    console.log('[markers] isEventOwner check', {
      id: (content as any).id,
      type: content.type,
      isEventOwner,
      contentUserId: content.user_id,
      currentUserId: currentUserId ?? null,
    });
    if (isEventOwner) {
      marker.setDraggable(true);
      console.log('[markers] setDraggable(true)');
      const el = marker.getElement();
      console.log('[markers] marker element obtained', { exists: !!el });
      el.style.cursor = 'grab';

      const map = mapRef.current;
      const enableMapPan = () => map && map.dragPan.enable();
      const disableMapPan = () => map && map.dragPan.disable();

      // ポップアップ要素がドラッグ開始を阻害しないように、ドラッグ中はpointer-eventsを無効化
      const popupEl = marker.getPopup()?.getElement() || null;

      marker.on('dragstart', () => {
        console.log('[markers] dragstart');
        el.style.cursor = 'grabbing';
        if (popupEl) (popupEl.style as any).pointerEvents = 'none';
        disableMapPan();
      });
      marker.on('drag', () => {
        const { lng, lat } = marker.getLngLat();
        console.log('[markers] dragging', { lng, lat });
      });
      marker.on('dragend', () => {
        const { lng, lat } = marker.getLngLat();
        el.style.cursor = 'grab';
        enableMapPan();
        if (popupEl) (popupEl.style as any).pointerEvents = 'auto';
        console.log('[markers] dragend', { lng, lat });
        onEventMoved?.({ id: (content as any).id, lat, lng });
      });

      // クリックでポップアップをトグルさせず、ドラッグ操作を優先する
      const preventClickToggle = (ev: MouseEvent) => {
        console.log('[markers] prevent click toggle');
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
          console.log('[markers] prevent key toggle', { key: ev.key });
          ev.preventDefault();
          ev.stopPropagation();
        }
      }, { capture: true });
    } else {
      console.log('[markers] not draggable (not event owner or not event)', {
        id: (content as any).id,
        type: content.type,
        contentUserId: content.user_id,
        currentUserId: currentUserId ?? null,
      });
    }

    marker.addTo(mapRef.current);
    console.log('[markers] marker added to map');

    // ポップアップを即座に開く
    marker.togglePopup();
    console.log('[markers] popup toggled');

    markersRef.current.push(marker);
    console.log('[markers] marker pushed to ref', { length: markersRef.current.length });
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