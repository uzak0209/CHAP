import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { MAPBOX_CONFIG } from "@/constants/map";
import { useAppSelector } from "@/store";
import { HeatMapData, Status } from "@/types/types";
import { createMapInstance } from "@/lib/mapbox/setup";
import { addCurrentLocationMarker } from "@/lib/mapbox/markers";
import { API_ENDPOINTS, apiClient } from "@/lib/api";

export const useMapbox = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [is3D, setIs3D] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const currentLocationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const currentMarksRef = useRef<mapboxgl.Marker[]>([]);
  // Redux storeから位置情報を取得
  const { location, state: locationState } = useAppSelector(
    (state) => state.location
  );

  // Mapboxトークンを初期化
  const initializeMapboxToken = () => {
    const accessToken = process.env.NEXT_PUBLIC_MAP_API_TOKEN;
    if (!accessToken) {
      console.error("Mapbox access token is not configured");
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
        duration: 1000,
      });
    } else {
      mapRef.current.easeTo({
        pitch: MAPBOX_CONFIG.PITCH,
        bearing: MAPBOX_CONFIG.BEARING,
        duration: 1000,
      });
    }
    setIs3D(!is3D);
  };

  // マップ初期化
  useEffect(() => {
    if (!initializeMapboxToken()) return;
    if (!mapContainerRef.current) {
      console.error("Map container ref is not available");
      return;
    }

    // マップインスタンスを作成
    mapRef.current = createMapInstance(
      mapContainerRef.current,
      location,
      locationState
    );

    // マップが完全に読み込まれたときの処理
    mapRef.current.on("load", () => {
      console.log("Map is fully loaded and ready");
      setIsMapReady(true);
    });

    // マップのスタイルが読み込まれたときの処理（フォールバック）
    mapRef.current.on("style.load", () => {
      console.log("Map style is loaded");
      if (!isMapReady) {
        setIsMapReady(true);
      }
    });

    // クリーンアップ関数
    return () => {
      if (mapRef.current) {
        setIsMapReady(false);
        mapRef.current.remove();
      }
    };
  }, []);

  const changeMapView = (view: number) => {
    if (!mapRef.current) return;

    if (view === 1) {
      // 2Dビュー
      mapRef.current.setProjection("mercator");
      mapRef.current.easeTo({
        pitch: 0,
        bearing: 0,
        zoom: 12,
        duration: 1000,
        center: [location.lng, location.lat],
      });
      setIs3D(false);
      mapRef.current.setStyle("mapbox://styles/mapbox/streets-v11");
    } else if (view === 2) {
      // 3Dビュー
      mapRef.current.setProjection("mercator");
      mapRef.current.easeTo({
        pitch: MAPBOX_CONFIG.PITCH,
        bearing: MAPBOX_CONFIG.BEARING,
        zoom: 12,
        duration: 1000,
        center: [location.lng, location.lat],
      });
      mapRef.current.setStyle("mapbox://styles/mapbox/streets-v11");
      setIs3D(true);
    } else if (view === 3) {
      if (!mapRef.current) return;
      try {
        mapRef.current.once("style.load", async () => {
          mapRef.current!.setProjection("globe");
          mapRef.current!.easeTo({
            pitch: 0,
            bearing: 0,
            zoom: 1.5,
            duration: 1000,
            center: [location.lng, location.lat],
          });

          // ヒートマップデータ取得
          const data = await apiClient.get<HeatMapData>(
            API_ENDPOINTS.social.heatmap
          );

          // 既存のsource/layerがあれば削除
          if (mapRef.current!.getLayer("heatmap-layer")) {
            mapRef.current!.removeLayer("heatmap-layer");
          }
          if (mapRef.current!.getSource("heatmap")) {
            mapRef.current!.removeSource("heatmap");
          }

          // GeoJSONをsourceとして追加
          mapRef.current!.addSource("heatmap", {
            type: "geojson",
            data: data.geojson,
          });

          // Heatmap Layer追加
          mapRef.current!.addLayer({
            id: "heatmap-layer",
            type: "heatmap",
            source: "heatmap",
            paint: {
              "heatmap-weight": ["get", "mag"],
              "heatmap-intensity": 1,
              "heatmap-radius": 20,
              "heatmap-opacity": 0.7,
              "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0,
                "rgba(33,102,172,0)",
                0.2,
                "rgb(103,169,207)",
                0.4,
                "rgb(209,229,240)",
                0.6,
                "rgb(253,219,199)",
                0.8,
                "rgb(239,138,98)",
                1,
                "rgb(178,24,43)",
              ],
            },
          });
        });
        mapRef.current.setStyle("mapbox://styles/mapbox/satellite-v9");
        setIs3D(false);
      } catch (error) {
        console.error("Error changing to globe view:", error);
      }
    }
  };
  // 位置情報が更新された時に地図の中心を移動
  useEffect(() => {
    if (mapRef.current && locationState === Status.LOADED) {
      console.log("位置情報更新により地図中心を移動:", [
        location.lng,
        location.lat,
      ]);
      mapRef.current.easeTo({
        center: [location.lng, location.lat],
        duration: 1000,
      });
      addCurrentLocationMarker(
        location.lat,
        location.lng,
        mapRef,
        currentLocationMarkerRef
      );
    }
  }, [location, locationState]);

  return {
    mapContainerRef,
    mapRef,
    is3D,
    isMapReady,
    currentLocationMarkerRef,
    currentMarksRef,
    toggle3D,
    changeMapView,
  };
};
