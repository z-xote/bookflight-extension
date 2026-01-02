import type { ToolConfig } from '@/types';

export const AVAILABLE_TOOLS: ToolConfig[] = [
  {
    id: 'availability',
    name: 'Availability Search',
    description: 'Search for available flights using Amadeus commands with AI assistance',
    icon: '✈️',
    hasChatbar: true,
  },
  {
    id: 'pricing',
    name: 'Pricing Calculator',
    description: 'Calculate fare quotes and pricing for bookings',
    icon: '💰',
    hasChatbar: false,
  },
  {
    id: 'pnr-builder',
    name: 'PNR Builder',
    description: 'Build and validate PNR records step-by-step',
    icon: '📋',
    hasChatbar: true,
  },
  {
    id: 'seat-map',
    name: 'Seat Map Viewer',
    description: 'View and select seats with visual seat maps',
    icon: '💺',
    hasChatbar: false,
  },
];