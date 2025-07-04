'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { PostCard } from '@/components/Post/PostCard';
import { PostFilters } from '@/components/Post/PostFilters';
import { LoadingSpinner } from '@/components/ui/loading';
import { Post } from '@/types/types';

import { fetchAroundPosts, fetchPost, postsActions } from '@/store/postsSlice';
import { getCurrentLocation } from '@/store/locationSlice';
import { useAppDispatch, useAppSelector } from '@/store';

export default function PostPage() {
  const [sortBy, setSortBy] = useState<'time' | 'distance'>('time');
  const [filter, setFilter] = useState<string>('all');
  
  const dispatch = useAppDispatch();
  const { items: posts, loading, error } = useAppSelector(state => state.posts);
  const { current: location, loading: locationLoading } = useAppSelector(state => state.location);

  // 位置情報取得と投稿データ取得
  useEffect(() => {
    // 位置情報がまだ取得されていない場合は取得
    if (!location.lat || !location.lng) {
      dispatch(getCurrentLocation());
    }
  }, [dispatch, location.lat, location.lng]);

  useEffect(() => {
    // 位置情報が取得できたら周辺投稿を取得
    if (location.lat && location.lng) {
      dispatch(fetchPost("1"));
    }
  }, [dispatch, location.lat, location.lng]);



  // エラー処理
  if (error.fetch) {
    return (
      <AppLayout title="タイムライン">
        <div className="p-4 max-w-2xl mx-auto">
          <div className="text-red-500 text-center">
            エラー: {error.fetch}
            <button 
              onClick={() => dispatch(postsActions.clearPostErrors())}
              className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
            >
              再試行
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ローディング状態
  if (loading.fetch || locationLoading) {
    return (
      <AppLayout title="タイムライン">
        <div className="flex justify-center items-center min-h-64">
          <LoadingSpinner />
          <span className="ml-2">
            {locationLoading ? '位置情報を取得中...' : '投稿を読み込み中...'}
          </span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="タイムライン">
      <div className="p-4 max-w-2xl mx-auto">
        <PostFilters
          sortBy={sortBy}
          filter={filter}
          onSortChange={setSortBy}
          onFilterChange={setFilter}
        />
        
        {posts.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            周辺に投稿がありません
          </div>
        ) : (
          <PostList posts={posts} />
        )}

        {/* 手動更新ボタン */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              if (location.lat && location.lng) {
                dispatch(fetchAroundPosts({
                  lat: location.lat,
                  lng: location.lng
                }));
              }
            }}
            disabled={loading.fetch || !location.lat || !location.lng}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            {loading.fetch ? '更新中...' : '更新'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

function PostList({ posts }: { posts: Post[] }) {
  return (
    <div className="space-y-4 pb-4">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

