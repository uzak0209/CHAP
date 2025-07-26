'use client';

import React from 'react';
import { useMapbox } from '@/hooks/useMapbox';
import { useThreads } from '@/hooks/useThreads';
import { useAppSelector } from '@/store';
import MapControls from '@/components/Map/MapControls';
import { MultiModalFAB } from '@/components/ui/multi-modal-fab';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapBackPage() {
  const { mapContainerRef, mapRef, is3D, toggle3D, changeMapView } = useMapbox();
  const { displayThreads } = useThreads(mapRef);
  const { items: posts } = useAppSelector(state => state.posts);

  return (
    <div className="h-full w-full relative">
      {/* マップコンテナ */}
      <div 
        id="map" 
        className="h-full w-full" 
        ref={mapContainerRef} 
      />
      
      {/* マップコントロール */}
      <MapControls
        is3D={is3D}
        onToggle3D={toggle3D}
        onChangeMapView={changeMapView}
      />
      
      {/* ポップアップ診断パネル */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg z-10">
        <div className="text-xs text-gray-600 mb-2">ポップアップ診断</div>
        
        <button 
          onClick={() => {
            console.log('🔍 ポップアップ状態チェック開始');
            
            // DOM上のポップアップ要素を確認
            const popupElements = document.querySelectorAll('.mapboxgl-popup');
            const markerElements = document.querySelectorAll('.mapboxgl-marker');
            
            console.log(`📍 マーカー数: ${markerElements.length}`);
            console.log(`📌 ポップアップ数: ${popupElements.length}`);
            
            let visibleCount = 0;
            popupElements.forEach((popup, index) => {
              const htmlElement = popup as HTMLElement;
              const isVisible = htmlElement.style.display !== 'none' && 
                               htmlElement.style.visibility !== 'hidden' &&
                               !htmlElement.classList.contains('mapboxgl-popup-close');
              if (isVisible) visibleCount++;
              console.log(`📌 ポップアップ${index}: ${isVisible ? '表示中' : '非表示'}`);
            });
            
            alert(`ポップアップ診断結果:\n・マーカー数: ${markerElements.length}\n・ポップアップ数: ${popupElements.length}\n・表示中: ${visibleCount}`);
          }}
          className="mb-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors w-full"
        >
          状態確認
        </button>
        
        <button 
          onClick={() => {
            console.log('🔄 全ポップアップ強制表示開始');
            
            // useMapboxフックから取得したマーカーに直接アクセス
            const mapInstance = mapRef.current;
            if (!mapInstance) {
              alert('地図が初期化されていません');
              return;
            }
            
            setTimeout(() => {
              // 1. DOM操作で既存のポップアップを表示
              const popupElements = document.querySelectorAll('.mapboxgl-popup');
              console.log(`📌 DOM上のポップアップ: ${popupElements.length}個`);
              
              let forceDisplayCount = 0;
              popupElements.forEach((popup, index) => {
                const htmlElement = popup as HTMLElement;
                htmlElement.style.display = 'block';
                htmlElement.style.visibility = 'visible';
                htmlElement.style.opacity = '1';
                htmlElement.style.pointerEvents = 'auto';
                forceDisplayCount++;
                console.log(`📌 ポップアップ${index}を強制表示`);
              });
              
              // 2. 全てのマーカーのポップアップを開く（JavaScriptから直接操作）
              const markerElements = document.querySelectorAll('.mapboxgl-marker');
              console.log(`📍 マーカー要素: ${markerElements.length}個`);
              
              // 3. 地図インスタンスから直接ポップアップを作成（フォールバック）
              // Reduxから投稿データを取得してポップアップを再作成
              console.log(`📊 Redux投稿データ: ${posts.length}件`);
              
              posts.forEach((post, index) => {
                if (post.coordinate && post.coordinate.lat && post.coordinate.lng) {
                  try {
                    const popup = new (window as any).mapboxgl.Popup({
                      closeButton: false,
                      closeOnClick: false,
                      closeOnMove: false,
                      offset: 25
                    })
                    .setLngLat([post.coordinate.lng, post.coordinate.lat])
                    .setHTML(`
                      <div class="p-2 transparent rounded shadow">
                        <div class="text-xs font-bold">${post.category || 'その他'}</div>
                        <div class="text-xs">${post.content.substring(0, 30)}...</div>
                      </div>
                    `)
                    .addTo(mapInstance);
                    
                    forceDisplayCount++;
                    console.log(`✅ 投稿${post.id}のポップアップを再作成`);
                  } catch (error) {
                    console.error(`❌ 投稿${post.id}のポップアップ作成エラー:`, error);
                  }
                }
              });
              
              // 閉じるボタンを非表示にする
              const closeButtons = document.querySelectorAll('.mapboxgl-popup-close-button');
              closeButtons.forEach(btn => {
                (btn as HTMLElement).style.display = 'none';
              });
              
              alert(`${forceDisplayCount}個のポップアップを強制表示しました\n・既存: ${popupElements.length}個\n・新規作成: ${forceDisplayCount - popupElements.length}個`);
            }, 100);
          }}
          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors w-full"
        >
          強制表示
        </button>
      </div>
      
      {/* フローティング投稿ボタン */}
      <MultiModalFAB />
    </div>
  );
}
