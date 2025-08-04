// カテゴリを日本語に変換するユーティリティ関数
export const getCategoryName = (category: string) => {
  switch (category) {
    case 'entertainment': return 'エンターテイメント';
    case 'community': return 'コミュニティ';
    case 'information': return '情報';
    case 'disaster': return '災害';
    case 'event': return 'イベント';
    default: return category;
  }
};

// カテゴリに基づいてマーカーの色を決定するユーティリティ関数
export const getMarkerColor = (category: string) => {
  switch (category) {
    case 'entertainment': return '#ff6b6b';  // エンターテイメント（赤）
    case 'community': return '#4ecdc4';      // コミュニティ（青緑）
    case 'information': return '#45b7d1';    // 情報（青）
    case 'disaster': return '#ff4757';       // 災害（赤）
    case 'food': return '#feca57';           // 食事（黄）
    case 'event': return '#96ceb4';          // イベント（緑）
    default: return '#95a5a6';               // デフォルト（グレー）
  }
}; 