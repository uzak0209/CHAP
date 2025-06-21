import { NextRequest, NextResponse } from 'next/server';

// Sample posts data
const samplePosts = [
  {
    id: '1',
    userId: 'user1',
    content: '桜が綺麗に咲いています！上野公園にて。',
    images: ['https://picsum.photos/400/300?random=1'],
    tags: ['桜', 'イベント', '上野'],
    reactions: {
      likes: 15,
      comments: 3
    },
    distance: 0.5,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30分前
  },
  {
    id: '2',
    userId: 'user2',
    content: '美味しいラーメンを発見！渋谷の隠れた名店です。',
    images: ['https://picsum.photos/400/300?random=2'],
    tags: ['グルメ', 'ラーメン', '渋谷'],
    reactions: {
      likes: 8,
      comments: 2
    },
    distance: 1.2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1時間前
  },
  {
    id: '3',
    userId: 'user3',
    content: '新しいカフェがオープンしました！コーヒーが絶品です☕',
    images: ['https://picsum.photos/400/300?random=3'],
    tags: ['カフェ', 'コーヒー', '新宿'],
    reactions: {
      likes: 12,
      comments: 5
    },
    distance: 2.1,
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString() // 1.5時間前
  },
  {
    id: '4',
    userId: 'user4',
    content: 'ショッピングモールで素敵な服を見つけました！',
    tags: ['ショッピング', 'ファッション', '原宿'],
    reactions: {
      likes: 6,
      comments: 1
    },
    distance: 3.0,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2時間前
  },
  {
    id: '5',
    userId: 'user5',
    content: '夕日がとても美しいです。お台場から見る景色は最高！',
    images: ['https://picsum.photos/400/300?random=4'],
    tags: ['夕日', '景色', 'お台場'],
    reactions: {
      likes: 20,
      comments: 4
    },
    distance: 5.5,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString() // 3時間前
  }
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius');

  // シミュレート: 位置情報に基づいてフィルタリング（実際のアプリではデータベースクエリ）
  let filteredPosts = [...samplePosts];
  
  if (radius) {
    const maxDistance = parseFloat(radius);
    filteredPosts = samplePosts.filter(post => (post.distance || 0) <= maxDistance);
  }

  // 位置情報のログ（開発用）
  console.log(`Posts requested for location: lat=${lat}, lng=${lng}, radius=${radius}`);
  console.log(`Returning ${filteredPosts.length} posts`);

  return NextResponse.json({
    posts: filteredPosts,
    location: {
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null
    },
    total: filteredPosts.length
  });
} 