import { useState, useEffect } from 'react';

export function useLocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation({ 
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude 
        }),
        () => setLocation({ lat: 35.6762, lng: 139.6503 }) // 東京駅をデフォルト
      );
    }
  }, []);
  
  return location;
} 