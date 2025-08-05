'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Heart, MessageCircle, AlertTriangle, Info } from 'lucide-react';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'system' | 'admin';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    title: 'いいねがつきました',
    message: '田中太郎さんがあなたの投稿にいいねしました',
    time: '5分前',
    read: false,
  },
  {
    id: '2',
    type: 'comment',
    title: 'コメントがつきました',
    message: '佐藤花子さんがあなたの投稿にコメントしました',
    time: '1時間前',
    read: true,
  },
  {
    id: '3',
    type: 'admin',
    title: '管理者からのお知らせ',
    message: '桜祭りイベントが開催されます',
    time: '3時間前',
    read: false,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const filteredNotifications = notifications.filter(
    notif => filter === 'all' || !notif.read
  );

  return (
    <AppLayout title="通知">
      <div className="p-4 max-w-2xl mx-auto">
        <NotificationHeader
          onMarkAllRead={markAllAsRead}
          filter={filter}
          onFilterChange={setFilter}
        />
        
        <div className="space-y-3">
          {filteredNotifications.map(notification => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={markAsRead}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

function NotificationHeader({ 
  onMarkAllRead, 
  filter, 
  onFilterChange 
}: {
  onMarkAllRead: () => void;
  filter: 'all' | 'unread';
  onFilterChange: (filter: 'all' | 'unread') => void;
}) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('all')}
        >
          すべて
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('unread')}
        >
          未読
        </Button>
      </div>
      <Button variant="outline" size="sm" onClick={onMarkAllRead}>
        すべて既読
      </Button>
    </div>
  );
}

function NotificationCard({ 
  notification, 
  onMarkRead 
}: { 
  notification: Notification;
  onMarkRead: (id: string) => void;
}) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment': return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'admin': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all ${
        !notification.read ? 'bg-blue-50 border-blue-200' : ''
      }`}
      onClick={() => onMarkRead(notification.id)}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            {getIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
              {notification.title}
            </p>
            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
            <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
          </div>
          {!notification.read && (
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 