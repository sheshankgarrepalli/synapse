import { cn } from '@/lib/utils';

// Spinner Component
export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export function Spinner({ size = 'md', color = 'primary', className }: SpinnerProps) {
  const sizes = {
    xs: 'h-4 w-4',
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10',
  };

  const colors = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    white: 'text-white',
  };

  return (
    <svg
      className={cn(
        'animate-spin',
        sizes[size],
        colors[color],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// Skeleton Component
export interface SkeletonProps {
  variant?: 'text' | 'circle' | 'rectangle';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className
}: SkeletonProps) {
  const baseClasses = cn(
    'bg-gray-200 dark:bg-gray-800',
    'animate-shimmer',
    'bg-shimmer-gradient bg-[length:1000px_100%]',
    className
  );

  if (variant === 'text') {
    return (
      <div
        className={cn(
          baseClasses,
          'h-4 rounded',
          className
        )}
        style={{ width: width || '100%' }}
      />
    );
  }

  if (variant === 'circle') {
    const size = width || height || 40;
    return (
      <div
        className={cn(
          baseClasses,
          'rounded-full',
          className
        )}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        'rounded-lg',
        className
      )}
      style={{ width: width || '100%', height: height || '100px' }}
    />
  );
}

// Skeleton Group for common patterns
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 border border-gray-200 dark:border-gray-800 rounded-xl', className)}>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circle" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="text" height={16} />
          ))}
        </div>
      </div>
      {/* Rows */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} variant="text" height={16} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Progress Bar Component
export interface ProgressBarProps {
  value?: number; // 0-100 for determinate, undefined for indeterminate
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  size = 'md',
  color = 'primary',
  showLabel = false,
  className
}: ProgressBarProps) {
  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colors = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
  };

  const isIndeterminate = value === undefined;
  const percentage = Math.min(100, Math.max(0, value || 0));

  return (
    <div className={cn('w-full', className)}>
      <div className={cn(
        'w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden',
        sizes[size]
      )}>
        {isIndeterminate ? (
          <div
            className={cn(
              'h-full rounded-full',
              colors[color],
              'animate-pulse'
            )}
            style={{ width: '50%' }}
          />
        ) : (
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-smooth',
              colors[color]
            )}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
      {showLabel && !isIndeterminate && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-right">
          {percentage}%
        </div>
      )}
    </div>
  );
}

// Loading Overlay
export interface LoadingOverlayProps {
  isLoading: boolean;
  children?: React.ReactNode;
  message?: string;
  blur?: boolean;
}

export function LoadingOverlay({
  isLoading,
  children,
  message = 'Loading...',
  blur = true
}: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      {children && (
        <div className={cn(blur && 'blur-sm opacity-50')}>
          {children}
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          {message && (
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading Dots
export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-primary animate-pulse"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
