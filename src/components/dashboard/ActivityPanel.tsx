import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ActivityPanelProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Overall activity percentage
   */
  activityPercentage: number;

  /**
   * Trend indicator
   */
  trend?: number;

  /**
   * Daily activity breakdown
   */
  dailyActivity: Array<{
    day: string;
    percentage: number;
    color: 'blue' | 'red' | 'teal' | 'gray' | 'orange' | 'green' | 'purple';
  }>;
}

/**
 * Activity panel showing daily activity breakdown
 */
export function ActivityPanel({
  activityPercentage,
  trend,
  dailyActivity,
  className,
  ...props
}: ActivityPanelProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    teal: 'bg-teal-500',
    gray: 'bg-gray-400',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-6 shadow-sm',
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">
          Activity
        </h3>
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-semibold',
            trend > 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-600 dark:text-red-400'
          )}>
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              {trend > 0 ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              )}
            </svg>
            <span>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          </div>
        )}
      </div>

      {/* Big Number */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="font-heading text-5xl font-bold text-card-foreground">
            {activityPercentage}
          </span>
          <span className="text-2xl text-muted-foreground">%</span>
        </div>
      </div>

      {/* Daily Activity Bars */}
      <div className="space-y-4">
        {dailyActivity.map((item) => (
          <div key={item.day}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{item.day}</span>
              <span className="text-sm font-semibold text-card-foreground">
                {item.percentage}%
              </span>
            </div>
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  colorClasses[item.color]
                )}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
