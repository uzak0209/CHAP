'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera, MapPin, Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createPost, useAppDispatch,useAppSelector } from '@/store';

export default function PostPage() {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const location = useAppSelector((state) => state.location.current);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setLoading(true);
    try {
      dispatch(createPost({
        content,
        tags,
        coordinate:
          location && location.lat !== null && location.lng !== null
            ? { lat: location.lat, lng: location.lng }
            : { lat: 0, lng: 0 },
        valid: true,
        like: 0,
        updated_time: new Date().toISOString(),
      }));
      router.push('/');
    } catch (error) {
      console.error('Post submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  return (
    <AppLayout title="新しい投稿" showNavigation={false}>
      <div className="p-4 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6 space-y-6">
            <PostContentForm
              content={content}
              onContentChange={setContent}
            />
            
            <ImageUploadSection
              images={images}
              onImagesChange={setImages}
            />
            
            <TagsSection
              tags={tags}
              tagInput={tagInput}
              onTagInputChange={setTagInput}
              onAddTag={addTag}
              onRemoveTag={(tag) => setTags(tags.filter(t => t !== tag))}
            />
            
            <LocationInfo location={location} />
            
            <PostActions
              onSubmit={handleSubmit}
              onCancel={() => router.back()}
              loading={loading}
              disabled={!content.trim()}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function PostContentForm({ 
  content, 
  onContentChange 
}: { 
  content: string; 
  onContentChange: (value: string) => void;
}) {
  return (
    <div>
      <Label htmlFor="content">投稿内容</Label>
      <Textarea
        id="content"
        placeholder="何が起こっていますか？"
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        className="mt-2 min-h-32"
      />
    </div>
  );
}

function ImageUploadSection({ 
  images, 
  onImagesChange 
}: { 
  images: File[]; 
  onImagesChange: (files: File[]) => void;
}) {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onImagesChange([...images, ...files]);
  };

  return (
    <div>
      <Label>画像</Label>
      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <Camera className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">画像をアップロード</p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="mt-2"
        />
      </div>
    </div>
  );
}

function TagsSection({ 
  tags, 
  tagInput, 
  onTagInputChange, 
  onAddTag, 
  onRemoveTag 
}: {
  tags: string[];
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}) {
  const dispatch = useAppDispatch();
  return (
    <div>
      <Label>タグ</Label>
      <div className="mt-2 flex gap-2">
        <Input
          placeholder="タグを入力"
          value={tagInput}
          onChange={(e) => onTagInputChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onAddTag()}
        />
        <Button onClick={onAddTag} variant="outline" size="sm">
          <Hash className="w-4 h-4" />
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {tags.map(tag => (
          <span
            key={tag}
            onClick={() => onRemoveTag(tag)}
            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm cursor-pointer hover:bg-blue-200"
          >
            #{tag} ×
          </span>
        ))}
      </div>
    </div>
  );
}

function LocationInfo({ 
  location 
}: { 
  location: { lat: number | null; lng: number | null } | null 
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <MapPin className="w-4 h-4" />
      <span>
        {location ? '現在地付近' : '位置情報を取得中...'}
      </span>
    </div>
  );
}

function PostActions({ 
  onSubmit, 
  onCancel, 
  loading, 
  disabled 
}: {
  onSubmit: () => void;
  onCancel: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  return (
    <div className="flex gap-3">
      <Button variant="outline" onClick={onCancel} className="flex-1">
        キャンセル
      </Button>
      <Button 
        onClick={onSubmit} 
        disabled={disabled || loading}
        className="flex-1"
      >
        {loading ? '投稿中...' : '投稿する'}
      </Button>
    </div>
  );
} 