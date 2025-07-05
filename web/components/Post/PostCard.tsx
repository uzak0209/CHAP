import { Heart, MessageCircle } from 'lucide-react';
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