import React from 'react';
import CircleButton from "@/components/ui/circle-button";

interface MapControlsProps {
  is3D: boolean;
  onToggle3D: () => void;
  onChangeMapView: (view: number) => void;
}

const MapControls: React.FC<MapControlsProps> = ({ is3D, onToggle3D, onChangeMapView }) => {
  return (
    <>
      {/* 円形ボタン */}
      <CircleButton
        position={{ top: '80px', right: '20px' }}
        onClick={() => onChangeMapView(1)}
        size="md"
        variant="default"
      >
        1
      </CircleButton>

      <CircleButton
        position={{ top: '160px', right: '20px' }}
        onClick={() => onChangeMapView(2)}
        size="md"
        variant="default"
      >
        2
      </CircleButton>

      <CircleButton
        position={{ top: '240px', right: '20px' }}
        onClick={() => onChangeMapView(3)}
        size="md"
        variant="default"
      >
        3
      </CircleButton>

      {/* 3D/2D切り替えボタン */}
      <button
        onClick={onToggle3D}
        style={{
          position: 'absolute',
          top: '20px',
          right: '80px',
          padding: '10px 20px',
          backgroundColor: is3D ? '#007cbf' : '#4a90e2',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '14px',
          fontWeight: 'bold',
          // boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
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
          bottom: '20px',
          left: '70px',
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
    </>
  );
};

export default MapControls;
