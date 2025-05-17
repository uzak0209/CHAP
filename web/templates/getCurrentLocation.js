export async function getCurrentLocation() {
    if (!("geolocation" in navigator)) {
        throw new Error("このブラウザは位置情報に対応していません。");
    }
    const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    const { latitude: lat, longitude: lng } = position.coords;
    return { lat, lng };
}
