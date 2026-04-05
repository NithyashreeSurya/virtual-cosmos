# Virtual Cosmos - Project Specification

## 1. Project Overview

**Project Name:** Virtual Cosmos  
**Project Type:** Real-time multiplayer web application  
**Core Functionality:** A 2D virtual environment where users can move around and interact with each other in real-time. When users come close, chat connects automatically; when they move apart, chat disconnects.  
**Target Users:** Anyone who wants to experience proximity-based virtual social interaction

---

## 2. Technical Architecture

### Tech Stack

**Frontend:**
- React 18+ with Vite
- PixiJS 7+ (2D canvas rendering)
- Tailwind CSS (styling)
- Socket.IO Client

**Backend:**
- Node.js with Express
- Socket.IO (real-time WebSocket communication)
- MongoDB with Mongoose (user/session storage)

### Project Structure

```
cosmos/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom hooks
│   │   ├── game/          # PixiJS game logic
│   │   ├── socket/        # Socket.IO logic
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                 # Backend server
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # Express routes
│   │   ├── socket/       # Socket.IO handlers
│   │   ├── types/        # TypeScript types
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── SPEC.md
└── README.md
```

---

## 3. UI/UX Specification

### Layout Structure

**Main Canvas Area:**
- Full viewport 2D canvas (PixiJS)
- Dark space theme background

**Overlay UI:**
- Top-left: User info panel
- Top-right: Active connections count
- Bottom-center: Chat panel (when connected)
- Center: Proximity indicator (visual feedback)

### Visual Design

**Color Palette:**
- Background: `#0a0a0f` (deep space black)
- Canvas background: `#12121a` (dark space)
- Primary accent: `#00d4ff` (cyan glow)
- Secondary accent: `#ff6b9d` (pink)
- Connected state: `#00ff88` (green glow)
- Disconnected state: `#ff4466` (red)
- Text primary: `#ffffff`
- Text secondary: `#8888aa`
- Panel background: `rgba(20, 20, 30, 0.9)`

**Typography:**
- Font family: `Inter, system-ui, sans-serif`
- Headings: 18px bold
- Body: 14px regular
- Small: 12px

**Spacing System:**
- Base unit: 4px
- Padding small: 8px
- Padding medium: 16px
- Padding large: 24px
- Border radius: 8px

**Visual Effects:**
- User avatars: Glowing circle with color
- Proximity zone: Semi-transparent circle around users
- Connected users: Pulsing glow effect
- Chat panel: Slide-up animation (300ms ease-out)

### Components

**1. Canvas Component**
- Full-screen PixiJS application
- Renders all users as colored circles (radius 20px)
- Proximity zone visualization (radius 150px, semi-transparent)

**2. User Avatar**
- Circle shape with glow
- Username label below
- Color based on user ID hash

**3. Chat Panel**
- Appears when connected to any user
- Slides up from bottom
- Shows connection status
- Message input + send button
- Messages scroll container

**4. User Info Panel (Top-left)**
- Current user name
- Current position (x, y)

**5. Connection Indicator (Top-right)**
- Number of active connections
- List of connected usernames

---

## 4. Functionality Specification

### Core Features

**4.1 User Movement**
- WASD or Arrow keys for movement
- Movement speed: 5 pixels per frame
- Smooth movement with key hold
- Position bounds: Keep within canvas

**4.2 Real-Time Multiplayer**
- All connected users visible on canvas
- Position updates via Socket.IO (60fps target)
- User join/leave events broadcast

**4.3 Proximity Detection**
- Proximity radius: 150 pixels (configurable)
- Distance calculation: Euclidean
- Check frequency: Every frame
- Connection events emitted to both users

**4.4 Chat System**
- Auto-connect when within proximity
- Auto-disconnect when out of range
- Messages stored in memory (session only)
- Timestamp on messages
- Auto-scroll to newest message

### User Interactions

**Movement Controls:**
- W / ArrowUp: Move up
- S / ArrowDown: Move down
- A / ArrowLeft: Move left
- D / ArrowRight: Move right
- Diagonal movement supported

**Chat Interactions:**
- Type message in input
- Press Enter or click Send to send
- Messages appear instantly
- Press Escape to close chat (returns to disconnected state)

### Data Handling

**User State (MongoDB):**
```typescript
interface User {
  userId: string;
  username: string;
  position: { x: number; y: number };
  color: string;
  lastActive: Date;
  createdAt: Date;
}
```

**Socket Events:**
- `user:join` - User joins the space
- `user:leave` - User disconnects
- `user:move` - Position update
- `user:position` - Broadcast position
- `chat:message` - Chat message
- `proximity:connect` - Proximity connection established
- `proximity:disconnect` - Proximity connection ended

### Edge Cases

- User disconnects unexpectedly → Remove from canvas, notify connected users
- No users in space → Show helpful message to wait
- Multiple users at same position → Handle gracefully
- Canvas resize → Recalculate bounds
- Network disconnect → Show reconnection message

---

## 5. API Specification

### REST Endpoints

**User Routes:**
- `POST /api/users` - Create new user
- `GET /api/users` - Get all users
- `GET /api/users/:userId` - Get user by ID
- `PUT /api/users/:userId` - Update user position

### Socket.IO Events

**Client → Server:**
- `join` - Join the cosmos
- `move` - Update position
- `chat` - Send message
- `disconnect` - Leave cosmos

**Server → Client:**
- `users` - All users data
- `userJoined` - New user joined
- `userLeft` - User left
- `userMoved` - User position update
- `proximityConnected` - Proximity connection
- `proximityDisconnected` - Proximity disconnect
- `chatMessage` - New chat message

---

## 6. Acceptance Criteria

### Visual Checkpoints
- [ ] Dark space theme renders correctly
- [ ] User avatars display as glowing circles
- [ ] Proximity zones visible around users
- [ ] Chat panel slides up smoothly when connected
- [ ] Connection count updates in real-time

### Functional Checkpoints
- [ ] User can move with WASD/Arrow keys
- [ ] Movement is smooth and responsive
- [ ] Other users visible and moving in real-time
- [ ] Chat connects when within 150px proximity
- [ ] Chat disconnects when moving beyond 150px
- [ ] Messages sent/received instantly
- [ ] User info panel shows position

### Technical Checkpoints
- [ ] Server runs without errors
- [ ] Client builds without errors
- [ ] Socket.IO connection stable
- [ ] MongoDB stores user data
- [ ] No memory leaks during extended use

---

## 7. Configuration

### Environment Variables

**Server (.env):**
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/cosmos
CORS_ORIGIN=http://localhost:5173
```

**Client (.env):**
```
VITE_SOCKET_URL=http://localhost:3001
```

### Constants

```typescript
const PROXIMITY_RADIUS = 150;
const MOVEMENT_SPEED = 5;
const USER_RADIUS = 20;
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;