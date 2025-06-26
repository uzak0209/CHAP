'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, Trash2 } from 'lucide-react';

interface Settings {
  notifications: boolean;
  locationMode: 'always' | 'app-only' | 'off';
  autoLocation: boolean;
}

const defaultSettings: Settings = {
  notifications: true,
  locationMode: 'app-only',
  autoLocation: true,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    console.log('Logging out...');
    // TODO: Implement logout logic
  };

  const handleDeleteAccount = () => {
    if (window.confirm('本当にアカウントを削除しますか？この操作は取り消せません。')) {
      console.log('Deleting account...');
      // TODO: Implement account deletion
    }
  };

  return (
    <AppLayout title="設定">
      <div className="p-4 max-w-2xl mx-auto space-y-6">
        <NotificationSettings
          notifications={settings.notifications}
          onNotificationsChange={(value) => updateSetting('notifications', value)}
        />
        
        <LocationSettings
          locationMode={settings.locationMode}
          autoLocation={settings.autoLocation}
          onLocationModeChange={(value) => updateSetting('locationMode', value)}
          onAutoLocationChange={(value) => updateSetting('autoLocation', value)}
        />
        
        <AccountActions
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
        />
      </div>
    </AppLayout>
  );
}

function NotificationSettings({ 
  notifications, 
  onNotificationsChange 
}: {
  notifications: boolean;
  onNotificationsChange: (value: boolean) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>通知設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications">プッシュ通知</Label>
          <Switch
            id="notifications"
            checked={notifications}
            onCheckedChange={onNotificationsChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function LocationSettings({ 
  locationMode, 
  autoLocation, 
  onLocationModeChange, 
  onAutoLocationChange 
}: {
  locationMode: 'always' | 'app-only' | 'off';
  autoLocation: boolean;
  onLocationModeChange: (value: 'always' | 'app-only' | 'off') => void;
  onAutoLocationChange: (value: boolean) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>位置情報設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>位置情報の取得モード</Label>
          <Select value={locationMode} onValueChange={onLocationModeChange}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="always">常時取得</SelectItem>
              <SelectItem value="app-only">アプリ起動時のみ</SelectItem>
              <SelectItem value="off">無効</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="autoLocation">自動位置更新</Label>
          <Switch
            id="autoLocation"
            checked={autoLocation}
            onCheckedChange={onAutoLocationChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function AccountActions({ 
  onLogout, 
  onDeleteAccount 
}: {
  onLogout: () => void;
  onDeleteAccount: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>アカウント</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" onClick={onLogout} className="w-full">
          <LogOut className="w-4 h-4 mr-2" />
          ログアウト
        </Button>
        
        <Button variant="destructive" onClick={onDeleteAccount} className="w-full">
          <Trash2 className="w-4 h-4 mr-2" />
          アカウントを削除
        </Button>
      </CardContent>
    </Card>
  );
} 