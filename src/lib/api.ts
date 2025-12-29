import { N8N_CONFIG } from './config';
import { getChatId } from './utils';
import type { FormSubmission } from '@/types';

/**
 * Send message to appropriate n8n agent based on submission type
 * 
 * @param userMessage - The user's input message
 * @param formData - Form submission data with submission_type
 * @returns AI-generated response text
 */
export async function sendToN8N(
  userMessage: string, 
  formData: FormSubmission
): Promise<string> {
  const chatId = getChatId();
  
  // Route to correct agent based on submission_type
  const agentConfig = formData.submission_type === 'filled_form' 
    ? N8N_CONFIG.guide_mode 
    : N8N_CONFIG.chat_mode;
  
  try {
    const response = await fetch(agentConfig.url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        chatId,
        message: userMessage,
        route: agentConfig.route,
        form: formData // Send entire form structure
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