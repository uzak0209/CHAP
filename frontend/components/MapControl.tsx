import React from 'react';

interface MapControlsProps {
  is3D: boolean;
  onToggle3D: () => void;
  onChangeMapView: (view: number) => void;
}

const MapControls: React.FC<MapControlsProps> = ({ is3D, onToggle3D, onChangeMapView }) => {
  return (
    <>
      {/* 2Dボタン */}
      <button
        className="absolute top-20 right-5 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-blue-600 text-lg font-bold hover:bg-blue-50 transition"
        onClick={() => onChangeMapView(1)}
      >
        2D
      </button>
      {/* 3Dボタン */}
      <button
        className="absolute top-40 right-5 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-blue-600 text-lg font-bold hover:bg-blue-50 transition"
        onClick={() => onChangeMapView(2)}
      >
        3D
      </button>
      {/* Globeボタン（無効化中の場合は非表示やdisabledにしてもOK） */}
      <button
        className="absolute top-60 right-5 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-blue-600 text-lg font-bold hover:bg-blue-50 transition"
        onClick={() => onChangeMapView(3)}
      >
        🌐
      </button>
      {/* 3D/2D切り替えトグル */}
      <button
        className={`absolute top-5 right-24 px-4 py-2 rounded-lg font-bold transition shadow-md ${
          is3D
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-blue-700 hover:bg-blue-100'
        }`}
        onClick={onToggle3D}
      >
        {is3D ? '2D表示' : '3D表示'}
      </button>
      {/* 現在のモード表示 */}
      <div
        className="absolute bottom-5 left-20 px-4 py-2 bg-black/70 text-white rounded-full text-xs font-medium z-50"
      >
        現在のモード: {is3D ? '3D' : '2D'}
      </div>
    </>
  );
};

export default MapControls;