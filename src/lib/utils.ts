export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  });
}

export function generateChatId(): string {
  return 'chat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

export function getChatId(): string {
  if (typeof window === 'undefined') return '';
  
  let chatId = sessionStorage.getItem('chatId');
  if (!chatId) {
    chatId = generateChatId();
    sessionStorage.setItem('chatId', chatId);
  }
  return chatId;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  const value = (text ?? '').trim();
  if (!value) return false;

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch (err) {
    try {
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }
}

// =============================================================================
// API
// =============================================================================
