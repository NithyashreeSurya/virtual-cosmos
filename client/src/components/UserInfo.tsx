import { User } from '../types';

interface UserInfoProps {
  currentUser: User | null;
  usersCount: number;
}

export function UserInfo({ currentUser, usersCount }: UserInfoProps) {
  if (!currentUser) return null;

  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
        style={{ backgroundColor: currentUser.color, boxShadow: `0 0 15px ${currentUser.color}` }}
      >
        {currentUser.username.charAt(0).toUpperCase()}
      </div>
      <div>
        <h2 className="text-white font-medium">{currentUser.username}</h2>
        <p className="text-text-secondary text-xs">
          Position: ({Math.round(currentUser.position.x)}, {Math.round(currentUser.position.y)}) • {usersCount} online
        </p>
      </div>
    </div>
  );
}
