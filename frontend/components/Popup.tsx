import React, { useState } from 'react';
import { Post, Thread, Event, Content as Context } from '@/types/types';
import { Heart, MessageCircle, Star, CalendarDays } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// 型チェック関数
const isPost = (popup: Context): popup is Post => popup.type === 'post';
const isThread = (popup: Context): popup is Thread => popup.type === 'thread';
const isEvent = (popup: Context): popup is Event => popup.type === 'event';

// カテゴリごとのデザイン設定（淡色・半透明・控えめな色）
const getPopupStyles = (popup: Context) => {
  if (isPost(popup)) {
    return {
      bg: 'bg-white/80 backdrop-blur border border-blue-200',
      icon: <Star className="w-4 h-4 text-blue-400 opacity-70" />,
      badge: 'bg-blue-100 text-blue-700',
      label: 'POST',
      labelColor: 'text-blue-600',
    };
  } else if (isThread(popup)) {
    return {
      bg: 'bg-white/80 backdrop-blur border border-yellow-200',
      icon: <MessageCircle className="w-4 h-4 text-yellow-400 opacity-70" />,
      badge: 'bg-yellow-100 text-yellow-700',
      label: 'THREAD',
      labelColor: 'text-yellow-600',
    };
  } else if (isEvent(popup)) {
    return {
      bg: 'bg-white/80 backdrop-blur border border-pink-200',
      icon: <CalendarDays className="w-4 h-4 text-pink-400 opacity-70" />,
      badge: 'bg-pink-100 text-pink-700',
      label: 'EVENT',
      labelColor: 'text-pink-600',
    };
  }
  // デフォルト
  return {
    bg: 'bg-white/80 backdrop-blur border border-gray-200',
    icon: null,
    badge: 'bg-gray-100 text-gray-700',
    label: 'POST',
    labelColor: 'text-gray-600',
  };
};

export const Popup: React.FC<{ popup: Context; selectedCategory?: string }> = ({
  popup,
  selectedCategory = 'all'
}) => {
  const popID = popup.id;
  const updatedAt = popup.updated_at;
  const category = popup.category;
  const showPopup = selectedCategory === 'all' || selectedCategory === category;
  const styles = getPopupStyles(popup);

  // z-index制御用
  const [isActive, setIsActive] = useState(false);

  // スレッドクリックで遷移
  const handlePopupClick = () => {
    if (isThread(popup)) {
      window.location.href = `/threads/${popup.id}`;
    }
  };

  const handleMouseEnter = () => setIsActive(true);
  const handleMouseLeave = () => setIsActive(false);

  return (
    showPopup && (
      <Card
        className={`
          relative max-w-sm
          ${styles.bg}
          rounded-xl shadow-md transition-transform duration-200
          ${isThread(popup) ? 'cursor-pointer hover:scale-105' : ''}
        `}
        key={popID}
        style={{
          maxWidth: '20rem',
          borderWidth: 1,
          zIndex: isActive ? 50 : 10, // ホバー・アクティブ時に最前面
        }}
        onClick={handlePopupClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-center gap-2 absolute left-4 -top-4">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm border ${styles.badge} ${styles.labelColor}`}>
            {styles.icon} {styles.label}
          </span>
        </div>
        <CardContent className="p-4 pt-6">
          <p className="text-base font-medium text-gray-900 leading-relaxed mb-2">
            {popup.content}
          </p>
          {isThread(popup) && (
            <p className="text-xs text-yellow-700 italic mb-2">
              タップしてスレッドを開く
            </p>
          )}
          <div className="flex justify-between items-center text-xs mt-2">
            <Button
              variant="ghost"
              className="flex items-center gap-1 p-0 h-auto bg-transparent hover:bg-transparent shadow-none focus-visible:ring-0"
            >
            </Button>
            <Badge className={`${styles.badge} px-2 py-0.5 rounded-full`}>
              {new Date(updatedAt || '').toLocaleDateString()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  );
};