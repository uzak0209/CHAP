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
  const threadGroups = groupOverlappingThreads(threads, map);
  
  threadGroups.forEach((group) => {
    const { mainThread, overlappingCount, allThreads } = group;
    
    const popupContainer = document.createElement('div');
    popupContainer.style.position = 'relative';
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
          replies={thread.replies}
          onClose={() => {
            detailPopup.remove();
            detailRoot.unmount();
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

      detailPopup.on('close', () => {
        detailRoot.unmount();
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
            newRoot.unmount();
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

        selectionPopup.on('close', () => {
          selectionRoot.unmount();
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
        onThreadClick={showThreadDetail}
        onClose={() => {
          popup.remove();
          root.unmount();
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

    popup.on('close', () => {
      root.unmount();
    });
  });
};

export const clearExistingPopups = () => {
  const existingPopups = document.querySelectorAll('.mapboxgl-popup');
  existingPopups.forEach(popup => popup.remove());
};
