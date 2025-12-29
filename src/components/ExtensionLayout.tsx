'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Modal } from './Modal';
import { FormView } from './FormView';
import { ChatView } from './ChatView';
import { useBookingContext } from '@/hooks/useBookingContext';
import { useChatMessages } from '@/hooks/useChatMessages';
import type { FormSubmission } from '@/types';
import { APP_VERSION } from '@/lib/config';

export function ExtensionLayout() {
  const [currentView, setCurrentView] = useState<'form' | 'chat'>('form');
  const [showResetModal, setShowResetModal] = useState(false);
  const { context, resetContext } = useBookingContext();
  const { addMessage, clearMessages } = useChatMessages();
  
  const generateWelcomeMessage = (skipped: boolean = false) => {
    if (skipped) {
      return `## Welcome to Bookflight Guide! ✈️

I'm here to help you navigate **Amadeus commands** and complete bookings efficiently.

**What can I help with?**
- Checking flight availability
- Selling seats and creating PNRs
- Pricing and fare quotes
- Understanding command syntax

Just ask me anything about the booking process!`;
    }
    
    const hasRoute = context.origin && context.destination;
    const hasDate = context.departDate;
    const hasPax = context.firstName;
    
    let message = `## Booking Context Loaded ✓\n\n`;
    
    if (hasPax) {
      message += `**Passenger:** ${context.title || ''} ${context.firstName} ${context.lastName}\n`;
    }
    
    if (hasRoute) {
      message += `**Route:** ${context.origin} → ${context.destination}`;
      if (context.tripType === 'return' && context.returnDate) {
        message += ` (Return)`;
      }
      message += '\n';
    }
    
    if (hasDate) {
      const date = new Date(context.departDate!);
      const formatted = date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
      message += `**Date:** ${formatted}\n`;
    }
    
    if (hasRoute && hasDate) {
      const date = new Date(context.departDate!);
      const day = String(date.getDate()).padStart(2, '0');
      const month = date.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
      
      message += `\n---\n\n### Ready to Check Availability\n\nBased on your details, here's the availability command:\n\n\`\`\`\nAN${day}${month}${context.origin}${context.destination}/FJ\n\`\`\`\n\nThis will show **Fiji Airways** flights for your route. Would you like me to explain what to do next?`;
    } else {
      message += `\n---\n\nWhat would you like help with? I can guide you through:\n- Checking availability\n- Selling seats\n- Pricing the booking\n- Completing the PNR`;
    }
    
    return message;
  };
  
  const handleFormSubmit = (formData: FormSubmission) => {
    setCurrentView('chat');
    const welcomeMsg = generateWelcomeMessage(false);
    addMessage('assistant', welcomeMsg, formData); // PASS FORM DATA
  };
  
  
  const handleSkipForm = (formData: FormSubmission) => {
    setCurrentView('chat');
    const welcomeMsg = generateWelcomeMessage(true);
    addMessage('assistant', welcomeMsg, formData); // PASS FORM DATA
  };
  
  const handleEditContext = () => {
    setCurrentView('form');
  };
  
  const handleReset = () => {
    setShowResetModal(true);
  };
  
  const confirmReset = () => {
    resetContext();
    clearMessages();
    setCurrentView('form');
    setShowResetModal(false);
  };
  
  return (
    <div className="flex flex-col h-full overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="relative z-10 bg-gradient-header px-5 py-4 flex items-center gap-3 shadow-md after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent">
        <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center shadow-md overflow-hidden">
          <Image 
            className="w-7 h-7 block object-contain" 
            src="/bfl-red.png" 
            alt="Bookflight logo" 
            width={28} 
            height={28} 
          />
        </div>
        
        <div className="flex-1">
          <h1 className="text-base font-bold text-white tracking-tight">Bookflight Guide</h1>
          <p className="text-[11px] text-white/80 font-medium mt-px">Amadeus Booking Assistant</p>
        </div>

        {/* VERSION BADGE */}
        <div className="px-2.5 py-0.5 bg-black/15 rounded-full text-[9px] font-semibold text-white/85 tracking-wide whitespace-nowrap backdrop-blur-sm">
          v{APP_VERSION}
        </div>
        
        <button 
          className="w-8 h-8 border-none bg-white/15 rounded-md text-white cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-white/25 hover:scale-105" 
          onClick={handleReset}
          title="New Booking"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </header>
      
      {/* Views */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentView === 'form' && (
          <FormView 
            onSubmit={handleFormSubmit} 
            onSkip={handleSkipForm} 
          />
        )}
        
        {currentView === 'chat' && (
          <ChatView onEditContext={handleEditContext} />
        )}
      </div>
      
      <Modal 
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={confirmReset}
      />
    </div>
  );
}