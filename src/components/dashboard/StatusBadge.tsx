import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Badge variant for status
   */
  variant: 'active' | 'needs-attention' | 'paused' | 'urgent' | 'high' | 'medium' | 'low';

  /**
   * Badge size
   */
  size?: 'sm' | 'md';
}

/**
 * Status badge component for thread cards
 */
export function StatusBadge({
  variant,
  size = 'sm',
  children,
  className,
  ...props
}: StatusBadgeProps) {
  const variantClasses = {
    'active': 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
    'needs-attention': 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
    'paused': 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30',
    'urgent': 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
    'high': 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
    'medium': 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30',
    'low': 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  const labels = {
    'active': 'Active',
    'needs-attention': 'Needs Attention',
    'paused': 'Paused',
    'urgent': 'Urgent',
    'high': 'High',
    'medium': 'Medium',
    'low': 'Low',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-md border',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children || labels[variant]}
    </span>
  );
}
