'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, MapPin, Clock, Plus, Filter, ArrowUpDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistance, formatTime } from '@/lib/format';
import { Post } from '@/types/post';

const PostCard = ({ post }: { post: Post }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm text-muted-foreground">{post.userId}</span>
      </div>
      <p className="mb-3">{post.content}</p>
      {post.images?.[0] && (
        <img src={post.images[0]} alt="投稿画像" className="w-full h-48 object-cover rounded-md mb-3" />
      )}
      <div className="flex flex-wrap gap-1 mb-3">
        {post.tags.map(tag => (
          <span key={tag} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{post.reactions.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{post.reactions.comments}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {post.distance && <span>{formatDistance(post.distance)}</span>}
          <span>{formatTime(post.createdAt)}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const useLocation = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation({ lat: 35.6762, lng: 139.6503 })
      );
    }
  }, []);
  
  return location;
};

const usePosts = (location: { lat: number; lng: number } | null) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!location) return;
    
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/posts?lat=${location.lat}&lng=${location.lng}&radius=5`);
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error('投稿取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [location]);

  return { posts, loading };
};

export default function Home() {
  const [sortBy, setSortBy] = useState<'time' | 'distance'>('time');
  const [filter, setFilter] = useState<string>('');
  const location = useLocation();
  const { posts, loading } = usePosts(location);

  const filteredPosts = posts
    .filter(post => !filter || post.tags.includes(filter))
    .sort((a, b) => {
      if (sortBy === 'distance') return (a.distance || 0) - (b.distance || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">タイムライン</h1>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(value: 'time' | 'distance') => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">時系列順</SelectItem>
              <SelectItem value="distance">距離順</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="フィルター" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">すべて</SelectItem>
              <SelectItem value="event">イベント</SelectItem>
              <SelectItem value="food">グルメ</SelectItem>
              <SelectItem value="shopping">ショッピング</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredPosts.map(post => <PostCard key={post.id} post={post} />)}
      </div>
      
      <Button className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg">
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
} 