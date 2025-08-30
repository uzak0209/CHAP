"use client";

import React, { useEffect, useCallback, useRef } from "react";
import { useMapbox } from "@/hooks/useMapbox";
import { useAppSelector, useAppDispatch } from "@/store";
import { fetchPosts } from "@/store/postsSlice";
import { fetchThreads } from "@/store/threadsSlice";
import { fetchEvents, editEvent } from "@/store/eventsSlice";
import { getCurrentLocation } from "@/store/locationSlice";
import { verifyToken } from "@/store/authSlice";
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
    isMapReady,
    currentLocationMarkerRef,
    currentMarksRef,
    toggle3D,
    changeMapView,
  } = useMapbox();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const { location, state: locationState } = useAppSelector(
    (state) => state.location
  );
  const posts = useAppSelector((state) => state.posts.items);
  const threads = useAppSelector((state) => state.threads.items);
  const events = useAppSelector((state) => state.events.items);
  const selectedCategories = useAppSelector(
    (state) => state.filters.selectedCategories
  );
  useEffect(() => {
    if (locationState === Status.IDLE || locationState === Status.ERROR) {
      dispatch(getCurrentLocation());
    }
    dispatch(verifyToken());
  }, [dispatch]);

  useEffect(() => {
    clearAllMarkers(currentMarksRef, currentLocationMarkerRef);
    if (locationState === Status.LOADED) {
      // 現在位置を中心とした周辺の投稿を取得
      dispatch(fetchPosts({ lat: location.lat, lng: location.lng }));
      // 現在位置を中心とした周辺のスレッドを取得
      dispatch(fetchThreads({ lat: location.lat, lng: location.lng }));
      // 現在位置を中心とした周辺のイベントを取得
      dispatch(fetchEvents({ lat: location.lat, lng: location.lng }));
      addCurrentLocationMarker(
        location.lat,
        location.lng,
        mapRef,
        currentLocationMarkerRef
      );
    }
  }, [dispatch, locationState, location]);
  const updateMarkers = () => {
    if (locationState === Status.LOADED && isMapReady) {
      clearAllMarkers(currentMarksRef, currentLocationMarkerRef);
      const currentUserId = auth.user?.id ?? null;
      console.log('[map] currentUserId', currentUserId);
      const handleEventMoved = ({ id, lat, lng }: { id: number; lat: number; lng: number }) => {
        dispatch(
          editEvent({
            id,
            data: { coordinate: { lat, lng } },
          })
        );
      };

      posts.forEach((post) => {
        addContentMarker(post, mapRef, currentMarksRef, selectedCategories, currentUserId);
      });
      threads.forEach((thread) => {
        addContentMarker(thread, mapRef, currentMarksRef, selectedCategories, currentUserId);
      });
      events.forEach((event) => {
        addContentMarker(event, mapRef, currentMarksRef, selectedCategories, currentUserId, handleEventMoved);
      });
      addCurrentLocationMarker(
        location.lat,
        location.lng,
        mapRef,
        currentLocationMarkerRef
      );
    }
  };

  // フィルタ変更時にマーカーを更新
  useEffect(() => {
    updateMarkers();
  }, [selectedCategories, posts, threads, events, locationState, location, isMapReady, auth.user?.id]);
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