'use client'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Provider } from 'react-redux'
import { store } from 'store/store'
const inter = Inter({ subsets: ['latin'] })

const metadata: Metadata = {
  title: 'CHAP - Home',
  description: 'Location-based social platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}><Provider store={store}>{children}</Provider></body>
    </html>
  )
} 