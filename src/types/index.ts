export type ViewType = 'form' | 'chat' | 'tools';

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  icon: string; 
  hasChatbar: boolean; 
  component?: React.ComponentType<ToolProps>; 
}

export interface ToolProps {
  onBack: () => void;
  onSendMessage?: (message: string) => Promise<void>; 
}

export interface BookingContext {
  paxCount?: string;
  email?: string;
  phone?: string;
  origin?: string;
  destination?: string;
  departDate?: string;
  returnDate?: string;
  tripType?: string;
  passengers?: Array<{
    title: string;
    firstName: string;
    lastName: string;
  }>;
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

export type SubmissionType = 'filled_form' | 'skipped_form';

export interface PassengerData {
  title: string;
  firstName: string;
  lastName: string;
}

export interface FormSubmission {
  submission_type: SubmissionType;
  passengers: PassengerData[];
  contact_info: {
    email?: string;
    phone?: string;
  };
  travel_details: {
    origin?: string;
    destination?: string;
    departure?: string;
    return?: string;
    trip_type?: string;
  };
}