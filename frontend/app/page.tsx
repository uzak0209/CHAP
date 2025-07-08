'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login'); // pushよりreplaceの方が適切な場合も
  }, [router]);

  return null;
}
