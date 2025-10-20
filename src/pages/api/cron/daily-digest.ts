/**
 * Daily Digest Cron Job API Endpoint
 * Triggers daily digest email generation and sending
 * Runs at 9 AM in each user's timezone
 *
 * Usage with Vercel Cron:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/daily-digest",
 *     "schedule": "0 * * * *"  // Runs every hour
 *   }]
 * }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { generateDigest, shouldSendDigest } from '../../../lib/digest/generateDigest';
import { sendDigestBatch } from '../../../lib/email/sendDailyDigest';

interface DigestJobResponse {
  success: boolean;
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
  errors: string[];
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DigestJobResponse>
) {
  // Security: Verify cron job authorization
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({
      success: false,
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: ['Unauthorized'],
      message: 'Invalid authorization',
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: ['Method not allowed'],
      message: 'Only POST requests are allowed',
    });
  }

  try {
    const now = new Date();
    const currentHour = now.getUTCHours();

    console.log(`[Daily Digest] Starting cron job at ${now.toISOString()}`);

    // Fetch all active users with their organizations
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        organization: {
          deletedAt: null,
        },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        organizationId: true,
        preferences: true,
      },
    });

    console.log(`[Daily Digest] Found ${users.length} active users`);

    let processed = 0;
    let skipped = 0;
    const digestsToSend: Array<{ data: any; to: string }> = [];

    // Process each user
    for (const user of users) {
      processed++;

      try {
        // Check if user should receive digest today
        const shouldSend = await shouldSendDigest(user.id, now);
        if (!shouldSend) {
          skipped++;
          continue;
        }

        // Get user's timezone preference
        const preferences = (user.preferences as any) || {};
        const emailPrefs = preferences.email || {};
        const timezone = preferences.timezone || 'America/New_York';
        const digestTime = emailPrefs.digestTime || '09:00';

        // Check if it's 9 AM in user's timezone
        // This is a simplified check - for production, use a proper timezone library
        const userHour = parseInt(digestTime.split(':')[0]);
        const shouldSendNow = isDigestTime(currentHour, userHour, timezone);

        if (!shouldSendNow) {
          skipped++;
          continue;
        }

        // Generate digest data
        const digestData = await generateDigest({
          userId: user.id,
          organizationId: user.organizationId,
          date: now,
        });

        // Skip if no content to send
        const hasContent =
          digestData.alerts.length > 0 ||
          digestData.warnings.length > 0 ||
          digestData.goodNews.length > 0 ||
          digestData.activeThreads.length > 0;

        if (!hasContent && emailPrefs.skipEmptyDigests !== false) {
          skipped++;
          continue;
        }

        // Add to batch
        digestsToSend.push({
          data: digestData,
          to: user.email,
        });

        console.log(`[Daily Digest] Prepared digest for ${user.email}`);
      } catch (error) {
        console.error(`[Daily Digest] Error processing user ${user.id}:`, error);
        skipped++;
      }
    }

    console.log(`[Daily Digest] Sending ${digestsToSend.length} digests`);

    // Send digests in batches
    const sendResults = await sendDigestBatch(digestsToSend);

    console.log(
      `[Daily Digest] Completed: ${sendResults.success} sent, ${sendResults.failed} failed`
    );

    // Log to database for tracking (optional)
    if (process.env.LOG_DIGEST_RUNS === 'true') {
      // You can implement a DigestLog model to track sends
    }

    return res.status(200).json({
      success: true,
      processed,
      sent: sendResults.success,
      failed: sendResults.failed,
      skipped,
      errors: sendResults.errors,
      message: `Successfully sent ${sendResults.success} digests`,
    });
  } catch (error) {
    console.error('[Daily Digest] Fatal error:', error);

    return res.status(500).json({
      success: false,
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      message: 'Failed to process daily digest',
    });
  }
}

/**
 * Check if it's digest time for the user based on their timezone
 * Simplified implementation - for production use a proper timezone library
 */
function isDigestTime(currentUtcHour: number, targetLocalHour: number, timezone: string): boolean {
  // Map of timezones to UTC offset (simplified)
  const timezoneOffsets: Record<string, number> = {
    'America/New_York': -5,
    'America/Chicago': -6,
    'America/Denver': -7,
    'America/Los_Angeles': -8,
    'Europe/London': 0,
    'Europe/Paris': 1,
    'Asia/Tokyo': 9,
    'Australia/Sydney': 11,
    // Add more as needed
  };

  const offset = timezoneOffsets[timezone] || 0;
  const userLocalHour = (currentUtcHour + offset + 24) % 24;

  // Check if current hour matches target hour (with 1-hour window)
  return userLocalHour === targetLocalHour;
}

/**
 * Helper function to manually trigger digest for testing
 * POST /api/cron/daily-digest?test=true&userId=xxx
 */
export async function testDigestForUser(userId: string): Promise<DigestJobResponse> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        organizationId: true,
        preferences: true,
      },
    });

    if (!user) {
      return {
        success: false,
        processed: 0,
        sent: 0,
        failed: 1,
        skipped: 0,
        errors: ['User not found'],
        message: 'User not found',
      };
    }

    const digestData = await generateDigest({
      userId: user.id,
      organizationId: user.organizationId,
      date: new Date(),
    });

    const result = await sendDigestBatch([
      {
        data: digestData,
        to: user.email,
      },
    ]);

    return {
      success: result.success > 0,
      processed: 1,
      sent: result.success,
      failed: result.failed,
      skipped: 0,
      errors: result.errors,
      message: result.success > 0 ? 'Test digest sent' : 'Failed to send test digest',
    };
  } catch (error) {
    return {
      success: false,
      processed: 1,
      sent: 0,
      failed: 1,
      skipped: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      message: 'Failed to send test digest',
    };
  }
}
