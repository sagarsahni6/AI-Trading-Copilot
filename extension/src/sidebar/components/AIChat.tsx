// ============================================================
// AIChat — ChatGPT-like AI conversation panel
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Loader2, Trash2 } from 'lucide-react';
import { useChatStore } from '../stores/chat-store';
import type { ChatMessage } from '../stores/chat-store';
import { generateId } from '@shared/utils/formatters';

export function AIChat() {
  const messages = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);
  const addMessage = useChatStore((s) => s.addMessage);
  const setLoading = useChatStore((s) => s.setLoading);
  const clearChat = useChatStore((s) => s.clearChat);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /** Send a chat message to the AI */
  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setInput('');
    setLoading(true);

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'AI_CHAT_REQUEST',
        payload: {
          message: text,
        },
      });

      const result = response as {
        success: boolean;
        data?: { reply: string; reasoning?: string };
        error?: string;
      };

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: result.success
          ? result.data?.reply ?? 'No response received.'
          : `Error: ${result.error || 'Failed to get response'}`,
        reasoning: result.success ? result.data?.reasoning : undefined,
        timestamp: Date.now(),
      };
      addMessage(assistantMsg);
    } catch {
      addMessage({
        id: generateId(),
        role: 'assistant',
        content: 'Unable to connect to the AI backend. Make sure the server is running.',
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  /** Handle enter key */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /** Quick question buttons */
  const quickQuestions = [
    'Why CALL?',
    'Explain BOS',
    'What is Max Pain?',
    'Can I hold overnight?',
    'Current risk?',
  ];

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col">
      {/* Chat Header */}
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold text-white/60">
          <Bot size={14} className="text-primary-400" />
          AI Chat
        </h3>
        <button
          onClick={clearChat}
          className="rounded-md p-1 text-white/25 transition-colors hover:bg-surface-100 hover:text-white/50"
          title="Clear chat"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-1"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500/20">
              <Bot size={12} className="text-primary-400" />
            </div>
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-400" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-400" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-400" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => {
                setInput(q);
                inputRef.current?.focus();
              }}
              className="rounded-full border border-surface-200 bg-surface-50 px-2.5 py-1 text-2xs text-white/50 transition-all hover:border-primary-500/30 hover:text-white/70"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about the market..."
          className="flex-1 bg-transparent text-xs text-white placeholder-white/25 outline-none"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-white transition-all hover:bg-primary-500 disabled:opacity-30 disabled:hover:bg-primary-600"
        >
          {isLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
        </button>
      </div>
    </div>
  );
}

/** Individual chat message bubble */
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-primary-500/20' : 'bg-surface-200'
        }`}
      >
        {isUser ? (
          <User size={12} className="text-primary-300" />
        ) : (
          <Bot size={12} className="text-primary-400" />
        )}
      </div>

      {/* Message */}
      <div
        className={`max-w-[85%] rounded-xl px-3 py-2 text-2xs leading-relaxed ${
          isUser
            ? 'bg-primary-600/20 text-white/90'
            : 'bg-surface-100 text-white/70'
        }`}
      >
        {message.reasoning && (
          <div className="mb-2 border-l border-white/20 pl-2 text-white/40 italic">
            <span className="font-semibold not-italic block mb-0.5 text-[10px]">Thinking Process:</span>
            {message.reasoning.split('\n').map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        )}
        {message.content.split('\n').map((line, i) => (
          <p key={i} className={i > 0 ? 'mt-1' : ''}>
            {line}
          </p>
        ))}
      </div>
    </motion.div>
  );
}
