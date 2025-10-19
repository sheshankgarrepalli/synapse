/**
 * Intelligence Feed - The NEW Home Page
 * This is where users see IMMEDIATE value
 * No manual work required - everything is automatic
 */

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { api } from '@/utils/api';
import { formatRelativeTime } from '@/lib/utils';
import {
  SparklesIcon,
  BoltIcon,
  LinkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function IntelligencePage() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');

  // Fetch intelligence data
  const { data: feed, isLoading: feedLoading } = api.intelligence.getFeed.useQuery({ timeRange });
  const { data: workSummary, isLoading: summaryLoading } = api.intelligence.getWorkSummary.useQuery();
  const { data: blockers } = api.intelligence.getBlockers.useQuery();
  const { data: driftStats } = api.drift.getDriftStats.useQuery();
  const { data: recentDrifts } = api.drift.getDriftAlerts.useQuery({
    status: 'detected',
    limit: 5,
    offset: 0,
  });

  const isLoading = feedLoading || summaryLoading;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center space-x-2 text-3xl font-bold text-white">
              <SparklesIcon className="h-8 w-8 text-primary" />
              <span>Intelligence Feed</span>
            </h1>
            <p className="mt-1 text-gray-400">
              AI-powered insights about your work across all tools
            </p>
          </div>

          {/* Time Range Filter */}
          <div className="flex space-x-2">
            {(['today', 'week', 'month'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
              <p className="mt-4 text-gray-400">Analyzing your work...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* AI Work Summary */}
            {workSummary && (
              <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-transparent">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <BoltIcon className="h-5 w-5 text-primary" />
                    <CardTitle>What's Happening Right Now</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-white">{workSummary.summary}</p>
                  {workSummary.highlights && workSummary.highlights.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-300">Key Highlights:</p>
                      <ul className="space-y-2">
                        {workSummary.highlights.map((highlight: string, idx: number) => (
                          <li key={idx} className="flex items-start space-x-2 text-gray-400">
                            <span className="text-primary">•</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Design-Code Drift Alerts */}
            {recentDrifts && recentDrifts.drifts.length > 0 && (
              <Card className="border-orange-500/50 bg-gradient-to-br from-orange-500/10 to-transparent">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
                      <CardTitle>Design-Code Drift Detected</CardTitle>
                    </div>
                    <Link href="/drift">
                      <Button variant="outline" size="sm">
                        View All ({driftStats?.total || 0})
                      </Button>
                    </Link>
                  </div>
                  <CardDescription>
                    Your Figma designs have changed - code may need updating
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentDrifts.drifts.map((drift) => {
                      const getSeverityColor = (severity: string) => {
                        switch (severity) {
                          case 'critical':
                            return 'bg-red-500/20 border-red-500/30 text-red-400';
                          case 'high':
                            return 'bg-orange-500/20 border-orange-500/30 text-orange-400';
                          case 'medium':
                            return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
                          case 'low':
                            return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
                          default:
                            return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
                        }
                      };

                      return (
                        <div
                          key={drift.id}
                          className={`rounded-lg border p-4 ${getSeverityColor(drift.severity)}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold uppercase">
                                  {drift.severity}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatRelativeTime(new Date(drift.detectedAt))}
                                </span>
                              </div>
                              <p className="mt-1 text-sm font-medium text-white">{drift.summary}</p>
                              {drift.recommendation && (
                                <p className="mt-2 text-xs text-gray-400">{drift.recommendation}</p>
                              )}
                              <div className="mt-2 flex gap-2 text-xs text-gray-500">
                                {drift.designSnapshot && (
                                  <span>📐 {drift.designSnapshot.fileName}</span>
                                )}
                                {drift.codeSnapshot && (
                                  <span>💻 {drift.codeSnapshot.filePath}</span>
                                )}
                              </div>
                            </div>
                            {drift.designSnapshot?.thumbnailUrl && (
                              <img
                                src={drift.designSnapshot.thumbnailUrl}
                                alt="Design preview"
                                className="ml-3 h-16 w-16 rounded border border-gray-700 object-cover"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Insights */}
            {feed && feed.insights && feed.insights.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <SparklesIcon className="h-5 w-5 text-primary" />
                      <CardTitle>Proactive Insights</CardTitle>
                    </div>
                    <Badge variant="primary" size="sm">
                      AI-Powered
                    </Badge>
                  </div>
                  <CardDescription>
                    Automatic analysis of potential blockers and dependencies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {feed.insights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="flex items-start space-x-3 rounded-lg border border-gray-800 bg-gray-900/50 p-4"
                      >
                        <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-yellow-500" />
                        <p className="text-gray-300">{insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Grid */}
            {feed && (
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {feed.stats.itemsThisWeek}
                        </div>
                        <p className="text-sm text-gray-400">New Items This Week</p>
                      </div>
                      <ChartBarIcon className="h-8 w-8 text-primary/50" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {feed.stats.threadsThisWeek}
                        </div>
                        <p className="text-sm text-gray-400">Auto-Created Threads</p>
                      </div>
                      <BoltIcon className="h-8 w-8 text-primary/50" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {feed.stats.relationshipsDetected}
                        </div>
                        <p className="text-sm text-gray-400">Relationships Detected</p>
                      </div>
                      <LinkIcon className="h-8 w-8 text-primary/50" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Blockers & Stalled Work */}
            {blockers && (blockers.stalledThreads.length > 0 || blockers.blockingRelationships.length > 0) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5 text-yellow-500" />
                    <CardTitle>Needs Attention</CardTitle>
                  </div>
                  <CardDescription>Work that's stalled or blocked</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {blockers.stalledThreads.map((thread) => (
                      <Link key={thread.id} href={`/threads/${thread.id}`}>
                        <div className="flex items-center justify-between rounded-lg border border-yellow-900/50 bg-yellow-900/20 p-4 transition-colors hover:bg-yellow-900/30">
                          <div>
                            <h4 className="font-medium text-white">{thread.title}</h4>
                            <p className="text-sm text-gray-400">
                              No activity for {thread.daysSinceActivity} days
                            </p>
                          </div>
                          <Badge variant="warning" size="sm">
                            Stalled
                          </Badge>
                        </div>
                      </Link>
                    ))}

                    {blockers.blockingRelationships.map((rel: any) => (
                      <div
                        key={rel.id}
                        className="flex items-start space-x-3 rounded-lg border border-red-900/50 bg-red-900/20 p-4"
                      >
                        <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-red-500" />
                        <div>
                          <p className="text-sm text-gray-300">
                            <span className="font-medium text-white">{rel.item?.title}</span> is
                            blocking other work
                          </p>
                          {rel.metadata.reasoning && (
                            <p className="mt-1 text-xs text-gray-500">{rel.metadata.reasoning}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Auto-Detected Relationships - Enhanced with Explainability */}
            {feed && feed.detectedRelationships && feed.detectedRelationships.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <LinkIcon className="h-5 w-5 text-primary" />
                      <CardTitle>Recently Detected Connections</CardTitle>
                    </div>
                    <Badge variant="primary" size="sm">
                      <SparklesIcon className="mr-1 h-3 w-3" />
                      AI-Powered
                    </Badge>
                  </div>
                  <CardDescription>
                    AI automatically found these relationships between your work items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {feed.detectedRelationships.slice(0, 10).map((rel: any) => {
                      const confidence = rel.type.confidence || 0;
                      const getConfidenceColor = (conf: number) => {
                        if (conf >= 0.9) return 'text-green-400';
                        if (conf >= 0.7) return 'text-yellow-400';
                        return 'text-orange-400';
                      };

                      return (
                        <div
                          key={rel.id}
                          className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 transition-colors hover:border-primary/50"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
                                <LinkIcon className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {rel.type.relationshipType}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatRelativeTime(new Date(rel.createdAt))}
                                </p>
                              </div>
                            </div>

                            {/* Confidence Score with Visual Indicator */}
                            <div className="flex items-center space-x-2">
                              <div className="flex flex-col items-end">
                                <span className={`text-sm font-semibold ${getConfidenceColor(confidence)}`}>
                                  {Math.round(confidence * 100)}%
                                </span>
                                <span className="text-xs text-gray-500">confidence</span>
                              </div>
                              <div className="h-12 w-12 relative">
                                <svg className="transform -rotate-90" viewBox="0 0 36 36">
                                  <circle
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    className="stroke-gray-800"
                                    strokeWidth="3"
                                  />
                                  <circle
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    className={confidence >= 0.9 ? 'stroke-green-500' : confidence >= 0.7 ? 'stroke-yellow-500' : 'stroke-orange-500'}
                                    strokeWidth="3"
                                    strokeDasharray={`${confidence * 100} 100`}
                                    strokeLinecap="round"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* AI Reasoning - Why this relationship was detected */}
                          {rel.type.reasoning && (
                            <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3 mb-3">
                              <div className="flex items-start space-x-2">
                                <SparklesIcon className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs font-medium text-blue-300 mb-1">Why this was detected:</p>
                                  <p className="text-xs text-gray-400">{rel.type.reasoning}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Connected Items Preview */}
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 rounded-lg border border-gray-800 bg-gray-900 p-3">
                              <p className="text-xs text-gray-500 mb-1">{rel.fromItem?.source || 'Source'}</p>
                              <p className="text-sm text-white truncate">{rel.fromItem?.title || 'Item A'}</p>
                            </div>
                            <div className="flex-shrink-0">
                              <div className="rounded-full bg-primary/20 p-2">
                                <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                              </div>
                            </div>
                            <div className="flex-1 rounded-lg border border-gray-800 bg-gray-900 p-3">
                              <p className="text-xs text-gray-500 mb-1">{rel.toItem?.source || 'Target'}</p>
                              <p className="text-sm text-white truncate">{rel.toItem?.title || 'Item B'}</p>
                            </div>
                          </div>

                          {/* Evidence/Signals that led to detection */}
                          {rel.type.signals && rel.type.signals.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-800">
                              <p className="text-xs font-medium text-gray-400 mb-2">Detection signals:</p>
                              <div className="flex flex-wrap gap-2">
                                {rel.type.signals.map((signal: string, idx: number) => (
                                  <Badge key={idx} variant="outline" size="sm">
                                    {signal}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Threads (including auto-created) */}
            {feed && feed.recentThreads && feed.recentThreads.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Threads</CardTitle>
                    <Link href="/threads">
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {feed.recentThreads.map((thread: any) => (
                      <Link key={thread.id} href={`/threads/${thread.id}`}>
                        <div className="flex items-center justify-between rounded-lg border border-gray-800 p-4 transition-colors hover:border-primary">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-white">{thread.title}</h4>
                              {thread.isAutoCreated && (
                                <Badge variant="primary" size="sm">
                                  <BoltIcon className="mr-1 h-3 w-3" />
                                  Auto-Created
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              {thread._count.connectedItems} connected items • {formatRelativeTime(new Date(thread.createdAt))}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {feed && feed.recentItems.length === 0 && feed.recentThreads.length === 0 && (
              <EmptyState
                illustration="intelligence"
                title="Waiting for your first integration"
                description="Connect GitHub, Linear, Figma, Slack, or Zoom to start seeing AI-powered insights about your work. Synapse will automatically analyze your data and detect relationships."
                action={{
                  label: 'Connect Your First Tool',
                  href: '/integrations',
                }}
                secondaryAction={{
                  label: 'View Demo',
                  href: '/demo',
                }}
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
