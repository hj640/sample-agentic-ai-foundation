export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    status?: string;
    tools_used?: string;
    citations?: string;
    message_id?: string;
    [key: string]: any;
  };
}

export interface ApiResponse {
  response?: string;
  message?: string;
  status?: string;
  tools_used?: string[];
  metadata?: {
    [key: string]: any;
  };
}

export interface FeedbackData {
  run_id: string;
  session_id: string;
  score: number;
  comment?: string;
}

export interface ClientConfig {
  baseUrl: string;
  agentRuntimeArn?: string;
  region?: string;
  authToken?: string;
}