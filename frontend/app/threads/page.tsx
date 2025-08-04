'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/Layout/AppLayout';
import { LoadingSpinner } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { MessageCircle, MapPin, Users, Tag, Heart } from 'lucide-react';

import { fetchAroundThreads, threadsActions } from '@/store/threadsSlice';
import { getCurrentLocation } from '@/store/locationSlice';
import { useAppDispatch, useAppSelector } from '@/store';
import { Thread, Status } from '@/types/types';

// スレッドカードコンポーネント
const ThreadCard = ({ thread }: { thread: Thread }) => {
  const router = useRouter();
  
  return (
    <Card className="w-full transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{thread.content}</CardTitle>
        <CardDescription className="flex items-center text-sm text-gray-500 pt-2">
          <Users className="w-4 h-4 mr-2" />
          <span>作成者: {thread.user_id.substring(0, 8)}...</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center">
          <MessageCircle className="w-5 h-5 mr-3 text-gray-600" />
          <div>
            <p className="font-semibold">作成日時</p>
            <p>{new Date(thread.created_time).toLocaleString()}</p>
          </div>
        </div>
        {/* <div className="flex items-center">
          <MapPin className="w-5 h-5 mr-3 text-gray-600" />
          <div>
            <p className="font-semibold">場所</p>
            <p>緯度: {thread.coordinate.lat.toFixed(4)}, 経度: {thread.coordinate.lng.toFixed(4)}</p>
          </div>
        </div> */}
        {thread.tags && thread.tags.length > 0 && (
          <div className="flex items-center">
            <Tag className="w-5 h-5 mr-3 text-gray-600" />
            <div className="flex flex-wrap gap-2">
              {thread.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            <span className="text-sm text-gray-500">{thread.like} </span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push(`/threads/${thread.id}`)}
          >
            詳細を見る
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ThreadsPage() {
  const [sortBy, setSortBy] = useState<'time' | 'distance'>('time');
  
  const dispatch = useAppDispatch();
  const { items: threads, loading, error } = useAppSelector(state => state.threads);
  const { state: locState, location, error: locError } = useAppSelector(state => state.location);
  const router = useRouter();

  // 位置情報取得とスレッドデータ取得
  useEffect(() => {
    if (locState === Status.IDLE) {
      dispatch(getCurrentLocation());
    }
  }, [dispatch, locState]);

  useEffect(() => {
    if ( locState === Status.LOADED) {
      dispatch(fetchAroundThreads({ lat: location.lat, lng: location.lng }));
    }
  }, [dispatch, location, locState]);

  const sortedThreads = useMemo(() => {
    return [...threads].sort((a, b) => {
      if (sortBy === 'time') {
        return new Date(b.created_time).getTime() - new Date(a.created_time).getTime();
      }
      // TODO: 距離でのソート
      return 0;
    });
  }, [threads, sortBy]);

  const renderContent = () => {
    if (locState === Status.LOADING) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
          <p className="mt-4 text-lg text-gray-600">位置情報を取得しています...</p>
        </div>
      );
    }

    if (locError) {
      return (
        <div className="text-center py-10">
          <p className="text-red-500 mb-4">位置情報の取得に失敗しました: {typeof locError === 'string' ? locError : locError}</p>
          <Button onClick={() => dispatch(getCurrentLocation())}>再試行</Button>
        </div>
      );
    }

    if (loading.fetch) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
          <p className="mt-4 text-lg text-gray-600">近くのスレッドを探しています...</p>
        </div>
      );
    }

    if (error.fetch) {
      return (
        <div className="text-center py-10">
          <p className="text-red-500 mb-4">スレッドの読み込みに失敗しました: {error.fetch}</p>
          <Button onClick={() => {
            dispatch(threadsActions.clearThreadErrors());
            if (location) {
              dispatch(fetchAroundThreads({ lat: location.lat, lng: location.lng }));
            }
          }}>再試行</Button>
        </div>
      );
    }

    if (sortedThreads.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-500">近くで開始されているスレッドはありません。</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedThreads.map(thread => (
          <ThreadCard key={thread.id} thread={thread} />
        ))}
      </div>
    );
  };

  return (
    <AppLayout title="スレッドを探す">
      <div className="container mx-auto p-4 md:p-6">
        <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">近くのスレッド</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/threads/create')}>スレッドを作成</Button>
            <Select onValueChange={(value: 'time' | 'distance') => setSortBy(value)} defaultValue={sortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="並び替え" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">新着順</SelectItem>
                <SelectItem value="distance">距離順</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>
        
        <main>
          {renderContent()}
        </main>
      </div>
      
      {/* フローティングスレッド作成ボタン */}
      <FloatingActionButton href="/threads/create" />
    </AppLayout>
  );
}
