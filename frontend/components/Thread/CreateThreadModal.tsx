'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, MessageSquareText, MapPin, Hash } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { createThread } from '@/store/threadsSlice';
import { Status } from '@/types/types';
import { PostCategory } from '@/types/thread';

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateThreadModal({ isOpen, onClose }: CreateThreadModalProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory | ''>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const dispatch = useAppDispatch();
  const { state, location } = useAppSelector((state) => state.location);

  const categoryOptions = [
    { value: 'entertainment', label: 'エンターテイメント' },
    { value: 'community', label: '地域住民コミュニケーション' },
    { value: 'disaster', label: '災害情報' }
  ];

  const handleSubmit = async () => {
    if (!content.trim() || !category) return;
    
    setLoading(true);
    try {
      // カテゴリをタグに追加
      const allTags = category ? [category, ...tags] : tags;
      
      await dispatch(createThread({
        content,
        tags: allTags,
        coordinate: state === Status.LOADED ? { lat: location.lat, lng: location.lng } : (() => { throw new Error('位置情報が取得できません'); })(),
        like: 0,
        user_id: '123e4567-e89b-12d3-a456-426614174000', // 有効なUUID形式に変更
        valid: true,
      }));
      
      // 成功したらモーダルを閉じてフォームをリセット
      setContent('');
      setCategory('');
      setTags([]);
      setTagInput('');
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>新しいスレッドを作成</CardTitle>
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
          {/* スレッド内容 */}
          <div>
            <Label htmlFor="content">スレッドタイトル・内容</Label>
            <Textarea
              id="content"
              placeholder="どんなスレッドを始めますか？"
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
            <Select value={category} onValueChange={(value: PostCategory) => setCategory(value)}>
              <SelectTrigger>
                <SelectValue placeholder="カテゴリを選択してください" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
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

          {/* 位置情報表示 */}
          {state === Status.LOADED && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <MapPin className="h-4 w-4" />
              <span>現在地: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
            </div>
          )}

          {/* 作成ボタン */}
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
              {loading ? '作成中...' : 'スレッド作成'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
