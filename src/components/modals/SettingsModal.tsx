'use client';

import { BaseModal } from './BaseModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      {/* Icon */}
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      </div>
      
      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
        Settings
      </h3>
      
      {/* Message */}
      <p className="text-sm text-gray-500 text-center leading-normal mb-6">
        Settings options coming soon.
      </p>
      
      {/* Actions */}
      <button 
        className="w-full px-4 py-2.5 rounded-md text-sm font-semibold font-sans cursor-pointer transition-all border-none bg-gray-100 text-gray-700 hover:bg-gray-200"
        onClick={onClose}
      >
        Close
      </button>
    </BaseModal>
  );
}