import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  SmartToy as BotIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { apiService, ChatResponse } from '../services/api';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  mode?: string;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('rag');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check backend connection on component mount
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      await apiService.healthCheck();
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
      console.error('Backend connection failed:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
      mode,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response: ChatResponse = await apiService.sendMessage(inputMessage, mode);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.reply || 'No response received',
        isUser: false,
        timestamp: new Date(),
        mode: mode,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please check if the backend is running.',
        isUser: false,
        timestamp: new Date(),
        mode: 'error',
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            Agent 007
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={<div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: isConnected ? '#4caf50' : '#f44336' }} />}
              label={isConnected ? 'Connected' : 'Disconnected'}
              variant="outlined"
              size="small"
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Mode</InputLabel>
              <Select
                value={mode}
                label="Mode"
                onChange={(e) => setMode(e.target.value)}
              >
                <MenuItem value="rag">RAG Mode</MenuItem>
                <MenuItem value="tools">Tools Mode</MenuItem>
                <MenuItem value="heavy">Heavy Mode</MenuItem>
              </Select>
            </FormControl>
            
            <IconButton onClick={checkConnection} size="small">
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Messages Area */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2, backgroundColor: '#f5f5f5' }}>
        {messages.length === 0 ? (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2
          }}>
            <BotIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
            <Typography variant="h6" color="text.secondary">
              Welcome to Agent 007!
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Start a conversation by typing a message below.<br />
              Choose your preferred mode from the dropdown above.
            </Typography>
          </Box>
        ) : (
          messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                mb: 2,
                flexDirection: message.isUser ? 'row-reverse' : 'row',
              }}
            >
              <Box sx={{ mx: 1 }}>
                {message.isUser ? (
                  <PersonIcon sx={{ color: 'primary.main' }} />
                ) : (
                  <BotIcon sx={{ color: 'secondary.main' }} />
                )}
              </Box>
              
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  backgroundColor: message.isUser ? 'primary.main' : 'background.paper',
                  color: message.isUser ? 'primary.contrastText' : 'text.primary',
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.text}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mt: 1, 
                    opacity: 0.7,
                    fontSize: '0.7rem'
                  }}
                >
                  {message.timestamp.toLocaleTimeString()} {message.mode && `• ${message.mode}`}
                </Typography>
              </Paper>
            </Box>
          ))
        )}
        
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type your message here..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || !isConnected}
            variant="outlined"
            size="small"
          />
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim() || !isConnected}
            sx={{ minWidth: 100 }}
          >
            Send
          </Button>
          <Button
            variant="outlined"
            onClick={clearChat}
            disabled={messages.length === 0}
          >
            Clear
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatInterface;