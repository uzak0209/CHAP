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

      );
    }
  }, []);
  
  return location;
} 