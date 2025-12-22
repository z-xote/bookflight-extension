// hooks/useChatMessages.ts
'use client';

import { create } from 'zustand';
import type { Message, BookingContext } from '@/types';
import { getTemplateResponse } from '@/lib/templateResponses';

interface ChatStore {
  messages: Message[];
  isTyping: boolean;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  sendMessage: (text: string, context: BookingContext) => Promise<void>;
  clearMessages: () => void;
}

export const useChatMessages = create<ChatStore>((set, get) => ({
  messages: [],
  isTyping: false,
  
  addMessage: (role, content) => {
    const message: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    set((state) => ({ messages: [...state.messages, message] }));
  },
  
  sendMessage: async (text, context) => {
    const { addMessage } = get();
    
    addMessage('user', text);
    set({ isTyping: true });
    
    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const response = getTemplateResponse(text, context);
    addMessage('assistant', response);
    
    set({ isTyping: false });
  },
  
  clearMessages: () => set({ messages: [] })
}));