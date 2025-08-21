'use client'

import React from 'react';
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Provider } from 'react-redux';
import { store } from '@/store';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();

  return (
    <div className="relative h-screen w-full">
      <main className="h-full w-full">
        {children}
      </main>
      <div className="absolute top-0 left-0 z-50">
        <AppSidebar />
      </div>
      {!open && (
        <div className="absolute top-4 left-4 z-50">
          <SidebarTrigger className="bg-white/90 backdrop-blur-sm shadow-md hover:bg-white border border-gray-200 rounded-lg p-2 transition-all duration-200 hover:scale-105" />
        </div>
      )}
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SidebarProvider>
        <LayoutContent>{children}</LayoutContent>
      </SidebarProvider>
    </Provider>
  );
}