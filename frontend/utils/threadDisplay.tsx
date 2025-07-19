import React from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import { Thread, ThreadGroup } from '../types/thread';
import { POPUP_CONFIG } from '../constants/map';
import { groupOverlappingThreads } from '../utils/threadGrouping';
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import ThreadComponent from "../components/ui/thread";
import ThreadDetail from "../components/ui/thread-detail";

export const createThreadDisplay = (map: mapboxgl.Map, threads: Thread[]) => {
  console.log('Creating thread display...');
  
  // マップインスタンスを設定
  setMapInstance(map);
  
  // 既存のポップアップを確実にクリア
  clearExistingPopups();
  
  const threadGroups = groupOverlappingThreads(threads, map);
  console.log(`Created ${threadGroups.length} thread groups from ${threads.length} threads`);
  
  threadGroups.forEach((group, index) => {
    console.log(`Rendering group ${index + 1}:`, group);
    const { mainThread, overlappingCount, allThreads } = group;
    
    const popupContainer = document.createElement('div');
    popupContainer.style.position = 'relative';
    popupContainer.setAttribute('data-thread-root', 'true');
    popupContainer.className = 'custom-thread-container';
    const root = createRoot(popupContainer);

    // 重複コメント数の表示要素
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

    // 個別のスレッド詳細を表示する関数
    const showIndividualThreadDetail = (thread: Thread) => {
      const detailContainer = document.createElement('div');
      const detailRoot = createRoot(detailContainer);
      
      detailRoot.render(
        <ThreadDetail 
          message={thread.message}
          author={thread.author}
          timestamp={thread.timestamp}
          like={thread.like}
          replies={thread.replies}
          onClose={() => {
            detailPopup.remove();
            // 非同期でアンマウントしてレースコンディションを回避
            setTimeout(() => {
              detailRoot.unmount();
            }, 0);
            displaySingleThread(group);
          }}
        />
      );

      const mapCenter = map.getCenter();
      
      const detailPopup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        anchor: 'center',
        offset: [0, 0],
        className: 'custom-popup detail-popup'
      })
        .setLngLat(mapCenter)
        .setDOMContent(detailContainer)
        .addTo(map);

      // ポップアップの吹き出しを確実に除去
      setTimeout(() => {
        const popupElement = detailPopup.getElement();
        if (popupElement) {
          const tip = popupElement.querySelector('.mapboxgl-popup-tip');
          if (tip) {
            tip.remove();
          }
        }
      }, 0);

      // ポップアップを追跡リストに追加
      allPopups.push(detailPopup);

      detailPopup.on('close', () => {
        // 非同期でアンマウントしてレースコンディションを回避
        setTimeout(() => {
          detailRoot.unmount();
        }, 0);
        // 追跡リストから削除
        const index = allPopups.indexOf(detailPopup);
        if (index > -1) {
          allPopups.splice(index, 1);
        }
      });
    };

    // 単一スレッドを表示する関数
    const displaySingleThread = (group: ThreadGroup) => {
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
        <ThreadComponent 
          message={group.mainThread.message} 
          author={group.mainThread.author} 
          timestamp={group.mainThread.timestamp}
          replyCount={group.mainThread.replyCount}
          onThreadClick={showThreadDetail}
          onClose={() => {
            newPopup.remove();
            // 非同期でアンマウントしてレースコンディションを回避
            setTimeout(() => {
              newRoot.unmount();
            }, 0);
          }}
        />
      );

      const newPopup = new mapboxgl.Popup({
        closeButton: POPUP_CONFIG.CLOSE_BUTTON,
        closeOnClick: POPUP_CONFIG.CLOSE_ON_CLICK,
        anchor: POPUP_CONFIG.ANCHOR,
        offset: POPUP_CONFIG.OFFSET,
        className: POPUP_CONFIG.CLASS_NAME
      })
        .setLngLat(group.mainThread.coordinates)
        .setDOMContent(newPopupContainer)
        .addTo(map);

      // ポップアップの吹き出しを確実に除去
      setTimeout(() => {
        const popupElement = newPopup.getElement();
        if (popupElement) {
          const tip = popupElement.querySelector('.mapboxgl-popup-tip');
          if (tip) {
            tip.remove();
          }
        }
      }, 0);

      // ポップアップを追跡リストに追加
      allPopups.push(newPopup);

      newPopup.on('close', () => {
        // 非同期でアンマウントしてレースコンディションを回避
        setTimeout(() => {
          newRoot.unmount();
        }, 0);
        // 追跡リストから削除
        const index = allPopups.indexOf(newPopup);
        if (index > -1) {
          allPopups.splice(index, 1);
        }
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
              {allThreads.map((thread) => (
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
          .addTo(map);

        // ポップアップの吹き出しを確実に除去
        setTimeout(() => {
          const popupElement = selectionPopup.getElement();
          if (popupElement) {
            const tip = popupElement.querySelector('.mapboxgl-popup-tip');
            if (tip) {
              tip.remove();
            }
          }
        }, 0);

        // ポップアップを追跡リストに追加
        allPopups.push(selectionPopup);

        selectionPopup.on('close', () => {
          // 非同期でアンマウントしてレースコンディションを回避
          setTimeout(() => {
            selectionRoot.unmount();
          }, 0);
          // 追跡リストから削除
          const index = allPopups.indexOf(selectionPopup);
          if (index > -1) {
            allPopups.splice(index, 1);
          }
        });
      } else {
        showIndividualThreadDetail(mainThread);
      }
    };
    
    // Threadコンポーネントをレンダリング
    root.render(
      <ThreadComponent 
        message={mainThread.message} 
        author={mainThread.author} 
        timestamp={mainThread.timestamp}
        replyCount={mainThread.replyCount}
        like={mainThread.like}
        onThreadClick={showThreadDetail}
        onClose={() => {
          popup.remove();
          // 非同期でアンマウントしてレースコンディションを回避
          setTimeout(() => {
            root.unmount();
          }, 0);
        }}
      />
    );
      
    const popup = new mapboxgl.Popup({
      closeButton: POPUP_CONFIG.CLOSE_BUTTON,
      closeOnClick: POPUP_CONFIG.CLOSE_ON_CLICK,
      anchor: POPUP_CONFIG.ANCHOR,
      offset: POPUP_CONFIG.OFFSET,
      className: POPUP_CONFIG.CLASS_NAME
    })
      .setLngLat(mainThread.coordinates)
      .setDOMContent(popupContainer)
      .addTo(map);

    // ポップアップの吹き出しを確実に除去
    setTimeout(() => {
      const popupElement = popup.getElement();
      if (popupElement) {
        const tip = popupElement.querySelector('.mapboxgl-popup-tip');
        if (tip) {
          tip.remove();
        }
      }
    }, 0);

    // ポップアップを追跡リストに追加
    allPopups.push(popup);

    popup.on('close', () => {
      // 非同期でアンマウントしてレースコンディションを回避
      setTimeout(() => {
        root.unmount();
      }, 0);
      // 追跡リストから削除
      const index = allPopups.indexOf(popup);
      if (index > -1) {
        allPopups.splice(index, 1);
      }
    });
  });
};

// Mapboxインスタンスを保持（ポップアップ管理用）
let mapInstance: mapboxgl.Map | null = null;
let allPopups: mapboxgl.Popup[] = [];

export const setMapInstance = (map: mapboxgl.Map) => {
  mapInstance = map;
  console.log('Map instance set for popup management');
};

export const clearExistingPopups = () => {
  console.log('Clearing existing popups and markers...');
  
  // Mapboxのポップアップを確実に削除
  if (mapInstance) {
    try {
      // 記録されたポップアップを削除
      allPopups.forEach(popup => {
        try {
          popup.remove();
        } catch (e) {
          console.warn('Error removing tracked popup:', e);
        }
      });
      allPopups = [];
      console.log('Cleared all tracked popups via Mapbox API');
    } catch (error) {
      console.warn('Error clearing popups via Mapbox API:', error);
    }
  }
  
  // DOM要素として存在するポップアップを削除
  const existingPopups = document.querySelectorAll('.mapboxgl-popup');
  console.log(`Found ${existingPopups.length} existing popup DOM elements`);
  existingPopups.forEach(popup => popup.remove());
  
  // ポップアップの吹き出し要素を確実に削除
  const existingTips = document.querySelectorAll('.mapboxgl-popup-tip');
  console.log(`Found ${existingTips.length} existing popup tips`);
  existingTips.forEach(tip => tip.remove());
  
  // Reactのrootコンテナをクリア
  const existingRoots = document.querySelectorAll('[data-thread-root]');
  console.log(`Found ${existingRoots.length} existing thread roots`);
  existingRoots.forEach(root => root.remove());
  
  // カスタムポップアップコンテナをクリア
  const existingContainers = document.querySelectorAll('.custom-thread-container');
  console.log(`Found ${existingContainers.length} existing thread containers`);
  existingContainers.forEach(container => container.remove());
  
  console.log('Cleanup completed');
};
