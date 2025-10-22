import { cn } from '@/lib/utils';

interface PageLoadingProps {
  message?: string;
  className?: string;
  fullPage?: boolean;
}

export function PageLoading({
  message = 'Loading...',
  className,
  fullPage = false,
}: PageLoadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        fullPage ? 'min-h-screen' : 'min-h-[60vh]',
        className
      )}
    >
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        {/* Inner ring (counter-rotating) */}
        <div
          className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary/50 rounded-full animate-spin"
          style={{
            animationDuration: '1.5s',
            animationDirection: 'reverse',
          }}
        />
        {/* Center glow */}
        <div className="absolute inset-0 m-auto w-8 h-8 bg-primary/10 rounded-full blur-sm" />
      </div>
      {message && (
        <p className="mt-6 text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  );
}

// Inline loading for smaller contexts
interface InlineLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InlineLoading({ size = 'md', className }: InlineLoadingProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div className={cn('inline-flex items-center justify-center', className)}>
      <div
        className={cn(
          'border-primary/20 border-t-primary rounded-full animate-spin',
          sizes[size]
        )}
      />
    </div>
  );
}

// Loading overlay for content
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  blur?: boolean;
}

export function LoadingOverlay({
  isLoading,
  children,
  message = 'Loading...',
  blur = true,
}: LoadingOverlayProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className={cn(blur && 'blur-sm opacity-50 pointer-events-none')}>
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <div
              className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary/50 rounded-full animate-spin"
              style={{
                animationDuration: '1.5s',
                animationDirection: 'reverse',
              }}
            />
          </div>
          {message && (
            <p className="text-sm font-medium text-muted-foreground">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
