import * as Types from './types.js';
import { sendMessage } from './api.js';
declare const L: typeof import("leaflet");
export function renderMap(map:L.Map) {
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
}

export function addMarker(lat: number, lng: number, message:string, map:L.Map, object:Types.MapObject) {
  const marker = L.marker([lat, lng]).addTo(map);
  marker.bindPopup(message).openPopup();
  sendMessage(object)
}

