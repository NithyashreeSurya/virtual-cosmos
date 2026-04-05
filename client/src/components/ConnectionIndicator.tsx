interface ConnectionIndicatorProps {
  isConnected: boolean;
  connectedCount: number;
}

export function ConnectionIndicator({ isConnected, connectedCount }: ConnectionIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'}`} />
      <span className="text-text-secondary text-sm">
        {isConnected ? (connectedCount > 0 ? `${connectedCount} nearby` : 'Searching...') : 'Connecting...'}
      </span>
    </div>
  );
}
