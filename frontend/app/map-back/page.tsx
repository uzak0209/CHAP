'use client';

import React, { useEffect , useState} from 'react';
import { useMapbox } from '@/hooks/useMapbox';
// import { useThreads } from '@/hooks/useThreads'; // 不要 - useMapboxで管理
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchAroundPosts } from '@/store/postsSlice';
import { fetchAroundThreads } from '@/store/threadsSlice';
import { fetchAroundEvents } from '@/store/eventsSlice';
import { getCurrentLocation } from '@/store/locationSlice';
import { Status } from '@/types/types';
import MapControls from '@/components/MapControl';
import { MultiModalFAB } from '@/components/multi-modal-fab';
import 'mapbox-gl/dist/mapbox-gl.css';
import { addContentMarker, addCurrentLocationMarker,clearAllMarkers } from '@/lib/mapbox/markers';

export default function MapBackPage() {
  const { mapContainerRef, mapRef, is3D, currentLocationMarkerRef,currentMarksRef, toggle3D, changeMapView } = useMapbox();
  const dispatch = useAppDispatch();
  // 位置情報の状態
  const { location, state: locationState } = useAppSelector(state => state.location);
  const posts = useAppSelector(state => state.posts.items);
  const threads = useAppSelector(state => state.threads.items);
  const events = useAppSelector(state => state.events.items);
  const [PopupID, setPopupID] = useState<number[]>([]);
  const selectedCategory = useAppSelector(state => state.filters.selectedCategory);
  useEffect(() => {
    
    // 位置情報がまだ取得されていない、またはエラー状態の場合に位置情報を取得
    if (locationState === Status.IDLE || locationState === Status.ERROR) {
      dispatch(getCurrentLocation());
    }
  }, [dispatch, locationState]);

  // データ取得用のuseEffect
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

  // 取得したデータのIDを差分更新し、新しいマーカーのみ描画するuseEffect
  useEffect(() => {
    const currentAllIds: number[] = [];
    const newContent: (typeof posts[0] | typeof threads[0] | typeof events[0])[] = [];
    
    // 現在のすべてのIDを収集
    posts.filter(post => post !== undefined && post !== null).forEach(post => {
      if (post.id) {
        currentAllIds.push(post.id);
        // 新しい投稿かチェック
        if (!PopupID.includes(post.id)) {
          newContent.push(post);
        }
      }
    });
    
    threads.filter(thread => thread !== undefined && thread !== null).forEach(thread => {
      if (thread.id) {
        currentAllIds.push(thread.id);
        // 新しいスレッドかチェック
        if (!PopupID.includes(thread.id)) {
          newContent.push(thread);
        }
      }
    });
    
    events.filter(event => event !== undefined && event !== null).forEach(event => {
      if (event.id) {
        currentAllIds.push(event.id);
        // 新しいイベントかチェック
        if (!PopupID.includes(event.id)) {
          newContent.push(event);
        }
      }
    });
    
    // 差分があるかチェック
    const hasNewContent = newContent.length > 0;
    const hasRemovedContent = PopupID.some(id => !currentAllIds.includes(id));
    
    if (hasNewContent || hasRemovedContent) {
      // PopupIDを更新
      setPopupID(currentAllIds);
      console.log('Updated PopupID - Added:', newContent.map(c => c.id), 'Current total:', currentAllIds);
      
      if (locationState === Status.LOADED) {
        if (hasRemovedContent) {
          // 削除されたコンテンツがある場合は全マーカーを再描画
          clearAllMarkers(currentMarksRef, currentLocationMarkerRef);
          
          posts.filter(post => post !== undefined && post !== null).forEach(post => {
            addContentMarker(post, mapRef, currentMarksRef, selectedCategory);
          });
          
          threads.filter(thread => thread !== undefined && thread !== null).forEach(thread => {
            addContentMarker(thread, mapRef, currentMarksRef, selectedCategory);
          });
          
          events.filter(event => event !== undefined && event !== null).forEach(event => {
            addContentMarker(event, mapRef, currentMarksRef, selectedCategory);
          });
          
          addCurrentLocationMarker(location.lat, location.lng, mapRef, currentLocationMarkerRef);
        } else {
          // 新しいコンテンツのみマーカーを追加
          newContent.forEach(content => {
            addContentMarker(content, mapRef, currentMarksRef, selectedCategory);
          });
        }
      }
    }
  }, [posts, threads, events, PopupID, locationState, mapRef, currentMarksRef, currentLocationMarkerRef, selectedCategory]);
  return (
    <div className="h-full w-full relative">
      <div 
        id="map" 
        className="h-full w-full" 
        ref={mapContainerRef} 
      />
      <MapControls
        is3D={is3D}
        onToggle3D={toggle3D}
        onChangeMapView={changeMapView}
      />
      <MultiModalFAB />
    </div>
  );
}
