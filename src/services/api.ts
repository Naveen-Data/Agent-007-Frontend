import axios from 'axios';
import { ChatStorageService } from './chatStorage';
import { API_CONSTANTS } from '../constants';

// API configuration uses constants and environment variables

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || API_CONSTANTS.DEFAULT_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
  },
  // Add additional configuration for production
  withCredentials: false,
});

// Generate unique request ID
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

export interface ChatMessage {
  message: string;
  mode?: string;
  conversation_history?: Array<{ role: string; content: string }>;
  request_id?: string;
  generate_title?: boolean;
}

export interface ChatResponse {
  reply: string;
  used_tools?: string[];
  session_title?: string;
}

export interface HealthResponse {
  status: string;
}

export const apiService = {
  // Health check
  async healthCheck(): Promise<HealthResponse> {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
  },

  // Send chat message with conversation history and unique request ID
  async sendMessage(message: string, mode: string = 'rag', generateTitle: boolean = false): Promise<ChatResponse & { request_id: string }> {
    // Generate unique request ID
    const requestId = generateRequestId();
    
    // Get recent conversation history (last 10 messages)
    const conversationHistory = ChatStorageService.getConversationHistory(10);
    
    const response = await apiClient.post<ChatResponse>('/api/chat/send', {
      message,
      mode,
      conversation_history: conversationHistory,
      request_id: requestId,
      generate_title: generateTitle,
    });
    
    return { ...response.data, request_id: requestId };
  },
};

export default apiService;