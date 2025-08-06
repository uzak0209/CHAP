'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { LoadingSpinner } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, ChevronRight, Heart, MessageCircle, MapPin } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/store';
import { getAuthToken } from '@/store/authSlice';
import { Thread, Post, Status } from '@/types/types';

// 2ちゃんねる風のレス表示コンポーネント
const ThreadResponse = ({ 
  number, 
  content, 
  userId, 
  createdTime, 
  isOP = false 
}: {
  number: number;
  content: string;
  userId: string;
  createdTime: string;
  isOP?: boolean;
}) => (
  <div className="border-b border-gray-200 py-3 hover:bg-gray-50">
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0">
        <span className={`inline-block px-2 py-1 text-xs font-mono rounded ${
          isOP ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'
        }`}>
          {number}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <span className="font-mono">
            {isOP ? '★' : ''}名無しさん@{userId.substring(0, 8)}
          </span>
          <span>{new Date(createdTime).toLocaleString('ja-JP')}</span>
          {isOP && <span className="text-red-600 font-bold">[スレ主]</span>}
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {content}
        </div>
      </div>
    </div>
  </div>
);

// 2ちゃんねる風のスレッド情報ヘッダー
const ThreadHeader = ({ thread, replyCount }: { thread: Thread; replyCount: number }) => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
    <h1 className="text-lg font-bold text-blue-900 mb-2">
      {thread.content}
    </h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-blue-700">
      <div className="flex items-center gap-1">
        <MessageCircle className="w-3 h-3" />
        <span>レス数: {replyCount}</span>
      </div>
      <div className="flex items-center gap-1">
        <Heart className="w-3 h-3" />
        <span>{thread.like}</span>
      </div>
    </div>
  </div>
);

export default function ThreadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = params.id as string;
  
  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newResponse, setNewResponse] = useState('');
  const [posting, setPosting] = useState(false);
  const [name, setName] = useState('');

  const dispatch = useAppDispatch();

  // スレッド情報とレス一覧を取得
  useEffect(() => {
    const fetchThreadDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/api/v1/thread/${threadId}/details`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch thread details');
        }
        
        const data = await response.json();
        setThread(data.thread);
        setReplies(data.replies || []);
        
        console.log('Thread details loaded:', data);
      } catch (error) {
        console.error('Failed to fetch thread details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (threadId) {
      fetchThreadDetails();
    }
  }, [threadId]);

  const handlePostResponse = async () => {
    if (!newResponse.trim()) return;
    
    setPosting(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:8080/api/v1/thread/${threadId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ 
          content: newResponse,
          valid: true,
          like: 0,
          tags: []
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to post reply');
      }
      
      const result = await response.json();
      console.log('Reply posted:', result);
      
      // レスが投稿されたら一覧を再取得
      const refreshResponse = await fetch(`http://localhost:8080/api/v1/thread/${threadId}/details`);
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setReplies(refreshData.replies || []);
      }
      
      setNewResponse('');
      setName('');
      
    } catch (error) {
      console.error('Failed to post response:', error);
      alert('レスの投稿に失敗しました: ' + error);
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="スレッド詳細" showNavigation={false}>
        <div className="flex justify-center items-center min-h-64">
          <LoadingSpinner />
          <span className="ml-2">スレッドを読み込み中...</span>
        </div>
      </AppLayout>
    );
  }

  if (!thread) {
    return (
      <AppLayout title="スレッド詳細" showNavigation={false}>
        <div className="p-4 max-w-4xl mx-auto">
          <div className="text-center text-gray-500 mt-8">
            <p>スレッドが見つかりません</p>
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="スレッド詳細" showNavigation={false}>
      <div className="p-4 max-w-4xl mx-auto">
        {/* 戻るボタン */}
        <Button 
          onClick={() => router.back()} 
          variant="outline" 
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          スレッド一覧に戻る
        </Button>

        {/* スレッド情報ヘッダー */}
        <ThreadHeader thread={thread} replyCount={replies.length} />

        {/* レス一覧 */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="bg-gray-100 px-4 py-2 border-b">
              <h2 className="text-sm font-bold text-gray-700">
                レス一覧 ({replies.length + 1}件) {/* スレッド本体 + レス */}
              </h2>
            </div>
            <div className="divide-y">
              {/* スレッド本体を1番として表示 */}
              <ThreadResponse
                number={1}
                content={thread.content}
                userId={thread.user_id}
                createdTime={thread.created_at}
                isOP={true}
              />
              {/* レス一覧 */}
              {replies.map((reply, index) => (
                <ThreadResponse
                  key={reply.id}
                  number={index + 2} // スレッド本体が1なので2から開始
                  content={reply.content}
                  userId={reply.user_id}
                  createdTime={reply.created_at}
                  isOP={false}
                />
              ))}
              {replies.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  まだレスがありません。最初のレスを投稿してみましょう！
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* レス投稿フォーム */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-bold mb-4">レスを書く</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  名前（省略可）
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="名無しさん"
                  className="w-full md:w-1/3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  内容 *
                </label>
                <Textarea
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  placeholder="レスを入力してください..."
                  className="min-h-24"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handlePostResponse}
                  disabled={!newResponse.trim() || posting}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {posting ? '投稿中...' : 'レスする'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setNewResponse('');
                    setName('');
                  }}
                >
                  クリア
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
