"use client";

import React, { useEffect, useCallback, useRef } from "react";
import { useMapbox } from "@/hooks/useMapbox";
// import { useThreads } from '@/hooks/useThreads'; // 不要 - useMapboxで管理
import { useAppSelector, useAppDispatch } from "@/store";
import { fetchAroundPosts } from "@/store/postsSlice";
import { fetchAroundThreads } from "@/store/threadsSlice";
import { fetchAroundEvents } from "@/store/eventsSlice";
import { getCurrentLocation } from "@/store/locationSlice";
import { Status } from "@/types/types";
import MapControls from "@/components/MapControl";
import { MultiModalFAB } from "@/components/multi-modal-fab";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  addContentMarker,
  addCurrentLocationMarker,
  clearAllMarkers,
} from "@/lib/mapbox/markers";


export default function MapBackPage() {
  const {
    mapContainerRef,
    mapRef,
    is3D,
    currentLocationMarkerRef,
    currentMarksRef,
    toggle3D,
    changeMapView,
  } = useMapbox();
  const dispatch = useAppDispatch();
  // 位置情報の状態
  const { location, state: locationState } = useAppSelector(
    (state) => state.location
  );
  const posts = useAppSelector((state) => state.posts.items);
  const threads = useAppSelector((state) => state.threads.items);
  const events = useAppSelector((state) => state.events.items);
  const selectedCategory = useAppSelector(
    (state) => state.filters.selectedCategory
  );
  useEffect(() => {
    // 位置情報がまだ取得されていない、またはエラー状態の場合に位置情報を取得
    if (locationState === Status.IDLE || locationState === Status.ERROR) {
      dispatch(getCurrentLocation());
    }
  }, [dispatch, locationState]);

  useEffect(() => {
    clearAllMarkers(currentMarksRef, currentLocationMarkerRef);
    if (locationState === Status.LOADED) {
      // 現在位置を中心とした周辺の投稿を取得
      dispatch(fetchAroundPosts({ lat: location.lat, lng: location.lng }));
      // 現在位置を中心とした周辺のスレッドを取得
      dispatch(fetchAroundThreads({ lat: location.lat, lng: location.lng }));
      // 現在位置を中心とした周辺のイベントを取得
      dispatch(fetchAroundEvents({ lat: location.lat, lng: location.lng }));
    }
  }, [dispatch, locationState, location]);

  const refreshPopupIDInternal = useCallback(() => {
    console.log('refreshPopupIDInternal called, locationState:', locationState);
    if (locationState === Status.LOADED) {
      console.log('Clearing and adding markers...');
      clearAllMarkers(currentMarksRef, currentLocationMarkerRef);
      posts.forEach((post) => {
        addContentMarker(post, mapRef, currentMarksRef, selectedCategory);
      });
      threads.forEach((thread) => {
        addContentMarker(thread, mapRef, currentMarksRef, selectedCategory);
      });
      events.forEach((event) => {
        addContentMarker(event, mapRef, currentMarksRef, selectedCategory);
      });
      addCurrentLocationMarker(
        location.lat,
        location.lng,
        mapRef,
        currentLocationMarkerRef
      );
      console.log('Markers refreshed successfully');
    } else {
      console.log('Location not loaded yet, skipping marker refresh');
    }
  }, [posts, threads, events, locationState, location, mapRef, currentMarksRef, currentLocationMarkerRef, selectedCategory]);

  // 最新のrefreshPopupIDInternal関数への参照を保持
  const refreshFunctionRef = useRef(refreshPopupIDInternal);
  refreshFunctionRef.current = refreshPopupIDInternal;

  //三秒ごとにマーカーを更新
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Refreshing markers every 3 seconds...');
      // 常に最新の関数を呼び出す
      refreshFunctionRef.current();
    }, 3000); // 3秒
    return () => clearInterval(interval);
  }, []); // 空の依存配列で一度だけ設定

  //カテゴリが呼び出されたらマーカーを更新
  useEffect(() => {
    refreshPopupIDInternal();
  }, [refreshPopupIDInternal, selectedCategory]);

  return (
    <div className="h-full w-full relative">
      <div id="map" className="h-full w-full" ref={mapContainerRef} />
      <MapControls
        is3D={is3D}
        onToggle3D={toggle3D}
        onChangeMapView={changeMapView}
      />
      <MultiModalFAB />
    </div>
  );
}

