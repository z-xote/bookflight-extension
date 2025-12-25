import { N8N_CONFIG } from './config';
import { getChatId } from './utils';
import type { BookingContext } from '@/types';

/**
 * Send message to n8n AI backend
 * 
 * @param userMessage - The user's input message
 * @param context - Optional booking context for personalized responses
 * @returns AI-generated response text
 */
export async function sendToN8N(
  userMessage: string, 
  context?: BookingContext
): Promise<string> {
  const chatId = getChatId();
  
  try {
    const response = await fetch(N8N_CONFIG.webhook.url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        chatId,
        message: userMessage,
        route: N8N_CONFIG.webhook.route,
        ...(context && { context }) // Only include context if provided
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract response from n8n output field
    const aiResponse = data.output || data.response || data.message;
    
    if (!aiResponse) {
      throw new Error('No response from AI backend');
    }
    
    return aiResponse;
    
  } catch (error) {
    console.error('❌ n8n webhook error:', error);
    
    // User-friendly error message
    return "I'm having trouble connecting right now. Please check your internet connection and try again.";
  }
}