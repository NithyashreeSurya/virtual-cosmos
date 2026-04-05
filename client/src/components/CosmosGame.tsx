import { useEffect, useRef } from 'react';
import { User } from '../types';

interface CosmosGameProps {
  users: User[];
  currentUser: User | null;
  onMove: (position: { x: number; y: number }) => void;
}

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const USER_RADIUS = 20;
const PROXIMITY_RADIUS = 150;
const MOVEMENT_SPEED = 8;

export function CosmosGame({ users, currentUser, onMove }: CosmosGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const animationRef = useRef<number | null>(null);
  const currentPosRef = useRef<{ x: number; y: number }>({ x: 400, y: 300 });

  // Initialize position when currentUser changes
  useEffect(() => {
    if (currentUser) {
      currentPosRef.current = { ...currentUser.position };
    }
  }, [currentUser]);

  // Sync positions when other users move
  useEffect(() => {
    // The users array already has updated positions from socket events
  }, [users]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop for movement
  useEffect(() => {
    const gameLoop = () => {
      if (!currentUser) {
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      let newX = currentPosRef.current.x;
      let newY = currentPosRef.current.y;
      const keys = keysRef.current;

      // Handle movement
      if (keys.has('w') || keys.has('arrowup')) {
        newY -= MOVEMENT_SPEED;
      }
      if (keys.has('s') || keys.has('arrowdown')) {
        newY += MOVEMENT_SPEED;
      }
      if (keys.has('a') || keys.has('arrowleft')) {
        newX -= MOVEMENT_SPEED;
      }
      if (keys.has('d') || keys.has('arrowright')) {
        newX += MOVEMENT_SPEED;
      }

      // Clamp position to canvas bounds
      newX = Math.max(USER_RADIUS, Math.min(CANVAS_WIDTH - USER_RADIUS, newX));
      newY = Math.max(USER_RADIUS, Math.min(CANVAS_HEIGHT - USER_RADIUS, newY));

      // Update position if changed
      if (newX !== currentPosRef.current.x || newY !== currentPosRef.current.y) {
        currentPosRef.current = { x: newX, y: newY };
        onMove({ x: newX, y: newY });
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentUser, onMove]);

  // Grid pattern for floor look
  const gridLines = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    position: i * 50,
  }));

  const allUsers = currentUser ? [currentUser, ...users] : users;

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundColor: '#1a1a2e',
        overflow: 'hidden',
        borderRadius: '8px',
      }}
    >
      {/* Grid lines for floor */}
      {gridLines.map((line) => (
        <>
          <div
            key={`h-${line.id}`}
            className="absolute"
            style={{
              left: 0,
              top: line.position,
              width: '100%',
              height: 1,
              backgroundColor: 'rgba(255,255,255,0.08)',
            }}
          />
          <div
            key={`v-${line.id}`}
            className="absolute"
            style={{
              left: line.position,
              top: 0,
              width: 1,
              height: '100%',
              backgroundColor: 'rgba(255,255,255,0.08)',
            }}
          />
        </>
      ))}

      {/* Proximity zone for current user */}
      {currentUser && (
        <div
          className="absolute rounded-full border-2"
          style={{
            left: currentUser.position.x - PROXIMITY_RADIUS,
            top: currentUser.position.y - PROXIMITY_RADIUS,
            width: PROXIMITY_RADIUS * 2,
            height: PROXIMITY_RADIUS * 2,
            borderColor: currentUser.color,
            backgroundColor: `${currentUser.color}15`,
          }}
        />
      )}

      {/* Room areas */}
      <div className="absolute" style={{ left: 50, top: 50, width: 300, height: 200, border: '2px dashed rgba(0,212,255,0.3)', borderRadius: 8 }}>
        <span className="absolute text-cyan-glow text-sm font-bold" style={{ left: 10, top: 10 }}>ROOM 1</span>
      </div>
      <div className="absolute" style={{ left: 400, top: 50, width: 300, height: 200, border: '2px dashed rgba(255,107,157,0.3)', borderRadius: 8 }}>
        <span className="absolute text-pink-glow text-sm font-bold" style={{ left: 10, top: 10 }}>ROOM 2</span>
      </div>
      <div className="absolute" style={{ left: 50, top: 300, width: 300, height: 200, border: '2px dashed rgba(0,255,136,0.3)', borderRadius: 8 }}>
        <span className="absolute text-green-connected text-sm font-bold" style={{ left: 10, top: 10 }}>ROOM 3</span>
      </div>
      <div className="absolute" style={{ left: 400, top: 300, width: 300, height: 200, border: '2px dashed rgba(255,170,0,0.3)', borderRadius: 8 }}>
        <span className="absolute text-yellow-500 text-sm font-bold" style={{ left: 10, top: 10 }}>ROOM 4</span>
      </div>

      {/* Users */}
      {allUsers.map((user) => (
        <div key={user.userId} className="absolute" style={{
            left: user.position.x,
            top: user.position.y,
            transform: 'translate(-50%, -50%)',
          }}>
            {/* Glow effect */}
            <div
              className="absolute rounded-full"
              style={{
                width: (USER_RADIUS + 8) * 2,
                height: (USER_RADIUS + 8) * 2,
                backgroundColor: user.color,
                opacity: 0.3,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
            {/* Main circle */}
            <div
              className="absolute rounded-full"
              style={{
                width: USER_RADIUS * 2,
                height: USER_RADIUS * 2,
                backgroundColor: user.color,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                boxShadow: `0 0 15px ${user.color}`,
              }}
            />
            {/* Inner highlight */}
            <div
              className="absolute rounded-full"
              style={{
                width: USER_RADIUS * 0.66,
                height: USER_RADIUS * 0.66,
                backgroundColor: 'rgba(255,255,255,0.3)',
                left: '35%',
                top: '35%',
              }}
            />
            {/* Username label */}
            <div
              className="absolute whitespace-nowrap text-white text-xs font-medium"
              style={{
                left: '50%',
                top: USER_RADIUS + 12,
                transform: 'translateX(-50%)',
              }}
            >
              {user.username}
            </div>
          </div>
        ))}

      {/* CSS for star twinkling */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
