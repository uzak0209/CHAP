import { useState, useEffect } from 'react';
import { Post } from '@/types/post';

export function usePosts(location: { lat: number; lng: number } | null) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!location) return;
    
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          `/api/posts?lat=${location.lat}&lng=${location.lng}&radius=5`
        );
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
} 