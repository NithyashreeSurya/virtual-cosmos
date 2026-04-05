# Virtual Cosmos

A 2D virtual environment where users can move around and interact with each other in real-time. When users come close, chat connects automatically; when they move apart, chat disconnects.

## Features

- **Real-time Multiplayer**: See other users moving in real-time
- **Proximity-based Chat**: Chat automatically connects when users are within range (150px)
- **Smooth Movement**: WASD or Arrow keys to navigate the virtual space
- **Visual Feedback**: Proximity zones, glowing avatars, connection indicators
- **Dark Space Theme**: Immersive cosmic visual design

## Tech Stack

### Frontend
- React 18 with Vite
- PixiJS for 2D canvas rendering
- Tailwind CSS for styling
- Socket.IO Client

### Backend
- Node.js with Express
- Socket.IO for real-time communication
- MongoDB for user/session storage

## Prerequisites

- Node.js 18+
- MongoDB (local or cloud instance)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cosmos
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

## Configuration

### Server (.env)

Create a `.env` file in the `server` directory:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/cosmos
CORS_ORIGIN=http://localhost:5173
```

### Client

The client is configured to connect to `http://localhost:3001` by default. To change this, create a `.env` file in the `client` directory:

```env
VITE_SOCKET_URL=http://localhost:3001
```

## Running the Application

### 1. Start MongoDB

Make sure MongoDB is running on your system. For local MongoDB:

```bash
# macOS/Linux
mongod

# Windows
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
```

### 2. Start the Backend Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:3001`.

### 3. Start the Frontend

In a new terminal:

```bash
cd client
npm run dev
```

The client will start on `http://localhost:5173`.

## How to Use

1. Open `http://localhost:5173` in your browser
2. Enter a username and click "Enter Cosmos"
3. Use **WASD** or **Arrow Keys** to move around
4. Move close to another user to start chatting
5. Move away to disconnect the chat

## Controls

- **W / Arrow Up**: Move up
- **S / Arrow Down**: Move down
- **A / Arrow Left**: Move left
- **D / Arrow Right**: Move right
- **Enter**: Send message

## Project Structure

```
cosmos/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom hooks (useSocket)
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Backend server
│   ├── src/
│   │   ├── models/        # Mongoose models (User)
│   │   ├── socket/        # Socket.IO handlers
│   │   └── index.ts       # Express server
│   ├── package.json
│   └── .env.example
├── SPEC.md                 # Project specification
└── README.md               # This file
```

## Socket Events

### Client → Server
- `user:join` - User joins the cosmos
- `user:move` - Position update
- `chat:message` - Chat message

### Server → Client
- `users:list` - All connected users
- `user:joined` - New user joined
- `user:left` - User disconnected
- `user:moved` - Position update
- `proximity:connected` - Proximity connection
- `proximity:disconnected` - Proximity disconnect
- `chat:message` - Chat message

## License

MIT
