'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { MultiModalFAB } from '@/components/ui/multi-modal-fab';
import 'maplibre-gl/dist/maplibre-gl.css';

// サンプルポイント（東京周辺）
const geojsonData: GeoJSON.FeatureCollection<GeoJSON.Point, { mag: number }> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { mag: 1 },
      geometry: { type: 'Point', coordinates: [139.7670, 35.6814] }, // 東京駅
    },
    {
      type: 'Feature',
      properties: { mag: 2 },
      geometry: { type: 'Point', coordinates: [139.771, 35.6895] }, // 少し離れた場所
    },
    {
      type: 'Feature',
      properties: { mag: 3 },
      geometry: { type: 'Point', coordinates: [139.76, 35.675] },
    },
    {
      type: 'Feature',
      properties: { mag: 4 },
      geometry: { type: 'Point', coordinates: [139.78, 35.68] },
    },
    // さらに追加可能
  ],
};

export default function GraphicHeatmapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (mapContainer.current && !mapInstance.current) {
      mapInstance.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://api.maptiler.com/maps/satellite/style.json?key=3nHAhhRBWRJGClBFEUfU',
        center: [139.7670, 35.6814],
        zoom: 12,
      });

      mapInstance.current.on('load', () => {
        // GeoJSONソース追加
        mapInstance.current!.addSource('points', {
          type: 'geojson',
          data: geojsonData,
        });

        // ヒートマップレイヤー
        mapInstance.current!.addLayer({
          id: 'heatmap-layer',
          type: 'heatmap',
          source: 'points',
          maxzoom: 15,
          paint: {
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'mag'],
              1, 0.1,
              4, 1,
            ],
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 1,
              15, 3,
            ],
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(0, 0, 255, 0)',
              0.25, 'blue',
              0.5, 'cyan',
              0.75, 'lime',
              1, 'yellow',
            ],
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 5,
              15, 20,
            ],
            'heatmap-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              7, 1,
              15, 0,
            ],
          },
        });

        // 光るポイントのcircleレイヤー
        mapInstance.current!.addLayer({
          id: 'point-glow',
          type: 'circle',
          source: 'points',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 5,
              15, 15,
            ],
            'circle-color': 'rgba(255, 255, 0, 0.6)',
            'circle-blur': 0.8,
            'circle-opacity': 0.7,
          },
        });

        // アニメーションでcircleのサイズをゆらゆらさせる例
        let sizeIncreasing = true;
        let radius = 10;
        function animate() {
          if (!mapInstance.current) return;

          radius += sizeIncreasing ? 0.3 : -0.3;
          if (radius > 15) sizeIncreasing = false;
          if (radius < 10) sizeIncreasing = true;

          mapInstance.current.setPaintProperty('point-glow', 'circle-radius', radius);

          requestAnimationFrame(animate);
        }
        animate();
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />
      <MultiModalFAB />
    </div>
  );
}
