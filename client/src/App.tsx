import { useState, useEffect, useCallback } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { CosmosGame } from './components/CosmosGame';
import { ChatPanel } from './components/ChatPanel';
import { UserInfo } from './components/UserInfo';
import { ConnectionIndicator } from './components/ConnectionIndicator';
import { useSocket } from './hooks/useSocket';
import { User } from './types';

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

function App() {
  const [isInCosmos, setIsInCosmos] = useState(false);
  const [username, setUsername] = useState('');
  
  const {
    isConnected,
    users,
    currentUser,
    connectedUsers,
    messages,
    joinCosmos,
    moveUser,
    sendMessage,
  } = useSocket();

  const handleJoin = useCallback((userId: string, name: string) => {
    setUsername(name);
    setIsInCosmos(true);
    
    // Generate random starting position
    const position = {
      x: Math.random() * (CANVAS_WIDTH - 200) + 100,
      y: Math.random() * (CANVAS_HEIGHT - 200) + 100,
    };
    
    joinCosmos(userId, name, position);
  }, [joinCosmos]);

  const handleMove = useCallback((position: { x: number; y: number }) => {
    if (currentUser) {
      moveUser(currentUser.userId, position);
    }
  }, [currentUser, moveUser]);

  const handleSendMessage = useCallback((message: string) => {
    sendMessage(message);
  }, [sendMessage]);

  // Show connection status before login
  if (!isInCosmos) {
    return (
      <LoginScreen
        onJoin={handleJoin}
        connectionStatus={isConnected ? 'connected' : 'connecting'}
        onlineCount={users.length}
      />
    );
  }

  return (
    <div className="min-h-screen bg-space-black flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-[1200px] mb-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">
            <span className="text-cyan-glow">Virtual</span> Cosmos
          </h1>
          <ConnectionIndicator 
            isConnected={isConnected} 
            connectedCount={connectedUsers.length} 
          />
        </div>
        <UserInfo 
          currentUser={currentUser} 
          usersCount={users.length} 
        />
      </div>

      {/* Main game area */}
      <div className="relative flex">
        <CosmosGame 
          users={users}
          currentUser={currentUser}
          onMove={handleMove}
        />
        
        {/* Fixed Chat Panel in right corner */}
        <div className="fixed right-4 top-20 w-80">
          <ChatPanel
            messages={messages}
            connectedUsers={connectedUsers}
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="mt-4 flex gap-3 bg-panel-bg px-6 py-3 rounded-full">
        <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full transition-colors">
          <span>⬅️</span> Move
        </button>
        <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full transition-colors">
          <span>👍</span> React
        </button>
        <button className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${connectedUsers.length > 0 ? 'bg-green-connected text-space-black' : 'bg-gray-700 text-white'}`}>
          <span>💬</span> Chat {connectedUsers.length > 0 && `(${connectedUsers.length})`}
        </button>
        <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full transition-colors">
          <span>➕</span> Invite
        </button>
        <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full transition-colors">
          <span>📱</span> Apps
        </button>
      </div>

      {/* Controls hint */}
      <div className="mt-2 text-text-secondary text-sm">
        Use <span className="text-white">WASD</span> or <span className="text-white">Arrow Keys</span> to move • Move close to others to chat
      </div>
    </div>
  );
}

export default App;
