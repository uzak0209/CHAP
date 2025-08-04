'use client'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Provider } from 'react-redux'
import { store } from '@/store/store'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store/store'
import { setUser } from '@/store/authSlice'

const inter = Inter({ subsets: ['latin'] })

function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authtoken');
      
      if (storedToken && !isAuthenticated) {
        try {
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
            localStorage.removeItem('authtoken');
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          localStorage.removeItem('authtoken');
        }
      }
    };

    if (typeof window !== 'undefined') {
      initializeAuth();
    }
  }, [dispatch, isAuthenticated]);

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Provider store={store}>
          <AppInitializer>
            {children}
          </AppInitializer>
        </Provider>
      </body>
    </html>
  )
} 