'use client';

import { create } from 'zustand';
import type { Message, FormSubmission } from '@/types';
import { sendToN8N } from '@/lib/api';
import { 
  saveMessages, 
  loadMessages, 
  saveFormData, 
  loadFormData,
  saveIsFirstMessage,
  loadIsFirstMessage
} from '@/lib/storage';

interface ChatStore {
  messages: Message[];
  isTyping: boolean;
  formData: FormSubmission | null;
  isFirstMessage: boolean;
  isHydrated: boolean; // NEW: Track if state has been loaded from storage
  addMessage: (role: 'user' | 'assistant', content: string, formData?: FormSubmission) => void;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
  hydrateFromStorage: () => Promise<void>; // NEW: Load state from storage
}

export const useChatMessages = create<ChatStore>((set, get) => ({
  messages: [],
  isTyping: false,
  formData: null,
  isFirstMessage: true,
  isHydrated: false,
  
  // NEW: Hydrate state from chrome.storage on mount
  hydrateFromStorage: async () => {
    try {
      const [messages, formData, isFirstMessage] = await Promise.all([
        loadMessages(),
        loadFormData(),
        loadIsFirstMessage()
      ]);
      
      set({ 
        messages, 
        formData, 
        isFirstMessage,
        isHydrated: true 
      });
    } catch (error) {
      console.error('Failed to hydrate from storage:', error);
      set({ isHydrated: true }); // Mark as hydrated even on error
    }
  },
  
  addMessage: (role, content, formData) => {
    const message: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    
    set((state) => {
      const newMessages = [...state.messages, message];
      const newState = { 
        messages: newMessages,
        ...(formData && { formData, isFirstMessage: true })
      };
      
      // Persist to storage
      saveMessages(newMessages);
      if (formData) {
        saveFormData(formData);
        saveIsFirstMessage(true);
      }
      
      return newState;
    });
  },
  
  sendMessage: async (text) => {
    const { addMessage, formData, isFirstMessage } = get();
    
    if (!formData) {
      console.error('No form data available');
      addMessage('assistant', 'Error: Session data missing. Please refresh.');
      return;
    }
    
    // Inject form data into first message
    let messageToSend = text;
    if (isFirstMessage) {
      messageToSend = buildMessageWithContext(text, formData);
      set({ isFirstMessage: false });
      saveIsFirstMessage(false);
    }
    
    // Add user message (show original text to user)
    addMessage('user', text);
    
    set({ isTyping: true });
    
    try {
      const aiResponse = await sendToN8N(messageToSend, formData);
      addMessage('assistant', aiResponse);
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('assistant', 'Sorry, something went wrong. Please try again.');
    } finally {
      set({ isTyping: false });
    }
  },
  
  clearMessages: () => {
    set({ messages: [], formData: null, isFirstMessage: true });
    // Clear from storage
    saveMessages([]);
    saveFormData(null);
    saveIsFirstMessage(true);
  }
}));

// Helper function to build contextualized message
function buildMessageWithContext(message: string, formData: FormSubmission): string {
  const passengers = formData.passengers
    .filter(p => p.firstName && p.lastName)
    .map(p => `${p.title} ${p.firstName} ${p.lastName}`.trim())
    .join(', ');
  
  const parts = [message, '', '---', '[BOOKING CONTEXT]'];
  
  if (passengers) parts.push(`Passengers: ${passengers}`);
  if (formData.contact_info.phone) parts.push(`Phone: ${formData.contact_info.phone}`);
  if (formData.contact_info.email) parts.push(`Email: ${formData.contact_info.email}`);
  
  if (formData.travel_details.origin && formData.travel_details.destination) {
    parts.push(`Route: ${formData.travel_details.origin} → ${formData.travel_details.destination}`);
  }
  if (formData.travel_details.departure) parts.push(`Departure: ${formData.travel_details.departure}`);
  if (formData.travel_details.return) parts.push(`Return: ${formData.travel_details.return}`);
  if (formData.travel_details.trip_type) parts.push(`Trip Type: ${formData.travel_details.trip_type}`);
  
  return parts.join('\n');
}