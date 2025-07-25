import mapboxgl from 'mapbox-gl';
import { Thread, ThreadGroup } from '../types/thread';

export const getOverlapThreshold = (zoom: number): number => {
  if (zoom < 10) return 100;
  if (zoom < 13) return 80;
  if (zoom < 15) return 60;
  if (zoom < 17) return 40;
  return 20;
};

export const calculatePixelDistance = (
  map: mapboxgl.Map,
  coord1: [number, number],
  coord2: [number, number]
): number => {
  const point1 = map.project(coord1);
  const point2 = map.project(coord2);
  
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  
  return Math.sqrt(dx * dx + dy * dy);
};

export const groupOverlappingThreads = (threads: Thread[], map: mapboxgl.Map): ThreadGroup[] => {
  const currentZoom = map.getZoom();
  const PIXEL_THRESHOLD = getOverlapThreshold(currentZoom);
  
  const groups: ThreadGroup[] = [];
  const processed = new Set<number>();

  threads.forEach((thread, index) => {
    if (processed.has(index)) return;

    const overlappingThreads = [thread];
    processed.add(index);

    // 他のスレッドと画面上の距離を比較
    threads.forEach((otherThread, otherIndex) => {
      if (otherIndex === index || processed.has(otherIndex)) return;

      // ★カテゴリが同じ場合のみグループ化
      if (thread.category !== otherThread.category) return;

      const pixelDistance = calculatePixelDistance(map, thread.coordinates, otherThread.coordinates);
      if (pixelDistance < PIXEL_THRESHOLD) {
        overlappingThreads.push(otherThread);
        processed.add(otherIndex);
      }
    });

    // 最新のコメントを代表として選ぶ
    const mainThread = overlappingThreads.sort((a, b) => 
      new Date(`2024-01-01 ${b.timestamp}`).getTime() - 
      new Date(`2024-01-01 ${a.timestamp}`).getTime()
    )[0];

    groups.push({
      mainThread,
      overlappingCount: overlappingThreads.length,
      allThreads: overlappingThreads
    });
  });

  return groups;
};
