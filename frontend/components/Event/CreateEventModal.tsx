'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Calendar, MapPin, Clock, Users } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { createEvent } from '@/store/eventsSlice';
import { Event } from '@/types/types';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(state => state.events);
  const { location } = useAppSelector(state => state.location);
  const { isAuthenticated } = useAppSelector(state => state.auth);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    if (!isAuthenticated) {
      alert('イベントを作成するにはログインが必要です。');
      onClose();
      return;
    }

    if (!location) {
      alert('位置情報が取得できません。');
      return;
    }

    setIsSubmitting(true);
    try {
      // イベントデータを作成
      const eventData: Omit<Event, 'user_id' | 'id' | 'updated_at' | 'deleted_time'> = {
        content: `${title}: ${description}`, // タイトルと説明を結合
        coordinate: {
          lat: location.lat,
          lng: location.lng,
        },
        created_time: new Date().toISOString(),
        like: 0,
        valid: true,
        tags: [], // モーダルではタグ機能は簡略化
      };

      // Redux経由でイベント作成
      await dispatch(createEvent(eventData as any)).unwrap();
      
      // 成功後にモーダルを閉じてフォームをリセット
      onClose();
      setTitle('');
      setDescription('');
      setDate('');
      setTime('');
      setLocationInput('');
      setMaxParticipants('');
      
      console.log('✅ イベントがデータベースに正常に追加されました');
    } catch (error) {
      console.error('❌ イベント作成エラー:', error);
      alert('イベントの作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* モーダルコンテンツ */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">イベント作成</h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* イベントタイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              イベントタイトル *
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="イベントのタイトルを入力"
              className="w-full"
              required
            />
          </div>

          {/* イベント説明 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              イベント説明 *
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="イベントの詳細を入力してください"
              className="w-full h-24 resize-none"
              required
            />
          </div>

          {/* 日付と時間 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                開催日 *
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                開始時間 *
              </label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full"
                required
              />
            </div>
          </div>

          {/* 場所 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              開催場所
            </label>
            <Input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="開催場所を入力（任意）"
              className="w-full"
            />
          </div>

          {/* 参加者数上限 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              参加者数上限
            </label>
            <Input
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              placeholder="参加者数の上限（任意）"
              className="w-full"
              min="1"
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              disabled={isSubmitting || loading.create || !title || !description}
            >
              {isSubmitting || loading.create ? '作成中...' : 'イベント作成'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
