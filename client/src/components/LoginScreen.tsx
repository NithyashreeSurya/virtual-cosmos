import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface LoginScreenProps {
  onJoin: (userId: string, username: string) => void;
  connectionStatus?: 'connecting' | 'connected' | 'disconnected';
  onlineCount?: number;
}

export function LoginScreen({ onJoin, connectionStatus = 'connecting', onlineCount = 0 }: LoginScreenProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      const userId = uuidv4();
      onJoin(userId, username.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-space-black flex items-center justify-center">
      <div className="bg-panel-bg rounded-xl p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-cyan-glow">Virtual</span> Cosmos
          </h1>
          <p className="text-text-secondary">
            Move close to others to connect and chat
          </p>
        </div>

        {/* Connection status */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
          <span className="text-text-secondary text-sm">
            {connectionStatus === 'connected' ? `Online - ${onlineCount} users` : 'Connecting...'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-text-secondary text-sm mb-2">
              Enter your username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name..."
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-glow placeholder:text-text-secondary"
              autoFocus
              maxLength={20}
            />
          </div>

          <button
            type="submit"
            disabled={!username.trim()}
            className="w-full bg-cyan-glow text-space-black font-bold py-3 rounded-lg hover:bg-cyan-glow/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
          >
            Enter Cosmos
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-800">
          <p className="text-text-secondary text-xs text-center">
            Use <span className="text-white">WASD</span> or <span className="text-white">Arrow Keys</span> to move
          </p>
        </div>
      </div>
    </div>
  );
}
