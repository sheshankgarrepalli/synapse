/**
 * ThreadStatus Component
 * Visual status indicator with golden glow for thread health
 */

type ThreadStatusType = 'healthy' | 'syncing' | 'drift' | 'error';

interface ThreadStatusProps {
  status: ThreadStatusType;
  className?: string;
}

export function ThreadStatus({ status, className = '' }: ThreadStatusProps) {
  const config: Record<ThreadStatusType, { label: string; color: string; glow: string }> = {
    healthy: {
      label: 'Healthy',
      color: 'text-success',
      glow: 'shadow-[0_0_10px_rgba(67,160,71,0.3)]',
    },
    syncing: {
      label: 'Syncing',
      color: 'text-primary',
      glow: 'shadow-[0_0_10px_rgba(212,165,116,0.3)]',
    },
    drift: {
      label: 'Drift Detected',
      color: 'text-warning',
      glow: 'shadow-[0_0_10px_rgba(251,140,0,0.3)]',
    },
    error: {
      label: 'Error',
      color: 'text-error',
      glow: 'shadow-[0_0_10px_rgba(229,57,53,0.3)]',
    },
  };

  const { label, color, glow } = config[status];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`w-3 h-3 rounded-full ${color.replace('text-', 'bg-')} ${glow} ${
          status === 'syncing' ? 'animate-pulse' : ''
        }`}
      />
      <span className={`text-sm font-medium ${color}`}>{label}</span>
    </div>
  );
}
