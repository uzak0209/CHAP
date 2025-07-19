import { Thread } from '@/types/thread';

export const MAPBOX_CONFIG = {
  CENTER: [136.918320, 35.157171] as [number, number],
  ZOOM: 15.27,
  PITCH: 42,
  BEARING: -50,
  STYLE: 'mapbox://styles/mapbox/standard',
  MIN_ZOOM: 5,
  MAX_ZOOM: 50,
  LANGUAGE: 'ja',
  LIGHT_PRESET: 'dusk'
} as const;

export const POPUP_CONFIG = {
  ANCHOR: 'bottom' as const,
  OFFSET: [0, -10] as [number, number],
  CLOSE_BUTTON: false,
  CLOSE_ON_CLICK: false,
  CLASS_NAME: 'custom-popup'
} as const;

export const THREADS_DATA: Thread[] = [
  {
    id: 1,
    coordinates: [136.918320, 35.157171],
    message: "こんちには",
    author: "ユーザー1",
    timestamp: "14:30:25",
    replyCount: 3,
    category: 'entertainment',
    like: 8, // いいね数を追加
    replies: [
      { id: 1, message: "こんにちは！", author: "ユーザーA", timestamp: "14:31:10" },
      { id: 2, message: "今日は良い天気ですね", author: "ユーザーB", timestamp: "14:32:15" },
      { id: 3, message: "はじめまして", author: "ユーザーC", timestamp: "14:33:20" }
    ]
  },
  {
    id: 2,
    coordinates: [136.920320, 35.158171],
    message: "名古屋駅周辺はとても便利ですね！",
    author: "ユーザー2",
    timestamp: "14:35:12",
    replyCount: 1,
    category: 'community',
    like: 15, // いいね数を追加
    replies: [
      { id: 1, message: "本当にそうですね！交通の便が良いです", author: "ユーザーD", timestamp: "14:36:05" }
    ]
  },
  {
    id: 3,
    coordinates: [136.916320, 35.156171],
    message: "今日は良い天気です☀️",
    author: "ユーザー3",
    timestamp: "14:40:33",
    replyCount: 5,
    category: 'entertainment',
    like: 3, // いいね数を追加
    replies: [
      { id: 1, message: "本当に気持ちいいですね", author: "ユーザーX", timestamp: "14:41:00" },
      { id: 2, message: "散歩日和です", author: "ユーザーY", timestamp: "14:41:30" },
      { id: 3, message: "写真撮影にも最適", author: "ユーザーZ", timestamp: "14:42:00" },
      { id: 4, message: "外に出たくなります", author: "ユーザーW", timestamp: "14:42:30" },
      { id: 5, message: "青空が綺麗です", author: "ユーザーV", timestamp: "14:43:00" }
    ]
  },
  {
    id: 4,
    coordinates: [136.919320, 35.159171],
    message: "緊急：この地域で停電が発生しています",
    author: "ユーザー4",
    timestamp: "14:45:10",
    replyCount: 2,
    category: 'disaster',
    like: 12, // いいね数を追加
    replies: [
      { id: 1, message: "こちらも停電しています", author: "ユーザーE", timestamp: "14:46:00" },
      { id: 2, message: "電力会社に連絡済みです", author: "ユーザーF", timestamp: "14:47:00" }
    ]
  },
  {
    id: 5,
    coordinates: [136.917320, 35.155171],
    message: "この場所おすすめです✨",
    author: "ユーザー5",
    timestamp: "14:50:45",
    replyCount: 2,
    category: 'community',
    like: 7, // いいね数を追加
    replies: [
      { id: 1, message: "どんなところがおすすめですか？", author: "ユーザーJ", timestamp: "14:51:00" },
      { id: 2, message: "今度行ってみます！", author: "ユーザーK", timestamp: "14:51:30" }
    ]
  },
  // 重複テスト用: 同じカテゴリ(entertainment)で同じ場所にある複数のコメント
  {
    id: 6,
    coordinates: [136.918325, 35.157175], // id:1とほぼ同じ場所
    message: "お疲れ様です！今日も一日頑張りましょう",
    author: "ユーザー6",
    timestamp: "14:55:20",
    replyCount: 1,
    category: 'entertainment',
    like: 25, // id:1より多いいいね数（25 > 8）
    replies: [
      { id: 1, message: "頑張りましょう！", author: "ユーザーL", timestamp: "14:56:00" }
    ]
  },
  {
    id: 7,
    coordinates: [136.918318, 35.157169], // id:1とほぼ同じ場所
    message: "今日のランチはどこにしようかな🍽️",
    author: "ユーザー7",
    timestamp: "15:00:10",
    replyCount: 0,
    category: 'entertainment',
    like: 5, // id:1より少ないいいね数（5 < 8）
    replies: []
  },
  // より離れた位置での同じカテゴリ(entertainment)のテスト
  {
    id: 9,
    coordinates: [136.922320, 35.159500], // より離れた位置
    message: "映画館で新作を見てきました🎬",
    author: "ユーザー9",
    timestamp: "15:10:40",
    replyCount: 2,
    category: 'entertainment',
    like: 12,
    replies: [
      { id: 1, message: "どの映画でしたか？", author: "ユーザーP", timestamp: "15:11:00" },
      { id: 2, message: "私も見たいです！", author: "ユーザーQ", timestamp: "15:11:30" }
    ]
  },
  {
    id: 10,
    coordinates: [136.914000, 35.154000], // さらに離れた位置
    message: "カラオケ楽しかった〜🎤",
    author: "ユーザー10",
    timestamp: "15:15:20",
    replyCount: 1,
    category: 'entertainment',
    like: 20,
    replies: [
      { id: 1, message: "何を歌いましたか？", author: "ユーザーR", timestamp: "15:16:00" }
    ]
  },
  // コミュニティカテゴリの重複テスト
  {
    id: 8,
    coordinates: [136.917322, 35.155173], // id:5とほぼ同じ場所
    message: "このエリアのコーヒーショップが最高です！",
    author: "ユーザー8",
    timestamp: "15:05:30",
    replyCount: 3,
    category: 'community',
    like: 18, // id:5より多いいいね数（18 > 7）
    replies: [
      { id: 1, message: "どのお店ですか？", author: "ユーザーM", timestamp: "15:06:00" },
      { id: 2, message: "私も行ってみたいです", author: "ユーザーN", timestamp: "15:06:30" },
      { id: 3, message: "コーヒーが美味しいですよね", author: "ユーザーO", timestamp: "15:07:00" }
    ]
  },
  // 離れたコミュニティカテゴリのテスト
  {
    id: 11,
    coordinates: [136.925000, 35.160000], // 離れた位置
    message: "新しい図書館がオープンしました📚",
    author: "ユーザー11",
    timestamp: "15:20:15",
    replyCount: 1,
    category: 'community',
    like: 9,
    replies: [
      { id: 1, message: "利用してみたいです", author: "ユーザーS", timestamp: "15:21:00" }
    ]
  },
  // 地域住民コミュニケーションカテゴリ(community)のグループテスト
  {
    id: 12,
    coordinates: [136.918300, 35.157150], // 中心付近
    message: "近所の方と挨拶を交わしました😊",
    author: "ユーザー12",
    timestamp: "15:25:30",
    replyCount: 2,
    category: 'community',
    like: 22,
    replies: [
      { id: 1, message: "素敵ですね！", author: "ユーザーT", timestamp: "15:26:00" },
      { id: 2, message: "地域の絆は大切ですね", author: "ユーザーU", timestamp: "15:26:30" }
    ]
  },
  {
    id: 13,
    coordinates: [136.918310, 35.157160], // id:12とほぼ同じ場所
    message: "町内会の掃除に参加しました🧹",
    author: "ユーザー13",
    timestamp: "15:30:45",
    replyCount: 1,
    category: 'community',
    like: 15,
    replies: [
      { id: 1, message: "お疲れ様でした！", author: "ユーザーV", timestamp: "15:31:00" }
    ]
  },
  {
    id: 14,
    coordinates: [136.918290, 35.157140], // id:12と近い場所
    message: "隣の方から野菜をいただきました🥬",
    author: "ユーザー14",
    timestamp: "15:35:20",
    replyCount: 3,
    category: 'community',
    like: 18,
    replies: [
      { id: 1, message: "ご近所付き合いって温かいですね", author: "ユーザーW", timestamp: "15:36:00" },
      { id: 2, message: "新鮮な野菜は嬉しいですね", author: "ユーザーX", timestamp: "15:36:30" },
      { id: 3, message: "地域コミュニティの良さを感じます", author: "ユーザーY", timestamp: "15:37:00" }
    ]
  },
  {
    id: 15,
    coordinates: [136.918320, 35.157180], // id:12と近い場所
    message: "子どもたちが元気に挨拶してくれました👶",
    author: "ユーザー15",
    timestamp: "15:40:10",
    replyCount: 2,
    category: 'community',
    like: 25, // 最も多いいいね数
    replies: [
      { id: 1, message: "子どもの挨拶は心が温まりますね", author: "ユーザーZ", timestamp: "15:41:00" },
      { id: 2, message: "地域の宝ですね", author: "ユーザーAA", timestamp: "15:41:30" }
    ]
  },
  // 離れた位置の地域住民コミュニケーション
  {
    id: 16,
    coordinates: [136.921000, 35.159000], // 離れた位置
    message: "新しく引っ越してきた方にご挨拶👋",
    author: "ユーザー16",
    timestamp: "15:45:25",
    replyCount: 1,
    category: 'community',
    like: 12,
    replies: [
      { id: 1, message: "温かい地域ですね", author: "ユーザーBB", timestamp: "15:46:00" }
    ]
  }
];

