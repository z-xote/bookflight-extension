// components/ChatView.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Message } from './Message';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useBookingContext } from '@/hooks/useBookingContext';
import { QUICK_ACTIONS } from '@/lib/config';
import { formatDate, escapeHtml } from '@/lib/utils';

interface ChatViewProps {
  onEditContext: () => void;
}

export function ChatView({ onEditContext }: ChatViewProps) {
  const { messages, isTyping, sendMessage } = useChatMessages();
  const { context } = useBookingContext();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text) return;
    
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    
    await sendMessage(text, context);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleInput = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  };
  
  // ← CHANGE THIS FUNCTION
  const handleQuickAction = async (action: string) => {
    await sendMessage(action, context);
  };
  
  const renderContextBar = () => {
    const tags: JSX.Element[] = [];
    
    if (context.firstName || context.lastName) {
      const name = [context.firstName, context.lastName].filter(Boolean).join(' ');
      tags.push(
        <span key="name" className="context-tag">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
          </svg>
          {name}
        </span>
      );
    }
    
    if (context.origin && context.destination) {
      tags.push(
        <span key="route" className="context-tag">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          {context.origin} → {context.destination}
        </span>
      );
    }
    
    if (context.departDate) {
      const date = new Date(context.departDate);
      const formatted = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      tags.push(
        <span key="date" className="context-tag">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
          {formatted}
        </span>
      );
    }
    
    if (context.paxCount && context.paxCount !== '1') {
      tags.push(
        <span key="pax" className="context-tag">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          {context.paxCount} Pax
        </span>
      );
    }
    
    return tags.length > 0 ? (
      <div className="chat-context-bar">
        {tags}
        <button className="edit-context-btn" onClick={onEditContext}>
          Edit Details
        </button>
      </div>
    ) : null;
  };
  
  return (
    <div className="chat-view active">
      {renderContextBar()}
      
      <div className="chat-messages">
        {messages.map(msg => (
          <Message key={msg.id} message={msg} />
        ))}
        
        {isTyping && (
          <div className="message assistant">
            <div className="message-avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
            <div className="message-content">
              <div className="message-bubble">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-container">
        <div className="quick-actions">
          {QUICK_ACTIONS.map(qa => (
            <button
              key={qa.action}
              className="quick-action"
              onClick={() => handleQuickAction(qa.action)}
            >
              {qa.label}
            </button>
          ))}
        </div>
        
        <div className="chat-input-wrapper">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Ask about Amadeus commands..."
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4 20-7Z"/>
              <path d="M22 2 11 13"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}