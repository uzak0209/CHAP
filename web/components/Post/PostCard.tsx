import { Heart, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistance, formatTime } from '@/lib/format';
import { Post } from '@/types/post';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <PostHeader userId={post.userId} />
        <PostContent content={post.content} images={post.images} />
        <PostTags tags={post.tags} />
        <PostFooter 
          reactions={post.reactions}
          distance={post.distance}
          createdAt={post.createdAt}
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

function PostFooter({ reactions, distance, createdAt }: {
  reactions: { likes: number; comments: number };
  distance?: number;
  createdAt: string;
}) {
  return (
    <div className="flex justify-between items-center text-sm text-muted-foreground">
      <div className="flex gap-4">
        <div className="flex items-center gap-1">
          <Heart className="w-4 h-4" />
          <span>{reactions.likes}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" />
          <span>{reactions.comments}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {distance && <span>{formatDistance(distance)}</span>}
        <span>{formatTime(createdAt)}</span>
      </div>
    </div>
  );
} 