import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './Badge';

export interface ThreadCardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Thread title/name
   */
  title: string;

  /**
   * Thread status
   */
  status?: 'active' | 'paused' | 'completed' | 'error';

  /**
   * Connected integration icons (React nodes like icons or images)
   */
  integrations?: ReactNode[];

  /**
   * Activity summary text
   */
  activity?: string;

  /**
   * Activity timestamp
   */
  timestamp?: string;

  /**
   * Optional progress value (0-100)
   */
  progress?: number;

  /**
   * Show golden gradient border (signature Golden Thread style)
   */
  golden?: boolean;

  /**
   * Make card interactive/hoverable
   */
  interactive?: boolean;

  /**
   * Optional footer actions
   */
  footer?: ReactNode;
}

const ThreadCard = forwardRef<HTMLDivElement, ThreadCardProps>(
  ({
    className,
    title,
    status = 'active',
    integrations,
    activity,
    timestamp,
    progress,
    golden = true,
    interactive = true,
    footer,
    children,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'relative rounded-xl border bg-card p-5 shadow-sm',
          // Golden gradient border (SIGNATURE FEATURE)
          golden && [
            'border-primary/30',
            'before:absolute before:top-0 before:left-0',
            'before:h-full before:w-1 before:rounded-l-xl',
            'before:bg-gradient-to-b before:from-primary-300 before:via-primary-500 before:to-primary-300',
            'before:shadow-glow-gold',
          ],
          // Error state overrides golden border
          status === 'error' && !golden && 'border-error/30',
          // Interactive hover effect
          interactive && 'cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
          className
        )}
        {...props}
      >
        {/* Header: Title + Status Badge */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="font-heading text-lg font-semibold text-card-foreground leading-tight flex-1">
            {title}
          </h3>
          {status && (
            <Badge variant={status} size="sm">
              {status}
            </Badge>
          )}
        </div>

        {/* Connected Integrations */}
        {integrations && integrations.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-muted-foreground mr-1">Connected:</span>
            <div className="flex items-center gap-2">
              {integrations.map((icon, index) => (
                <div
                  key={index}
                  className="w-5 h-5 flex items-center justify-center"
                  aria-label={`Integration ${index + 1}`}
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Summary */}
        {activity && (
          <div className="mb-3 space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-primary">⚡</span>
              <span className="text-card-foreground">{activity}</span>
            </div>
            {timestamp && (
              <p className="text-xs text-muted-foreground pl-6">{timestamp}</p>
            )}
          </div>
        )}

        {/* Custom content */}
        {children && (
          <div className="text-sm text-card-foreground mb-4">
            {children}
          </div>
        )}

        {/* Progress Bar */}
        {typeof progress === 'number' && progress >= 0 && progress <= 100 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Progress</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {footer && (
          <div className="pt-4 border-t border-border/50 flex items-center justify-between">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

ThreadCard.displayName = 'ThreadCard';

export { ThreadCard };
