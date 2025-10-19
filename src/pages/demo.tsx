import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import {
  SparklesIcon,
  BoltIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

// Demo data for showcase
const demoThreads = [
  {
    id: 'demo-1',
    title: 'User Authentication Redesign',
    status: 'in_progress',
    items: 15,
    driftCount: 2,
    insights: 3,
    lastActivity: '2 hours ago',
    confidence: 0.92,
  },
  {
    id: 'demo-2',
    title: 'Dashboard Analytics Widget',
    status: 'review',
    items: 8,
    driftCount: 0,
    insights: 1,
    lastActivity: '5 hours ago',
    confidence: 0.88,
  },
  {
    id: 'demo-3',
    title: 'Mobile Navigation Improvements',
    status: 'completed',
    items: 12,
    driftCount: 0,
    insights: 0,
    lastActivity: '1 day ago',
    confidence: 0.95,
  },
];

const demoInsights = [
  {
    id: 'insight-1',
    type: 'drift',
    severity: 'high',
    title: 'Design-Code Drift Detected',
    description: 'Button border-radius in LoginForm.tsx (8px) doesn\'t match Figma spec (12px)',
    threadTitle: 'User Authentication Redesign',
    confidence: 0.94,
    actionable: true,
  },
  {
    id: 'insight-2',
    type: 'bottleneck',
    severity: 'medium',
    title: 'Potential Bottleneck Identified',
    description: 'PR #234 has been in review for 4 days, blocking 3 dependent tasks',
    threadTitle: 'Dashboard Analytics Widget',
    confidence: 0.87,
    actionable: true,
  },
  {
    id: 'insight-3',
    type: 'relationship',
    severity: 'low',
    title: 'New Relationship Detected',
    description: 'Slack discussion "Q4 Metrics" automatically linked to Linear issue LIN-456',
    threadTitle: 'Dashboard Analytics Widget',
    confidence: 0.91,
    actionable: false,
  },
  {
    id: 'insight-4',
    type: 'drift',
    severity: 'high',
    title: 'Typography Inconsistency',
    description: 'Heading font size in ProfileCard.tsx (18px) differs from design system (20px)',
    threadTitle: 'User Authentication Redesign',
    confidence: 0.89,
    actionable: true,
  },
];

const demoStats = {
  totalThreads: 24,
  activeThreads: 8,
  driftIssues: 3,
  resolvedToday: 12,
  avgConfidence: 0.91,
  teamVelocity: '+23%',
};

const demoRelationships = [
  {
    source: { type: 'Figma', name: 'Login Screen v3', icon: '🎨' },
    target: { type: 'GitHub', name: 'PR #234: Update login UI', icon: '💻' },
    relationship: 'implements',
    confidence: 0.94,
  },
  {
    source: { type: 'Linear', name: 'LIN-456: Add analytics', icon: '📋' },
    target: { type: 'Slack', name: '#eng-discuss: Q4 Metrics', icon: '💬' },
    relationship: 'discusses',
    confidence: 0.87,
  },
  {
    source: { type: 'GitHub', name: 'PR #234: Update login UI', icon: '💻' },
    target: { type: 'Linear', name: 'LIN-123: Login redesign', icon: '📋' },
    relationship: 'closes',
    confidence: 0.98,
  },
];

export default function DemoMode() {
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'drift' | 'relationships'>('overview');

  return (
    <Layout>
      <div className="space-y-6">
        {/* Demo Mode Banner */}
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="rounded-lg bg-primary/20 p-2">
                  <SparklesIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Demo Mode Active</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Exploring Synapse with sample data. Connect your real tools to see your actual workflow intelligence.
                  </p>
                </div>
              </div>
              <Link href="/integrations">
                <Button size="sm">
                  Connect Real Tools
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-gray-800">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'insights', label: 'Insights', icon: SparklesIcon },
            { id: 'drift', label: 'Drift Detection', icon: ExclamationTriangleIcon },
            { id: 'relationships', label: 'Relationships', icon: BoltIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab stats={demoStats} threads={demoThreads} />}
        {activeTab === 'insights' && <InsightsTab insights={demoInsights} />}
        {activeTab === 'drift' && <DriftTab insights={demoInsights.filter(i => i.type === 'drift')} />}
        {activeTab === 'relationships' && <RelationshipsTab relationships={demoRelationships} />}
      </div>
    </Layout>
  );
}

function OverviewTab({ stats, threads }: { stats: typeof demoStats; threads: typeof demoThreads }) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Threads</p>
                <p className="mt-1 text-3xl font-bold text-white">{stats.totalThreads}</p>
              </div>
              <div className="rounded-lg bg-blue-500/20 p-3">
                <ChartBarIcon className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Threads</p>
                <p className="mt-1 text-3xl font-bold text-white">{stats.activeThreads}</p>
              </div>
              <div className="rounded-lg bg-green-500/20 p-3">
                <BoltIcon className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Drift Issues</p>
                <p className="mt-1 text-3xl font-bold text-white">{stats.driftIssues}</p>
              </div>
              <div className="rounded-lg bg-red-500/20 p-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Team Velocity</p>
                <p className="mt-1 text-3xl font-bold text-white">{stats.teamVelocity}</p>
              </div>
              <div className="rounded-lg bg-purple-500/20 p-3">
                <ArrowTrendingUpIcon className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Golden Threads */}
      <Card>
        <CardHeader>
          <CardTitle>Golden Threads</CardTitle>
          <CardDescription>Connected workflows across your tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {threads.map((thread) => (
              <div
                key={thread.id}
                className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 p-4 transition-colors hover:border-primary"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-white">{thread.title}</h3>
                    <Badge variant={thread.status === 'completed' ? 'success' : 'primary'}>
                      {thread.status.replace('_', ' ')}
                    </Badge>
                    {thread.driftCount > 0 && (
                      <Badge variant="danger">{thread.driftCount} drift issues</Badge>
                    )}
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-400">
                    <span>{thread.items} items</span>
                    <span>•</span>
                    <span>{thread.insights} insights</span>
                    <span>•</span>
                    <span>{thread.lastActivity}</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <span>Confidence:</span>
                      <span className="font-medium text-green-400">
                        {Math.round(thread.confidence * 100)}%
                      </span>
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Thread
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InsightsTab({ insights }: { insights: typeof demoInsights }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-4">
      {insights.map((insight) => (
        <Card key={insight.id} hover>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Badge variant={getSeverityColor(insight.severity)}>
                    {insight.severity} priority
                  </Badge>
                  <Badge variant="outline">{insight.type}</Badge>
                  <div className="flex items-center space-x-1 text-sm text-gray-400">
                    <SparklesIcon className="h-4 w-4" />
                    <span>{Math.round(insight.confidence * 100)}% confident</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                <p className="mt-1 text-sm text-gray-400">{insight.description}</p>
                <p className="mt-2 text-xs text-gray-500">
                  Thread: <span className="text-primary">{insight.threadTitle}</span>
                </p>
              </div>
              {insight.actionable && (
                <Button size="sm">
                  Take Action
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DriftTab({ insights }: { insights: typeof demoInsights }) {
  return (
    <div className="space-y-6">
      <Card className="border-orange-500/50 bg-orange-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-orange-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                What is Design-Code Drift?
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Drift occurs when implemented code diverges from the original design specifications.
                Synapse automatically detects these inconsistencies by comparing your Figma designs
                with the actual code, down to individual CSS properties.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {insights.map((insight) => (
          <Card key={insight.id} hover className="border-orange-500/30">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Badge variant="danger">Drift Detected</Badge>
                    <div className="flex items-center space-x-1 text-sm text-gray-400">
                      <SparklesIcon className="h-4 w-4" />
                      <span>{Math.round(insight.confidence * 100)}% confident</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{insight.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{insight.description}</p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">🎨</span>
                        <span className="text-sm font-medium text-gray-300">Figma Design</span>
                      </div>
                      <code className="text-xs text-green-400">border-radius: 12px</code>
                    </div>
                    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">💻</span>
                        <span className="text-sm font-medium text-gray-300">Actual Code</span>
                      </div>
                      <code className="text-xs text-red-400">border-radius: 8px</code>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex flex-col space-y-2">
                  <Button size="sm">
                    Fix in Code
                  </Button>
                  <Button size="sm" variant="outline">
                    Update Design
                  </Button>
                  <Button size="sm" variant="ghost">
                    Ignore
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RelationshipsTab({ relationships }: { relationships: typeof demoRelationships }) {
  return (
    <div className="space-y-6">
      <Card className="border-blue-500/50 bg-blue-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <BoltIcon className="h-6 w-6 text-blue-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                Automatic Relationship Detection
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Synapse uses AI to automatically detect and map relationships between your tools.
                These connections form "Golden Threads" that tell the complete story of your work—from
                initial design to final deployment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {relationships.map((rel, index) => (
          <Card key={index} hover>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                {/* Source */}
                <div className="flex-1 rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{rel.source.icon}</span>
                    <div>
                      <p className="text-xs text-gray-500">{rel.source.type}</p>
                      <p className="text-sm font-medium text-white">{rel.source.name}</p>
                    </div>
                  </div>
                </div>

                {/* Relationship */}
                <div className="flex flex-col items-center">
                  <div className="rounded-full border border-primary bg-primary/20 px-3 py-1">
                    <span className="text-xs font-medium text-primary">{rel.relationship}</span>
                  </div>
                  <div className="mt-1 flex items-center space-x-1 text-xs text-gray-500">
                    <SparklesIcon className="h-3 w-3" />
                    <span>{Math.round(rel.confidence * 100)}%</span>
                  </div>
                </div>

                {/* Target */}
                <div className="flex-1 rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{rel.target.icon}</span>
                    <div>
                      <p className="text-xs text-gray-500">{rel.target.type}</p>
                      <p className="text-sm font-medium text-white">{rel.target.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
