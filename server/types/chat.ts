export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
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

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt?: number;
    completion?: number;
    request?: number;
  };
}

export interface HealthResponse {
  success: boolean;
  status: string;
  message?: string;
  timestamp: string;
  service: string;
  version: string;
  api_provider: string;
  endpoint: string;
  uptime: number;
}