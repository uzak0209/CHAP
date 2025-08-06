'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading';
import { useAppDispatch, useAppSelector } from '@/store';
import { createEvent, eventsActions } from '@/store/eventsSlice';
import { filtersActions } from '@/store/filtersSlice';
import { getCurrentLocation } from '@/store/locationSlice';
import { Event, EventCategory, Status } from '@/types/types';
import { EVENT_CATEGORY_OPTIONS } from '@/constants/map';


export default function CreateEventPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState<EventCategory | ''>('');
  
  const { loading, error } = useAppSelector(state => state.events);
  const { state:locState,location,error:locError} = useAppSelector(state => state.location);
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const { selectedCategory } = useAppSelector((state) => state.filters);
  useEffect(() => {
      dispatch(getCurrentLocation()); 
    // エラーがあればクリア
    dispatch(eventsActions.clearEventErrors());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('イベントを作成します');

    if (!isAuthenticated) {
      alert('イベントを作成するにはログインが必要です。');
      router.push('/login');
      return;
    }

    if (!location) {
      alert('位置情報が取得できません。再度お試しください。');
      dispatch(getCurrentLocation());
      return;
    }

    if (!category) {
      alert('カテゴリを選択してください。');
      return;
    }

    const eventData: Omit<Event, 'user_id'|'id' | 'updated_at' | 'deleted_time'> = {
      content: content,
      category: category,
      coordinate: {
        lat: location.lat,
        lng: location.lng,
      },
      created_at: new Date().toISOString(),
      like: 0,
      valid: true,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      visible: selectedCategory === category
    };

    try {
      await dispatch(createEvent(eventData as any)).unwrap();
      
      // イベント作成成功後、カテゴリフィルターを作成したイベントのカテゴリに更新
      console.log('🎯 カテゴリフィルターを更新:', category);
      dispatch(filtersActions.setSelectedCategory(category as any));
      
      router.push('/events');
    } catch (err) {
      // エラーはSliceで処理されるのでここでは何もしない
    }
  };

  if (locState===Status.LOADING || locState===Status.IDLE) {
    return (
      <AppLayout title="イベント作成">
        <div className="flex justify-center items-center min-h-64">
          <LoadingSpinner />
          <span className="ml-2">位置情報を取得中...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="新しいイベントを作成">
      <div className="container mx-auto p-4 md:p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">イベント作成</CardTitle>
            <CardDescription>新しいイベントの詳細を入力してください。</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="content">イベント内容 *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="イベントの詳しい説明を入力..."
                  required
                  className="min-h-[150px]"
                />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <EventCategorySection
                  category={category}
                  onCategoryChange={setCategory}
                />
              </div>

              <div>
                <Label htmlFor="tags">タグ（任意）</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="例: 音楽, フェス, 交流会 (カンマ区切り)"
                />
              </div>

              {locError && (
                <p className="text-sm text-red-500">
                  位置情報の取得に失敗しました: {typeof locError === 'string' ? locError : locError}
                </p>
              )}

              {error.create && (
                <p className="text-sm text-red-500">
                  作成エラー: {error.create}
                </p>
              )}

              <Button type="submit" disabled={loading.create || !content.trim() || !category} className="w-full">
                {loading.create ? <LoadingSpinner /> : 'イベントを作成する'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function EventCategorySection({ 
  category, 
  onCategoryChange 
}: { 
  category: EventCategory | ''; 
  onCategoryChange: (value: EventCategory | '') => void;
}) {
  const categoryOptions = EVENT_CATEGORY_OPTIONS;

  return (
    <div className="space-y-2">
      <Label htmlFor="category" className="text-sm font-medium text-blue-700">
        カテゴリ * （必須選択）
      </Label>
      <select
        id="category"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value as EventCategory | '')}
        className="w-full px-3 py-2 border-2 border-blue-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required
      >
        {categoryOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {category && (
        <p className="text-xs text-green-600 font-medium">
          ✓ 選択済み: {categoryOptions.find(opt => opt.value === category)?.label}
        </p>
      )}
      {!category && (
        <p className="text-xs text-red-600">
          ⚠ カテゴリの選択が必要です
        </p>
      )}
    </div>
  );
}
