import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { User, ChatMessage, ProximityConnection } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<ProximityConnection[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Initialize socket connection
  useEffect(() => {
    console.log('Initializing socket connection to:', SOCKET_URL);
    
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.on('users:list', (allUsers: User[]) => {
      setUsers(allUsers);
    });

    socket.on('user:joined', (user: User) => {
      setUsers((prev) => {
        // Don't add self
        if (currentUser && user.userId === currentUser.userId) {
          return prev;
        }
        const exists = prev.find((u) => u.userId === user.userId);
        if (exists) return prev;
        return [...prev, user];
      });
    });

    socket.on('user:left', ({ userId }: { userId: string }) => {
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
      setConnectedUsers((prev) => prev.filter((u) => u.userId !== userId));
    });

    socket.on('user:moved', ({ userId, position }: { userId: string; position: { x: number; y: number } }) => {
      setUsers((prev) =>
        prev.map((u) => (u.userId === userId ? { ...u, position } : u))
      );
    });

    socket.on('proximity:connected', (connection: ProximityConnection) => {
      setConnectedUsers((prev) => {
        const exists = prev.find((u) => u.userId === connection.userId);
        if (exists) return prev;
        return [...prev, connection];
      });
    });

    socket.on('proximity:disconnected', ({ userId }: { userId: string }) => {
      setConnectedUsers((prev) => prev.filter((u) => u.userId !== userId));
      // Clear messages when connection is lost
      setMessages([]);
    });

    socket.on('chat:message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Join the cosmos
  const joinCosmos = useCallback((userId: string, username: string, position: { x: number; y: number }) => {
    if (!socketRef.current) return;

    socketRef.current.emit('user:join', { userId, username, position });

    // Set current user (we don't add self to the users list)
    const colors = ['#00d4ff', '#ff6b9d', '#00ff88', '#ffaa00', '#aa88ff', '#ff5588', '#88ff00', '#00aaff'];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = colors[Math.abs(hash) % colors.length];

    setCurrentUser({
      userId,
      username,
      position,
      color,
    });
  }, []);

  // Move user
  const moveUser = useCallback((userId: string, position: { x: number; y: number }) => {
    if (!socketRef.current) return;

    socketRef.current.emit('user:move', { userId, position });

    // Update local position
    if (currentUser && currentUser.userId === userId) {
      setCurrentUser((prev) => prev ? { ...prev, position } : null);
    }
  }, [currentUser]);

  // Send chat message
  const sendMessage = useCallback((message: string) => {
    if (!socketRef.current || !currentUser || connectedUsers.length === 0) return;

    // Send to first connected user for simplicity
    // In a full implementation, you'd have room-based chat
    const toUserId = connectedUsers[0].userId;
    socketRef.current.emit('chat:message', {
      fromUserId: currentUser.userId,
      toUserId,
      message,
    });

    // Add message locally
    const chatMessage: ChatMessage = {
      fromUserId: currentUser.userId,
      fromUsername: currentUser.username,
      message,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, chatMessage]);
  }, [currentUser, connectedUsers]);

  return {
    isConnected,
    users,
    currentUser,
    connectedUsers,
    messages,
    joinCosmos,
    moveUser,
    sendMessage,
  };
}
