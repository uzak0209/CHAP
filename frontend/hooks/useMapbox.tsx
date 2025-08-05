import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_CONFIG } from '@/constants/map';
import { useAppSelector } from '@/store';
import { Status } from '@/types/types';
import { createMarkerFunctions } from '@/hooks/mapbox/markers';
import { initializeMapboxToken, createMapInstance, setupMapLabels, setupMapStyle, hideRoadLayers, createMapStyles, createRestorePopupsFunction } from '@/hooks/mapbox/setup';


export const useMapbox = () => {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [is3D, setIs3D] = useState(true);
  
  // Redux storeから位置情報とフィルタ状態を取得
  const { location, state: locationState } = useAppSelector(state => state.location);
  const { items: posts } = useAppSelector(state => state.posts);
  const { items: threads } = useAppSelector(state => state.threads);
  const { items: events } = useAppSelector(state => state.events);
  const { selectedCategory } = useAppSelector(state => state.filters);
  const { isAuthenticated } = useAppSelector(state => state.auth);

  // 投稿とスレッドマーカーの参照を保持
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const threadMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const eventMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const currentLocationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const restorePopupsRef = useRef<((event?: any) => void) | null>(null);

  // マーカー関数を作成
  const markerFunctions = createMarkerFunctions(
    mapRef,
    markersRef,
    threadMarkersRef,
    eventMarkersRef,
    currentLocationMarkerRef,
    restorePopupsRef,
    posts,
    threads,
    events,
    selectedCategory,
    location,
    locationState,
    router
  );

  const { addCurrentLocationMarker, addPostMarkers, addThreadMarkers, addEventMarkers } = markerFunctions;

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
    mapRef.current = createMapInstance(mapContainerRef.current, location, locationState);

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

    // ポップアップ復元関数を作成
    const restorePopups = createRestorePopupsFunction(markersRef, threadMarkersRef, eventMarkersRef);
    
    // refに関数を保存
    restorePopupsRef.current = restorePopups;

    // 地図イベントリスナーを追加（ズーム時のポップアップ復元用）
    mapRef.current.on('zoomstart', restorePopups); // ズーム開始時に状態を保存
    mapRef.current.on('zoomend', restorePopups);   // ズーム終了時に復元
    mapRef.current.on('moveend', restorePopups);   // 移動終了時に復元
    mapRef.current.on('load', restorePopups);      // 地図の読み込み完了時に復元

    // クリーンアップ関数
    return () => {
      // 投稿マーカーを削除
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      // スレッドマーカーを削除
      threadMarkersRef.current.forEach(marker => marker.remove());
      threadMarkersRef.current = [];
      
      // イベントマーカーを削除
      eventMarkersRef.current.forEach(marker => marker.remove());
      eventMarkersRef.current = [];
      
      // 現在地マーカーを削除
      if (currentLocationMarkerRef.current) {
        currentLocationMarkerRef.current.remove();
        currentLocationMarkerRef.current = null;
      }
      
      if (mapRef.current) {
        // すべてのイベントリスナーを削除
        mapRef.current.off('zoomstart', restorePopups);
        mapRef.current.off('zoomend', restorePopups);
        mapRef.current.off('moveend', restorePopups);
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
      
      // スレッドマーカーも更新
      if (threads.length > 0) {
        addThreadMarkers();
      }
      
      // イベントマーカーも更新
      if (events.length > 0) {
        addEventMarkers();
      }
    }
  }, [location, locationState, addCurrentLocationMarker, addThreadMarkers, addEventMarkers, threads.length, events.length]);

  // 前回のイベントIDリストを保持するref
  const prevEventIdsRef = useRef<number[]>([]);

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
    
    // スレッドマーカーも追加
    if (mapRef.current) {
      console.log(`📋 スレッドデータ確認: ${threads.length}個のスレッド`);
      if (threads.length > 0) {
        console.log('スレッドデータが更新されました。スレッドマーカーを更新中...', threads);
        addThreadMarkers();
      } else {
        console.log('⚠️ スレッドデータが空です');
      }
    }
    
    // イベントマーカー更新
    if (mapRef.current) {
      const currentEventIds = events.map(e => e.id).sort();
      const prevEventIds = prevEventIdsRef.current;
      
      // IDリストが変更された場合のみマーカーを更新
      const hasEventsChanged = 
        currentEventIds.length !== prevEventIds.length ||
        currentEventIds.some((id, index) => String(id) !== prevEventIds[index]);
      
      console.log(`🎉 イベントデータ確認: ${events.length}個のイベント`, {
        currentIds: currentEventIds,
        prevIds: prevEventIds,
        hasChanged: hasEventsChanged
      });
      
      if (hasEventsChanged) {
        if (events.length > 0) {
          console.log('✨ イベントデータが実際に変更されました。マーカーを更新中...', events);
          addEventMarkers();
          // prevEventIdsRef.current = currentEventIds;
        } else {
          console.log('⚠️ イベントデータが空になりました。マーカーをクリア...');
          // 既存のマーカーをクリア
          eventMarkersRef.current.forEach(marker => marker.remove());
          eventMarkersRef.current = [];
          prevEventIdsRef.current = [];
        }
      } else {
        console.log('🔄 イベントデータは変更されていません。マーカー更新をスキップ');
      }
    }
  }, [posts, threads, events, selectedCategory, addPostMarkers, addThreadMarkers, addEventMarkers]);

  // フィルタが変更されたときの専用effect
  useEffect(() => {
    if (mapRef.current && (posts.length > 0 || threads.length > 0 || events.length > 0)) {
      console.log('🔄 フィルタ変更を検知 - マーカーを強制再描画:', selectedCategory);
      console.log('📊 現在のデータ状況:', {
        posts: posts.length,
        threads: threads.length,
        events: events.length
      });
      
      // 少し遅延を入れて確実にマーカーを再作成
      setTimeout(() => {
        console.log('⚡ フィルタ変更によるマーカー再作成開始');
        addPostMarkers();
        addThreadMarkers(); 
        addEventMarkers();
        console.log('✅ フィルタ変更によるマーカー再作成完了');
      }, 100);
    }
  }, [selectedCategory, addPostMarkers, addThreadMarkers, addEventMarkers]); // 依存配列を拡張

  // 認証状態が変更された時にいいね状態を再確認
  useEffect(() => {
    if (isAuthenticated && mapRef.current) {
      console.log('🔐 認証状態が変更されました。いいね状態を再確認中...');
      
      // 少し遅延させてからいいね状態を確認（個別に処理）
      setTimeout(() => {
        posts.forEach((post, index) => {
          if (post.coordinate && post.coordinate.lat && post.coordinate.lng) {
            setTimeout(() => {
              console.log(`🔐 認証後: 投稿${post.id}のいいね状態を確認中 (${index + 1}/${posts.length})`);
              // checkInitialLikeStatus(post);
            }, index * 100); // 100msずつ遅延（200msから短縮）
          }
        });
        
        threads.forEach((thread, index) => {
          if (thread.coordinate && thread.coordinate.lat && thread.coordinate.lng) {
            setTimeout(() => {
              console.log(`🔐 認証後: スレッド${thread.id}のいいね状態を確認中 (${index + 1}/${threads.length})`);
              // checkInitialThreadLikeStatus(thread);
            }, index * 100); // 100msずつ遅延（200msから短縮）
          }
        });

        events.forEach((event, index) => {
          if (event.coordinate && event.coordinate.lat && event.coordinate.lng) {
            setTimeout(() => {
              console.log(`🔐 認証後: イベント${event.id}のいいね状態を確認中 (${index + 1}/${events.length})`);
              // checkInitialEventLikeStatus(event);
            }, index * 100); // 100msずつ遅延
          }
        });
      }, 500); // 1000msから短縮
    }
  }, [isAuthenticated, posts, threads, events]);

  return {
    mapContainerRef,
    mapRef,
    is3D,
    toggle3D,
    changeMapView,
    addPostMarkers,
    addThreadMarkers,
    addEventMarkers,
    addCurrentLocationMarker
  };
};