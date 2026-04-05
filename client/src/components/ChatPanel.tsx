import { useState, useRef, useEffect } from 'react';
import { ChatMessage, ProximityConnection, User } from '../types';

interface ChatPanelProps {
  connectedUsers: ProximityConnection[];
  messages: ChatMessage[];
  currentUser: User | null;
  onSendMessage: (message: string) => void;
}

export function ChatPanel({ connectedUsers, messages, currentUser, onSendMessage }: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = currentUser?.userId ?? null;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isConnected = connectedUsers.length > 0;

  if (!isConnected) {
    return (
      <div className="bg-panel-bg border border-gray-800 rounded-lg p-4 h-[500px] flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-red-disconnected" />
          <span className="text-red-disconnected text-sm font-medium">🚫 Chat Disabled</span>
        </div>
        <p className="text-text-secondary text-sm text-center py-8">
          Move close to another user to enable chat
        </p>
      </div>
    );
  }

  return (
    <div className="bg-panel-bg border border-gray-800 rounded-lg h-[500px] flex flex-col">
      <div className="max-w-2xl mx-auto p-4">
        {/* Connection status */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-green-connected animate-pulse" />
          <span className="text-green-connected text-sm font-medium">
            ✅ Chat enabled with: {connectedUsers.map((u) => u.username).join(', ')}
          </span>
        </div>

        {/* Messages */}
        <div className="h-48 overflow-y-auto mb-3 space-y-2">
          {messages.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-cyan-glow text-sm font-medium mb-1">
                This is the beginning of your chat history with {connectedUsers.map((u) => u.username).join(', ')}
              </p>
              <p className="text-text-secondary text-sm">
                No messages yet. Say hello!
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.fromUserId === currentUserId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 ${
                    msg.fromUserId === currentUserId
                      ? 'bg-cyan-glow text-space-black'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-xs mt-1 ${
                    msg.fromUserId === currentUserId ? 'text-space-black/70' : 'text-text-secondary'
                  }`}>
                    {msg.fromUsername} • {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-glow placeholder:text-text-secondary"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-cyan-glow text-space-black font-medium px-4 py-2 rounded-lg hover:bg-cyan-glow/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
