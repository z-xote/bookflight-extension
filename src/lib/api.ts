import { N8N_CONFIG } from './config';
import { getChatId } from './utils';
import type { BookingContext } from '@/types';

export async function sendToN8N(
  userMessage: string, 
  context: BookingContext
): Promise<string> {
  const chatId = getChatId();
  
  try {
    const response = await fetch(N8N_CONFIG.webhook.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId,
        message: userMessage,
        route: N8N_CONFIG.webhook.route,
        context
      })
    });
    
    if (!response.ok) throw new Error('Network error');
    
    const data = await response.json();
    return data.output || "Sorry, I couldn't process that request.";
    
  } catch (error) {
    console.error('N8N Error:', error);
    return "Connection error. Please check your network and try again.";
  }
}

// =============================================================================
// MARKDOWN PARSER
// =============================================================================
