'use client';

import { cn } from '@/lib/utils';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

const widthClasses = {
  sm: 'w-[300px]',
  md: 'w-[340px]',
  lg: 'w-[400px]',
};

export function BaseModal({ isOpen, onClose, children, width = 'md' }: BaseModalProps) {
  return (
    <div 
      className={cn(
        "fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[1000] transition-opacity duration-200",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={cn(
        "bg-white rounded-xl px-6 py-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] transition-transform duration-200",
        widthClasses[width],
        isOpen ? "scale-100" : "scale-95"
      )}>
        {children}
      </div>
    </div>
  );
}