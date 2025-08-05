import { useEffect, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import { Thread } from '@/types/thread';

import { createThreadDisplay, clearExistingPopups, setMapInstance } from '@/utils/threadDisplay';
import { useAppSelector } from '@/store';

export const useThreads = (mapRef: React.RefObject<mapboxgl.Map | null>) => {
  const selectedCategory = useAppSelector(state => state.filters.selectedCategory);
  
  // デバッグ用ログ
  console.log('useThreads - selectedCategory:', selectedCategory);

  // カテゴリでフィルタリングされたスレッドを取得（現在はデータなし）
  const filteredThreads = useMemo(() => {
    const filtered: Thread[] = []; // 空の配列（データがないため）
    console.log('useThreads - filteredThreads:', filtered);
    return filtered;
  }, [selectedCategory]);

  const displayThreads = useCallback(() => {
    if (!mapRef.current) return;
    console.log('displayThreads called with filteredThreads:', filteredThreads);
    createThreadDisplay(mapRef.current, filteredThreads);
  }, [mapRef, filteredThreads]);

  const handleZoomEnd = useCallback(() => {
    if (!mapRef.current) return;
    // ズーム時のクリア・再表示は無効化（ポップアップ復元システムが処理）
    console.log('Zoom changed - skipping thread clearing (handled by popup restoration system)');
    // clearExistingPopups(); // コメントアウト
    // displayThreads(); // コメントアウト
  }, [mapRef]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // マップインスタンスを設定
    setMapInstance(map);

    const onStyleLoad = () => {
      displayThreads();
      map.on('zoomend', handleZoomEnd);
    };

    // マップが既に読み込まれている場合
    if (map.loaded()) {
      displayThreads();
      map.on('zoomend', handleZoomEnd);
    } else {
      map.on('style.load', onStyleLoad);
    }

    return () => {
      map.off('style.load', onStyleLoad);
      map.off('zoomend', handleZoomEnd);
    };
  }, [mapRef, displayThreads, handleZoomEnd]);

  // フィルタが変更されたときにスレッドを再表示
  useEffect(() => {
    if (mapRef.current) {
      console.log('Filter changed, updating threads display');
      displayThreads();
    }
  }, [filteredThreads, displayThreads]);

  return { displayThreads };
};
