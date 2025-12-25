/**
 * Chat ID Management
 * 
 * Generates and persists unique chat session IDs for conversation continuity.
 * Each browser session gets a unique UUID that persists across interactions.
 */

const STORAGE_KEY = 'bfg-chat-id';

/**
 * Get or create a unique chat ID for this session
 * Uses sessionStorage to maintain ID across page interactions
 */
export function getChatId(): string {
  // Try to get existing chatId from session
  let chatId = sessionStorage.getItem(STORAGE_KEY);
  
  if (!chatId) {
    // Generate new UUID using crypto API (with fallback)
    chatId = crypto.randomUUID?.() || 
             `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    sessionStorage.setItem(STORAGE_KEY, chatId);
  }
  
  return chatId;
}

/**
 * Reset the current chat session (generates new ID)
 */
export function resetChatId(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

/**
 * Get the current chat ID without creating a new one
 */
export function getCurrentChatId(): string | null {
  return sessionStorage.getItem(STORAGE_KEY);
}