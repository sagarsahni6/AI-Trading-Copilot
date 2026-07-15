// ============================================================
// Chat Store — Zustand store for AI chat
// ============================================================

import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  timestamp: number;
  isStreaming?: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;

  // Actions
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "👋 Hi! I'm your AI Trading Copilot. Ask me anything about the current market, option chain analysis, or trading strategies.\n\n**Example questions:**\n- Why is the trend bullish?\n- Explain the current BOS\n- What is Max Pain?\n- Should I hold overnight?\n- What's the risk-reward for this trade?",
      timestamp: Date.now(),
    },
  ],
  isLoading: false,
  error: null,
  conversationId: null,

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  updateLastMessage: (content) => {
    set((state) => {
      const messages = [...state.messages];
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant') {
        messages[messages.length - 1] = {
          ...lastMsg,
          content: lastMsg.content + content,
        };
      }
      return { messages };
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error, isLoading: false });
  },

  clearChat: () => {
    set({
      messages: [],
      conversationId: null,
      error: null,
    });
  },
}));
