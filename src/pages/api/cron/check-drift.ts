/**
 * Vercel Cron Job: Check Design-Code Drift
 * Runs periodically to check all active drift watches
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { DriftDetectionService } from '@/lib/services/drift-detection';
import { logger } from '@/lib/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify the request is from Vercel Cron
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    logger.warn('Unauthorized cron request', {
      hasAuth: !!authHeader,
      hasSecret: !!cronSecret,
    });
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('Starting drift check cron job');

    const result = await DriftDetectionService.checkAllWatches();

    logger.info('Drift check cron job completed', result);

    return res.status(200).json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Drift check cron job failed', {
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
