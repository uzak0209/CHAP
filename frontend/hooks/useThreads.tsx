import { useEffect, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import { Thread } from '@/types/thread';
import { THREADS_DATA } from '@/constants/map';
import { createThreadDisplay, clearExistingPopups } from '@/utils/threadDisplay';
import { useAppSelector } from '@/store';

export const useThreads = (mapRef: React.RefObject<mapboxgl.Map | null>) => {
  const selectedCategory = useAppSelector(state => state.filters.selectedCategory);
  
  // デバッグ用ログ
  console.log('useThreads - selectedCategory:', selectedCategory);
  console.log('useThreads - THREADS_DATA:', THREADS_DATA);

  // カテゴリでフィルタリングされたスレッドを取得
  const filteredThreads = useMemo(() => {
    const filtered = THREADS_DATA.filter((thread: Thread) => 
      thread.category === selectedCategory
    );
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
    console.log('Zoom changed, clearing and re-displaying threads');
    clearExistingPopups();
    displayThreads();
  }, [mapRef, displayThreads]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

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
