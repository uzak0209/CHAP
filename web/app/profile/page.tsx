'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Edit, Save, X } from 'lucide-react';

interface UserProfile {
  name: string;
  bio: string;
  avatar: string;
  joinedRooms: number;
  totalPosts: number;
}

const mockProfile: UserProfile = {
  name: '田中太郎',
  bio: '地域のイベントが大好きです。よろしくお願いします！',
  avatar: '',
  joinedRooms: 5,
  totalPosts: 12,
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(mockProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(mockProfile);

  const handleSave = () => {
    setProfile(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  return (
    <AppLayout title="プロフィール">
      <div className="p-4 max-w-2xl mx-auto space-y-6">
        <ProfileCard 
          profile={profile}
          isEditing={isEditing}
          editForm={editForm}
          onEditFormChange={setEditForm}
          onEdit={() => setIsEditing(true)}
          onSave={handleSave}
          onCancel={handleCancel}
        />
        
        <StatsCard profile={profile} />
      </div>
    </AppLayout>
  );
}

function ProfileCard({ 
  profile, 
  isEditing, 
  editForm, 
  onEditFormChange, 
  onEdit, 
  onSave, 
  onCancel 
}: {
  profile: UserProfile;
  isEditing: boolean;
  editForm: UserProfile;
  onEditFormChange: (form: UserProfile) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle>プロフィール情報</CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-1" />
              編集
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AvatarSection />
        
        {isEditing ? (
          <EditForm 
            form={editForm}
            onChange={onEditFormChange}
            onSave={onSave}
            onCancel={onCancel}
          />
        ) : (
          <ProfileDisplay profile={profile} />
        )}
      </CardContent>
    </Card>
  );
}

function AvatarSection() {
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
          <Camera className="w-8 h-8 text-gray-400" />
        </div>
        <Button 
          size="sm" 
          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function ProfileDisplay({ profile }: { profile: UserProfile }) {
  return (
    <>
      <div>
        <Label>ユーザー名</Label>
        <p className="mt-1 text-sm">{profile.name}</p>
      </div>
      <div>
        <Label>自己紹介</Label>
        <p className="mt-1 text-sm text-gray-600">{profile.bio}</p>
      </div>
    </>
  );
}

function EditForm({ 
  form, 
  onChange, 
  onSave, 
  onCancel 
}: {
  form: UserProfile;
  onChange: (form: UserProfile) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <div>
        <Label htmlFor="name">ユーザー名</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="bio">自己紹介</Label>
        <Textarea
          id="bio"
          value={form.bio}
          onChange={(e) => onChange({ ...form, bio: e.target.value })}
          className="mt-1"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={onSave} className="flex-1">
          <Save className="w-4 h-4 mr-1" />
          保存
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          <X className="w-4 h-4 mr-1" />
          キャンセル
        </Button>
      </div>
    </>
  );
}

function StatsCard({ profile }: { profile: UserProfile }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>アクティビティ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{profile.totalPosts}</p>
            <p className="text-sm text-gray-600">投稿数</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{profile.joinedRooms}</p>
            <p className="text-sm text-gray-600">参加ルーム</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 