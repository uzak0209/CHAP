export async function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  if (!("geolocation" in navigator)) {
    throw new Error("このブラウザは位置情報に対応していません。");
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });

  const { latitude: lat, longitude: lng } = position.coords;
  return { lat, lng };
}
