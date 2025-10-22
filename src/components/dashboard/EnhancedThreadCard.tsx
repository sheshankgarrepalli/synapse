import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';

export interface EnhancedThreadCardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Thread title
   */
  title: string;

  /**
   * Thread description
   */
  description: string;

  /**
   * Status badges (e.g., Active, Needs Attention, Paused)
   */
  status: 'active' | 'needs-attention' | 'paused';

  /**
   * Priority badge (e.g., High, Medium, Low, Urgent)
   */
  priority: 'urgent' | 'high' | 'medium' | 'low';

  /**
   * Update count (e.g., "2 Updates")
   */
  updateCount?: number;

  /**
   * Integration icons
   */
  integrations?: ReactNode[];

  /**
   * Team member avatars
   */
  teamMembers?: Array<{
    name: string;
    initials: string;
    color: string;
  }>;

  /**
   * Timestamp (e.g., "2h ago")
   */
  timestamp?: string;

  /**
   * Additional message or activity
   */
  message?: string;
}

/**
 * Enhanced thread card with rainbow gradient border and all new features
 */
export function EnhancedThreadCard({
  title,
  description,
  status,
  priority,
  updateCount,
  integrations,
  teamMembers,
  timestamp,
  message,
  className,
  ...props
}: EnhancedThreadCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl border border-border bg-card p-5 shadow-sm',
        'transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
        'cursor-pointer',
        // Rainbow gradient top border
        'before:absolute before:top-0 before:left-0 before:right-0',
        'before:h-1 before:rounded-t-xl',
        'before:bg-gradient-to-r before:from-orange-500 before:via-teal-500 before:to-blue-500',
        className
      )}
      {...props}
    >
      {/* Title */}
      <h3 className="text-lg font-semibold text-card-foreground mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-3">
        {description}
      </p>

      {/* Badges Row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <StatusBadge variant={status} />
        <StatusBadge variant={priority} />
        {updateCount !== undefined && updateCount > 0 && (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-primary/20 text-primary border border-primary/30">
            {updateCount} {updateCount === 1 ? 'Update' : 'Updates'}
          </span>
        )}
      </div>

      {/* Message */}
      {message && (
        <p className="text-sm text-card-foreground mb-4 italic">
          {message}
        </p>
      )}

      {/* Footer: Integrations + Team Members + Timestamp */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        {/* Integrations */}
        <div className="flex items-center gap-2">
          {integrations && integrations.length > 0 && (
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
          )}

          {/* Team Members */}
          {teamMembers && teamMembers.length > 0 && (
            <div className="flex items-center -space-x-2 ml-2">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    'text-xs font-semibold text-white border-2 border-card',
                    member.color
                  )}
                  title={member.name}
                >
                  {member.initials}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{timestamp}</span>
          </div>
        )}
      </div>
    </div>
  );
}
