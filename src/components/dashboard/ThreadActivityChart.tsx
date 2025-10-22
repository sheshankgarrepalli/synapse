import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface ThreadActivityChartProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Chart data with day, totalThreads, and synced values
   */
  data: Array<{
    day: string;
    totalThreads: number;
    synced: number;
  }>;

  /**
   * Chart title
   */
  title?: string;

  /**
   * Chart subtitle
   */
  subtitle?: string;
}

/**
 * Area chart showing thread activity over the last 7 days
 */
export function ThreadActivityChart({
  data,
  title = 'Thread Activity',
  subtitle = 'Last 7 days',
  className,
  ...props
}: ThreadActivityChartProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-6 shadow-sm',
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-1">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {subtitle}
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
        >
          <defs>
            {/* Gradient for Total Threads (Orange) */}
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FCA311" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#FCA311" stopOpacity={0} />
            </linearGradient>
            {/* Gradient for Synced (Teal/Green) */}
            <linearGradient id="colorSynced" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="stroke-border/30"
            vertical={false}
          />

          <XAxis
            dataKey="day"
            stroke="currentColor"
            className="text-muted-foreground text-xs"
            tick={{ fill: 'currentColor' }}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            stroke="currentColor"
            className="text-muted-foreground text-xs"
            tick={{ fill: 'currentColor' }}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--card-foreground))',
            }}
            labelStyle={{
              color: 'hsl(var(--card-foreground))',
              fontWeight: 600,
              marginBottom: '4px',
            }}
          />

          <Legend
            wrapperStyle={{
              paddingTop: '20px',
            }}
            iconType="circle"
            formatter={(value) => (
              <span className="text-sm text-card-foreground">{value}</span>
            )}
          />

          <Area
            type="monotone"
            dataKey="totalThreads"
            name="Total Threads"
            stroke="#FCA311"
            strokeWidth={2}
            fill="url(#colorTotal)"
            activeDot={{ r: 6, fill: '#FCA311' }}
          />

          <Area
            type="monotone"
            dataKey="synced"
            name="Synced"
            stroke="#14B8A6"
            strokeWidth={2}
            fill="url(#colorSynced)"
            activeDot={{ r: 6, fill: '#14B8A6' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
