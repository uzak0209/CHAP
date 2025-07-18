import { useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { Thread } from '@/types/thread';
import { THREADS_DATA } from '@/constants/map';
import { createThreadDisplay, clearExistingPopups } from '@/utils/threadDisplay';

export const useThreads = (mapRef: React.RefObject<mapboxgl.Map | null>) => {
  const displayThreads = useCallback(() => {
    if (!mapRef.current) return;
    createThreadDisplay(mapRef.current, THREADS_DATA);
  }, [mapRef]);

  const handleZoomEnd = useCallback(() => {
    clearExistingPopups();
    displayThreads();
  }, [displayThreads]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const onStyleLoad = () => {
      displayThreads();
      map.on('zoomend', handleZoomEnd);
    };

    map.on('style.load', onStyleLoad);

    return () => {
      map.off('style.load', onStyleLoad);
      map.off('zoomend', handleZoomEnd);
    };
  }, [mapRef, displayThreads, handleZoomEnd]);

  return { displayThreads };
};
