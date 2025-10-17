/**
 * Daily/Weekly Digest Generation
 * Sends AI-powered summaries via email or Slack
 * Keeps teams in sync without meetings
 */

import { Anthropic } from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface DigestData {
  summary: string;
  keyUpdates: string[];
  blockers: string[];
  completedWork: string[];
  upcomingWork: string[];
}

/**
 * Generates a daily digest for an organization
 */
export async function generateDailyDigest(organizationId: string): Promise<DigestData | null> {
  if (!process.env.ANTHROPIC_API_KEY) {
    logger.warn('Cannot generate digest: ANTHROPIC_API_KEY not set');
    return null;
  }

  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Gather data from last 24 hours
    const [newItems, updatedThreads, completedThreads, activityFeed] = await Promise.all([
      // New items created
      prisma.connectedItem.findMany({
        where: {
          organizationId,
          deletedAt: null,
          createdAt: { gte: yesterday },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          thread: { select: { title: true } },
        },
      }),

      // Threads with updates
      prisma.goldenThread.findMany({
        where: {
          organizationId,
          deletedAt: null,
          updatedAt: { gte: yesterday },
          status: { in: ['in_progress', 'review'] },
        },
        include: {
          connectedItems: {
            where: { deletedAt: null },
            take: 3,
          },
        },
      }),

      // Completed work
      prisma.goldenThread.findMany({
        where: {
          organizationId,
          deletedAt: null,
          status: 'completed',
          updatedAt: { gte: yesterday },
        },
      }),

      // Recent activity
      prisma.activityFeed.findMany({
        where: {
          organizationId,
          createdAt: { gte: yesterday },
        },
        take: 20,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    if (newItems.length === 0 && updatedThreads.length === 0 && completedThreads.length === 0) {
      return {
        summary: 'No significant activity yesterday.',
        keyUpdates: [],
        blockers: [],
        completedWork: [],
        upcomingWork: [],
      };
    }

    // Use AI to generate narrative digest
    const prompt = `Create a daily team update digest from this data.

NEW WORK ITEMS (Last 24h):
${newItems
  .map((item) => `- [${item.integrationType}] ${item.title} (Thread: ${item.thread?.title || 'None'})`)
  .join('\n')}

ACTIVE THREADS WITH UPDATES:
${updatedThreads
  .map(
    (thread) => `
- ${thread.title} [${thread.status}]
  Items: ${thread.connectedItems.map((i) => i.title).join(', ')}
`
  )
  .join('\n')}

COMPLETED WORK:
${completedThreads.map((thread) => `- ${thread.title}`).join('\n')}

Create a digest with:
1. A brief summary (2-3 sentences) of what happened yesterday
2. 3-5 key updates (specific accomplishments or progress)
3. Any blockers or items that need attention (if apparent)
4. Completed work to celebrate
5. What's coming up next

Return JSON:
{
  "summary": "Brief overview of yesterday",
  "keyUpdates": ["Update 1", "Update 2", ...],
  "blockers": ["Blocker 1", ...],
  "completedWork": ["Completed item 1", ...],
  "upcomingWork": ["Upcoming item 1", ...]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }

    const digest = JSON.parse(jsonMatch[0]);

    logger.info('Generated daily digest', { organizationId, itemCount: newItems.length });

    return digest;
  } catch (error) {
    logger.error('Error generating daily digest', { error, organizationId });
    return null;
  }
}

/**
 * Generates a weekly summary digest
 */
export async function generateWeeklyDigest(organizationId: string): Promise<DigestData | null> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return null;
  }

  try {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [weekItems, weekThreads, completedThreads] = await Promise.all([
      prisma.connectedItem.findMany({
        where: {
          organizationId,
          deletedAt: null,
          createdAt: { gte: lastWeek },
        },
        orderBy: { createdAt: 'desc' },
      }),

      prisma.goldenThread.findMany({
        where: {
          organizationId,
          deletedAt: null,
          createdAt: { gte: lastWeek },
        },
      }),

      prisma.goldenThread.findMany({
        where: {
          organizationId,
          status: 'completed',
          updatedAt: { gte: lastWeek },
        },
      }),
    ]);

    const prompt = `Create a weekly team summary from this data.

THIS WEEK'S ACTIVITY:
- ${weekItems.length} new work items created
- ${weekThreads.length} new threads started
- ${completedThreads.length} threads completed

NEW ITEMS:
${weekItems
  .slice(0, 20)
  .map((item) => `- [${item.integrationType}] ${item.title}`)
  .join('\n')}

COMPLETED:
${completedThreads.map((thread) => `- ${thread.title}`).join('\n')}

Create a narrative weekly summary highlighting:
1. Overall theme of the week
2. Major accomplishments
3. What's in progress
4. What needs attention next week

Return JSON with same format as daily digest.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    logger.error('Error generating weekly digest', { error, organizationId });
    return null;
  }
}
