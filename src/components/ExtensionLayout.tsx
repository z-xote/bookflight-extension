// components/ExtensionLayout.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Modal } from './Modal';
import { FormView } from './FormView';
import { ChatView } from './ChatView';
import { useBookingContext } from '@/hooks/useBookingContext';
import { useChatMessages } from '@/hooks/useChatMessages';
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
  
  const handleFormSubmit = () => {
    setCurrentView('chat');
    const welcomeMsg = generateWelcomeMessage(false);
    addMessage('assistant', welcomeMsg);
  };
  
  const handleSkipForm = () => {
    setCurrentView('chat');
    const welcomeMsg = generateWelcomeMessage(true);
    addMessage('assistant', welcomeMsg);
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
    <div className="app-container">
      <header className="header">
        <div className="logo-container">
          <Image className="logo-icon" src="/bfl-red.png" alt="Bookflight logo" width={32} height={32} />
        </div>
        
        <div className="header-text">
          <h1 className="header-title">Bookflight Guide</h1>
          <p className="header-subtitle">Amadeus Booking Assistant</p>
        </div>

        {/* VERSION BADGE */}
        <div className="version-badge">v{APP_VERSION}</div>
        
        <button 
          className="header-btn" 
          onClick={handleReset}
          title="New Booking"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </header>
      
      {currentView === 'form' && (
        <FormView 
          onSubmit={handleFormSubmit} 
          onSkip={handleSkipForm} 
        />
      )}
      
      {currentView === 'chat' && (
        <ChatView onEditContext={handleEditContext} />
      )}
      
      <Modal 
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={confirmReset}
      />
    </div>
  );
}