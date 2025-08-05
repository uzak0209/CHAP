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
      dispatch(verifyToken()).then((result) => {
        if (result.type === 'auth/verifyToken/fulfilled') {

          router.push('/timeline');
        }else{
          router.replace('/login');
        }
      });

  }, [dispatch]);

  return null;
}
