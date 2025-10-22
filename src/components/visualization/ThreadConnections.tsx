/**
 * ThreadConnections Component
 * Show connections between integrations with animated golden lines
 */

import React from 'react';
import { IntegrationIcon } from './IntegrationIcon';

interface Integration {
  type: 'figma' | 'linear' | 'github' | 'slack';
  status: 'connected' | 'syncing' | 'error';
}

interface ThreadConnectionsProps {
  integrations: Integration[];
  className?: string;
}

export function ThreadConnections({ integrations, className = '' }: ThreadConnectionsProps) {
  if (!integrations || integrations.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-sm text-muted-foreground">No integrations connected</p>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center gap-8 py-8 ${className}`}>
      {integrations.map((integration, index) => (
        <React.Fragment key={integration.type}>
          {/* Integration Node */}
          <div className="relative">
            <div
              className={`relative w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 border-2 border-primary flex items-center justify-center ${
                integration.status === 'error' ? 'opacity-50' : ''
              } ${integration.status === 'connected' ? 'animate-thread-pulse' : ''}`}
              style={{
                boxShadow:
                  integration.status === 'connected'
                    ? '0 0 20px rgba(212, 165, 116, 0.3), 0 0 40px rgba(212, 165, 116, 0.1)'
                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <IntegrationIcon type={integration.type} size={32} />
            </div>

            {/* Syncing pulse animation */}
            {integration.status === 'syncing' && (
              <div className="absolute -inset-1 border-2 border-primary rounded-full animate-ping" />
            )}

            {/* Error indicator */}
            {integration.status === 'error' && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full border-2 border-background flex items-center justify-center">
                <span className="text-[10px] text-white">!</span>
              </div>
            )}
          </div>

          {/* Connection Line */}
          {index < integrations.length - 1 && (
            <div className="relative w-24 h-0.5">
              <div
                className="absolute inset-0 overflow-hidden rounded-full"
                style={{
                  background: 'linear-gradient(to right, #F8C580, #D4A574, #F8C580)',
                }}
              >
                {/* Animated shimmer flowing along connection */}
                <div
                  className="absolute h-full w-8 animate-thread-flow"
                  style={{
                    background:
                      'linear-gradient(to right, transparent, rgba(255,255,255,0.5), transparent)',
                  }}
                />
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
