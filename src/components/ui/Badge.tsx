import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Badge variant
   * - active: Green badge for active/running status
   * - paused: Yellow badge for paused/pending status
   * - completed: Gray badge for completed/finished status
   * - error: Red badge for error/failed status
   * - count: Circular count badge (for notifications, highlights)
   * - custom: Use custom styling
   *
   * Legacy variants (for backward compatibility):
   * - default: Maps to completed (gray)
   * - primary: Maps to active (green) with primary color
   * - success: Maps to active (green)
   * - warning: Maps to paused (yellow)
   * - danger: Maps to error (red)
   * - info: Blue informational badge
   * - outline: Outlined badge style
   */
  variant?: 'active' | 'paused' | 'completed' | 'error' | 'count' | 'custom' |
            'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';

  /**
   * Size of the badge
   * - sm: Small (12px text, for status badges)
   * - md: Medium (13px text)
   * - lg: Large (14px text)
   * - count: For count badges (11px, circular)
   */
  size?: 'sm' | 'md' | 'lg' | 'count';

  /**
   * Count badge color (only for variant="count")
   * - red: For notifications/alerts
   * - gold: For highlights/important items
   * - gray: For neutral counts
   */
  countColor?: 'red' | 'gold' | 'gray';

  /**
   * Optional icon to display before text
   */
  icon?: ReactNode;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'active', size = 'sm', countColor = 'red', icon, children, ...props }, ref) => {
    // Status badge variants (pill-like, uppercase, bold)
    const statusVariants = {
      active: 'bg-success-50 text-success-700 border-success-200/30',
      paused: 'bg-warning-50 text-warning-700 border-warning-200/30',
      completed: 'bg-gray-100 text-gray-700 border-gray-200',
      error: 'bg-error-50 text-error-700 border-error-200/30',
      custom: '',
      // Legacy variants (backward compatibility)
      default: 'bg-gray-100 text-gray-700 border-gray-200',
      primary: 'bg-primary/20 text-primary border-primary/30',
      success: 'bg-success-50 text-success-700 border-success-200/30',
      warning: 'bg-warning-50 text-warning-700 border-warning-200/30',
      danger: 'bg-error-50 text-error-700 border-error-200/30',
      info: 'bg-info-50 text-info-700 border-info-200/30',
      outline: 'bg-transparent text-muted-foreground border-border',
    };

    // Count badge variants (circular, no uppercase)
    const countVariants = {
      red: 'bg-error text-white border-error',
      gold: 'bg-primary text-white border-primary',
      gray: 'bg-gray-400 text-white border-gray-500',
    };

    // Size variants
    const statusSizes = {
      sm: 'px-2.5 py-1 text-xs',
      md: 'px-3 py-1 text-[13px]',
      lg: 'px-3.5 py-1.5 text-sm',
      count: '',
    };

    const countSizes = {
      sm: 'min-w-5 h-5 px-1.5 text-[11px]',
      md: 'min-w-6 h-6 px-2 text-xs',
      lg: 'min-w-7 h-7 px-2 text-sm',
      count: 'min-w-5 h-5 px-1.5 text-[11px]',
    };

    // Determine if this is a count badge
    const isCountBadge = variant === 'count' || size === 'count';

    // Build class names
    const badgeClasses = cn(
      'inline-flex items-center justify-center font-bold transition-all duration-150',
      isCountBadge ? [
        // Count badge styles
        'rounded-full',
        countVariants[countColor],
        size === 'count' ? countSizes.count : countSizes[size],
      ] : [
        // Status badge styles
        'rounded-md border uppercase tracking-wider',
        statusVariants[variant],
        statusSizes[size],
      ],
      icon && !isCountBadge && 'gap-1.5',
      className
    );

    return (
      <span
        ref={ref}
        className={badgeClasses}
        {...props}
      >
        {icon && !isCountBadge && <span className="inline-flex">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
