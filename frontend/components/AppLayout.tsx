'use client';

import { usePathname } from 'next/navigation';
import { BottomNavigation, TopNavigation } from '@/components/ui/navigation';
import  NetworkVisualization  from '@/components/ui/timeline_background';

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
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10">
        <NetworkVisualization />
      </div>
      {showTopBar && <TopNavigation title={title} />}
      
      <main className={`
        ${showTopBar ? 'pt-2' : ''}
        ${shouldShowNav ? 'pb-20' : ''}
        min-h-screen
        relative z-10
      `}>
        {children}
      </main>
      
      {shouldShowNav && <BottomNavigation />}
    </div>
  );
} 