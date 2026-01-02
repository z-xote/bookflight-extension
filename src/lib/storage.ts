/**
 * Chrome Extension Storage Utilities
 * 
 * Manages persistent storage for chat state and form data across popup sessions.
 * Uses chrome.storage.local for persistence between popup open/close cycles.
 */

import type { Message, FormSubmission, ViewType } from '@/types';

const STORAGE_KEYS = {
  MESSAGES: 'bfg-messages',
  FORM_DATA: 'bfg-form-data',
  IS_FIRST_MESSAGE: 'bfg-is-first-message',
  CURRENT_VIEW: 'bfg-current-view'
} as const;

/**
 * Get chrome storage API safely
 */
function getChromeStorage(): typeof chrome.storage.local | null {
  if (typeof globalThis !== 'undefined' && 'chrome' in globalThis) {
    const g = globalThis as unknown as { chrome?: { storage?: { local?: typeof chrome.storage.local } } };
    return g.chrome?.storage?.local ?? null;
  }
  return null;
}

/**
 * Save messages to chrome.storage.local
 */
export async function saveMessages(messages: Message[]): Promise<void> {
  const chromeStorage = getChromeStorage();
  
  if (!chromeStorage) {
    console.warn('Chrome storage not available, using localStorage fallback');
    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
    return;
  }
  
  try {
    await chromeStorage.set({
      [STORAGE_KEYS.MESSAGES]: messages
    });
  } catch (error) {
    console.error('Failed to save messages:', error);
  }
}

/**
 * Load messages from chrome.storage.local
 */
export async function loadMessages(): Promise<Message[]> {
  const chromeStorage = getChromeStorage();
  
  if (!chromeStorage) {
    console.warn('Chrome storage not available, using localStorage fallback');
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (!stored) return [];
      
      const messages = JSON.parse(stored);
      return Array.isArray(messages) 
        ? messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        : [];
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return [];
    }
  }
  
  try {
    const result = await chromeStorage.get(STORAGE_KEYS.MESSAGES);
    const messages = result[STORAGE_KEYS.MESSAGES];
    
    if (!Array.isArray(messages)) return [];
    
    return messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
  } catch (error) {
    console.error('Failed to load messages:', error);
    return [];
  }
}

/**
 * Save form data to chrome.storage.local
 */
export async function saveFormData(formData: FormSubmission | null): Promise<void> {
  const chromeStorage = getChromeStorage();
  
  if (!chromeStorage) {
    try {
      localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(formData));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
    return;
  }
  
  try {
    await chromeStorage.set({
      [STORAGE_KEYS.FORM_DATA]: formData
    });
  } catch (error) {
    console.error('Failed to save form data:', error);
  }
}

/**
 * Load form data from chrome.storage.local
 */
export async function loadFormData(): Promise<FormSubmission | null> {
  const chromeStorage = getChromeStorage();
  
  if (!chromeStorage) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FORM_DATA);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }
  
  try {
    const result = await chromeStorage.get(STORAGE_KEYS.FORM_DATA);
    const formData = result[STORAGE_KEYS.FORM_DATA];
    return (formData && typeof formData === 'object' && 'submission_type' in formData) 
      ? formData as FormSubmission 
      : null;
  } catch (error) {
    console.error('Failed to load form data:', error);
    return null;
  }
}

/**
 * Save first message flag
 */
export async function saveIsFirstMessage(isFirst: boolean): Promise<void> {
  const chromeStorage = getChromeStorage();
  
  if (!chromeStorage) {
    try {
      localStorage.setItem(STORAGE_KEYS.IS_FIRST_MESSAGE, JSON.stringify(isFirst));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
    return;
  }
  
  try {
    await chromeStorage.set({
      [STORAGE_KEYS.IS_FIRST_MESSAGE]: isFirst
    });
  } catch (error) {
    console.error('Failed to save first message flag:', error);
  }
}

/**
 * Load first message flag
 */
export async function loadIsFirstMessage(): Promise<boolean> {
  const chromeStorage = getChromeStorage();
  
  if (!chromeStorage) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.IS_FIRST_MESSAGE);
      return stored ? JSON.parse(stored) : true;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return true;
    }
  }
  
  try {
    const result = await chromeStorage.get(STORAGE_KEYS.IS_FIRST_MESSAGE);
    const value = result[STORAGE_KEYS.IS_FIRST_MESSAGE];
    return typeof value === 'boolean' ? value : true;
  } catch (error) {
    console.error('Failed to load first message flag:', error);
    return true;
  }
}

/**
 * Save current view state (form | chat | tools)
 */
export async function saveCurrentView(view: ViewType): Promise<void> {
  const chromeStorage = getChromeStorage();
  
  if (!chromeStorage) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_VIEW, view);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
    return;
  }
  
  try {
    await chromeStorage.set({
      [STORAGE_KEYS.CURRENT_VIEW]: view
    });
  } catch (error) {
    console.error('Failed to save current view:', error);
  }
}

/**
 * Load current view state
 */
export async function loadCurrentView(): Promise<ViewType> {
  const chromeStorage = getChromeStorage();
  
  if (!chromeStorage) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_VIEW);
      const view = stored as ViewType | null;
      return (view === 'form' || view === 'chat' || view === 'tools') ? view : 'form';
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return 'form';
    }
  }
  
  try {
    const result = await chromeStorage.get(STORAGE_KEYS.CURRENT_VIEW);
    const view = result[STORAGE_KEYS.CURRENT_VIEW] as ViewType | undefined;
    return (view === 'form' || view === 'chat' || view === 'tools') ? view : 'form';
  } catch (error) {
    console.error('Failed to load current view:', error);
    return 'form';
  }
}

/**
 * Clear all stored data (for reset)
 */
export async function clearAllStorage(): Promise<void> {
  const chromeStorage = getChromeStorage();
  
  if (!chromeStorage) {
    try {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
    return;
  }
  
  try {
    await chromeStorage.remove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}