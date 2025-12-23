import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  children, 
  className,
  ...props 
}: ButtonProps) {
  return (
    <button 
      className={cn(
        // Base styles (.btn)
        "flex flex-1 items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold font-sans transition-all duration-200 ease-in-out cursor-pointer",
        // Variants
        variant === 'primary' && "bg-gradient-primary text-white shadow-red hover:-translate-y-px hover:shadow-[0_6px_20px_-3px_rgba(220,38,38,0.5)] border-none",
        variant === 'secondary' && "bg-white text-gray-700 border-[1.5px] border-gray-300 hover:bg-gray-100 hover:border-gray-400",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}