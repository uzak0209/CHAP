'use client';

import React from 'react';
import { useMapbox } from '@/hooks/useMapbox';
import { useThreads } from '@/hooks/useThreads';
import MapControls from '@/components/Map/MapControls';
import { MultiModalFAB } from '@/components/ui/multi-modal-fab';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapBackPage() {
  const { mapContainerRef, mapRef, is3D, toggle3D, changeMapView } = useMapbox();
  const { displayThreads } = useThreads(mapRef);

  return (
    <div className="h-full w-full relative">
      {/* マップコンテナ */}
      <div 
        id="map" 
        className="h-full w-full" 
        ref={mapContainerRef} 
      />
      
      {/* マップコントロール */}
      <MapControls
        is3D={is3D}
        onToggle3D={toggle3D}
        onChangeMapView={changeMapView}
      />
      
      {/* フローティング投稿ボタン */}
      <MultiModalFAB />
    </div>
  );
}
