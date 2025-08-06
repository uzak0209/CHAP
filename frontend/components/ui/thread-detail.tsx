import React from 'react';
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, MessageCircle, Reply, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThreadReply {
  id: number;
  message: string;
  author: string;
  timestamp: string;
}

interface ThreadDetailProps {
  message: string;
  author: string;
  timestamp: string;
  like: number;
  replies: ThreadReply[];
  onClose: () => void;
  className?: string;
}

const ThreadDetail: React.FC<ThreadDetailProps> = ({ 
  message, 
  author, 
  timestamp,
  like,
  replies, 
  onClose, 
  className 
}) => {
  return (
    <Card className={cn(
      "w-80 max-h-96 bg-transparent border-none shadow-none rounded-2xl overflow-hidden",
      className
    )}>
      {/* ヘッダー */}
      <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">スレッド</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-white bg:white rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* メインメッセージ */}
      <CardContent className="p-4 border-none bg-transparent">
        <div className="space-y-2">
          <p className="text-sm text-gray-900 leading-relaxed">{message}</p>
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span className="text-red-500 font-medium">{like}</span>
            </div>
            <div className="text-gray-500">
              <span className="font-medium">{author}</span>
              <span className="ml-2">{timestamp}</span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* 返信一覧 */}
      <div className="max-h-48 overflow-y-auto bg-transparent">
        {replies.map((reply) => (
          <div key={reply.id} className="p-3 border-none bg-transparent last:border-b-0">
            <div className="flex items-start space-x-2">
              <Reply className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <p className="text-sm text-gray-800">{reply.message}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="font-medium">{reply.author}</span>
                  <span>{reply.timestamp}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* フッター */}
      <CardFooter className="bg-transparent p-3 border-none">
        <div className="flex items-center justify-between w-full text-xs text-gray-500">
          <span>{replies.length}件の返信</span>
          <Button 
            variant="outline" 
            size="sm"
            className="h-6 px-2 text-xs bg-transparent border-gray-300"
          >
            返信する
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ThreadDetail;
