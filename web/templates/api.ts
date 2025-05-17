import { getCurrentLocation } from "./getCurrentLocation.js";
import * as Types from "./types.js";
export async function sendMessage(obj:Types.MapObject): Promise<void> {
    const res = await fetch("https://localhost:1111/api/message", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(obj)
    });
    if (!res.ok) {
        throw new Error("APIリクエストに失敗しました");
    }

}

export async function getThread(threadId: string): Promise<void> {
    const position=await getCurrentLocation();
    const res = await fetch(`https://your-api.example.com/api/thread/${threadId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"

        },
        body: JSON.stringify({ lat: position.lat, lng: position.lng })
    });

    if (!res.ok) {
        throw new Error("APIリクエストに失敗しました");
    }

}