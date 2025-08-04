'use client';

import React, { useEffect } from 'react';
import { useMapbox } from '@/hooks/useMapbox';
import { useThreads } from '@/hooks/useThreads';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchAroundPosts } from '@/store/postsSlice';
import { fetchAroundThreads } from '@/store/threadsSlice';
import { fetchAroundEvents } from '@/store/eventsSlice';
import { getCurrentLocation } from '@/store/locationSlice';
import { Status } from '@/types/types';
import MapControls from '@/components/Map/MapControls';
import { MultiModalFAB } from '@/components/ui/multi-modal-fab';
import 'mapbox-gl/dist/mapbox-gl.css';

/**
 * MapBackPage - デバッグ機能付きの地図表示ページ
 * 
 * 主な機能:
 * - Mapboxを使用した地図表示
 * - 3D表示の切り替え
 * - 現在位置周辺の投稿とスレッドの表示
 * - デバッグ用の診断パネル（ポップアップ状態確認、強制表示など）
 */
export default function MapBackPage() {
  // === カスタムフックからの値取得 ===
  // 地図関連のロジック（地図コンテナ、3D切り替え、視点変更）
  const { mapContainerRef, mapRef, is3D, toggle3D, changeMapView } = useMapbox();
  
  // スレッド表示関連のロジック
  const { displayThreads } = useThreads(mapRef);
  
  // === Redux状態管理 ===
  const dispatch = useAppDispatch();
  
  // 投稿データの状態（アイテム、ローディング状態、エラー状態）
  const { items: posts, loading: postsLoading, error: postsError } = useAppSelector(state => state.posts);
  
  // スレッドデータの状態
  const { items: threads, loading: threadsLoading, error: threadsError } = useAppSelector(state => state.threads);
  
  // イベントデータの状態
  const { items: events, loading: eventsLoading, error: eventsError } = useAppSelector(state => state.events);
  
  // 位置情報の状態
  const { location, state: locationState } = useAppSelector(state => state.location);

  // === 初期化処理：ページ読み込み時に位置情報を取得 ===
  useEffect(() => {
    
    // 位置情報がまだ取得されていない、またはエラー状態の場合に位置情報を取得
    if (locationState === Status.IDLE || locationState === Status.ERROR) {
      dispatch(getCurrentLocation());
    }
  }, [dispatch, locationState]);

  // === データ取得処理：位置情報が取得できたら周辺データを取得 ===
  useEffect(() => {
    if (locationState === Status.LOADED) {
      // 現在位置を中心とした周辺の投稿を取得
      dispatch(fetchAroundPosts({ lat: location.lat, lng: location.lng }));
      // 現在位置を中心とした周辺のスレッドを取得
      dispatch(fetchAroundThreads({ lat: location.lat, lng: location.lng }));
      // 現在位置を中心とした周辺のイベントを取得
      dispatch(fetchAroundEvents({ lat: location.lat, lng: location.lng }));
    }
  }, [dispatch, locationState, location]);

  return (
    <div className="h-full w-full relative">
      {/* === メイン地図表示エリア === */}
      <div 
        id="map" 
        className="h-full w-full" 
        ref={mapContainerRef} 
      />
      
      {/* === 地図コントロールパネル === */}
      {/* 3D切り替えボタンと視点変更ボタンを含む */}
      <MapControls
        is3D={is3D}
        onToggle3D={toggle3D}
        onChangeMapView={changeMapView}
      />
      <MultiModalFAB />
    </div>
  );
}
