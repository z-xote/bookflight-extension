'use client';

import { create } from 'zustand';
import type { Message, FormSubmission } from '@/types';
import { sendToN8N } from '@/lib/api';

interface ChatStore {
  messages: Message[];
  isTyping: boolean;
  formData: FormSubmission | null;
  isFirstMessage: boolean; // TRACK IF FIRST MESSAGE
  addMessage: (role: 'user' | 'assistant', content: string, formData?: FormSubmission) => void;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
}

export const useChatMessages = create<ChatStore>((set, get) => ({
  messages: [],
  isTyping: false,
  formData: null,
  isFirstMessage: true, // INITIALIZE
  
  addMessage: (role, content, formData) => {
    const message: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    set((state) => ({ 
      messages: [...state.messages, message],
      ...(formData && { formData, isFirstMessage: true }) // RESET FLAG WHEN FORM PROVIDED
    }));
  },
  
  sendMessage: async (text) => {
    const { addMessage, formData, isFirstMessage } = get();
    
    if (!formData) {
      console.error('No form data available');
      addMessage('assistant', 'Error: Session data missing. Please refresh.');
      return;
    }
    
    // INJECT FORM DATA INTO FIRST MESSAGE
    let messageToSend = text;
    if (isFirstMessage) {
      messageToSend = buildMessageWithContext(text, formData);
      set({ isFirstMessage: false }); // MARK AS SENT
    }
    
    // Add user message (show original text to user, not injected version)
    addMessage('user', text);
    
    set({ isTyping: true });
    
    try {
      const aiResponse = await sendToN8N(messageToSend, formData.submission_type);
      addMessage('assistant', aiResponse);
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('assistant', 'Sorry, something went wrong. Please try again.');
    } finally {
      set({ isTyping: false });
    }
  },
  
  clearMessages: () => set({ messages: [], formData: null, isFirstMessage: true })
}));

// HELPER FUNCTION TO BUILD CONTEXTUALIZED MESSAGE
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