export const LABEL_LAYERS = [
  'country-label',
  'state-label', 
  'settlement-label',
  'settlement-subdivision-label',
  'place-label',
  'poi-label',
  'road-label',
  'water-label',
  'airport-label',
  'transit-label',
  'building-label',
  'natural-label',
  'boundary-label',
  'waterway-label',
  'rail-label',
  'bridge-label',
  'tunnel-label',
  'ferry-label',
  'aerialway-label',
  'cable-car-label',
  'subway-label',
  'bus-label',
  'parking-label',
  'hospital-label',
  'school-label',
  'university-label',
  'library-label',
  'museum-label',
  'theatre-label',
  'cinema-label',
  'restaurant-label',
  'cafe-label',
  'bar-label',
  'hotel-label',
  'shop-label',
  'bank-label',
  'post-office-label',
  'police-label',
  'fire-station-label',
  'church-label',
  'temple-label',
  'shrine-label',
  'mosque-label',
  'synagogue-label',
  'cemetery-label',
  'park-label',
  'playground-label',
  'sports-centre-label',
  'stadium-label',
  'swimming-pool-label',
  'golf-course-label',
  'tennis-court-label',
  'football-pitch-label',
  'baseball-field-label',
  'basketball-court-label',
  'volleyball-court-label',
  'table-tennis-label',
  'badminton-court-label',
  'squash-court-label',
  'bowling-alley-label',
  'fitness-centre-label',
  'gym-label',
  'yoga-studio-label',
  'dance-studio-label',
  'martial-arts-label',
  'climbing-wall-label',
  'ice-rink-label',
  'ski-slope-label',
  'snow-park-label',
  'beach-label',
  'marina-label',
  'harbour-label',
  'port-label',
  'airport-terminal-label',
  'helipad-label',
  'gas-station-label',
  'charging-station-label',
  'car-wash-label',
  'car-rental-label',
  'taxi-stand-label',
  'bus-station-label',
  'train-station-label',
  'subway-station-label',
  'tram-stop-label',
  'ferry-terminal-label',
  'cable-car-station-label',
  'aerialway-station-label',
  'bicycle-parking-label',
  'bicycle-rental-label',
  'motorcycle-parking-label',
  'car-parking-label',
  'truck-parking-label',
  'rv-parking-label',
  'boat-parking-label',
  'airplane-parking-label',
  'helicopter-parking-label',
  'bicycle-shop-label',
  'motorcycle-shop-label',
  'car-dealer-label',
  'truck-dealer-label',
  'boat-dealer-label',
  'airplane-dealer-label',
  'helicopter-dealer-label',
  'bicycle-repair-label',
  'motorcycle-repair-label',
  'car-repair-label',
  'truck-repair-label',
  'boat-repair-label',
  'airplane-repair-label',
  'helicopter-repair-label'
] as const;
