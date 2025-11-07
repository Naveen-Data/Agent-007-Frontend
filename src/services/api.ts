import axios from 'axios';

// Dynamic API URL configuration
const getApiBaseUrl = () => {
  // Production: Use environment variable
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Development: Use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }
  
  // Fallback for production builds without env vars
  return window.location.origin.includes('localhost') 
    ? 'http://localhost:8000'
    : 'https://your-backend-url.awsapprunner.com'; // Update this after deployment
};

const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
  },
  // Add additional configuration for production
  withCredentials: false,
});

export interface ChatMessage {
  message: string;
  mode?: string;
}

export interface ChatResponse {
  reply: string;
  used_tools?: string[];
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

  // Send chat message
  async sendMessage(message: string, mode: string = 'rag'): Promise<ChatResponse> {
    const response = await apiClient.post<ChatResponse>('/api/chat/send', {
      message,
      mode,
    });
    return response.data;
  },
};

export default apiService;