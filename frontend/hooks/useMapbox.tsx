import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_CONFIG } from '@/constants/map';
import { useAppSelector } from '@/store';
import { Status } from '@/types/types';
import { createMapInstance } from '@/lib/mapbox/setup';
import { addCurrentLocationMarker } from '@/lib/mapbox/markers';

export const useMapbox = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [is3D, setIs3D] = useState(true);
  const currentLocationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const currentMarksRef = useRef<mapboxgl.Marker[]>([]);
  // Redux storeから位置情報を取得
  const { location, state: locationState } = useAppSelector(state => state.location);

  // Mapboxトークンを初期化
  const initializeMapboxToken = () => {
    const accessToken = process.env.NEXT_PUBLIC_MAP_API_TOKEN;
    if (!accessToken) {
      console.error('Mapbox access token is not configured');
      return false;
    }
    mapboxgl.accessToken = accessToken;
    return true;
  };

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

  // マップ初期化
  useEffect(() => {
    if (!initializeMapboxToken()) return;
    if (!mapContainerRef.current) {
      console.error('Map container ref is not available');
      return;
    }

    // マップインスタンスを作成
    mapRef.current = createMapInstance(mapContainerRef.current, location, locationState);

    // クリーンアップ関数
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);
  
  const changeMapView = (view: number) => {
    if (!mapRef.current || !mapContainerRef.current) return;
    mapRef.current.remove();
  };

  // 位置情報が更新された時に地図の中心を移動
  useEffect(() => {
    if (mapRef.current && locationState === Status.LOADED) {
      console.log('位置情報更新により地図中心を移動:', [location.lng, location.lat]);
      mapRef.current.easeTo({
        center: [location.lng, location.lat],
        duration: 1000
      });
      addCurrentLocationMarker(location.lat, location.lng, mapRef, currentLocationMarkerRef);
    }
  }, [location, locationState]);

  return {
    mapContainerRef,
    mapRef,
    is3D,
    currentLocationMarkerRef,
    currentMarksRef,
    toggle3D,
    changeMapView
  };
};