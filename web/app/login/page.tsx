'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthMethodSelector } from '@/components/Auth/AuthMethodSelector';
import { AuthForm } from '@/components/Auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [inviteCode, setInviteCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [authMethod, setAuthMethod] = useState<'invite' | 'sms'>('invite');
  
  const { loading, handleLogin, handleQRScan } = useAuth();

  const onLogin = () => handleLogin(authMethod, inviteCode, phoneNumber);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-600">CHAP</CardTitle>
          <p className="text-gray-600 mt-2">地域密着型SNSプラットフォーム</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <AuthMethodSelector
            value={authMethod}
            onChange={setAuthMethod}
          />

          <AuthForm
            authMethod={authMethod}
            inviteCode={inviteCode}
            phoneNumber={phoneNumber}
            loading={loading}
            onInviteCodeChange={setInviteCode}
            onPhoneNumberChange={setPhoneNumber}
            onLogin={onLogin}
            onQRScan={handleQRScan}
          />

          <PrivacyNotice />
        </CardContent>
      </Card>
    </div>
  );
}

function PrivacyNotice() {
  return (
    <div className="text-xs text-gray-500 text-center space-y-2">
      <p>ログインすることで、利用規約とプライバシーポリシーに同意したものとみなされます。</p>
      <p>位置情報の取得許可が必要です。</p>
    </div>
  );
} 