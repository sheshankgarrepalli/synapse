/**
 * ThreadFlowDiagram Component
 * Canvas-based flow view for complex thread networks (inspired by Make.com)
 * Shows draggable nodes connected by bezier curves with animated flow
 */

import React from 'react';
import { IntegrationIcon } from './IntegrationIcon';

interface Node {
  id: string;
  type: 'figma' | 'linear' | 'github' | 'slack';
  label: string;
  x: number;
  y: number;
}

interface Connection {
  from: string;
  to: string;
  status: 'active' | 'inactive';
}

interface ThreadFlowDiagramProps {
  nodes: Node[];
  connections: Connection[];
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

export function ThreadFlowDiagram({
  nodes,
  connections,
  onNodeClick,
  className = '',
}: ThreadFlowDiagramProps) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className={`relative w-full h-96 bg-secondary/50 rounded-xl border border-border overflow-hidden flex items-center justify-center ${className}`}>
        <p className="text-sm text-muted-foreground">No connections to visualize</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-96 bg-secondary/50 dark:bg-secondary/30 rounded-xl border border-border overflow-hidden ${className}`}>
      {/* SVG for connection lines */}
      <svg className="absolute inset-0 w-full h-full">
        {/* Gradient definition */}
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F8C580" />
            <stop offset="50%" stopColor="#D4A574" />
            <stop offset="100%" stopColor="#F8C580" />
          </linearGradient>

          {/* Animated shimmer gradient */}
          <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.4)" />
            <stop offset="100%" stopColor="transparent" />
            <animate
              attributeName="x1"
              values="-100%;200%"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="x2"
              values="0%;300%"
              dur="2s"
              repeatCount="indefinite"
            />
          </linearGradient>
        </defs>

        {/* Draw connections */}
        {connections.map((conn) => {
          const fromNode = nodes.find((n) => n.id === conn.from);
          const toNode = nodes.find((n) => n.id === conn.to);

          if (!fromNode || !toNode) return null;

          const controlPointOffset = 50;

          return (
            <g key={`${conn.from}-${conn.to}`}>
              {/* Base bezier curve path */}
              <path
                d={`M ${fromNode.x},${fromNode.y} C ${
                  fromNode.x + controlPointOffset
                },${fromNode.y} ${toNode.x - controlPointOffset},${toNode.y} ${toNode.x},${
                  toNode.y
                }`}
                stroke="url(#goldGradient)"
                strokeWidth="2"
                fill="none"
                className={conn.status === 'active' ? 'opacity-100' : 'opacity-40'}
              />

              {/* Animated shimmer on active connections */}
              {conn.status === 'active' && (
                <path
                  d={`M ${fromNode.x},${fromNode.y} C ${
                    fromNode.x + controlPointOffset
                  },${fromNode.y} ${toNode.x - controlPointOffset},${toNode.y} ${toNode.x},${
                    toNode.y
                  }`}
                  stroke="url(#shimmerGradient)"
                  strokeWidth="3"
                  fill="none"
                  className="animate-thread-flow"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => (
        <div
          key={node.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-105"
          style={{
            left: node.x,
            top: node.y,
          }}
          onClick={() => onNodeClick?.(node.id)}
        >
          <div
            className="w-16 h-16 rounded-xl bg-card border-2 border-primary flex flex-col items-center justify-center shadow-lg hover:shadow-[0_0_20px_rgba(212,165,116,0.3)] transition-shadow"
            role="button"
            tabIndex={0}
            aria-label={`${node.type} node: ${node.label}`}
          >
            <IntegrationIcon type={node.type} size={24} />
            <span className="text-[10px] mt-1 text-foreground truncate max-w-[60px] text-center">
              {node.label}
            </span>
          </div>
        </div>
      ))}

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
        Click nodes for details
      </div>
    </div>
  );
}
