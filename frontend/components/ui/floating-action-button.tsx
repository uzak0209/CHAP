'use client';

import React from 'react';
import { Button } from './button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FloatingActionButtonProps {
  href?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function FloatingActionButton({ 
  href = '/post', 
  onClick, 
  className = '', 
  children 
}: FloatingActionButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={`
        fixed bottom-6 right-6 z-50
        h-14 w-14 rounded-full
        bg-blue-600 hover:bg-blue-700
        text-white shadow-md hover:shadow-xl
        transition-all duration-200
        transform hover:scale-105
        ${className}
      `}
      size="icon"
    >
      {children || <Plus className="h-6 w-6" />}
    </Button>
  );
}
