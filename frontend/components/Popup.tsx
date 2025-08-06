import React from 'react';
import { Post, Thread, Event ,Content as Context} from '@/types/types';
import { Heart} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// 型ガード関数
const isPost = (popup: Context): popup is Post => {
  return true; 
};

const isThread = (popup: Context): popup is Thread => {
  return false; 
};

const isEvent = (popup: Context): popup is Event => {
  return false; 
};

const getPopupColors = (popup: Context) => {
  if (isPost(popup)) {
    // Post: 青色
    return {
      background: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      textColor: 'text-black-900',
      badgeColor: 'text-blue-600 bg-blue-100',
      arrow: '#eff6ff'
    };
  } else if (isThread(popup)) {
    // Thread: 黄色
    return {
      background: 'bg-gradient-to-br from-yellow-50 to-amber-50',
      border: 'border-yellow-200',
      textColor: 'text-black-900',
      badgeColor: 'text-yellow-600 bg-yellow-100',
      arrow: '#fefce8'
    };
  } else if (isEvent(popup)) {
    // Event: 赤色
    return {
      background: 'bg-gradient-to-br from-red-50 to-rose-50',
      border: 'border-red-200',
      textColor: 'text-black-900',
      badgeColor: 'text-red-600 bg-red-100',
      arrow: '#fef2f2'
    };
  }
  
  // デフォルト（Post扱い）
  return {
    background: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    textColor: 'text-black-900',
    badgeColor: 'text-blue-600 bg-blue-100',
    arrow: '#eff6ff'
  };
};

// Popupコンポーネントの定義
export const Popup: React.FC<{ popup: Context; selectedCategory?: string }> = ({ popup, selectedCategory = 'all' }) => {
  const popID = popup.id;
  const updatedAt = popup.updated_at;
  const category = popup.category;
  const showPopup = selectedCategory === 'all' || selectedCategory === category;
  const colors = getPopupColors(popup);

  return (
    showPopup && (
    <Card 
      className={`relative max-w-sm ${colors.background} ${colors.border}`}
      key={popID}
      style={{ maxWidth: '20rem' }}
    >
      <div 
        className="absolute -bottom-2 left-5 w-0 h-0" 
        style={{
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent', 
          borderTop: `8px solid ${colors.arrow}`
        }}
      />
      
      <CardContent className="p-4 pt-8">
        <p className={`text-sm ${colors.textColor} leading-relaxed mb-3`}>
          {popup.content}
        </p>
        <div className="flex justify-between items-center text-xs">
          <Button
            className="flex items-center gap-1 p-0 h-auto"
          >
            <Heart 
              id={`heart-post-${popID}`}
              className="w-3 h-3 text-white hover:scale-110 transition-transform"
              fill="white"
            />
            <span 
              id={`like-count-post-${popID}`}
              className="text-white font-medium"
            >
                {popup.like || 0} 
            </span>
          </Button>
          <Badge className={colors.badgeColor}>
            {new Date(updatedAt || '').toLocaleDateString()}
          </Badge>
        </div>
      </CardContent>
    </Card>
    )
  );
};

