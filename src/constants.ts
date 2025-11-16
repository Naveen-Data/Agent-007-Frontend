// Frontend Application Constants
// Centralized constants for Agent 007 Frontend - Environment variables are kept separate

// =============================================================================
// API CONSTANTS
// =============================================================================

export const API_CONSTANTS = {
  // Base URLs
  DEFAULT_API_BASE_URL: 'http://localhost:8000',
  API_VERSION: 'v1',
  
  // Endpoints
  ENDPOINTS: {
    CHAT: '/api/chat',
    TOOLS_AVAILABLE: '/api/tools/available',
    TOOLS_CONFIGURE: '/api/tools/configure',
    TOOLS_RESET: '/api/tools/reset',
    TOOLS_ENABLE: '/api/tools/enable',
    TOOLS_DISABLE: '/api/tools/disable',
    LOGS: '/api/logs',
    MCP: '/api/mcp',
  },
  
  // Request Settings
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// =============================================================================
// UI CONSTANTS
// =============================================================================

export const UI_CONSTANTS = {
  // Message Types
  MESSAGE_TYPES: {
    USER: 'user',
    ASSISTANT: 'assistant',
    SYSTEM: 'system',
    TOOL: 'tool',
    ERROR: 'error',
  },
  
  // Chat Settings
  MAX_MESSAGE_LENGTH: 5000,
  MAX_SESSION_NAME_LENGTH: 100,
  DEFAULT_SESSION_NAME: 'New Chat',
  
  // UI Behavior
  TYPING_INDICATOR_DELAY: 1000, // milliseconds
  AUTO_SCROLL_THRESHOLD: 100,
  DEBOUNCE_DELAY: 300, // milliseconds
  
  // Mode Settings
  DEFAULT_MODE: 'chat',
  EXPRESSIVE_BUTTON_TEXT: 'Expressive',
  EXPRESSIVE_BUTTON_TOOLTIP: 'Use advanced model for detailed, expressive responses',
  
  // Animations
  FADE_DURATION: 200, // milliseconds
  SLIDE_DURATION: 300, // milliseconds
  
  // Layout
  SIDEBAR_WIDTH: 280, // pixels
  MOBILE_BREAKPOINT: 768, // pixels
  MAX_CONTENT_WIDTH: 1200, // pixels
} as const;

// =============================================================================
// THEME CONSTANTS
// =============================================================================

export const THEME_CONSTANTS = {
  // Color Scheme
  THEMES: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
  },
  
  // Color Classes (Tailwind)
  COLORS: {
    PRIMARY: 'blue',
    SECONDARY: 'gray',
    SUCCESS: 'green',
    WARNING: 'yellow',
    ERROR: 'red',
    INFO: 'blue',
  },
  
  // Status Colors
  STATUS_COLORS: {
    ENABLED: 'text-green-600 bg-green-100',
    DISABLED: 'text-red-600 bg-red-100',
    PENDING: 'text-yellow-600 bg-yellow-100',
    ERROR: 'text-red-600 bg-red-100',
  },
} as const;

// =============================================================================
// STORAGE CONSTANTS
// =============================================================================

