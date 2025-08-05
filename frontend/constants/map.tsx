

export const MAPBOX_CONFIG = {
  CENTER: [136.918320, 35.157171] as [number, number],
  ZOOM: 15.27,
  PITCH: 42,
  BEARING: -50,
  STYLE: 'mapbox://styles/mapbox/standard',
  MIN_ZOOM: 5,
  MAX_ZOOM: 50,
  LANGUAGE: 'ja',
  LIGHT_PRESET: 'dusk'
} as const;

export const POPUP_CONFIG = {
  ANCHOR: 'center' as const,
  OFFSET: [0, 0] as [number, number],
  CLOSE_BUTTON: false,
  CLOSE_ON_CLICK: false,
  CLASS_NAME: 'custom-popup'
} as const;




