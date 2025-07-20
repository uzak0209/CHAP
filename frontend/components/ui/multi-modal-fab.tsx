'use client';

import React, { useState } from 'react';
import { Button } from './button';
import { Plus, MessageSquareText, Image, X } from 'lucide-react';
import { CreatePostModal } from '@/components/Post/CreatePostModal';
import { CreateThreadModal } from '@/components/Thread/CreateThreadModal';

interface MultiModalFABProps {
  className?: string;
}

export function MultiModalFAB({ className = '' }: MultiModalFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showThreadModal, setShowThreadModal] = useState(false);

  const actions = [
    {
      icon: <Image className="h-5 w-5" />,
      label: '投稿作成',
      onClick: () => {
        setIsOpen(false);
        setShowPostModal(true);
      },
      bgColor: 'bg-green-600 hover:bg-green-700'
    },
    {
      icon: <MessageSquareText className="h-5 w-5" />,
      label: 'スレッド作成',
      onClick: () => {
        setIsOpen(false);
        setShowThreadModal(true);
      },
      bgColor: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  return (
    <>
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        {/* アクションボタン群 */}
        {isOpen && (
          <div className="flex flex-col gap-3 mb-3">
            {actions.map((action, index) => (
              <div
                key={index}
                className="flex items-center gap-3 transform transition-all duration-200 ease-out"
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animation: isOpen ? 'slideUp 0.3s ease-out forwards' : 'none'
                }}
              >
                <span className="bg-black/80 text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap">
                  {action.label}
                </span>
                <Button
                  onClick={action.onClick}
                  className={`
                    h-12 w-12 rounded-full shadow-lg hover:shadow-xl
                    text-white transition-all duration-200 ease-in-out
                    transform hover:scale-105
                    ${action.bgColor}
                  `}
                  size="icon"
                >
                  {action.icon}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* メインボタン */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            h-14 w-14 rounded-full
            ${isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
            text-white shadow-lg hover:shadow-xl
            transition-all duration-200 ease-in-out
            transform hover:scale-105 ${isOpen ? 'rotate-45' : ''}
          `}
          size="icon"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </Button>
      </div>

      {/* モーダル */}
      <CreatePostModal 
        isOpen={showPostModal} 
        onClose={() => setShowPostModal(false)} 
      />
      <CreateThreadModal 
        isOpen={showThreadModal} 
        onClose={() => setShowThreadModal(false)} 
      />
    </>
  );
}
