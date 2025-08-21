'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X,  Hash } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { createThread, fetchThreads } from '@/store/threadsSlice';
import { createPost,fetchPosts } from '@/store/postsSlice';
import { createEvent,fetchEvents } from '@/store/eventsSlice';
import { Category ,ContentType,Status} from '@/types/types';
import { CATEGORY_OPTIONS } from '@/constants/map';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: ContentType;
}

export function CreateModal({ isOpen, onClose , contentType}: CreateModalProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const dispatch = useAppDispatch();
  const { state, location } = useAppSelector((state) => state.location);

  const categoryOptions = CATEGORY_OPTIONS;

  const handleSubmit = async () => {
    if (!content.trim() || !category) return;
    
    setLoading(true);
    try {
      // カテゴリをタグに追加
      const allTags = category ? [category, ...tags] : tags;

      switch (contentType) {
        case 'thread':
          await dispatch(createThread({
          content,
          category: category as Category,
          tags: allTags,
          coordinate: state === Status.LOADED ? { lat: location.lat, lng: location.lng } : (() => { throw new Error('位置情報が取得できません'); })(),
          valid: true,
          like: 0,
          created_at: new Date().toISOString(),
          type: 'thread',
          }))
          break;
        case 'post':
          await dispatch(createPost({
            content,
            category: category as Category,
            tags: allTags,
            coordinate: state === Status.LOADED ? { lat: location.lat, lng: location.lng } : (() => { throw new Error('位置情報が取得できません'); })(),
            valid: true,
            like: 0,
            created_at: new Date().toISOString(),
            type: 'post',
          }));
          break;
        case 'event':
          await dispatch(createEvent({
            content,
            category: category as Category,
            tags: allTags,
            coordinate: state === Status.LOADED ? { lat: location.lat, lng: location.lng } : (() => { throw new Error('位置情報が取得できません'); })(),
            valid: true,
            like: 0,
            created_at: new Date().toISOString(),
            type: 'event',
          }));
          break;
        }
      
      
      // POST成功後に周辺のスレッドを再取得（地図上に即座に反映）
      if (state === Status.LOADED) {
        await dispatch(fetchThreads({ lat: location.lat, lng: location.lng }));
        await dispatch(fetchEvents({ lat: location.lat, lng: location.lng }));
        await dispatch(fetchPosts({ lat: location.lat, lng: location.lng }));
      }
      onClose();
    } catch (error) {
      console.error('Thread submission error:', error);
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

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>新しい{contentType}を作成</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={280}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {content.length}/280
            </div>
          </div>

          {/* カテゴリ選択 */}
          <div>
            <Label htmlFor="category">カテゴリ</Label>
            <Select value={category} onValueChange={(value: Category) => setCategory(value)}>
              <SelectTrigger>
                <SelectValue placeholder="カテゴリを選択してください" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md z-50">
                {categoryOptions.map(option => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="hover:bg-gray-100 cursor-pointer px-3 py-2"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* タグ入力 */}
          <div>
            <Label htmlFor="tags">タグ（任意）</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="タグを入力"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button onClick={addTag} variant="outline" size="sm">
                <Hash className="h-4 w-4" />
              </Button>
            </div>
            
            {/* タグ表示 */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:bg-purple-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || !category || loading || state !== Status.LOADED}
              className="flex-1"
            >
              {loading ? '作成中...' : `${contentType}作成`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
