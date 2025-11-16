import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Send, Upload, X, FileText, RefreshCw, MessageCircle, Plus, Trash2, Sparkles } from 'lucide-react';
import { UI_CONSTANTS } from '../constants';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ChatMessage, ChatMessageModel } from './ChatMessage';
import { apiService } from '../services/api';
import { ChatStorageService, ChatSession } from '../services/chatStorage';
import logger from '../services/logger';

type Mode = 'rag' | 'tools' | 'chat' | 'expressive' | 'enhanced_tools';
type UploadedFile = { id: string; name: string; size: number };

const ChatInterface: React.FC = () => {
  const getPreferredTheme = () => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('agent-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const [mode, setMode] = useState<Mode>('chat');
  const [isExpressiveMode, setIsExpressiveMode] = useState(false);
  const [messages, setMessages] = useState<ChatMessageModel[]>([]);
  const [input, setInput] = useState('');
  const [isDark, setIsDark] = useState<boolean>(getPreferredTheme);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('agent-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    checkConnection();
    loadCurrentSession();
  }, []);

  const loadCurrentSession = () => {
    const session = ChatStorageService.getCurrentSession();
    setCurrentSession(session);
    setSessions(ChatStorageService.getSessions());
    
    // Convert stored messages to ChatMessageModel format
    const chatMessages: ChatMessageModel[] = session.messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      mode: msg.mode || 'rag'
    }));
    setMessages(chatMessages);
  };

  const checkConnection = async () => {
    const startTime = performance.now();
    try {
      await apiService.healthCheck();
      setIsConnected(true);
      const duration = performance.now() - startTime;
      
      logger.logApiCall('/health', 'GET', duration, true);
      logger.info('Backend connection successful', 'connection');
    } catch (error) {
      setIsConnected(false);
      const duration = performance.now() - startTime;
      
      logger.logApiCall('/health', 'GET', duration, false, error);
      logger.error('Backend connection failed', 'connection', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const startTime = performance.now();
    const userMessage: ChatMessageModel = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      mode,
    };

    // Log user action
    logger.logUserAction('send_message', {
      mode,
      messageLength: userMessage.content.length,
      sessionId: currentSession?.id
    });

    // Save user message to storage
    ChatStorageService.addMessage({
      role: 'user',
      content: userMessage.content,
      mode
    });

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Check if we need to generate a title for this conversation
      const shouldGenerateTitle = ChatStorageService.needsTitleGeneration();
      
      // Use expressive mode if toggle is active and we're in chat mode
      const effectiveMode = (mode === 'chat' && isExpressiveMode) ? 'expressive' : mode;
      
      const response = await apiService.sendMessage(userMessage.content, effectiveMode, shouldGenerateTitle);
      const duration = performance.now() - startTime;
      
      const botMessage: ChatMessageModel = {
        id: (Date.now() + 1).toString(),
        content: response.reply || 'No response received',
        role: 'assistant',
        timestamp: new Date(),
        mode,
      };

      // Log successful API call with request ID
      logger.logApiCall('/api/chat/send', 'POST', duration, true, null, response.request_id);
      logger.info('Message sent successfully', 'chat', {
        mode,
        messageLength: userMessage.content.length,
        responseLength: botMessage.content.length,
        duration,
        request_id: response.request_id
      });

      // Save bot message to storage
      ChatStorageService.addMessage({
        role: 'assistant',
        content: botMessage.content,
        mode
      });

      // Update session title if generated
      if (response.session_title) {
        const currentSession = ChatStorageService.getCurrentSession();
        ChatStorageService.updateSessionTitle(currentSession.id, response.session_title);
        
        logger.info('Session title updated', 'chat', {
          sessionId: currentSession.id,
          newTitle: response.session_title,
          request_id: response.request_id
        });
      }

      setMessages(prev => [...prev, botMessage]);
      
      // Update sessions list
      setSessions(ChatStorageService.getSessions());
      
      // Log performance metric with request ID
      logger.logPerformance('chat_response', duration, {
        mode,
        messageLength: userMessage.content.length,
        responseLength: botMessage.content.length,
        request_id: response.request_id
      });
      
    } catch (error) {
      const duration = performance.now() - startTime;
      
      // Log error
      logger.logApiCall('/api/chat/send', 'POST', duration, false, error);
      logger.error('Error sending message', 'chat', {
        error: error instanceof Error ? error.message : String(error),
        mode,
        messageLength: userMessage.content.length
      });
      
      const errorMessage: ChatMessageModel = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please check if the backend is running.',
        role: 'assistant',
        timestamp: new Date(),
        mode: 'error',
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const next = Array.from(files).map(file => ({
      id: `${file.name}-${file.size}-${Date.now()}`,
      name: file.name,
      size: file.size,
    }));
    setUploadedFiles(prev => [...prev, ...next]);
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const createNewSession = () => {
    logger.logUserAction('create_new_session');
    const newSession = ChatStorageService.createNewSession();
    setCurrentSession(newSession);
    setMessages([]);
    setSessions(ChatStorageService.getSessions());
    setShowSessions(false);
    logger.info('New chat session created', 'session', { sessionId: newSession.id });
  };

  const switchToSession = (sessionId: string) => {
    if (ChatStorageService.switchToSession(sessionId)) {
      logger.logUserAction('switch_session', { sessionId });
      loadCurrentSession();
      setShowSessions(false);
      logger.info('Switched to session', 'session', { sessionId });
    }
  };

  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    logger.logUserAction('delete_session', { sessionId });
    ChatStorageService.deleteSession(sessionId);
    setSessions(ChatStorageService.getSessions());
    
    // If we deleted the current session, load the new current session
    if (currentSession?.id === sessionId) {
      loadCurrentSession();
    }
    logger.info('Session deleted', 'session', { sessionId });
  };

  const startEditingTitle = (sessionId: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
  };

  const saveTitle = (sessionId: string) => {
    if (editingTitle.trim()) {
      ChatStorageService.updateSessionTitle(sessionId, editingTitle.trim());
      setSessions(ChatStorageService.getSessions());
      
      logger.logUserAction('rename_session', { 
        sessionId, 
        newTitle: editingTitle.trim() 
      });
    }
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const cancelEditing = () => {
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent, sessionId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveTitle(sessionId);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-white text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Button variant="ghost" size="sm" onClick={() => setShowSessions(!showSessions)} className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Sessions
            </Button>
            {showSessions && (
              <div className="absolute top-full left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
                  <Button onClick={createNewSession} size="sm" className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    New Chat
                  </Button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {sessions.map(session => (
                    <div
                      key={session.id}
                      className={`p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer border-b border-zinc-100 dark:border-zinc-800 last:border-b-0 ${
                        currentSession?.id === session.id ? 'bg-zinc-100 dark:bg-zinc-800' : ''
                      }`}
                      onClick={() => switchToSession(session.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          {editingSessionId === session.id ? (
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={(e) => handleTitleKeyDown(e, session.id)}
                              onBlur={() => saveTitle(session.id)}
                              className="text-sm font-medium bg-transparent border-b border-blue-500 focus:outline-none w-full"
                              autoFocus
                            />
                          ) : (
                            <p 
                              className="text-sm font-medium truncate cursor-pointer hover:text-blue-500 transition-colors"
                              onClick={(e) => startEditingTitle(session.id, session.title, e)}
                              title="Click to rename"
                            >
                              {session.title}
                            </p>
                          )}
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {session.messages.length} messages • {session.updatedAt.toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => deleteSession(session.id, e)}
                          className="ml-2 p-1 h-6 w-6 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <h1 className="text-xl font-semibold">Agent 007</h1>
          <div className="flex items-center gap-2">
            <Select value={mode} onValueChange={(value) => {
              const newMode = value as Mode;
              setMode(newMode);
              // Reset expressive mode when changing away from chat
              if (newMode !== 'chat') {
                setIsExpressiveMode(false);
              }
              logger.logUserAction('change_mode', { mode: newMode, previousMode: mode });
            }}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rag">RAG</SelectItem>
                <SelectItem value="tools">Tools</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
                <SelectItem value="enhanced_tools">Enhanced Tools</SelectItem>
              </SelectContent>
            </Select>
            
            {mode === 'chat' && (
              <Button
                variant={isExpressiveMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setIsExpressiveMode(!isExpressiveMode);
                  logger.logUserAction('toggle_expressive_mode', { 
                    enabled: !isExpressiveMode,
                    mode: 'chat'
                  });
                }}
                className="gap-2"
                title={UI_CONSTANTS.EXPRESSIVE_BUTTON_TOOLTIP}
              >
                <Sparkles className="h-4 w-4" />
                {UI_CONSTANTS.EXPRESSIVE_BUTTON_TEXT}
              </Button>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={checkConnection} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Ping
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isConnected ? 'default' : 'destructive'} className="gap-1.5">
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          <Button variant="ghost" size="icon" onClick={() => {
            const newTheme = !isDark;
            setIsDark(newTheme);
            logger.logUserAction('toggle_theme', { theme: newTheme ? 'dark' : 'light' });
          }}>
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {messages.length === 0 && (
            <div className="mt-20 text-center text-zinc-400 dark:text-zinc-600">
              <p>Start a conversation in {mode.toUpperCase()} mode.</p>
            </div>
          )}
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex justify-center">
              <div className="mt-4 h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="mx-auto max-w-3xl">
          {mode === 'rag' && uploadedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {uploadedFiles.map(file => (
                <div key={file.id} className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-1.5 text-sm dark:bg-zinc-800">
                  <FileText className="h-4 w-4" />
                  <span>{file.name}</span>
                  <button onClick={() => handleRemoveFile(file.id)} className="hover:text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            {mode === 'rag' && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.txt,.doc,.docx"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-lg shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-5 w-5" />
                </Button>
              </>
            )}
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isConnected ? 'Type your message…' : 'Connect to backend before sending.'}
              className="flex-1 rounded-lg border border-zinc-200 bg-transparent text-sm leading-6 focus-visible:ring-2 focus-visible:ring-zinc-900 dark:border-zinc-800 dark:bg-transparent dark:focus-visible:ring-zinc-100"
              style={{ minHeight: '3rem', height: '3rem' }}
              disabled={!isConnected || isLoading}
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="h-12 w-12 rounded-lg shrink-0"
              disabled={!input.trim() || !isConnected || isLoading}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          {!isConnected && (
            <p className="mt-2 text-xs text-destructive">Backend offline — run the FastAPI service and press Ping.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;