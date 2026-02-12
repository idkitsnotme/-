
export type Role = 'user' | 'assistant' | 'system';

export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  image?: {
    data: string;
    mimeType: string;
  };
  error?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  location: string;
}
