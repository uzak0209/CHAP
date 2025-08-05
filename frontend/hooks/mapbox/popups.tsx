import React from 'react';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import { Post, Thread, Event } from '@/types/types';
import { Heart, MessageCircle, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// 投稿ポップアップコンポーネント
export const PostPopup: React.FC<{ post: Post; onLike?: (postId: string) => void }> = ({ post, onLike }) => {
  const postId = post.id;
  const updatedAt = post.updated_at;

  return (
    <Card 
      className="relative max-w-sm bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg"
      data-post-id={postId}
      style={{ maxWidth: '20rem' }}
    >
      {/* 吹き出しの矢印 */}
      <div 
        className="absolute -bottom-2 left-5 w-0 h-0" 
        style={{
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent', 
          borderTop: '8px solid #eff6ff'
        }}
      />
      
      <CardContent className="p-4 pt-8">
        <p className="text-sm text-blue-900 leading-relaxed mb-3">
          {post.content}
        </p>
        <div className="flex justify-between items-center text-xs">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 p-0 h-auto"
            onClick={() => onLike?.(postId.toString())}
          >
            <Heart 
              id={`heart-post-${postId}`}
              className="w-3 h-3 text-white hover:scale-110 transition-transform"
              fill="white"
            />
            <span 
              id={`like-count-post-${postId}`}
              className="text-white font-medium"
            >
              {post.like || 0}
            </span>
          </Button>
          <Badge variant="secondary" className="text-blue-600 bg-blue-100">
            {new Date(updatedAt || '').toLocaleDateString()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};


// スレッドポップアップコンポーネント
export const ThreadPopup: React.FC<{ thread: Thread }> = ({ thread }) => {
  const threadId = thread.id;
  const createdAt = thread.created_at;

  return (
    <Card 
      className="relative max-w-sm bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg"
      data-thread-id={threadId}
      style={{ maxWidth: '20rem' }}
    >
      {/* 吹き出しの矢印 */}
      <div 
        className="absolute -bottom-2 left-5 w-0 h-0" 
        style={{
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid #f0fdf4'
        }}
      />
      
      <CardHeader className="p-4 pb-2">
        {thread.category && (
          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-100 w-fit mb-2">
            #{thread.category}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <CardDescription className="text-sm text-green-800 leading-relaxed mb-3">
          {thread.content}
        </CardDescription>
        <div className="flex justify-between items-center text-xs">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 p-0 h-auto"
          >
            <MessageCircle className="w-3 h-3 text-green-600" />
            <span className="text-green-600 font-medium">
              {thread.like || 0}
            </span>
          </Button>
          <Badge variant="secondary" className="text-green-600 bg-green-100">
            {new Date(createdAt || '').toLocaleDateString()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};


// カテゴリに基づくラベルを取得する関数
const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'entertainment': return 'エンターテイメント';
    case 'community': return '地域住民コミュニケーション';
    case 'disaster': return '災害情報';
    default: return 'その他';
  }
};

// カテゴリに基づく色設定を取得する関数
const getCategoryColors = (category: string) => {
  switch (category) {
    case 'entertainment':
      return {
        background: 'linear-gradient(to bottom right, #fef2f2, #fecaca)',
        border: '#fca5a5',
        iconBg: '#ef4444',
        textColor: '#991b1b',
        arrow: '#fef2f2'
      };
    case 'community':
      return {
        background: 'linear-gradient(to bottom right, #f0fdfa, #ccfbf1)',
        border: '#5eead4',
        iconBg: '#14b8a6',
        textColor: '#134e4a',
        arrow: '#f0fdfa'
      };
    case 'disaster':
      return {
        background: 'linear-gradient(to bottom right, #fef2f2, #fee2e2)',
        border: '#fca5a5',
        iconBg: '#dc2626',
        textColor: '#991b1b',
        arrow: '#fef2f2'
      };
    default:
      return {
        background: 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb)',
        border: '#d1d5db',
        iconBg: '#6b7280',
        textColor: '#374151',
        arrow: '#f3f4f6'
      };
  }
};

// イベントポップアップコンポーネント
export const EventPopup: React.FC<{ event: Event; onLike?: (eventId: string) => void }> = ({ event, onLike }) => {
  const eventId = event.id;
  const createdAt = event.created_at;

  return (
    <Card 
      className="relative max-w-sm bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 shadow-lg"
      data-event-id={eventId}
      style={{ maxWidth: '20rem' }}
    >
      {/* 吹き出しの矢印 */}
      <div 
        className="absolute -bottom-2 left-5 w-0 h-0" 
        style={{
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid #faf5ff'
        }}
      />
      
      <CardHeader className="p-4 pb-2">
        {event.category && (
          <Badge variant="outline" className="text-purple-700 border-purple-300 bg-purple-100 w-fit mb-2">
            <Calendar className="w-3 h-3 mr-1" />
            {event.category}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <CardDescription className="text-sm text-purple-800 leading-relaxed mb-3">
          {event.content}
        </CardDescription>
        <div className="flex justify-between items-center text-xs">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 p-0 h-auto"
            onClick={() => onLike?.(eventId.toString())}
          >
            <Heart className="w-3 h-3 text-purple-600" />
            <span className="text-purple-600 font-medium">
              {event.like || 0}
            </span>
          </Button>
          <Badge variant="secondary" className="text-purple-600 bg-purple-100">
            {new Date(createdAt || '').toLocaleDateString()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};


