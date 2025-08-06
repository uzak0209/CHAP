'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { login, register, clearAuthErrors, verifyToken } from '@/store/authSlice';
import { cn } from '@/lib/utils';

type AuthMode = 'login' | 'register';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  
  const { isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);



  // ログイン成功時のリダイレクト処理
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/timeline');
    }
  }, [isAuthenticated, router]);

  // エラークリア
  useEffect(() => {
    dispatch(clearAuthErrors());
  }, [authMode, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authMode === 'login') {
      dispatch(login({ email, password }));
    } else {
      if (password !== confirmPassword) {
        alert('パスワードが一致しません');
        return;
      }
      dispatch(register({ email, password, display_name: displayName, logintype: 'email' }));

    }
  };

  const isLoading = authMode === 'login' ? loading.login : loading.register;
  const currentError = authMode === 'login' ? error.login : error.register;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴとヘッダー */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
            <span className="text-2xl font-bold text-white">C</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CHAP
          </h1>
          <p className="text-gray-600 mt-2 text-lg">地域密着型SNSプラットフォーム</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* 認証モード切り替え */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={cn(
                  "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200",
                  authMode === 'login' 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-800"
                )}
              >
                ログイン
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={cn(
                  "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200",
                  authMode === 'register' 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-800"
                )}
              >
                新規登録
              </button>
            </div>

            {/* エラー表示 */}
            {currentError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {currentError}
              </div>
            )}

            {/* フォーム */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {authMode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-gray-700 font-medium">
                    表示名
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="あなたの表示名"
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  メールアドレス
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  パスワード
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {authMode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                    パスワード確認
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-base shadow-md hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    処理中...
                  </div>
                ) : (
                  authMode === 'login' ? 'ログイン' : '新規登録'
                )}
              </Button>
            </form>

            <PrivacyNotice />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PrivacyNotice() {
  return (
    <div className="text-xs text-gray-500 text-center space-y-2 mt-6 pt-6 border-t border-gray-100">
      <p className="flex items-center justify-center">
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        ログインすることで、利用規約とプライバシーポリシーに同意したものとみなされます。
      </p>
      <p className="flex items-center justify-center">
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
        位置情報の取得許可が必要です。
      </p>
    </div>
  );
} 