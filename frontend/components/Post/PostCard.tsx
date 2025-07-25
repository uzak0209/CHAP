import { Heart, MessageCircle, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistance, formatTime } from '@/lib/format';
import { Post } from '@/types/types';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  console.log("PostCard rendered with post:", post);
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <PostHeader userId={String(post.user_id)} />
        <PostContent content={post.content} />
        {post.category && <PostCategoryDisplay category={post.category} />}
        {post.tags && <PostTags tags={post.tags} />}
        <PostFooter
          createdAt={post.created_time}
        />
      </CardContent>
    </Card>
  );
}

function PostHeader({ userId }: { userId: string }) {
  return (
    <div className="flex justify-between items-start mb-2">
      <span className="text-sm text-muted-foreground">{userId}</span>
    </div>
  );
}

function PostContent({ content, images }: { content: string; images?: string[] }) {
  return (
    <>
      <p className="mb-3">{content}</p>
      {images?.[0] && (
        <img 
          src={images[0]} 
          alt="投稿画像" 
          className="w-full h-48 object-cover rounded-md mb-3" 
        />
      )}
    </>
  );
}

function PostCategoryDisplay({ category }: { category: string }) {
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'entertainment': return 'エンターテイメント';
      case 'community': return '地域住民コミュニケーション';
      case 'information': return '情報共有';
      case 'disaster': return '災害情報';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'entertainment': return 'bg-pink-100 text-pink-800';
      case 'community': return 'bg-blue-100 text-blue-800';
      case 'information': return 'bg-green-100 text-green-800';
      case 'disaster': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mb-3">
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
        <Tag className="h-3 w-3" />
        {getCategoryLabel(category)}
      </span>
    </div>
  );
}

function PostTags({ tags }: { tags: string[] }) {
  console.log("PostTags rendered with tags:", tags);
  return (
    <div className="flex flex-wrap gap-1 mb-3">
      {tags.map(tag => (
        <span 
          key={tag} 
          className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function PostFooter({ createdAt }: {
  createdAt: string;
}) {
  return (
    <div className="flex justify-between items-center text-sm text-muted-foreground">
      <div className="flex gap-4">
        <span>{formatTime(createdAt)}</span>
      </div>
    </div>
  );
} 