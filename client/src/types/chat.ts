export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  model?: string;
}

export interface ChatRequest {
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  model?: string;
}

export interface ChatResponse {
  success: boolean;
  reply: string;
  model?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: string;
  timestamp: string;
}

export interface AIModel {
  value: string;
  label: string;
  description?: string;
}

export interface APIStatus {
  status: 'connected' | 'disconnected' | 'checking';
  message?: string;
}