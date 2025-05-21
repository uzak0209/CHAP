import { getCurrentLocation } from './getCurrentLocation.js';
import { renderMap, addMarker } from './map.js';
import * as Types from './types.js';
import { MapObject } from './types.js';

(async () => {
    try {
        const { lat, lng } = await getCurrentLocation();
        console.log("現在地:", lat, lng);
        const map = L.map('map').setView([lat, lng], 15);
        renderMap(map);
        const time= new Date();
        addMarker(lat, lng, "現在地", map, {
            lat: lat,
            lng: lng,
            user_id: 1,
            content: "私はここにいます",
            created_time: time.toLocaleString('ja-JP'),
            type: Types.ObjectType.MESSAGE,
            valid: true,
        });
    } catch (err) {
        if (err instanceof Error) {
            console.error(err.message);
        } else {
            console.error("Unknown error", err);
        }
    }
})();
