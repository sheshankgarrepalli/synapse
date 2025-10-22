import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface StatsCardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Card header/label (e.g., "Active Threads")
   */
  label: string;

  /**
   * Large number to display
   */
  value: string | number;

  /**
   * Optional description below the label
   */
  description?: string;

  /**
   * Change indicator
   * - Positive number shows green up arrow
   * - Negative number shows red down arrow
   * - Zero or undefined shows no indicator
   */
  change?: number;

  /**
   * Change label (e.g., "today", "vs last week")
   */
  changeLabel?: string;

  /**
   * Status message with optional icon
   */
  statusMessage?: string;

  /**
   * Status icon (optional)
   */
  statusIcon?: ReactNode;

  /**
   * Optional action link
   */
  actionLabel?: string;

  /**
   * Action click handler
   */
  onActionClick?: () => void;

  /**
   * Make card interactive
   */
  interactive?: boolean;

  /**
   * Icon to display in colored circle at top of card
   */
  icon?: ReactNode;

  /**
   * Icon background color variant
   */
  iconColor?: 'orange' | 'teal' | 'red' | 'blue' | 'green' | 'purple';
}

const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(
  ({
    className,
    label,
    value,
    description,
    change,
    changeLabel,
    statusMessage,
    statusIcon,
    actionLabel,
    onActionClick,
    interactive = false,
    icon,
    iconColor = 'orange',
    ...props
  }, ref) => {
    // Determine change direction
    const isPositive = change && change > 0;
    const isNegative = change && change < 0;
    const hasChange = typeof change === 'number' && change !== 0;

    // Icon background colors
    const iconColorClasses = {
      orange: 'bg-primary/20 text-primary',
      teal: 'bg-teal-500/20 text-teal-500',
      red: 'bg-red-500/20 text-red-500',
      blue: 'bg-blue-500/20 text-blue-500',
      green: 'bg-green-500/20 text-green-500',
      purple: 'bg-purple-500/20 text-purple-500',
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-xl border border-border bg-card p-6 shadow-sm',
          'min-h-[160px] flex flex-col',
          // Interactive hover
          interactive && 'cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30',
          className
        )}
        {...props}
      >
        {/* Icon + Trend Indicator Row */}
        <div className="flex items-start justify-between mb-4">
          {/* Icon */}
          {icon && (
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center',
              iconColorClasses[iconColor]
            )}>
              {icon}
            </div>
          )}

          {/* Trend Indicator */}
          {hasChange && (
            <div className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold',
              isPositive && 'text-teal-600 dark:text-teal-400',
              isNegative && 'text-red-600 dark:text-red-400',
            )}>
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {isPositive ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                )}
              </svg>
              <span>
                {isPositive ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </div>

        {/* Label */}
        <div className="mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {label}
          </h3>
        </div>

        {/* Big Number */}
        <div className="mb-2 flex-1">
          <div className="font-heading text-4xl font-bold text-card-foreground leading-none">
            {value}
          </div>
        </div>

        {/* Description / Status Message */}
        <div className="text-xs text-muted-foreground">
          {description || statusMessage}
        </div>

        {/* Action Link */}
        {actionLabel && (
          <div className="pt-3 border-t border-border/50 mt-3">
            <button
              onClick={onActionClick}
              className={cn(
                'text-sm font-medium text-primary hover:text-primary-600',
                'transition-colors duration-150',
                'flex items-center gap-1.5',
                !onActionClick && 'cursor-default'
              )}
              disabled={!onActionClick}
            >
              {actionLabel}
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }
);

StatsCard.displayName = 'StatsCard';

export { StatsCard };