export const STORAGE_CONSTANTS = {
  // Local Storage Keys
  KEYS: {
    CHAT_SESSIONS: 'agent_007_chat_sessions',
    CURRENT_SESSION: 'agent_007_current_session',
    USER_PREFERENCES: 'agent_007_user_preferences',
    THEME: 'agent_007_theme',
    API_BASE_URL: 'agent_007_api_base_url',
    TOOL_CONFIG: 'agent_007_tool_config',
  },
  
  // Storage Limits
  MAX_SESSIONS: 50,
  MAX_MESSAGES_PER_SESSION: 100,
  MAX_STORAGE_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

// =============================================================================
// VALIDATION CONSTANTS
// =============================================================================

export const VALIDATION_CONSTANTS = {
  // Input Limits
  MIN_MESSAGE_LENGTH: 1,
  MAX_MESSAGE_LENGTH: 5000,
  MIN_SESSION_NAME_LENGTH: 1,
  MAX_SESSION_NAME_LENGTH: 100,
  
  // Patterns
  SESSION_ID_PATTERN: /^[a-zA-Z0-9_-]+$/,
  URL_PATTERN: /^https?:\/\/.+/,
  
  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['.txt', '.md', '.json', '.csv'],
} as const;

// =============================================================================
// AGENT CONSTANTS (Frontend UI-specific)
// =============================================================================

export const AGENT_CONSTANTS = {
  // Agent Modes (for UI display)
  MODES: {
    RAG: 'rag',
    TOOLS: 'tools',
    CHAT: 'chat',        // Default conversational mode
    EXPRESSIVE: 'expressive', // Heavy model for detailed responses
    ENHANCED_TOOLS: 'enhanced_tools',
  },
  
  // Tool Categories (for UI grouping)
  TOOL_CATEGORIES: {
    INFORMATION: 'Information',
    DEVELOPMENT: 'Development',
    KNOWLEDGE_BASE: 'Knowledge Base',
    UTILITY: 'Utility',
    OTHER: 'Other',
  },
  
  // Tool Status (for UI display)
  TOOL_STATUS: {
    ENABLED: 'enabled',
    DISABLED: 'disabled',
    ERROR: 'error',
  },
} as const;

// =============================================================================
// ERROR CONSTANTS
// =============================================================================

export const ERROR_CONSTANTS = {
  // Error Types
  TYPES: {
    NETWORK: 'NETWORK_ERROR',
    API: 'API_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    STORAGE: 'STORAGE_ERROR',
    TIMEOUT: 'TIMEOUT_ERROR',
  },
  
  // Error Messages
  MESSAGES: {
    NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
    API_ERROR: 'Server error occurred. Please try again later.',
    VALIDATION_ERROR: 'Invalid input. Please check your input and try again.',
    STORAGE_ERROR: 'Failed to save data. Storage might be full.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',
    GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
  },
  
  // Retry Settings
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAYS: [1000, 2000, 5000], // milliseconds
} as const;

// =============================================================================
// FEATURE FLAGS
// =============================================================================

export const FEATURE_FLAGS = {
  // Core Features
  ENABLE_DARK_MODE: true,
  ENABLE_TOOL_CONFIGURATION: true,
  ENABLE_CHAT_EXPORT: true,
  ENABLE_SESSION_PERSISTENCE: true,
  
  // Advanced Features
  ENABLE_FILE_UPLOAD: false,
  ENABLE_VOICE_INPUT: false,
  ENABLE_ANALYTICS: false,
  ENABLE_OFFLINE_MODE: false,
  
  // Debug Features
  ENABLE_DEBUG_PANEL: process.env.NODE_ENV === 'development',
  ENABLE_PERFORMANCE_MONITORING: process.env.NODE_ENV === 'development',
  ENABLE_ERROR_REPORTING: process.env.NODE_ENV === 'production',
} as const;

// =============================================================================
// KEYBOARD SHORTCUTS
// =============================================================================

export const KEYBOARD_SHORTCUTS = {
  // Chat Actions
  SEND_MESSAGE: ['Enter'],
  NEW_LINE: ['Shift+Enter'],
  NEW_CHAT: ['Ctrl+N', 'Cmd+N'],
  
  // Navigation
  TOGGLE_SIDEBAR: ['Ctrl+B', 'Cmd+B'],
  SEARCH: ['Ctrl+K', 'Cmd+K'],
  
  // Settings
  TOGGLE_THEME: ['Ctrl+Shift+T', 'Cmd+Shift+T'],
  OPEN_SETTINGS: ['Ctrl+,', 'Cmd+,'],
} as const;

// =============================================================================
// VERSION CONSTANTS
// =============================================================================

export const VERSION_CONSTANTS = {
  APP_VERSION: '1.0.0',
  API_VERSION: 'v1',
  BUILD_DATE: new Date().toISOString(),
  
  // Compatibility
  MIN_API_VERSION: 'v1',
  SUPPORTED_BROWSERS: ['Chrome', 'Firefox', 'Safari', 'Edge'],
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export const getConstantsByCategory = (category: keyof typeof CONSTANTS_REGISTRY) => {
  return CONSTANTS_REGISTRY[category];
};

export const getAllConstants = () => {
  return CONSTANTS_REGISTRY;
};

// Registry of all constants for easy access
const CONSTANTS_REGISTRY = {
  api: API_CONSTANTS,
  ui: UI_CONSTANTS,
  theme: THEME_CONSTANTS,
  storage: STORAGE_CONSTANTS,
  validation: VALIDATION_CONSTANTS,
  agent: AGENT_CONSTANTS,
  error: ERROR_CONSTANTS,
  features: FEATURE_FLAGS,
  keyboard: KEYBOARD_SHORTCUTS,
  version: VERSION_CONSTANTS,
} as const;

export default CONSTANTS_REGISTRY;