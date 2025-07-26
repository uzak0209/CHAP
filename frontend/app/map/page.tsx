'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { MultiModalFAB } from '@/components/ui/multi-modal-fab';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchAroundPosts } from '@/store/postsSlice';
import { fetchAroundThreads } from '@/store/threadsSlice';
import { getCurrentLocation, refreshLocation } from '@/store/locationSlice';
import { Status, Post } from '@/types/types';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const [markersCreated, setMarkersCreated] = useState(false);

  const dispatch = useAppDispatch();
  const { items: posts, loading } = useAppSelector(state => state.posts);
  const { items: threads } = useAppSelector(state => state.threads);
  const { state: locationState, location } = useAppSelector(state => state.location);

  // デバッグ用: postsの変更を監視
  useEffect(() => {
    console.log('地図ページ: 投稿データが更新されました:', posts.length, '件');
    if (posts.length > 0) {
      console.log('地図ページ: 最新の投稿:', posts[0]);
    }
  }, [posts]);

  // デバッグ用: threadsの変更を監視
  useEffect(() => {
    console.log('地図ページ: スレッドデータが更新されました:', threads.length, '件');
    if (threads.length > 0) {
      console.log('地図ページ: 最新のスレッド:', threads[0]);
      console.log('地図ページ: 全スレッドの座標:', threads.map(t => ({
        id: t.id,
        coordinate: t.coordinate
      })));
    }
  }, [threads]);

  // 投稿作成を検知して地図データを更新
  useEffect(() => {
    if (locationState === Status.LOADED && posts.length > 0) {
      const latestPost = posts[0];
      const now = new Date();
      const postTime = new Date(latestPost.created_time || latestPost.updated_time);
      const timeDiff = now.getTime() - postTime.getTime();
      
      // 5秒以内に作成された投稿があれば周辺投稿とスレッドを再取得
      if (timeDiff < 5000) {
        console.log('新しい投稿を検知、周辺投稿とスレッドを再取得します');
        dispatch(fetchAroundPosts({
          lat: location.lat,
          lng: location.lng
        }));
        dispatch(fetchAroundThreads({
          lat: location.lat,
          lng: location.lng
        }));
      }
    }
  }, [posts.length, locationState, location, dispatch]);

  // 位置情報を取得
  useEffect(() => {
    if (locationState === Status.IDLE) {
      dispatch(getCurrentLocation());
    }
  }, [dispatch, locationState]);

  // 位置情報が取得できたら周辺の投稿とスレッドを取得
  useEffect(() => {
    if (locationState === Status.LOADED) {
      console.log('位置情報取得完了、周辺投稿とスレッドを取得中:', location);
      
      // 投稿を取得
      dispatch(fetchAroundPosts({
        lat: location.lat,
        lng: location.lng
      }))
      .unwrap()
      .then((posts) => {
        console.log('周辺投稿取得成功:', posts);
        console.log('取得した投稿数:', posts.length);
        if (posts.length > 0) {
          console.log('投稿例:', posts.slice(0, 2).map((p: Post) => ({
            id: p.id,
            content: p.content.substring(0, 20),
            coordinate: p.coordinate
          })));
        }
      })
      .catch((error) => {
        console.error('周辺投稿取得エラー:', error);
      });

      // スレッドを取得
      dispatch(fetchAroundThreads({
        lat: location.lat,
        lng: location.lng
      }))
      .unwrap()
      .then((threads) => {
        console.log('周辺スレッド取得成功:', threads);
        console.log('取得したスレッド数:', threads.length);
      })
      .catch((error) => {
        console.error('周辺スレッド取得エラー:', error);
      });
    }
  }, [dispatch, locationState, location]);

  // 投稿データをGeoJSONに変換
  const createGeoJSONFromPosts = (posts: Post[]): GeoJSON.FeatureCollection => {
    console.log('GeoJSONに変換する投稿データ:', posts.length, '件');
    console.log('投稿データ詳細:', posts.map(p => ({
      id: p.id,
      content: p.content?.substring(0, 10),
      coordinate: p.coordinate,
      hasCoordinate: !!(p.coordinate && p.coordinate.lat && p.coordinate.lng)
    })));
    
    const validFeatures = posts
      .filter((post) => {
        const isValid = !!(post.coordinate && post.coordinate.lat && post.coordinate.lng);
        if (!isValid) {
          console.warn('座標データが不正な投稿をスキップ:', {
            id: post.id,
            content: post.content?.substring(0, 20),
            coordinate: post.coordinate
          });
        }
        return isValid;
      })
      .map((post) => {
        // 投稿内容を短縮（最大20文字）
        const shortContent = post.content.length > 20 
          ? post.content.substring(0, 20) + '...' 
          : post.content;
          
        const feature = {
          type: 'Feature' as const,
          properties: {
            id: post.id,
            content: shortContent, // 短縮されたコンテンツ
            fullContent: post.content, // 完全なコンテンツも保持
            category: post.category || 'other',
            likes: post.like,
            created_time: post.created_time,
            user_id: post.user_id,
            tags: post.tags || []
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [post.coordinate.lng, post.coordinate.lat]
          }
        };
        console.log('作成されたフィーチャー:', {
          id: post.id,
          coordinates: feature.geometry.coordinates,
          category: feature.properties.category
        });
        return feature;
      });
    
    console.log(`有効な投稿: ${validFeatures.length}/${posts.length}`);
    return {
      type: 'FeatureCollection',
      features: validFeatures
    };
  };

  // 地図の初期化
  useEffect(() => {
    if (mapContainer.current && !mapInstance.current && locationState === Status.LOADED) {
      console.log('地図を初期化中:', location);
      mapInstance.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://api.maptiler.com/maps/satellite/style.json?key=3nHAhhRBWRJGClBFEUfU',
        center: [location.lng, location.lat], // 現在地を中心に
        zoom: 14,
      });

      // 現在地マーカーを追加
      new maplibregl.Marker({ color: 'red' })
        .setLngLat([location.lng, location.lat])
        .setPopup(new maplibregl.Popup().setHTML('<div class="p-2 text-sm">現在地</div>'))
        .addTo(mapInstance.current);

      mapInstance.current.on('load', () => {
        console.log('Map loaded, initializing layers...');
        
        // 投稿データ用のソースを追加（初期は空）
        mapInstance.current!.addSource('posts', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          },
        });
        console.log('投稿用GeoJSONソースを追加しました');

        // 投稿ポイントのレイヤーを追加
        mapInstance.current!.addLayer({
          id: 'posts-layer',
          type: 'circle',
          source: 'posts',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 8,
              15, 20,
            ],
            'circle-color': [
              'case',
              ['==', ['get', 'category'], 'entertainment'], '#ff6b6b',
              ['==', ['get', 'category'], 'community'], '#4ecdc4',
              ['==', ['get', 'category'], 'information'], '#45b7d1',
              ['==', ['get', 'category'], 'disaster'], '#ff4757',
              '#ffa726' // デフォルト色
            ],
            'circle-opacity': 0.8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          },
        });

        // 投稿ラベル（常時表示）のレイヤーを追加
        mapInstance.current!.addLayer({
          id: 'posts-labels',
          type: 'symbol',
          source: 'posts',
          layout: {
            'text-field': ['get', 'content'],
            'text-font': ['Open Sans Regular'],
            'text-offset': [0, -2],
            'text-anchor': 'bottom',
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 10,
              15, 14,
            ],
            'text-max-width': 8,
            'text-allow-overlap': false,
            'text-ignore-placement': false
          },
          paint: {
            'text-color': '#333333',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2
          }
        });
        console.log('投稿用レイヤーを追加しました');

        // クリックイベントの追加（詳細情報表示）
        mapInstance.current!.on('click', 'posts-layer', (e) => {
          if (e.features && e.features[0]) {
            const feature = e.features[0];
            const properties = feature.properties;
            
            new maplibregl.Popup()
              .setLngLat((feature.geometry as any).coordinates)
              .setHTML(`
                <div class="p-3 max-w-xs bg-white rounded-lg shadow-lg">
                  <h3 class="font-bold text-sm mb-2">${properties!.fullContent || properties!.content}</h3>
                  <p class="text-xs text-gray-600 mb-1">カテゴリ: ${properties!.category || 'その他'}</p>
                  <p class="text-xs text-gray-600 mb-1">いいね: ${properties!.likes || 0}</p>
                  <p class="text-xs text-gray-500">${new Date(properties!.created_time).toLocaleString()}</p>
                  ${properties!.tags && properties!.tags.length > 0 ? `
                    <div class="mt-2">
                      ${properties!.tags.map((tag: string) => `<span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">#${tag}</span>`).join('')}
                    </div>
                  ` : ''}
                </div>
              `)
              .addTo(mapInstance.current!);
          }
        });

        // ホバー効果（マーカーとラベルの両方）
        mapInstance.current!.on('mouseenter', 'posts-layer', () => {
          mapInstance.current!.getCanvas().style.cursor = 'pointer';
        });

        mapInstance.current!.on('mouseleave', 'posts-layer', () => {
          mapInstance.current!.getCanvas().style.cursor = '';
        });

        mapInstance.current!.on('mouseenter', 'posts-labels', () => {
          mapInstance.current!.getCanvas().style.cursor = 'pointer';
        });

        mapInstance.current!.on('mouseleave', 'posts-labels', () => {
          mapInstance.current!.getCanvas().style.cursor = '';
        });

        // ラベルクリックでも詳細情報を表示
        mapInstance.current!.on('click', 'posts-labels', (e) => {
          if (e.features && e.features[0]) {
            const feature = e.features[0];
            const properties = feature.properties;
            
            new maplibregl.Popup()
              .setLngLat((feature.geometry as any).coordinates)
              .setHTML(`
                <div class="p-3 max-w-xs bg-white rounded-lg shadow-lg">
                  <h3 class="font-bold text-sm mb-2">${properties!.fullContent || properties!.content}</h3>
                  <p class="text-xs text-gray-600 mb-1">カテゴリ: ${properties!.category || 'その他'}</p>
                  <p class="text-xs text-gray-600 mb-1">いいね: ${properties!.likes || 0}</p>
                  <p class="text-xs text-gray-500">${new Date(properties!.created_time).toLocaleString()}</p>
                  ${properties!.tags && properties!.tags.length > 0 ? `
                    <div class="mt-2">
                      ${properties!.tags.map((tag: string) => `<span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">#${tag}</span>`).join('')}
                    </div>
                  ` : ''}
                </div>
              `)
              .addTo(mapInstance.current!);
          }
        });

        console.log('地図の初期化が完了しました');
        console.log('追加されたソース:', Object.keys(mapInstance.current!.getStyle().sources));
        console.log('追加されたレイヤー:', mapInstance.current!.getStyle().layers?.map(l => l.id));
        
        setMarkersCreated(true);
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        setMarkersCreated(false);
      }
    };
  }, [locationState, location]);

  // 投稿データが更新されたら地図を更新
  useEffect(() => {
    if (mapInstance.current && markersCreated && posts.length > 0) {
      console.log('地図を更新中 - 投稿数:', posts.length);
      console.log('最新の投稿:', posts[0]); // 最新の投稿をログ出力
      
      const geojsonData = createGeoJSONFromPosts(posts);
      console.log('GeoJSONデータ作成完了 - フィーチャー数:', geojsonData.features.length);
      console.log('GeoJSONフィーチャー例:', geojsonData.features.slice(0, 2));
      
      const source = mapInstance.current.getSource('posts') as maplibregl.GeoJSONSource;
      if (source) {
        console.log('地図ソースを更新します...');
        source.setData(geojsonData);
        console.log('地図ソースを更新しました');
        
        // 更新後にソースからデータを確認
        setTimeout(() => {
          const updatedData = source._data;
          console.log('更新後のソースデータ:', updatedData);
        }, 100);
      } else {
        console.warn('地図ソースが見つかりません');
        console.log('利用可能なソース:', mapInstance.current?.getStyle().sources);
      }
    } else {
      console.log('地図更新条件チェック:', {
        mapInstance: !!mapInstance.current,
        markersCreated,
        postsLength: posts.length
      });
    }
  }, [posts, markersCreated]);

  // ローディング状態の表示
  if (locationState === Status.LOADING) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">位置情報を取得中...</p>
        </div>
      </div>
    );
  }

  if (locationState === Status.ERROR) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">位置情報の取得に失敗しました</p>
          <button
            onClick={() => dispatch(getCurrentLocation())}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />
      <MultiModalFAB />
      
      {/* 投稿数を表示 */}
      {posts.length > 0 && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">ストア内投稿: {posts.length}件</p>
              <p className="text-xs text-gray-600">
                現在地: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
              <p className="text-xs text-gray-500">
                {/* 愛知県かどうかの判定を表示 */}
                {location.lat >= 34.5 && location.lat <= 35.5 && location.lng >= 136.5 && location.lng <= 138.0 
                  ? '✅ 愛知県内' 
                  : '⚠️ 愛知県外 - 位置確認推奨'}
              </p>
              {posts.length > 0 && (
                <p className="text-xs text-gray-500">
                  最新: {posts[0]?.content?.substring(0, 15)}...
                </p>
              )}
              {loading.fetch && <p className="text-xs text-gray-500">更新中...</p>}
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  console.log('投稿データ再取得開始');
                  dispatch(fetchAroundPosts({
                    lat: location.lat,
                    lng: location.lng
                  }));
                }}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                更新
              </button>
              <button
                onClick={() => {
                  console.log('位置情報をリフレッシュ中...');
                  dispatch(refreshLocation());
                }}
                className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
                disabled={(locationState as any) === 'loading'}
              >
                {(locationState as any) === 'loading' ? '取得中...' : '位置更新'}
              </button>
              <button
                onClick={() => {
                  // 位置情報の詳細診断
                  console.log('🔍 位置情報診断開始');
                  console.log('現在のRedux状態:', { location, locationState });
                  
                  // Chrome DevTools位置オーバーライドの詳細チェック
                  console.log('🔧 Chrome DevTools詳細チェック:');
                  console.log('  - DevTools開いているか:', window.outerHeight - window.innerHeight > 100);
                  console.log('  - User Agent:', navigator.userAgent);
                  console.log('  - Vendor:', navigator.vendor);
                  console.log('  - WebDriver:', (navigator as any).webdriver);
                  console.log('  - プラグイン数:', navigator.plugins.length);
                  
                  // ネットワーク詳細
                  fetch('https://ipapi.co/json/')
                    .then(response => response.json())
                    .then(data => {
                      console.log('🌐 IP位置情報サービス結果:');
                      console.log('  - IP位置:', data.latitude, data.longitude);
                      console.log('  - 都市:', data.city);
                      console.log('  - 地域:', data.region);
                      console.log('  - 国:', data.country_name);
                      console.log('  - ISP:', data.org);
                      console.log('  - タイムゾーン:', data.timezone);
                      
                      if (data.city && data.city.includes('Tokyo')) {
                        console.log('⚠️ IP位置情報が東京を示しています - ISPの問題の可能性');
                      }
                    })
                    .catch(err => console.log('IP位置情報取得失敗:', err));
                  
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const coords = {
                          lat: position.coords.latitude,
                          lng: position.coords.longitude
                        };
                        
                        console.log('📍 リアルタイム位置情報:', coords);
                        console.log('🎯 精度:', position.coords.accuracy, 'メートル');
                        
                        // 東京駅チェック
                        const isTokyoStation = Math.abs(coords.lat - 35.6876288) < 0.001 && 
                                             Math.abs(coords.lng - 139.7030912) < 0.001;
                        
                        if (isTokyoStation) {
                          alert('🚨 東京駅の座標が検出されました!\n原因:\n• VPN/プロキシの使用\n• Wi-Fi位置情報データベースの問題\n• ブラウザ設定の問題');
                        } else {
                          const isInAichi = coords.lat >= 34.5 && coords.lat <= 35.5 && 
                                          coords.lng >= 136.5 && coords.lng <= 138.0;
                          alert(`📍 現在地診断結果:\n緯度: ${coords.lat.toFixed(6)}\n経度: ${coords.lng.toFixed(6)}\n精度: ${position.coords.accuracy}m\n愛知県内: ${isInAichi ? 'はい' : 'いいえ'}`);
                        }
                      },
                      (error) => {
                        console.error('位置情報診断エラー:', error);
                        alert(`位置情報エラー:\n${error.message}\n(コード: ${error.code})`);
                      },
                      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                    );
                  }
                }}
                className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                診断
              </button>
              <button
                onClick={async () => {
                  // API接続テスト
                  console.log('🔗 API接続テスト開始');
                  
                  try {
                    // ヘルスチェック
                    const healthResponse = await fetch('http://localhost:8080/health');
                    console.log('💚 ヘルスチェック:', healthResponse.status === 200 ? '成功' : '失敗');
                    
                    // API投稿検索テスト
                    const testCoords = { lat: 35.0, lng: 137.0 }; // 愛知県中心部
                    const apiResponse = await fetch('http://localhost:8080/api/v1/around/post', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(testCoords),
                    });
                    
                    if (apiResponse.ok) {
                      const data = await apiResponse.json();
                      console.log('✅ API投稿検索成功:', data.length, '件');
                      alert(`✅ API接続テスト成功\n\n• ヘルスチェック: 正常\n• 投稿API: 正常\n• 検索結果: ${data.length}件`);
                    } else {
                      console.error('❌ API投稿検索失敗:', apiResponse.status);
                      alert(`❌ API投稿検索失敗\nステータス: ${apiResponse.status}`);
                    }
                  } catch (error) {
                    console.error('❌ API接続エラー:', error);
                    alert(`❌ API接続エラー\n${error}`);
                  }
                }}
                className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
              >
                API
              </button>
              <button
                onClick={() => {
                  // 強制的な位置情報リセット
                  console.log('🔄 位置情報完全リセット開始');
                  
                  // 1. ブラウザ許可状態をチェック
                  navigator.permissions.query({name: 'geolocation'}).then(result => {
                    console.log('📍 位置情報許可状態:', result.state);
                    
                    if (result.state === 'denied') {
                      alert('❌ 位置情報の許可が拒否されています\n\nブラウザ設定で位置情報を許可してください:\n1. URLバー左の🔒アイコンをクリック\n2. 位置情報を「許可」に変更\n3. ページを更新');
                      return;
                    }
                    
                    // 2. 複数回の位置情報取得を試行
                    let attempts = 0;
                    const maxAttempts = 3;
                    
                    const tryGetLocation = () => {
                      attempts++;
                      console.log(`📍 位置情報取得試行 ${attempts}/${maxAttempts}`);
                      
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const coords = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                          };
                          
                          console.log(`✅ 試行${attempts} 成功:`, coords);
                          console.log(`🎯 精度: ${position.coords.accuracy}m`);
                          
                          // 東京駅座標の場合は再試行
                          if (attempts < maxAttempts && coords.lat === 35.6876288 && coords.lng === 139.7030912) {
                            console.log('⚠️ 東京駅座標を検出 - 再試行します');
                            setTimeout(tryGetLocation, 2000);
                          } else {
                            console.log('✅ 位置情報取得完了');
                            dispatch(refreshLocation());
                          }
                        },
                        (error) => {
                          console.error(`❌ 試行${attempts} 失敗:`, error.message);
                          if (attempts < maxAttempts) {
                            setTimeout(tryGetLocation, 2000);
                          } else {
                            alert(`❌ 位置情報取得に失敗しました\n\n対処法:\n1. GPS/Wi-Fiを有効にする\n2. VPN/プロキシを無効にする\n3. Chrome DevToolsの位置オーバーライドを確認\n4. ブラウザを再起動する`);
                          }
                        },
                        { 
                          enableHighAccuracy: true, 
                          timeout: 10000, 
                          maximumAge: 0 
                        }
                      );
                    };
                    
                    tryGetLocation();
                  });
                }}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              >
                リセット
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 投稿が0件の場合の表示 */}
      {posts.length === 0 && !loading.fetch && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md">
          <p className="text-sm text-gray-600">この周辺に投稿はありません</p>
          <p className="text-xs text-gray-500">
            現在地: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
          <div className="flex gap-1 mt-2">
            <button
              onClick={() => {
                console.log('投稿データ再取得開始');
                dispatch(fetchAroundPosts({
                  lat: location.lat,
                  lng: location.lng
                }));
              }}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              再検索
            </button>

          </div>
        </div>
      )}
      
      {/* カテゴリ凡例 */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md">
        <h3 className="text-sm font-bold mb-2">カテゴリ</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span>エンターテイメント</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal-400"></div>
            <span>コミュニティ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span>情報</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span>災害</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-400"></div>
            <span>その他</span>
          </div>
        </div>
      </div>
    </div>
  );
}
