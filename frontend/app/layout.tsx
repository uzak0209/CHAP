'use client'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Provider } from 'react-redux'
import { store } from '@/store/store'
import { useAuthInitializer } from '@/hooks/useAuthInitializer'

const inter = Inter({ subsets: ['latin'] })

function AppInitializer({ children }: { children: React.ReactNode }) {
  useAuthInitializer();
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