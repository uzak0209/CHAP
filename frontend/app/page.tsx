'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch} from '@/store';
import { verifyToken } from '@/store/authSlice';
export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  // 初回ロード時にトークンチェック
  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (storedToken) {
      // トークンの有効性を検証
      dispatch(verifyToken()).then((result) => {
        if (result.type === 'auth/verifyToken/fulfilled') {

          router.push('/posts');
        }else{
          router.replace('/login');
        }
      });
    }else{
      router.replace('/login');
    }
  }, [dispatch, router]);

  return null;
}
