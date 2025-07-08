'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { setUser } from '@/store/authSlice';

export function useAuthInitializer() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      // ローカルストレージにトークンがあり、認証状態がfalseの場合（ページリロード時）
      const storedToken = localStorage.getItem('authToken');
      
      if (storedToken && !isAuthenticated) {
        try {
          // トークンでユーザー情報を取得
          const response = await fetch('/api/v1/auth/me', {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const userData = await response.json();
            dispatch(setUser(userData.user));
          } else {
            // トークンが無効な場合、削除
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          localStorage.removeItem('authToken');
        }
      }
    };

    if (typeof window !== 'undefined') {
      initializeAuth();
    }
  }, [dispatch, isAuthenticated]);
}
