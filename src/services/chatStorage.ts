// Chat Storage Service
// Manages chat sessions in localStorage with automatic cleanup and persistence

import { STORAGE_CONSTANTS } from '../constants';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  requestId?: string;
  mode?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = STORAGE_CONSTANTS.KEYS.CHAT_SESSIONS;
const CURRENT_SESSION_KEY = STORAGE_CONSTANTS.KEYS.CURRENT_SESSION;

export class ChatStorageService {
  // Get all chat sessions
  static getSessions(): ChatSession[] {
    try {
      const sessions = localStorage.getItem(STORAGE_KEY);
      if (!sessions) return [];
      
      const parsed = JSON.parse(sessions);
      return parsed.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      return [];
    }
  }

  // Save all sessions
  static saveSessions(sessions: ChatSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving chat sessions:', error);
    }
  }

  // Get current session ID
  static getCurrentSessionId(): string | null {
    return localStorage.getItem(CURRENT_SESSION_KEY);
  }

  // Set current session ID
  static setCurrentSessionId(sessionId: string): void {
    localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
  }

  // Create new session
  static createNewSession(title?: string): ChatSession {
    const newSession: ChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title || `Chat ${new Date().toLocaleDateString()}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const sessions = this.getSessions();
    sessions.unshift(newSession); // Add to beginning
    this.saveSessions(sessions);
    this.setCurrentSessionId(newSession.id);
    
    return newSession;
  }

  // Get session by ID
  static getSession(sessionId: string): ChatSession | null {
    const sessions = this.getSessions();
    return sessions.find(session => session.id === sessionId) || null;
  }

  // Get current session
  static getCurrentSession(): ChatSession {
    const currentId = this.getCurrentSessionId();
    if (currentId) {
      const session = this.getSession(currentId);
      if (session) return session;
    }
    
    // Create new session if none exists
    return this.createNewSession();
  }

  // Add message to current session
  static addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const sessions = this.getSessions();
    const currentSession = this.getCurrentSession();
    
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    // Update the session with new message
    const sessionIndex = sessions.findIndex(s => s.id === currentSession.id);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].messages.push(newMessage);
      sessions[sessionIndex].updatedAt = new Date();
    } else {
      // Session not found, add it
      currentSession.messages.push(newMessage);
      currentSession.updatedAt = new Date();
      sessions.unshift(currentSession);
    }

    this.saveSessions(sessions);
    return newMessage;
  }

  // Update session title
  static updateSessionTitle(sessionId: string, title: string): void {
    const sessions = this.getSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex !== -1) {
      sessions[sessionIndex].title = title;
      sessions[sessionIndex].updatedAt = new Date();
      this.saveSessions(sessions);
    }
  }

  // Check if current session needs a title (has messages but default title)
  static needsTitleGeneration(): boolean {
    const currentSession = this.getCurrentSession();
    const hasMessages = currentSession.messages.length > 0;
    const hasDefaultTitle = currentSession.title.startsWith('Chat ') || currentSession.title === 'New Chat';
    
    return hasMessages && hasDefaultTitle;
  }

  // Get conversation history for API (last N messages)
  static getConversationHistory(limit: number = 10): Array<{ role: string; content: string }> {
    const currentSession = this.getCurrentSession();
    const recentMessages = currentSession.messages.slice(-limit);
    
    return recentMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  // Delete session
  static deleteSession(sessionId: string): void {
    const sessions = this.getSessions();
    const filteredSessions = sessions.filter(s => s.id !== sessionId);
    this.saveSessions(filteredSessions);
    
    // If deleted session was current, create new one
    if (this.getCurrentSessionId() === sessionId) {
      this.createNewSession();
    }
  }

  // Clear all sessions
  static clearAllSessions(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_SESSION_KEY);
    this.createNewSession();
  }

  // Switch to different session
  static switchToSession(sessionId: string): boolean {
    const session = this.getSession(sessionId);
    if (session) {
      this.setCurrentSessionId(sessionId);
      return true;
    }
    return false;
  }
}