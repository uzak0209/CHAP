import { Post, Thread } from '@/types/types';

// マーカー関連の型定義
export interface MarkerRefs {
  markersRef: React.MutableRefObject<mapboxgl.Marker[]>;
  threadMarkersRef: React.MutableRefObject<mapboxgl.Marker[]>;
  eventMarkersRef: React.MutableRefObject<mapboxgl.Marker[]>;
  currentLocationMarkerRef: React.MutableRefObject<mapboxgl.Marker | null>;
}

// マーカー追加関数の型
export interface MarkerFunctions {
  addPostMarkers: () => void;
  addThreadMarkers: () => void;
  addEventMarkers: () => void;
  addCurrentLocationMarker: () => void;
}

// マップ制御関数の型
export interface MapControlFunctions {
  toggle3D: () => void;
  changeMapView: (view: number) => void;
}