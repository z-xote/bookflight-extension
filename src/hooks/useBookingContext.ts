'use client';

import { create } from 'zustand';
import type { BookingContext } from '@/types';

interface BookingContextStore {
  context: BookingContext;
  setContext: (context: BookingContext) => void;
  updateContext: (partial: Partial<BookingContext>) => void;
  resetContext: () => void;
}

export const useBookingContext = create<BookingContextStore>((set) => ({
  context: {},
  setContext: (context) => set({ context }),
  updateContext: (partial) => set((state) => ({ 
    context: { ...state.context, ...partial } 
  })),
  resetContext: () => set({ context: {} })
}));
