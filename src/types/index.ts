export interface BookingContext {
  firstName?: string;
  lastName?: string;
  title?: string;
  paxCount?: string;
  email?: string;
  phone?: string;
  origin?: string;
  destination?: string;
  departDate?: string;
  returnDate?: string;
  tripType?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface N8NConfig {
  webhook: {
    url: string;
    route: string;
  };
}

export interface QuickAction {
  label: string;
  action: string;
}

/**
 * n8n Webhook Request Payload
 */
export interface N8NRequest {
  chatId: string;
  message: string;
  route: string;
  context?: BookingContext;
}

/**
 * n8n Webhook Response
 */
export interface N8NResponse {
  output?: string;
  response?: string;
  message?: string;
}