import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ThreadOpportunityCard } from './ThreadOpportunityCard';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

type IntegrationType = 'linear' | 'github' | 'figma' | 'slack';

interface ThreadOpportunityItem {
  type: IntegrationType;
  title: string;
  icon: string;
}

interface ThreadOpportunity {
  id: string;
  title: string;
  items: ThreadOpportunityItem[];
  confidence: 'High match' | 'Strong connection' | 'Good match';
}

interface AhaMomentProps {
  connectedIntegration: IntegrationType;
  onCreateFirstThread: (threadOpportunity: ThreadOpportunity) => void;
  onSkip: () => void;
}

// Mock auto-detection logic for each integration type
const getMockThreadOpportunities = (integration: IntegrationType): ThreadOpportunity[] => {
  const mockData: Record<IntegrationType, ThreadOpportunity[]> = {
    linear: [
      {
        id: 'linear-1',
        title: 'Code Review Workflow',
        confidence: 'High match',
        items: [
          {
            type: 'linear',
            title: 'LIN-123: Build new onboarding flow',
            icon: '📋',
          },
          {
            type: 'linear',
            title: 'LIN-124: Fix authentication bug',
            icon: '📋',
          },
          {
            type: 'linear',
            title: 'LIN-125: Implement dark mode',
            icon: '📋',
          },
        ],
      },
      {
        id: 'linear-2',
        title: 'Feature Launch Pipeline',
        confidence: 'Strong connection',
        items: [
          {
            type: 'linear',
            title: 'EPIC-45: Q4 Platform Redesign',
            icon: '📋',
          },
          {
            type: 'linear',
            title: 'LIN-230: Design system updates',
            icon: '📋',
          },
          {
            type: 'linear',
            title: 'LIN-231: Component library v2',
            icon: '📋',
          },
        ],
      },
      {
        id: 'linear-3',
        title: 'Design Bug Tracking',
        confidence: 'Good match',
        items: [
          {
            type: 'linear',
            title: 'BUG-89: Button alignment issue',
            icon: '📋',
          },
          {
            type: 'linear',
            title: 'BUG-90: Dark mode color contrast',
            icon: '📋',
          },
        ],
      },
    ],
    github: [
      {
        id: 'github-1',
        title: 'Active Pull Requests',
        confidence: 'High match',
        items: [
          {
            type: 'github',
            title: 'PR #456: Implement onboarding UI',
            icon: '💻',
          },
          {
            type: 'github',
            title: 'PR #457: Add authentication flow',
            icon: '💻',
          },
          {
            type: 'github',
            title: 'PR #458: Dark mode styles',
            icon: '💻',
          },
        ],
      },
      {
        id: 'github-2',
        title: 'Design Implementation',
        confidence: 'Strong connection',
        items: [
          {
            type: 'github',
            title: 'PR #489: Component library updates',
            icon: '💻',
          },
          {
            type: 'github',
            title: 'PR #490: Design system tokens',
            icon: '💻',
          },
        ],
      },
      {
        id: 'github-3',
        title: 'Stuck PR Review',
        confidence: 'Good match',
        items: [
          {
            type: 'github',
            title: 'PR #412: Refactor API endpoints (10 days old)',
            icon: '💻',
          },
          {
            type: 'github',
            title: 'PR #413: Update dependencies (8 days old)',
            icon: '💻',
          },
        ],
      },
    ],
    figma: [
      {
        id: 'figma-1',
        title: 'Design Review Workflow',
        confidence: 'High match',
        items: [
          {
            type: 'figma',
            title: 'Onboarding redesign v2',
            icon: '🎨',
          },
          {
            type: 'figma',
            title: 'Dashboard mockups - Final',
            icon: '🎨',
          },
          {
            type: 'figma',
            title: 'Mobile responsive layouts',
            icon: '🎨',
          },
        ],
      },
      {
        id: 'figma-2',
        title: 'A/B Test Iterations',
        confidence: 'Strong connection',
        items: [
          {
            type: 'figma',
            title: 'Landing page v2 - Iteration 3',
            icon: '🎨',
          },
          {
            type: 'figma',
            title: 'CTA button variants',
            icon: '🎨',
          },
        ],
      },
      {
        id: 'figma-3',
        title: 'Component Library Sync',
        confidence: 'Good match',
        items: [
          {
            type: 'figma',
            title: 'Design System - Components',
            icon: '🎨',
          },
          {
            type: 'figma',
            title: 'Button component specs',
            icon: '🎨',
          },
        ],
      },
    ],
    slack: [
      {
        id: 'slack-1',
        title: 'Engineering Discussions',
        confidence: 'High match',
        items: [
          {
            type: 'slack',
            title: 'Thread: PR review for new feature',
            icon: '💬',
          },
          {
            type: 'slack',
            title: 'Thread: Architecture decisions',
            icon: '💬',
          },
          {
            type: 'slack',
            title: 'Thread: Bug triage session',
            icon: '💬',
          },
        ],
      },
      {
        id: 'slack-2',
        title: 'Design Feedback Loop',
        confidence: 'Strong connection',
        items: [
          {
            type: 'slack',
            title: 'Thread: Design review feedback',
            icon: '💬',
          },
          {
            type: 'slack',
            title: 'Thread: Component spacing discussion',
            icon: '💬',
          },
        ],
      },
      {
        id: 'slack-3',
        title: 'Project Updates',
        confidence: 'Good match',
        items: [
          {
            type: 'slack',
            title: 'Thread: Q4 roadmap planning',
            icon: '💬',
          },
          {
            type: 'slack',
            title: 'Thread: Sprint retrospective',
            icon: '💬',
          },
        ],
      },
    ],
  };

  return mockData[integration] || [];
};

