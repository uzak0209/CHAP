import { sendMessage } from './api.js';
export function renderMap(lat, lng, map) {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}
export function addMarker(lat, lng, message, map, object) {
    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup(message).openPopup();
    sendMessage(object);
}
