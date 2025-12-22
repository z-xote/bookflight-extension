// Import package.json to extract version

import pkg from '@pkg' assert { type: 'json' }

export const N8N_CONFIG = {
  webhook: {
    url: 'https://www.quicklst.com/webhook/9bd8be74-62eb-4c38-9b9e-41feee25ecc8/chat',
    route: 'bookflight-amadeus'
  }
};

export const QUICK_ACTIONS = [
  { label: 'Check Availability', action: 'Check availability' },
  { label: 'Help with Pricing', action: 'Help with pricing' },
  { label: 'How to Sell', action: 'How do I sell a seat?' },
  { label: 'PNR Checklist', action: 'PNR checklist' }
];

export const APP_VERSION = pkg.version;

// =============================================================================
// UTILITIES
// =============================================================================
