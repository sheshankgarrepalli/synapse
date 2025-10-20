/**
 * Daily Digest Data Aggregation
 * Generates digest data for a user by analyzing their Golden Threads,
 * detecting alerts, warnings, and good news
 */

import { prisma } from '../prisma';
import {
  DailyDigestData,
  DigestAlert,
  DigestWarning,
  DigestGoodNews,
  ThreadSummary,
} from './digestTypes';
import { subDays, differenceInDays, startOfDay } from 'date-fns';

interface GenerateDigestOptions {
  userId: string;
  organizationId: string;
  date?: Date;
}

/**
 * Generate daily digest data for a user
 */
export async function generateDigest(options: GenerateDigestOptions): Promise<DailyDigestData> {
  const { userId, organizationId, date = new Date() } = options;

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      preferences: true,
    },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  // Fetch organization data
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
    },
  });

  if (!organization) {
    throw new Error(`Organization ${organizationId} not found`);
  }

  // Extract user preferences (timezone, email preferences)
  const preferences = (user.preferences as any) || {};
  const firstName = user.fullName?.split(' ')[0] || 'there';
  const timezone = preferences.timezone || 'America/New_York';

  // Fetch user's active threads
  const activeThreads = await prisma.goldenThread.findMany({
    where: {
      organizationId,
      deletedAt: null,
      OR: [
        { createdBy: userId },
        {
          collaborators: {
            some: { userId },
          },
        },
      ],
    },
    include: {
      connectedItems: {
        where: { deletedAt: null },
        select: {
          id: true,
          integrationType: true,
          itemType: true,
          metadata: true,
          updatedAt: true,
        },
      },
      _count: {
        select: {
          connectedItems: true,
          comments: true,
        },
      },
    },
    orderBy: {
      lastActivityAt: 'desc',
    },
  });

  // Generate alerts (critical issues requiring attention)
  const alerts = await detectAlerts(activeThreads, organizationId);

  // Generate warnings (important but not urgent)
  const warnings = await detectWarnings(activeThreads, organizationId);

  // Generate good news (positive updates)
  const goodNews = await detectGoodNews(activeThreads, organizationId, date);

  // Generate thread summaries
  const threadSummaries = activeThreads.map(thread => generateThreadSummary(thread));

  // Calculate stats
  const stats = {
    totalThreads: activeThreads.length,
    activeThreads: activeThreads.filter(t =>
      differenceInDays(date, new Date(t.lastActivityAt)) <= 7
    ).length,
    completedThisWeek: activeThreads.filter(t =>
      t.status === 'completed' &&
      differenceInDays(date, new Date(t.updatedAt)) <= 7
    ).length,
    totalAlerts: alerts.length + warnings.length,
  };

  return {
    user: {
      id: user.id,
      firstName,
      email: user.email,
      timezone,
    },
    organization: {
      id: organization.id,
      name: organization.name,
    },
    date,
    alerts,
    warnings,
    goodNews,
    activeThreads: threadSummaries,
    stats,
  };
}

/**
 * Detect critical alerts requiring immediate attention
 */
