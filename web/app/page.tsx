'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { PostCard } from '@/components/Post/PostCard';
import { PostFilters } from '@/components/Post/PostFilters';
import { useLocation } from '@/hooks/useLocation';
import { usePosts } from '@/hooks/usePosts';
import { LoadingSpinner } from '@/components/ui/loading';
import { Post } from '@/types/post';

export default function Home() {
  const [sortBy, setSortBy] = useState<'time' | 'distance'>('time');
  const [filter, setFilter] = useState<string>('all');
  
  const location = useLocation();
  const { posts, loading } = usePosts(location);

  const filteredPosts = filterAndSortPosts(posts, filter, sortBy);

  if (loading) {
    return (
      <AppLayout title="タイムライン">
        <LoadingSpinner />
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
        
        <PostList posts={filteredPosts} />
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

function filterAndSortPosts(
  posts: Post[], 
  filter: string, 
  sortBy: 'time' | 'distance'
): Post[] {
  return posts
    .filter(post => filter === 'all' || post.tags.includes(filter))
    .sort((a, b) => {
      if (sortBy === 'distance') {
        return (a.distance || 0) - (b.distance || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
} 