export function AhaMoment({
  connectedIntegration,
  onCreateFirstThread,
  onSkip,
}: AhaMomentProps) {
  const [selectedThread, setSelectedThread] = useState<ThreadOpportunity | null>(null);
  const detectedThreads = getMockThreadOpportunities(connectedIntegration);

  const integrationNames: Record<IntegrationType, string> = {
    linear: 'Linear',
    github: 'GitHub',
    figma: 'Figma',
    slack: 'Slack',
  };

  const handleCreateThread = (thread: ThreadOpportunity) => {
    setSelectedThread(thread);
    onCreateFirstThread(thread);
  };

  if (selectedThread) {
    return (
      <div className="text-center max-w-3xl mx-auto">
        <div className="mb-8 flex justify-center">
          <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircleIcon className="h-12 w-12 text-green-400 animate-bounce" />
          </div>
        </div>

        <h1 className="mb-4 text-4xl font-bold text-white">
          Your first Golden Thread is ready!
        </h1>

        <p className="mb-8 text-lg text-gray-400">
          We're setting up "{selectedThread.title}" with {selectedThread.items.length} connected items
        </p>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <SparklesIcon className="h-5 w-5 text-primary" />
            <p className="text-sm text-gray-400">
              This is what makes Synapse powerful: Everything automatically connected.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Celebration header */}
      <div className="text-center mb-12">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
              <SparklesIcon className="h-12 w-12 text-primary animate-bounce" />
            </div>
            {/* Sparkle effects */}
            <SparklesIcon className="h-6 w-6 text-primary absolute -top-2 -right-2 animate-pulse" />
            <SparklesIcon className="h-4 w-4 text-primary absolute -bottom-1 -left-2 animate-pulse delay-150" />
          </div>
        </div>

        <h1 className="mb-4 text-5xl font-bold text-white leading-tight">
          Here's what we found!
        </h1>

        <p className="text-xl text-gray-300 mb-2">
          We detected <span className="font-bold text-primary">{detectedThreads.length} potential Golden Threads</span> in your {integrationNames[connectedIntegration]} account
        </p>

        <p className="text-base text-gray-500">
          These are work items that should be connected together
        </p>
      </div>

      {/* Auto-detected thread opportunities */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {detectedThreads.map((thread) => (
          <ThreadOpportunityCard
            key={thread.id}
            title={thread.title}
            items={thread.items}
            confidence={thread.confidence}
            onClick={() => handleCreateThread(thread)}
          />
        ))}
      </div>

      {/* Primary CTA and skip option */}
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-6">
          Don't worry - you can create more threads or customize these later
        </p>

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onSkip}
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors underline decoration-dotted underline-offset-4"
          >
            I'll explore later
          </button>
        </div>
      </div>

      {/* Value reinforcement */}
      <div className="mt-12 bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <SparklesIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              This is the magic of Golden Threads
            </h3>
            <p className="text-sm text-gray-400">
              Instead of manually linking your design, code, and tasks across tools, Synapse does it automatically.
              Click any thread above to see how we connect everything for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
