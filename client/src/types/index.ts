export interface User {
  userId: string;
  username: string;
  position: {
    x: number;
    y: number;
  };
  color: string;
}

export interface ChatMessage {
  fromUserId: string;
  fromUsername: string;
  message: string;
  timestamp: string;
}

export interface ProximityConnection {
  userId: string;
  username: string;
}

export interface Position {
  x: number;
  y: number;
}
