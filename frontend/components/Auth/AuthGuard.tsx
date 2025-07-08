'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // トークンがローカルストレージにあるが認証状態がfalseの場合、
    // アプリ再起動時の状態復元が必要
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    if (!isAuthenticated && !storedToken) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, token, router, redirectTo]);

  // 認証されていない場合は何も表示しない
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
