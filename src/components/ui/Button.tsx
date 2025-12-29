import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  disabled?: boolean; // ADD
}

export function Button({ 
  variant = 'primary', 
  children, 
  disabled = false, // ADD
  className,
  ...props 
}: ButtonProps) {
  return (
    <button 
      disabled={disabled} // ADD
      className={cn(
        // Base styles
        "flex flex-1 items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold font-sans transition-all duration-200 ease-in-out",

        // Cursor logic
        disabled ? "cursor-not-allowed" : "cursor-pointer",

        // Variants
        variant === 'primary' &&
          "bg-gradient-primary text-white shadow-red border-none",

        variant === 'secondary' &&
          "bg-white text-gray-700 border-[1.5px] border-gray-300",

        // Hover effects ONLY when enabled
        !disabled && variant === 'primary' &&
          "hover:-translate-y-px hover:shadow-[0_6px_20px_-3px_rgba(220,38,38,0.5)]",

        !disabled && variant === 'secondary' &&
          "hover:bg-gray-100 hover:border-gray-400",

        // Disabled styles
        disabled && "opacity-50",

        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
