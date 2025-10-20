/**
 * Email Sending Service for Daily Digest
 * Handles rendering email template and sending via Resend
 */

import { Resend } from 'resend';
import { render } from '@react-email/render';
import DailyDigestEmail from '../../emails/DailyDigest';
import { DailyDigestData } from '../digest/digestTypes';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendDigestEmailOptions {
  data: DailyDigestData;
  to: string;
  from?: string;
}

interface SendDigestEmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

/**
 * Send daily digest email to a user
 */
export async function sendDailyDigest(
  options: SendDigestEmailOptions
): Promise<SendDigestEmailResult> {
  const { data, to, from = 'Synapse <digest@synapse.app>' } = options;

  try {
    // Generate URLs for email footer
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://synapse.app';
    const unsubscribeUrl = `${baseUrl}/settings?section=email&action=unsubscribe`;
    const preferencesUrl = `${baseUrl}/settings?section=email`;
    const viewInBrowserUrl = undefined; // Can implement later with stored digest

    // Render HTML email
    const html = await render(
      DailyDigestEmail({
        data,
        unsubscribeUrl,
        preferencesUrl,
        viewInBrowserUrl,
      })
    );

    // Render plain text fallback
    const text = renderPlainTextDigest(data, unsubscribeUrl, preferencesUrl);

    // Generate subject line
    const subject = generateSubjectLine(data);

    // Send email via Resend
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      tags: [
        { name: 'type', value: 'daily-digest' },
        { name: 'user_id', value: data.user.id },
        { name: 'organization_id', value: data.organization.id },
      ],
    });

    if (!result.data) {
      throw new Error(result.error?.message || 'Failed to send email');
    }

    return {
      success: true,
      emailId: result.data.id,
    };
  } catch (error) {
    console.error('Failed to send daily digest email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate subject line based on digest content
 */
function generateSubjectLine(data: DailyDigestData): string {
  const { alerts, warnings, goodNews, stats } = data;
  const date = new Date(data.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  // Critical alerts take priority
  if (alerts.length > 0) {
    return `⚠️ ${alerts.length} alert${alerts.length > 1 ? 's' : ''} in your Golden Threads`;
  }

  // Good news second
  if (goodNews.length > 0) {
    return `✅ ${goodNews.length} update${goodNews.length > 1 ? 's' : ''} in your Golden Threads`;
  }

  // Warnings third
  if (warnings.length > 0) {
    return `${warnings.length} update${warnings.length > 1 ? 's' : ''} in your Golden Threads`;
  }

  // Default: date-based subject
  return `Your Golden Threads digest for ${date}`;
}

/**
 * Render plain text version of digest email
 */
function renderPlainTextDigest(
  data: DailyDigestData,
  unsubscribeUrl: string,
  preferencesUrl: string
): string {
  const { user, organization, date, alerts, warnings, goodNews, activeThreads } = data;
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let text = `SYNAPSE\n`;
  text += `${formattedDate}\n\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `Hi ${user.firstName},\n\n`;
  text += `Here's what's happening across your Golden Threads:\n\n`;

  // Critical Alerts
  if (alerts.length > 0) {
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `🚨 CRITICAL ALERTS (${alerts.length})\n\n`;
    for (const alert of alerts) {
      text += `• ${alert.title}\n`;
      if (alert.threadTitle) {
        text += `  "${alert.threadTitle}" thread\n`;
      }
      text += `  ${alert.description}\n`;
      if (alert.actionUrl) {
        text += `  → ${alert.actionLabel}: ${alert.actionUrl}\n`;
      }
      text += `\n`;
    }
  }

  // Warnings
  if (warnings.length > 0) {
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `⚠️  WARNINGS (${warnings.length})\n\n`;
    for (const warning of warnings) {
      text += `• ${warning.title}\n`;
      if (warning.threadTitle) {
        text += `  "${warning.threadTitle}" thread\n`;
      }
      text += `  ${warning.description}\n`;
      if (warning.actionUrl) {
        text += `  → ${warning.actionLabel}: ${warning.actionUrl}\n`;
      }
      text += `\n`;
    }
  }

  // Good News
  if (goodNews.length > 0) {
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `✅ GOOD NEWS (${goodNews.length})\n\n`;
    for (const news of goodNews) {
      text += `• ${news.title}\n`;
      text += `  ${news.description}\n`;
      if (news.url) {
        text += `  → View details: ${news.url}\n`;
      }
      text += `\n`;
    }
  }

  // Active Threads
  if (activeThreads.length > 0) {
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📊 YOUR ACTIVE GOLDEN THREADS (${activeThreads.length})\n\n`;
    for (let i = 0; i < Math.min(5, activeThreads.length); i++) {
      const thread = activeThreads[i];
      text += `${i + 1}. ${thread.title} (${thread.status})\n`;

      const stats: string[] = [];
      if (thread.designCount > 0) stats.push(`🎨 ${thread.designCount} ${thread.designCount === 1 ? 'design' : 'designs'}`);
      if (thread.prCount > 0) stats.push(`💻 ${thread.prCount} ${thread.prCount === 1 ? 'PR' : 'PRs'}`);
      if (thread.issueCount > 0) stats.push(`📋 ${thread.issueCount} ${thread.issueCount === 1 ? 'issue' : 'issues'}`);
      if (thread.slackCount > 0) stats.push(`💬 ${thread.slackCount} ${thread.slackCount === 1 ? 'conversation' : 'conversations'}`);

      if (stats.length > 0) {
        text += `   ${stats.join('  ')}\n`;
      }

      const lastUpdate = new Date(thread.lastActivityAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
      text += `   Last updated: ${lastUpdate}\n`;
      text += `   → View thread: ${thread.url}\n`;
      text += `\n`;
    }

    if (activeThreads.length > 5) {
      text += `View all ${activeThreads.length} threads: ${process.env.NEXT_PUBLIC_APP_URL}/threads\n\n`;
    }
  }

  // Empty state
  if (alerts.length === 0 && warnings.length === 0 && goodNews.length === 0 && activeThreads.length === 0) {
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `No new activity in your Golden Threads today. All caught up!\n\n`;
  }

  // Footer
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `Email Preferences: ${preferencesUrl}\n`;
  text += `Unsubscribe: ${unsubscribeUrl}\n\n`;
  text += `© ${new Date().getFullYear()} ${organization.name}. All rights reserved.\n`;

  return text;
}

/**
 * Send digest emails in batch with rate limiting
 */
export async function sendDigestBatch(
  digests: Array<{ data: DailyDigestData; to: string }>
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  // Process in batches of 10 (Resend rate limit consideration)
  const batchSize = 10;
  for (let i = 0; i < digests.length; i += batchSize) {
    const batch = digests.slice(i, i + batchSize);

    // Send batch concurrently
    const results = await Promise.allSettled(
      batch.map((digest) => sendDailyDigest(digest))
    );

    // Count successes and failures
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success) {
        success++;
      } else {
        failed++;
        if (result.status === 'fulfilled') {
          errors.push(result.value.error || 'Unknown error');
        } else {
          errors.push(result.reason?.message || 'Unknown error');
        }
      }
    }

    // Rate limiting: wait 1 second between batches
    if (i + batchSize < digests.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return { success, failed, errors };
}

/**
 * Test email sending with mock data
 */
export async function sendTestDigest(to: string): Promise<SendDigestEmailResult> {
  const mockData: DailyDigestData = {
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      email: to,
      timezone: 'America/New_York',
    },
    organization: {
      id: 'test-org-id',
      name: 'Test Organization',
    },
    date: new Date(),
    alerts: [
      {
        id: 'alert-1',
        type: 'drift_detected',
        severity: 'critical',
        title: 'Design-Code Drift Detected',
        description: 'Figma design updated 3 days ago, but code hasn\'t changed',
        threadId: 'thread-1',
        threadTitle: 'Mobile Onboarding',
        actionUrl: 'https://synapse.app/drift/drift-1',
        actionLabel: 'Review changes',
        createdAt: new Date(),
      },
      {
        id: 'alert-2',
        type: 'blocked_pr',
        severity: 'critical',
        title: 'Blocked PR',
        description: 'PR #456 waiting for review for 5 days',
        threadId: 'thread-2',
        threadTitle: 'Feature Launch Pipeline',
        actionUrl: 'https://github.com/org/repo/pull/456',
        actionLabel: 'Review PR',
        createdAt: new Date(),
      },
    ],
    warnings: [
      {
        id: 'warning-1',
        type: 'stale_thread',
        title: 'Stale Thread',
        description: '"Bug Fix Workflow" hasn\'t been updated in 7 days',
        threadId: 'thread-3',
        threadTitle: 'Bug Fix Workflow',
        actionUrl: 'https://synapse.app/threads/thread-3',
        actionLabel: 'Check status',
        daysSince: 7,
      },
    ],
    goodNews: [
      {
        id: 'good-1',
        type: 'pr_merged',
        title: 'PR Merged',
        description: '"Code Review Workflow" - PR #457 merged to main',
        threadId: 'thread-4',
        threadTitle: 'Code Review Workflow',
        url: 'https://github.com/org/repo/pull/457',
        completedAt: new Date(),
      },
      {
        id: 'good-2',
        type: 'feature_deployed',
        title: 'Feature Deployed',
        description: '"New Dashboard" shipped to production',
        threadId: 'thread-5',
        threadTitle: 'New Dashboard',
        completedAt: new Date(),
      },
      {
        id: 'good-3',
        type: 'issue_completed',
        title: 'Issue Completed',
        description: 'LIN-125: Dark mode implementation marked done',
        threadId: 'thread-6',
        threadTitle: 'Dark Mode',
        url: 'https://linear.app/team/issue/LIN-125',
        completedAt: new Date(),
      },
    ],
    activeThreads: [
      {
        id: 'thread-1',
        title: 'Mobile Onboarding',
        status: 'In Progress',
        designCount: 2,
        prCount: 1,
        issueCount: 3,
        slackCount: 5,
        lastActivityAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        url: 'https://synapse.app/threads/thread-1',
      },
      {
        id: 'thread-2',
        title: 'Feature Launch Pipeline',
        status: 'Review',
        designCount: 0,
        prCount: 2,
        issueCount: 1,
        slackCount: 0,
        lastActivityAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        url: 'https://synapse.app/threads/thread-2',
      },
    ],
    stats: {
      totalThreads: 8,
      activeThreads: 5,
      completedThisWeek: 2,
      totalAlerts: 3,
    },
  };

  return sendDailyDigest({ data: mockData, to });
}
