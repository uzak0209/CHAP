# データ正規化ユーティリティ

データベースから取得したデータのプロパティ名を正規化するためのユーティリティ関数集です。

## 問題

データベースから取得されるデータは大文字プロパティ（`Content`, `Category`, `Coordinate`など）を使用していますが、TypeScript型定義は小文字プロパティ（`content`, `category`, `coordinate`など）を期待しています。

## 解決策

`dataTransform.tsx`の正規化関数を使用して、データベースの形式をTypeScript型定義に合わせて変換します。

## 使用方法

### 単体データの正規化

```typescript
import { normalizePostData, normalizeThreadData, normalizeEventData } from '@/utils/dataTransform';

// 投稿データの正規化
const normalizedPost = normalizePostData(rawPostFromDB);

// スレッドデータの正規化
const normalizedThread = normalizeThreadData(rawThreadFromDB);

// イベントデータの正規化
const normalizedEvent = normalizeEventData(rawEventFromDB);
```

### 複数データの一括正規化

```typescript
import { normalizePostsData, normalizeThreadsData, normalizeEventsData } from '@/utils/dataTransform';

// 複数投稿の一括正規化
const normalizedPosts = normalizePostsData(rawPostsFromDB);

// 複数スレッドの一括正規化
const normalizedThreads = normalizeThreadsData(rawThreadsFromDB);

// 複数イベントの一括正規化
const normalizedEvents = normalizeEventsData(rawEventsFromDB);
```

### デバッグログ付き正規化

```typescript
import { normalizePostData, logDataTransformation } from '@/utils/dataTransform';

const post = normalizePostData(rawPost);
logDataTransformation(rawPost, post, '投稿'); // コンソールに詳細ログを出力
```

## 使用箇所

- ✅ **地図マーカー** (`frontend/hooks/mapbox/markers.tsx`)
- ✅ **タイムライン** (`frontend/app/timeline/page.tsx`)
- 🔄 **イベント一覧** (`frontend/app/events/page.tsx`) - 今後対応
- 🔄 **スレッド一覧** (`frontend/app/threads/page.tsx`) - 今後対応

## データ変換例

### 変換前（データベースから取得）
```json
{
  "Category": "entertainment",
  "Content": "テストポスト",
  "Coordinate": {
    "Lat": 35.1508247,
    "Lng": 136.914369
  },
  "Like": 5,
  "Valid": true
}
```

### 変換後（TypeScript型定義に準拠）
```json
{
  "category": "entertainment",
  "content": "テストポスト",
  "coordinate": {
    "lat": 35.1508247,
    "lng": 136.914369
  },
  "like": 5,
  "valid": true
}
```

## 注意事項

- 正規化関数は大文字・小文字両方のプロパティに対応しています
- 存在しないプロパティに対してはデフォルト値を設定します
- デバッグモードでは変換前後のデータをコンソールに出力します