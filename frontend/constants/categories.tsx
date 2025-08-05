import { PostCategory, EventCategory } from '@/types/types';

// Base category options used across the application
export const CATEGORY_OPTIONS = [
  { value: 'entertainment' as const, label: 'エンターテイメント' },
  { value: 'community' as const, label: '地域住民コミュニケーション' },
  { value: 'disaster' as const, label: '災害情報' }
];

// Category options for posts and threads (same categories)
export const POST_CATEGORY_OPTIONS = CATEGORY_OPTIONS;
export const THREAD_CATEGORY_OPTIONS = CATEGORY_OPTIONS;

// Category options for events with additional placeholder option
export const EVENT_CATEGORY_OPTIONS = [
  { value: '' as const, label: 'カテゴリを選択してください' },
  ...CATEGORY_OPTIONS
];

// Helper function to get category label by value
export const getCategoryLabel = (value: PostCategory | EventCategory | ''): string => {
  const option = [...EVENT_CATEGORY_OPTIONS, ...CATEGORY_OPTIONS].find(opt => opt.value === value);
  return option?.label || '';
};

// Helper function to get category options by type
export const getCategoryOptions = (type: 'post' | 'thread' | 'event') => {
  switch (type) {
    case 'post':
      return POST_CATEGORY_OPTIONS;
    case 'thread':
      return THREAD_CATEGORY_OPTIONS;
    case 'event':
      return EVENT_CATEGORY_OPTIONS;
    default:
      return CATEGORY_OPTIONS;
  }
};