import React from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import {Content } from '@/types/types';
import { Popup } from '@/components/Popup';

// Popupコンポーネント付きマーカーを作成する関数
const createMarkerWithPopup = (content: Content, selectedCategory: string = 'all'): mapboxgl.Marker => {
  // 座標データの存在確認
  console.log('Creating marker for content:', content);
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
  markerElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

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
  locationElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

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
  selectedCategory: string = 'all'
) => {
  if (!mapRef.current || !markersRef.current) return;

  try {
    const marker = createMarkerWithPopup(content, selectedCategory);
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