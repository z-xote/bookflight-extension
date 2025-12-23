'use client';

import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function Modal({ isOpen, onClose, onConfirm }: ModalProps) {
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
        "bg-white rounded-xl px-6 py-6 w-[340px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] transition-transform duration-200",
        isOpen ? "scale-100" : "scale-95"
      )}>
        {/* Icon */}
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
          Start New Booking?
        </h3>
        
        {/* Message */}
        <p className="text-sm text-gray-600 text-center leading-normal mb-6">
          This will clear the current session and all conversation history. This action cannot be undone.
        </p>
        
        {/* Actions */}
        <div className="flex gap-3">
          <button 
            className="flex-1 px-4 py-2.5 rounded-md text-sm font-semibold font-sans cursor-pointer transition-all border-none bg-gray-100 text-gray-700 hover:bg-gray-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="flex-1 px-4 py-2.5 rounded-md text-sm font-semibold font-sans cursor-pointer transition-all border-none bg-gradient-primary text-white shadow-sm hover:-translate-y-px hover:shadow-md"
            onClick={onConfirm}
          >
            Reset Session
          </button>
        </div>
      </div>
    </div>
  );
}