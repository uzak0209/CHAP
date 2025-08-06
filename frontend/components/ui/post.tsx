import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostProps {
  message: string;
  author?: string;
  timestamp?: string;
  className?: string;
  onClose?: () => void;
}

const Post: React.FC<PostProps> = ({ message, author, timestamp, className, onClose }) => {
  return (
    <Card className={cn(
      "relative max-w-sm bg-white border border-gray-200  rounded-2xl",
      className
    )}>
      {/* 吹き出しの矢印 */}
      <div className="absolute -bottom-2 left-5 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" />
      
      {/* 閉じるボタン */}
      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      {/* //メッセージコンテンツ */}
      <CardContent className="p-4">
        <p className="text-sm text-gray-900 leading-relaxed">
          {message}
        </p>
      </CardContent>
      
      {(author || timestamp) && (
        <CardFooter className="px-3 py-1 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
          <div className="flex justify-between items-center w-full text-xs text-gray-500">
            {author && <span className="font-medium">{author}</span>}
            {timestamp && <span>{timestamp}</span>}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default Post;
