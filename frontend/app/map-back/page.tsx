'use client';

import React from 'react';
import { useMapbox } from '@/hooks/useMapbox';
import { useThreads } from '@/hooks/useThreads';
import MapControls from '@/components/Map/MapControls';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapboxExample = () => {
  const { mapContainerRef, mapRef, is3D, toggle3D, changeMapView } = useMapbox();
  useThreads(mapRef);

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <div id="map" style={{ height: '100%', width: '100%' }} ref={mapContainerRef} />
      
      <MapControls
        is3D={is3D}
        onToggle3D={toggle3D}
        onChangeMapView={changeMapView}
      />
    </div>
  );
};

export default MapboxExample;