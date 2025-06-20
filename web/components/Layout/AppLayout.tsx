'use client';

import { usePathname } from 'next/navigation';
import { BottomNavigation, TopNavigation } from '@/components/ui/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showNavigation?: boolean;
  showTopBar?: boolean;
}

export function AppLayout({ 
  children, 
  title = 'CHAP',
  showNavigation = true,
  showTopBar = true 
}: AppLayoutProps) {
  const pathname = usePathname();

  // Special pages that don't need navigation
  const noNavPages = ['/login', '/onboarding', '/admin'];
  const shouldShowNav = showNavigation && !noNavPages.some(page => pathname.startsWith(page));

  return (
    <div className="min-h-screen bg-gray-50">
      {showTopBar && <TopNavigation title={title} />}
      
      <main className={`
        ${showTopBar ? 'pt-2' : ''}
        ${shouldShowNav ? 'pb-20' : ''}
        min-h-screen
      `}>
        {children}
      </main>
      
      {shouldShowNav && <BottomNavigation />}
    </div>
  );
} 