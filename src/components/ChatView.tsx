'use client';

import { useEffect, useRef, useState } from 'react';
import { Message } from './Message';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useBookingContext } from '@/hooks/useBookingContext';
import { QUICK_ACTIONS } from '@/lib/config';
import { cn } from '@/lib/utils';

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
  
  const handleQuickAction = async (action: string) => {
    await sendMessage(action, context);
  };
  
  const renderContextBar = () => {
    const tags: React.ReactElement[] = [];
    
    if (context.firstName || context.lastName) {
      const name = [context.firstName, context.lastName].filter(Boolean).join(' ');
      tags.push(
        <span key="name" className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 rounded-full text-[11px] text-red-700 font-medium">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
          </svg>
          {name}
        </span>
      );
    }
    
    if (context.origin && context.destination) {
      tags.push(
        <span key="route" className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 rounded-full text-[11px] text-red-700 font-medium">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        <span key="date" className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 rounded-full text-[11px] text-red-700 font-medium">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
          {formatted}
        </span>
      );
    }
    
    if (context.paxCount && context.paxCount !== '1') {
      tags.push(
        <span key="pax" className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 rounded-full text-[11px] text-red-700 font-medium">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          {context.paxCount} Pax
        </span>
      );
    }
    
    return tags.length > 0 ? (
      <div className="px-4 py-2.5 bg-white border-b border-gray-200 flex items-center gap-2 flex-wrap">
        {tags}
        <button 
          className="ml-auto px-2.5 py-1 bg-transparent border border-gray-300 rounded-full text-[11px] text-gray-600 cursor-pointer font-sans font-medium transition-all hover:bg-gray-100 hover:border-gray-400"
          onClick={onEditContext}
        >
          Edit Details
        </button>
      </div>
    ) : null;
  };
  
  return (
    <div className="bg-gray-50 flex-1 flex flex-col overflow-hidden">
      {renderContextBar()}
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 flex flex-col gap-4">
        {messages.map(msg => (
          <Message key={msg.id} message={msg} />
        ))}
        
        {isTyping && (
          <div className="flex gap-2.5 animate-messageIn">
            <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 bg-gradient-primary text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="px-3.5 py-3 rounded-md text-[13px] leading-relaxed bg-white border border-gray-200 shadow-sm">
                <div className="flex gap-1 py-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full animate-typing"></span>
                  <span className="w-2 h-2 bg-red-400 rounded-full animate-typing [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-red-400 rounded-full animate-typing [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Container */}
      <div className="px-4 py-3 pb-4 bg-white border-t border-gray-200">
        {/* Quick Actions */}
        <div className="flex gap-1.5 mb-2.5 flex-wrap">
          {QUICK_ACTIONS.map(qa => (
            <button
              key={qa.action}
              className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-[11px] text-gray-700 cursor-pointer font-sans font-medium transition-all hover:bg-red-50 hover:border-red-200 hover:text-red-700"
              onClick={() => handleQuickAction(qa.action)}
            >
              {qa.label}
            </button>
          ))}
        </div>
        
        {/* Input Wrapper */}
        <div className="flex gap-2.5 items-end">
          <textarea
            ref={inputRef}
            className="flex-1 px-3.5 py-3 border-[1.5px] border-gray-200 rounded-md text-[13px] font-sans resize-none min-h-[44px] max-h-[120px] leading-tight transition-all focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 placeholder:text-gray-400"
            placeholder="Ask about Amadeus commands..."
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
          />
          <button
            className={cn(
              "w-11 h-11 border-none bg-gradient-primary rounded-md text-white cursor-pointer flex items-center justify-center transition-all shadow-red",
              inputValue.trim() && !isTyping ? "hover:scale-105" : "opacity-50 cursor-not-allowed"
            )}
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