'use client';

import { create } from 'zustand';
import type { Message, BookingContext } from '@/types';
import { sendToN8N } from '@/lib/api';

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
    
    try {
      const response = await sendToN8N(text, context);
      addMessage('assistant', response);
    } catch (error) {
      addMessage('assistant', 'Sorry, something went wrong. Please try again.');
    } finally {
      set({ isTyping: false });
    }
  },
  
  clearMessages: () => set({ messages: [] })
}));

// =============================================================================
// UI COMPONENTS
// =============================================================================
