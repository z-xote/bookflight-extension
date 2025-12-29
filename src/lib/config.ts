// Import package.json to extract version

import pkg from '@pkg' assert { type: 'json' }

export const N8N_CONFIG = {
  guide_mode: {
    url: 'https://www.quicklst.com/webhook/f04e78da-709a-4b07-b846-7286a4c89f2c/chat', // TODO: Replace with actual guide mode webhook
    route: 'bookflight-guide'
  },
  chat_mode: {
    url: 'https://www.quicklst.com/webhook/9bd8be74-62eb-4c38-9b9e-41feee25ecc8/chat', // TODO: Replace with actual chat mode webhook
    route: 'bookflight-chat'
  }
};

export const QUICK_ACTIONS = [
  { label: 'Check Availability', action: 'Check availability' },
  { label: 'Help with Pricing', action: 'Help with pricing' },
  { label: 'How to Sell', action: 'How do I sell a seat?' },
  { label: 'PNR Checklist', action: 'PNR checklist' }
];

export const APP_VERSION = pkg.version;