'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, Heart } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  maxParticipants?: number;
  currentParticipants: number;
  likes: number;
  category: string;
  created_time: string;
}

interface EventCardProps {
  event: Event;
  isPopup?: boolean;
  onHover?: (event: Event | null) => void;
}

export function EventCard({ event, isPopup = false, onHover }: EventCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: いいね機能の実装
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // HH:MM形式
  };

  const cardClass = isPopup 
    ? "relative max-w-sm bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
    : "bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-all duration-200";

  return (
    <div 
      className={cardClass}
      onMouseEnter={() => onHover?.(event)}
      onMouseLeave={() => onHover?.(null)}
      style={isPopup ? {
        maxWidth: '20rem',
        background: 'linear-gradient(to bottom right, #fff7ed, #fef3c7)',
        border: '1px solid #fed7aa',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        borderRadius: '1rem',
        overflow: 'hidden',
        position: 'relative'
      } : {}}
    >
      {isPopup && (
        <>
          {/* 吹き出しの矢印 */}
          <div 
            className="absolute -bottom-2 left-5 w-0 h-0" 
            style={{
              position: 'absolute',
              bottom: '-8px',
              left: '20px',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #fff7ed'
            }}
          />
          
          {/* イベントアイコン */}
          <div 
            className="absolute top-2 left-2 h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center"
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              height: '24px',
              width: '24px',
              borderRadius: '50%',
              backgroundColor: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Calendar className="h-3 w-3 text-white" style={{ height: '12px', width: '12px', color: 'white' }} />
          </div>
        </>
      )}

      {/* メインコンテンツ */}
      <div className={isPopup ? "p-4 pt-8" : ""} style={isPopup ? { padding: '1rem', paddingTop: '2rem' } : {}}>
        {/* イベントタイトル */}
        <h3 className={`font-bold mb-2 ${isPopup ? 'text-orange-900 text-lg' : 'text-gray-900 text-lg'}`}
            style={isPopup ? { color: '#9a3412', fontSize: '1.125rem', marginBottom: '0.5rem' } : {}}>
          {event.title}
        </h3>

        {/* イベント説明 */}
        <p className={`mb-3 leading-relaxed ${isPopup ? 'text-sm text-orange-800' : 'text-gray-700 text-sm'}`}
           style={isPopup ? { 
             fontSize: '0.875rem', 
             color: '#c2410c', 
             lineHeight: '1.6', 
             marginBottom: '0.75rem' 
           } : {}}>
          {event.description}
        </p>

        {/* イベント詳細情報 */}
        <div className="space-y-2 mb-3">
          {/* 日時 */}
          <div className="flex items-center gap-2">
            <Calendar className={`h-4 w-4 ${isPopup ? 'text-orange-600' : 'text-gray-500'}`} />
            <span className={`text-sm ${isPopup ? 'text-orange-700' : 'text-gray-600'}`}>
              {formatDate(event.date)} {formatTime(event.time)}
            </span>
          </div>

          {/* 場所 */}
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className={`h-4 w-4 ${isPopup ? 'text-orange-600' : 'text-gray-500'}`} />
              <span className={`text-sm ${isPopup ? 'text-orange-700' : 'text-gray-600'}`}>
                {event.location}
              </span>
            </div>
          )}

          {/* 参加者数 */}
          <div className="flex items-center gap-2">
            <Users className={`h-4 w-4 ${isPopup ? 'text-orange-600' : 'text-gray-500'}`} />
            <span className={`text-sm ${isPopup ? 'text-orange-700' : 'text-gray-600'}`}>
              {event.currentParticipants}人参加
              {event.maxParticipants && ` / ${event.maxParticipants}人まで`}
            </span>
          </div>
        </div>

        {/* フッター */}
        <div 
          className="flex justify-between items-center text-xs border-t pt-3"
          style={isPopup ? { 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            fontSize: '0.75rem',
            borderTop: '1px solid #fed7aa',
            paddingTop: '0.75rem'
          } : {}}
        >
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : isPopup ? 'text-orange-600' : 'text-gray-500'} hover:text-red-500 transition-colors`}
            style={isPopup ? { color: isLiked ? '#ef4444' : '#ea580c' } : {}}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-medium">{event.likes} いいね</span>
          </button>
          
          <div className={isPopup ? 'text-orange-600' : 'text-gray-500'} 
               style={isPopup ? { color: '#ea580c' } : {}}>
            <span className="font-medium">イベント</span>
            <span className="ml-2">{new Date(event.created_time).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