async function detectAlerts(threads: any[], organizationId: string): Promise<DigestAlert[]> {
  const alerts: DigestAlert[] = [];
  const now = new Date();

  // Check for design-code drift
  const driftAlerts = await prisma.designCodeDrift.findMany({
    where: {
      organizationId,
      status: 'detected',
      severity: { in: ['high', 'critical'] },
      detectedAt: { gte: subDays(now, 7) },
    },
    include: {
      designItem: {
        include: {
          thread: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    take: 10,
  });

  for (const drift of driftAlerts) {
    alerts.push({
      id: drift.id,
      type: 'drift_detected',
      severity: 'critical',
      title: 'Design-Code Drift Detected',
      description: drift.summary || 'Design has diverged from implementation',
      threadId: drift.designItem?.thread?.id,
      threadTitle: drift.designItem?.thread?.title,
      actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/drift/${drift.id}`,
      actionLabel: 'Review changes',
      metadata: { severity: drift.severity, confidence: drift.confidence },
      createdAt: drift.detectedAt,
    });
  }

  // Check for blocked PRs
  for (const thread of threads) {
    const blockedPRs = thread.connectedItems.filter(
      (item: any) =>
        item.integrationType === 'github' &&
        item.itemType === 'pull_request' &&
        item.metadata?.state === 'open' &&
        differenceInDays(now, new Date(item.updatedAt)) >= 5
    );

    for (const pr of blockedPRs) {
      alerts.push({
        id: `blocked-pr-${pr.id}`,
        type: 'blocked_pr',
        severity: 'critical',
        title: 'Blocked PR',
        description: `PR waiting for review for ${differenceInDays(now, new Date(pr.updatedAt))} days`,
        threadId: thread.id,
        threadTitle: thread.title,
        actionUrl: pr.metadata?.html_url || `${process.env.NEXT_PUBLIC_APP_URL}/threads/${thread.id}`,
        actionLabel: 'Review PR',
        metadata: pr.metadata,
        createdAt: pr.updatedAt,
      });
    }
  }

  return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Detect warnings (important but not urgent)
 */
async function detectWarnings(threads: any[], organizationId: string): Promise<DigestWarning[]> {
  const warnings: DigestWarning[] = [];
  const now = new Date();

  // Check for stale threads (no activity in 7+ days)
  for (const thread of threads) {
    const daysSinceActivity = differenceInDays(now, new Date(thread.lastActivityAt));

    if (daysSinceActivity >= 7 && thread.status !== 'completed') {
      warnings.push({
        id: `stale-thread-${thread.id}`,
        type: 'stale_thread',
        title: 'Stale Thread',
        description: `"${thread.title}" hasn't been updated in ${daysSinceActivity} days`,
        threadId: thread.id,
        threadTitle: thread.title,
        actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/threads/${thread.id}`,
        actionLabel: 'Check status',
        daysSince: daysSinceActivity,
      });
    }
  }

  // Check for threads with no connected items (missing connections)
  for (const thread of threads) {
    if (thread.connectedItems.length === 0 && differenceInDays(now, new Date(thread.createdAt)) >= 2) {
      warnings.push({
        id: `no-items-${thread.id}`,
        type: 'missing_connection',
        title: 'Thread Needs Connections',
        description: `"${thread.title}" has no connected items yet`,
        threadId: thread.id,
        threadTitle: thread.title,
        actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/threads/${thread.id}`,
        actionLabel: 'Add connections',
      });
    }
  }

  return warnings.slice(0, 5); // Limit to 5 warnings
}

/**
 * Detect good news (positive updates in the last 24 hours)
 */
async function detectGoodNews(
  threads: any[],
  organizationId: string,
  date: Date
): Promise<DigestGoodNews[]> {
  const goodNews: DigestGoodNews[] = [];
  const yesterday = subDays(startOfDay(date), 1);

  // Check for merged PRs
  for (const thread of threads) {
    const mergedPRs = thread.connectedItems.filter(
      (item: any) =>
        item.integrationType === 'github' &&
        item.itemType === 'pull_request' &&
        item.metadata?.state === 'closed' &&
        item.metadata?.merged === true &&
        new Date(item.updatedAt) >= yesterday
    );

    for (const pr of mergedPRs) {
      goodNews.push({
        id: `merged-pr-${pr.id}`,
        type: 'pr_merged',
        title: 'PR Merged',
        description: `"${thread.title}" - ${pr.metadata?.title || 'PR'} merged to ${pr.metadata?.base?.ref || 'main'}`,
        threadId: thread.id,
        threadTitle: thread.title,
        url: pr.metadata?.html_url,
        metadata: pr.metadata,
        completedAt: new Date(pr.updatedAt),
      });
    }
  }

  // Check for completed issues
  for (const thread of threads) {
    const completedIssues = thread.connectedItems.filter(
      (item: any) =>
        item.integrationType === 'linear' &&
        item.itemType === 'issue' &&
        (item.metadata?.state?.type === 'completed' || item.metadata?.completed === true) &&
        new Date(item.updatedAt) >= yesterday
    );

    for (const issue of completedIssues) {
      goodNews.push({
        id: `completed-issue-${issue.id}`,
        type: 'issue_completed',
        title: 'Issue Completed',
        description: `${issue.metadata?.identifier || 'Issue'}: ${issue.metadata?.title || thread.title}`,
        threadId: thread.id,
        threadTitle: thread.title,
        url: issue.metadata?.url,
        metadata: issue.metadata,
        completedAt: new Date(issue.updatedAt),
      });
    }
  }

  // Check for recently completed threads
  const completedThreads = threads.filter(
    (thread) =>
      thread.status === 'completed' &&
      new Date(thread.updatedAt) >= yesterday
  );

  for (const thread of completedThreads) {
    goodNews.push({
      id: `completed-thread-${thread.id}`,
      type: 'thread_completed',
      title: 'Thread Completed',
      description: `"${thread.title}" marked as complete`,
      threadId: thread.id,
      threadTitle: thread.title,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/threads/${thread.id}`,
      completedAt: new Date(thread.updatedAt),
    });
  }

  return goodNews
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
    .slice(0, 10); // Limit to 10 good news items
}

/**
 * Generate thread summary
 */
function generateThreadSummary(thread: any): ThreadSummary {
  const items = thread.connectedItems || [];

  return {
    id: thread.id,
    title: thread.title,
    status: thread.status,
    designCount: items.filter((i: any) => i.integrationType === 'figma').length,
    prCount: items.filter(
      (i: any) => i.integrationType === 'github' && i.itemType === 'pull_request'
    ).length,
    issueCount: items.filter((i: any) => i.integrationType === 'linear').length,
    slackCount: items.filter((i: any) => i.integrationType === 'slack').length,
    lastActivityAt: thread.lastActivityAt,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/threads/${thread.id}`,
  };
}

/**
 * Check if user should receive digest (based on preferences)
 */
export async function shouldSendDigest(userId: string, date: Date): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      preferences: true,
    },
  });

  if (!user) return false;

  const preferences = (user.preferences as any) || {};
  const emailPrefs = preferences.email || {};

  // Check if digest is enabled
  if (emailPrefs.digestEnabled === false) return false;
  if (emailPrefs.digestFrequency === 'off') return false;

  // For weekly digests, only send on Mondays
  if (emailPrefs.digestFrequency === 'weekly') {
    return date.getDay() === 1; // Monday
  }

  // Daily digests send every day
  return true;
}
