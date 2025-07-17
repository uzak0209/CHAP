import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThreadProps {
  message: string;
  author?: string;
  timestamp?: string;
  className?: string;
  onClose?: () => void;
  replyCount?: number;
  onThreadClick?: () => void;
}

const Thread: React.FC<ThreadProps> = ({ message, author, timestamp, className, onClose, replyCount = 0, onThreadClick }) => {
  return (
    <Card className={cn(
      "relative max-w-sm bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-lg rounded-2xl",
      className
    )}>
      {/* 吹き出しの矢印 */}
      <div className="absolute -bottom-2 left-5 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-blue-50 drop-shadow-sm" />
      
      {/* 閉じるボタン */}
      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-blue-100 rounded-full"
          onClick={onClose}
        >
          <X className="h-4 w-4 text-blue-600" />
        </Button>
      )}
      
      {/* スレッドアイコン */}
      <button 
        className="absolute top-2 left-2 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer z-10"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          console.log('Thread icon clicked!'); // デバッグ用
          console.log('onThreadClick exists:', !!onThreadClick);
          console.log('onThreadClick type:', typeof onThreadClick);
          if (onThreadClick) {
            console.log('Calling onThreadClick...');
            onThreadClick();
          } else {
            console.log('onThreadClick is undefined or null');
          }
        }}
      >
        <MessageCircle className="h-3 w-3 text-white" />
      </button>
      
      {/* メッセージコンテンツ */}
      <CardContent className="p-4 pt-8">
        <p className="text-sm text-blue-900 leading-relaxed">
          {message}
        </p>
      </CardContent>
      
      {(author || timestamp || replyCount > 0) && (
        <CardFooter className="px-3 py-1 bg-blue-100/50 border-t border-blue-200 rounded-b-2xl">
          <div className="flex justify-between items-center w-full text-xs text-blue-600">
            <div className="flex items-center space-x-2">
              {author && <span className="font-medium">{author}</span>}
              {replyCount > 0 && (
                <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs">
                  {replyCount} 返信
                </span>
              )}
            </div>
            {timestamp && <span>{timestamp}</span>}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default Thread;
