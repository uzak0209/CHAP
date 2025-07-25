import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CircleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  position?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  zIndex?: number;
}

const CircleButton: React.FC<CircleButtonProps> = ({
  children,
  onClick,
  position = { top: '20px', right: '20px' },
  size = 'md',
  variant = 'default',
  className = '',
  style = {},
  disabled = false,
  zIndex = 1000
}) => {
  // サイズの設定
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg'
  };

  const buttonStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex,
    ...position,
    ...style
  };

  return (
    <Button
      variant={variant}
      className={cn(
        "rounded-full p-0 flex items-center justify-center",
        sizeClasses[size],
        className
      )}
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

export default CircleButton;
