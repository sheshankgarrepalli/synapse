/**
 * ThreadTimeline Component
 * Vertical timeline showing thread history with animated golden line
 * This is a signature feature of the Golden Threads visualization
 */

import React from 'react';
import { IntegrationIcon } from './IntegrationIcon';

interface Activity {
  id: string;
  type: 'created' | 'updated' | 'connected' | 'status_change';
  title: string;
  description: string;
  timestamp: string;
  integration?: 'figma' | 'linear' | 'github' | 'slack';
  active?: boolean; // Pulse animation on active node
}

interface ThreadTimelineProps {
  activities: Activity[];
  className?: string;
}

export function ThreadTimeline({ activities, className = '' }: ThreadTimelineProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-sm text-muted-foreground">No activity yet</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Golden vertical line with animated shimmer */}
      <div
        className="absolute left-5 top-0 bottom-0 w-0.5 overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, #F8C580, #D4A574, #F8C580)',
        }}
      >
        {/* Animated shimmer flowing down the line */}
        <div
          className="absolute w-full h-20 animate-thread-flow"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.4), transparent)',
          }}
        />
      </div>

      {/* Timeline items */}
      <div className="space-y-8">
        {activities.map((activity, index) => (
          <div key={activity.id} className="relative flex gap-4">
            {/* Node */}
            <div
              className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center ${
                activity.active ? 'animate-thread-pulse' : ''
              }`}
            >
              <div
                className="w-3 h-3 rounded-full bg-primary"
                style={{
                  boxShadow: activity.active
                    ? '0 0 12px rgba(212, 165, 116, 0.4)'
                    : '0 0 4px rgba(212, 165, 116, 0.2)',
                }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 pt-1 pb-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {activity.integration && (
                      <IntegrationIcon type={activity.integration} size={20} />
                    )}
                    <h4 className="font-semibold text-sm text-foreground">{activity.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {activity.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
