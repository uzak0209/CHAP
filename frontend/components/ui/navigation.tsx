'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, MessageCircle, Bell, User, Map, Settings, Flag, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'ホーム', href: '/posts', icon: Home },
  { name: 'マップ', href: '/map-back', icon: Map },
  { name: '通知', href: '/notifications', icon: Bell },
  { name: 'イベント', href: '/events', icon: Flag },
  { name: 'スレッド', href: '/threads', icon: MessageSquare }
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-50">
      <div className="grid grid-cols-5 w-full justify-between ">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center py-3 px-3 text-xs transition-colors duration-200',
                isActive
                  ? 'text-primary font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className={cn(
                'w-6 h-6 mb-1',
                item.name === '投稿' && 'w-7 h-7' // 投稿ボタンは少し大きく
              )} />
              <span className="text-[11px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function TopNavigation({ title, showBack = false, onBack }: {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 safe-area-pt">
      <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
        <div className="flex items-center">
          {showBack && (
            <button
              onClick={onBack}
              className="mr-3 p-1 rounded-md hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        
        <Link href="/settings" className="p-2 rounded-md hover:bg-gray-100">
          <Settings className="w-5 h-5 text-gray-600" />
        </Link>
      </div>
    </header>
  );
} 