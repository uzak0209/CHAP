'use client';

//useRefはdomを操作する
import React, { useEffect, useRef, useState } from 'react';
import CircleButton from "@/components/ui/circle-button"
import mapboxgl from 'mapbox-gl';


import 'mapbox-gl/dist/mapbox-gl.css';

const MapboxExample = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  //マップインスタンスへの参照
  const mapRef = useRef<mapboxgl.Map | null>(null);
  // 3D/2D切り替えの状態管理
  const [is3D, setIs3D] = useState(true);

  useEffect(() => {
    const accessToken = process.env.NEXT_PUBLIC_MAP_API_TOKEN;
    
    console.log('Access token:', accessToken ? 'Found' : 'Not found');
    console.log('Token length:', accessToken ? accessToken.length : 0);
    
    //アクセストークンがないときはエラーを出力
    if (!accessToken) {
      console.error('Mapbox access token is not defined. Please check your .env.local file.');
      return;
    }
    
    mapboxgl.accessToken = accessToken;

    if (!mapContainerRef.current) {
      console.error('Map container ref is not available');
      return;
    }

    // マップインスタンスを作成
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [136.918320, 35.157171], // [経度, 緯度] の順番
      zoom: 15.27,
      pitch: 42,
      bearing: -50,
      style: 'mapbox://styles/mapbox/standard',
      minZoom: 15,
      maxZoom: 16,
      // ローカライズ設定
      localIdeographFontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
      // 言語設定を日本語に
      language: 'ja'
    });

    

    mapRef.current.on('style.load', () => {
      if (!mapRef.current) return;
      
      // 言語設定を日本語に変更
      const labelLayers = [
        'country-label',
        'state-label', 
        'settlement-label',
        'settlement-subdivision-label',
        'place-label',
        'poi-label',
        'road-label',
        'water-label',
        'airport-label',
        'transit-label',
        'building-label',
        'natural-label',
        'boundary-label',
        'waterway-label',
        'rail-label',
        'bridge-label',
        'tunnel-label',
        'ferry-label',
        'aerialway-label',
        'cable-car-label',
        'subway-label',
        'bus-label',
        'parking-label',
        'hospital-label',
        'school-label',
        'university-label',
        'library-label',
        'museum-label',
        'theatre-label',
        'cinema-label',
        'restaurant-label',
        'cafe-label',
        'bar-label',
        'hotel-label',
        'shop-label',
        'bank-label',
        'post-office-label',
        'police-label',
        'fire-station-label',
        'church-label',
        'temple-label',
        'shrine-label',
        'mosque-label',
        'synagogue-label',
        'cemetery-label',
        'park-label',
        'playground-label',
        'sports-centre-label',
        'stadium-label',
        'swimming-pool-label',
        'golf-course-label',
        'tennis-court-label',
        'football-pitch-label',
        'baseball-field-label',
        'basketball-court-label',
        'volleyball-court-label',
        'table-tennis-label',
        'badminton-court-label',
        'squash-court-label',
        'bowling-alley-label',
        'fitness-centre-label',
        'gym-label',
        'yoga-studio-label',
        'dance-studio-label',
        'martial-arts-label',
        'climbing-wall-label',
        'ice-rink-label',
        'ski-slope-label',
        'snow-park-label',
        'beach-label',
        'marina-label',
        'harbour-label',
        'port-label',
        'airport-terminal-label',
        'helipad-label',
        'gas-station-label',
        'charging-station-label',
        'car-wash-label',
        'car-rental-label',
        'taxi-stand-label',
        'bus-station-label',
        'train-station-label',
        'subway-station-label',
        'tram-stop-label',
        'ferry-terminal-label',
        'cable-car-station-label',
        'aerialway-station-label',
        'bicycle-parking-label',
        'bicycle-rental-label',
        'motorcycle-parking-label',
        'car-parking-label',
        'truck-parking-label',
        'rv-parking-label',
        'boat-parking-label',
        'airplane-parking-label',
        'helicopter-parking-label',
        'bicycle-shop-label',
        'motorcycle-shop-label',
        'car-dealer-label',
        'truck-dealer-label',
        'boat-dealer-label',
        'airplane-dealer-label',
        'helicopter-dealer-label',
        'bicycle-repair-label',
        'motorcycle-repair-label',
        'car-repair-label',
        'truck-repair-label',
        'boat-repair-label',
        'airplane-repair-label',
        'helicopter-repair-label'
      ];

      // すべてのラベルレイヤーを日本語に設定
      labelLayers.forEach(layerId => {
        if (mapRef.current!.getLayer(layerId)) {
          mapRef.current!.setLayoutProperty(layerId, 'text-field', ['get', 'name_ja']);
        }
      });

      // フォールバック設定：日本語名がない場合は英語名を使用
      labelLayers.forEach(layerId => {
        if (mapRef.current!.getLayer(layerId)) {
          mapRef.current!.setLayoutProperty(layerId, 'text-field', [
            'coalesce',
            ['get', 'name_ja'],
            ['get', 'name_jp'],
            ['get', 'name'],
            ['get', 'name_en']
          ]);
        }
      });

      
      // 地図の照明を夕暮れモードに変更
      mapRef.current.setConfigProperty('basemap', 'lightPreset', 'dusk');

      // 指定したポリゴン領域内の建物やシンボルを「消去」する機能（名古屋駅周辺に調整）
      mapRef.current.addSource('eraser', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                coordinates: [
                  [
                    [136.917320, 35.158171],
                    [136.919320, 35.158171],
                    [136.919320, 35.156171],
                    [136.917320, 35.156171],
                    [136.917320, 35.158171]
                  ]
                ],
                type: 'Polygon'
              }
            }
          ]
        }
      });

      //3Dタワーモデル（.glbファイル）を特定の位置に配置（名古屋駅周辺に調整）
      // モデルの回転、スケール、影、発光強度などを設定
      mapRef.current.addSource('model', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {
            'model-uri': 'https://docs.mapbox.com/mapbox-gl-js/assets/tower.glb'
          },
          geometry: {
            coordinates: [136.918320, 35.157171],
            type: 'Point'
          }
        }
      });

      mapRef.current.addLayer({
        id: 'eraser',
        type: 'clip',
        source: 'eraser',
        layout: {

          'clip-layer-types': ['symbol', 'model'],
          'clip-layer-scope': ['basemap']
        }
      });

    
      mapRef.current.addLayer({
        id: 'tower',
        type: 'model',
        slot: 'middle',
        source: 'model',
        minzoom: 15,
        layout: {
          'model-id': ['get', 'model-uri']
        },
        paint: {
          'model-opacity': 1,
          'model-rotation': [0.0, 0.0, 35.0],
          'model-scale': [0.8, 0.8, 1.2],
          'model-color-mix-intensity': 0,
          'model-cast-shadows': true,
          'model-emissive-strength': 0.8
        }
      });
    });

    // クリーンアップ関数
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  // 3D/2D切り替え機能
  const toggle3D = () => {
    if (!mapRef.current) return;
    
    if (is3D) {
      // 2Dモードに切り替え
      mapRef.current.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1000 // 1秒のアニメーション
      });
    } else {
      // 3Dモードに切り替え
      mapRef.current.easeTo({
        pitch: 42,
        bearing: -50,
        duration: 1000 // 1秒のアニメーション
      });
    }
    setIs3D(!is3D);
  };
  
  //マップのサイズ
  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <div id="map" style={{ height: '100%', width: '100%' }} ref={mapContainerRef} />

      {/* 円形ボタンの例 */}
      <CircleButton
        position={{ top: '80px', right: '20px' }}
        onClick={() => alert('ボタン1がクリックされました')}
        size="md"
        variant="default"
      >
        1
      </CircleButton>

      <CircleButton
        position={{ top: '160px', right: '20px' }}
        onClick={() => alert('ボタン1がクリックされました')}
        size="md"
        variant="default"
      >
        2
      </CircleButton>

      <CircleButton
        position={{ top: '240px', right: '20px' }}
        onClick={() => alert('ボタン1がクリックされました')}
        size="md"
        variant="default"
      >
        3
      </CircleButton>


      
      {/* 3D/2D切り替えボタン */}
      <button
        onClick={toggle3D}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '10px 20px',
          backgroundColor: is3D ? '#007cbf' : '#4a90e2',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease',
          zIndex: 1000
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {is3D ? '2D表示' : '3D表示'}
      </button>
      
      {/* 現在のモード表示 */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '8px 16px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          borderRadius: '20px',
          fontSize: '12px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          zIndex: 1000
        }}
      >
        現在のモード: {is3D ? '3D' : '2D'}
      </div>
    </div>
  );
};

export default MapboxExample;