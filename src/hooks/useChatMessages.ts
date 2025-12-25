'use client';

import { create } from 'zustand';
import type { Message, BookingContext } from '@/types';
import { sendToN8N } from '@/lib/api';

interface ChatStore {
  messages: Message[];
  isTyping: boolean;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  sendMessage: (text: string, context?: BookingContext) => Promise<void>;
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
    
    // Add user message immediately
    addMessage('user', text);
    
    // Show typing indicator
    set({ isTyping: true });
    
    try {
      // Send to n8n webhook and get AI response
      const aiResponse = await sendToN8N(text, context);
      
      // Add AI response
      addMessage('assistant', aiResponse);
      
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('assistant', 'Sorry, something went wrong. Please try again.');
    } finally {
      // Hide typing indicator
      set({ isTyping: false });
    }
  },
  
  clearMessages: () => set({ messages: [] })
}));