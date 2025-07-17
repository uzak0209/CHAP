'use client';

//useRefはdomを操作する
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import CircleButton from "@/components/ui/circle-button"
import Post from "@/components/ui/post"
import Thread from "@/components/ui/thread"
import ThreadDetail from "@/components/ui/thread-detail"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import 'mapbox-gl/dist/mapbox-gl.css';

const MapboxExample = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  //マップインスタンスへの参照
  const mapRef = useRef<mapboxgl.Map | null>(null);
  // 3D/2D切り替えの状態管理
  const [is3D, setIs3D] = useState(true);

  // スレッドデータ
  const threadsData = [
    {
      id: 1,
      coordinates: [136.918320, 35.157171] as [number, number],
      message: "こんちには",
      author: "ユーザー1",
      timestamp: "14:30:25",
      replyCount: 3,
      replies: [
        { id: 1, message: "こんにちは！", author: "ユーザーA", timestamp: "14:31:10" },
        { id: 2, message: "今日は良い天気ですね", author: "ユーザーB", timestamp: "14:32:15" },
        { id: 3, message: "はじめまして", author: "ユーザーC", timestamp: "14:33:20" }
      ]
    },
    {
      id: 2,
      coordinates: [136.920320, 35.158171] as [number, number],
      message: "名古屋駅周辺はとても便利ですね！",
      author: "ユーザー2",
      timestamp: "14:35:12",
      replyCount: 1,
      replies: [
        { id: 1, message: "本当にそうですね！交通の便が良いです", author: "ユーザーD", timestamp: "14:36:05" }
      ]
    },
    {
      id: 3,
      coordinates: [136.916320, 35.156171] as [number, number],
      message: "今日は良い天気です☀️",
      author: "ユーザー3",
      timestamp: "14:40:33",
      replyCount: 5,
      replies: [
        { id: 1, message: "本当に気持ちいいですね", author: "ユーザーX", timestamp: "14:41:00" },
        { id: 2, message: "散歩日和です", author: "ユーザーY", timestamp: "14:41:30" },
        { id: 3, message: "写真撮影にも最適", author: "ユーザーZ", timestamp: "14:42:00" },
        { id: 4, message: "外に出たくなります", author: "ユーザーW", timestamp: "14:42:30" },
        { id: 5, message: "青空が綺麗です", author: "ユーザーV", timestamp: "14:43:00" }
      ]
    },
    {
      id: 4,
      coordinates: [136.919320, 35.159171] as [number, number],
      message: "お疲れ様です！",
      author: "ユーザー4",
      timestamp: "14:45:10",
      replyCount: 0,
      replies: []
    },
    {
      id: 5,
      coordinates: [136.917320, 35.155171] as [number, number],
      message: "この場所おすすめです✨",
      author: "ユーザー5",
      timestamp: "14:50:45",
      replyCount: 2,
      replies: [
        { id: 1, message: "どんなところがおすすめですか？", author: "ユーザーJ", timestamp: "14:51:00" },
        { id: 2, message: "今度行ってみます！", author: "ユーザーK", timestamp: "14:51:30" }
      ]
    }
  ];

  // カスタムポップアップスタイル
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-popup .mapboxgl-popup-content {
        background: transparent !important;
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-width: none !important;
      }
      .custom-popup .mapboxgl-popup-tip {
        display: none !important;
      }
      .detail-popup .mapboxgl-popup-content {
        max-width: 500px !important;
        max-height: 600px !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 複数のスレッドを地図上に表示する関数
const displayThreads = () => {
  if (!mapRef.current) return;

  // 現在のズームレベルを取得
  const currentZoom = mapRef.current.getZoom();
  
  // ズームレベルに応じた重複判定の閾値を設定（画面上のピクセル距離）
  const getOverlapThreshold = (zoom: number) => {
    // ズームレベルが低い（引いている）ほど閾値を大きく
    if (zoom < 10) return 100; // 100px以内なら重複
    if (zoom < 13) return 80;  // 80px以内なら重複
    if (zoom < 15) return 60;  // 60px以内なら重複
    if (zoom < 17) return 40;  // 40px以内なら重複
    return 20; // 20px以内なら重複
  };

  const PIXEL_THRESHOLD = getOverlapThreshold(currentZoom);

  // 2つの座標間の画面上のピクセル距離を計算する関数
  const calculatePixelDistance = (coord1: [number, number], coord2: [number, number]) => {
    const point1 = mapRef.current!.project(coord1);
    const point2 = mapRef.current!.project(coord2);
    
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    
    return Math.sqrt(dx * dx + dy * dy);
  };

  // 重複するコメントをグループ化する関数
  const groupOverlappingThreads = (threads: typeof threadsData) => {
    const groups: Array<{
      mainThread: typeof threadsData[0];
      overlappingCount: number;
      allThreads: typeof threadsData;
    }> = [];
    
    const processed = new Set<number>();

    threads.forEach((thread, index) => {
      if (processed.has(index)) return;

      const overlappingThreads = [thread];
      processed.add(index);

      // 他のスレッドと画面上の距離を比較
      threads.forEach((otherThread, otherIndex) => {
        if (otherIndex === index || processed.has(otherIndex)) return;

        const pixelDistance = calculatePixelDistance(thread.coordinates, otherThread.coordinates);
        if (pixelDistance < PIXEL_THRESHOLD) {
          overlappingThreads.push(otherThread);
          processed.add(otherIndex);
        }
      });

      // 最新のコメントを代表として選ぶ（後でいいね順に変更予定）
      const mainThread = overlappingThreads.sort((a, b) => 
        new Date(`2024-01-01 ${b.timestamp}`).getTime() - 
        new Date(`2024-01-01 ${a.timestamp}`).getTime()
      )[0];

      groups.push({
        mainThread,
        overlappingCount: overlappingThreads.length,
        allThreads: overlappingThreads
      });
    });

    return groups;
  };

  const threadGroups = groupOverlappingThreads(threadsData);
  
  threadGroups.forEach((group) => {
    const { mainThread, overlappingCount, allThreads } = group;
    
    const popupContainer = document.createElement('div');
    popupContainer.style.position = 'relative';
    const root = createRoot(popupContainer);

    // 重複コメント数の表示要素（shadcn/ui Badge使用）
    if (overlappingCount > 1) {
      const badgeContainer = document.createElement('div');
      badgeContainer.style.cssText = `
        position: absolute;
        top: -8px;
        right: -8px;
        z-index: 1000;
      `;
      
      const badgeRoot = createRoot(badgeContainer);
      badgeRoot.render(
        <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold">
          {overlappingCount}
        </Badge>
      );
      
      popupContainer.appendChild(badgeContainer);
    }

    // ...existing code for showIndividualThreadDetail, displaySingleThread, and showThreadDetail functions...
    
    // 個別のスレッド詳細を表示する関数
    const showIndividualThreadDetail = (thread: typeof mainThread) => {
      const detailContainer = document.createElement('div');
      const detailRoot = createRoot(detailContainer);
      
      detailRoot.render(
        <ThreadDetail 
          message={thread.message}
          author={thread.author}
          timestamp={thread.timestamp}
          replies={thread.replies}
          onClose={() => {
            detailPopup.remove();
            detailRoot.unmount();
            // 元のポップアップを再表示
            displaySingleThread(group);
          }}
        />
      );

      const mapCenter = mapRef.current!.getCenter();
      
      const detailPopup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        anchor: 'center',
        offset: [0, 0],
        className: 'custom-popup detail-popup'
      })
        .setLngLat(mapCenter)
        .setDOMContent(detailContainer)
        .addTo(mapRef.current!);

      detailPopup.on('close', () => {
        detailRoot.unmount();
      });
    };

    // 単一スレッドを表示する関数
    const displaySingleThread = (group: typeof threadGroups[0]) => {
      const newPopupContainer = document.createElement('div');
      newPopupContainer.style.position = 'relative';
      
      const newRoot = createRoot(newPopupContainer);
      
      // 重複数バッジを再追加
      if (group.overlappingCount > 1) {
        const newBadgeContainer = document.createElement('div');
        newBadgeContainer.style.cssText = `
          position: absolute;
          top: -8px;
          right: -8px;
          z-index: 1000;
        `;
        
        const newBadgeRoot = createRoot(newBadgeContainer);
        newBadgeRoot.render(
          <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold">
            {group.overlappingCount}
          </Badge>
        );
        
        newPopupContainer.appendChild(newBadgeContainer);
      }

      newRoot.render(
        <Thread 
          message={group.mainThread.message} 
          author={group.mainThread.author} 
          timestamp={group.mainThread.timestamp}
          replyCount={group.mainThread.replyCount}
          onThreadClick={showThreadDetail}
          onClose={() => {
            newPopup.remove();
            newRoot.unmount();
          }}
        />
      );

      const newPopup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        anchor: 'bottom',
        offset: [0, -10],
        className: 'custom-popup'
      })
        .setLngLat(group.mainThread.coordinates)
        .setDOMContent(newPopupContainer)
        .addTo(mapRef.current!);

      newPopup.on('close', () => {
        newRoot.unmount();
      });
    };

    // スレッドの詳細を表示する関数
    const showThreadDetail = () => {
      console.log('showThreadDetail called for thread:', mainThread.id);
      
      if (overlappingCount > 1) {
        popup.remove();
        
        const selectionContainer = document.createElement('div');
        const selectionRoot = createRoot(selectionContainer);
        
        selectionRoot.render(
          <Card className="w-80 max-h-96 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">重複するコメント</CardTitle>
              <CardDescription>
                {overlappingCount}件のコメントが重複しています
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-60 overflow-y-auto">
              {allThreads.map((thread, index) => (
                <Card 
                  key={thread.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => {
                    selectionPopup.remove();
                    selectionRoot.unmount();
                    showIndividualThreadDetail(thread);
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">{thread.author}</span>
                      <span className="text-xs text-muted-foreground">{thread.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {thread.message.length > 50 ? `${thread.message.substring(0, 50)}...` : thread.message}
                    </p>
                  </CardContent>
                </Card>
              ))}
              <Separator />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  selectionPopup.remove();
                  selectionRoot.unmount();
                  displaySingleThread(group);
                }}
              >
                戻る
              </Button>
            </CardContent>
          </Card>
        );

        const selectionPopup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          anchor: 'center',
          offset: [0, 0],
          className: 'custom-popup detail-popup'
        })
          .setLngLat(mainThread.coordinates)
          .setDOMContent(selectionContainer)
          .addTo(mapRef.current!);

        selectionPopup.on('close', () => {
          selectionRoot.unmount();
        });
      } else {
        showIndividualThreadDetail(mainThread);
      }
    };
    
    // Threadコンポーネントをレンダリング
    root.render(
      <Thread 
        message={mainThread.message} 
        author={mainThread.author} 
        timestamp={mainThread.timestamp}
        replyCount={mainThread.replyCount}
        onThreadClick={showThreadDetail}
        onClose={() => {
          popup.remove();
          root.unmount();
        }}
      />
    );
      
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      anchor: 'bottom',
      offset: [0, -10],
      className: 'custom-popup'
    })
      .setLngLat(mainThread.coordinates)
      .setDOMContent(popupContainer)
      .addTo(mapRef.current!);

    popup.on('close', () => {
      root.unmount();
    });
  });
};


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
      minZoom: 5,
      maxZoom: 50,
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

      // 複数のスレッドを地図上に表示
      displayThreads();

      mapRef.current!.on('zoomend', () => {
        // 既存のポップアップを削除
        const existingPopups = document.querySelectorAll('.mapboxgl-popup');
        existingPopups.forEach(popup => popup.remove());
        
        // 新しいズームレベルでスレッドを再表示
        displayThreads();
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
  
  const ChangeMapView = (view: number) => {
    if (!mapRef.current || !mapContainerRef.current) return;
    
    // 既存のマップを削除
    mapRef.current.remove();
    
    switch(view){
      case 1:
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
          break;
      case 2:
            // マップインスタンスを作成
          mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: [136.918320, 35.157171], // [経度, 緯度] の順番
            zoom: 5.100,
            pitch: 42,
            bearing: -50,
            style: 'mapbox://styles/mapbox/standard',
            minZoom: 5,
            maxZoom: 100,
            // ローカライズ設定
            localIdeographFontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
            // 言語設定を日本語に
            language: 'ja'
          });

          // 道路表示を消すための設定
          mapRef.current.on('style.load', () => {
            if (!mapRef.current) return;
            
            // まず、すべてのレイヤーを取得してコンソールに表示
            const style = mapRef.current.getStyle();
            const allLayers = style.layers.map(layer => layer.id);
            console.log('All layers:', allLayers);
            
            // 道路関連のレイヤーを幅広く検索して非表示にする
            allLayers.forEach(layerId => {
              if (layerId.includes('road') || 
                  layerId.includes('street') || 
                  layerId.includes('highway') ||
                  layerId.includes('motorway') ||
                  layerId.includes('primary') ||
                  layerId.includes('secondary') ||
                  layerId.includes('tertiary') ||
                  layerId.includes('trunk') ||
                  layerId.includes('bridge') ||
                  layerId.includes('tunnel') ||
                  layerId.includes('path') ||
                  layerId.includes('pedestrian') ||
                  layerId.includes('rail') ||
                  layerId.includes('transit')) {
                try {
                  mapRef.current!.setLayoutProperty(layerId, 'visibility', 'none');
                  console.log(`Hidden layer: ${layerId}`);
                } catch (error) {
                  console.warn(`Could not hide layer: ${layerId}`, error);
                }
              }
            });
          });
          break;
      case 3:
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
          break;
    }
  };
  //マップのサイズ
  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <div id="map" style={{ height: '100%', width: '100%' }} ref={mapContainerRef} />

      {/* 円形ボタンの例 */}
      <CircleButton
        position={{ top: '80px', right: '20px' }}
        onClick={() => ChangeMapView(1)}
        size="md"
        variant="default"
      >
        1
      </CircleButton>

      <CircleButton
        position={{ top: '160px', right: '20px' }}
        onClick={() => ChangeMapView(2)}
        size="md"
        variant="default"
      >
        2
      </CircleButton>

      <CircleButton
        position={{ top: '240px', right: '20px' }}
        onClick={() => ChangeMapView(3)}
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