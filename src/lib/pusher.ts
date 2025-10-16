/**
 * Pusher server-side client
 * Used to broadcast real-time events to connected clients
 */

import Pusher from 'pusher';
import { logger } from './logger';

// Lazy initialization to avoid build-time errors
let pusherInstance: Pusher | null = null;

export function getPusher(): Pusher {
  if (!pusherInstance) {
    // Check if all required env vars are present
    if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || !process.env.PUSHER_SECRET || !process.env.PUSHER_CLUSTER) {
      logger.warn('Pusher environment variables not configured, real-time features will be disabled');
      // Return a mock instance for build time/missing config
      pusherInstance = {
        trigger: async () => ({ channels: {} }),
        authorizeChannel: () => ({ auth: '' }),
      } as unknown as Pusher;
      return pusherInstance;
    }

    pusherInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true,
    });
  }

  return pusherInstance;
}

/**
 * Broadcast thread update to all viewers
 */
export async function broadcastThreadUpdate(
  organizationId: string,
  threadId: string,
  data: any
) {
  try {
    await getPusher().trigger(`private-org-${organizationId}`, 'thread:updated', {
      threadId,
      timestamp: new Date().toISOString(),
      ...data,
    });

    logger.info('Broadcast thread update', { organizationId, threadId });
  } catch (error) {
    logger.error('Failed to broadcast thread update', { error, organizationId, threadId });
  }
}

/**
 * Broadcast new comment to thread viewers
 */
export async function broadcastCommentCreated(
  organizationId: string,
  threadId: string,
  comment: any
) {
  try {
    await getPusher().trigger(`private-org-${organizationId}`, 'comment:created', {
      threadId,
      comment,
      timestamp: new Date().toISOString(),
    });

    logger.info('Broadcast comment created', { organizationId, threadId, commentId: comment.id });
  } catch (error) {
    logger.error('Failed to broadcast comment', { error });
  }
}

/**
 * Broadcast item added to thread
 */
export async function broadcastItemAdded(
  organizationId: string,
  threadId: string,
  item: any
) {
  try {
    await getPusher().trigger(`private-org-${organizationId}`, 'item:added', {
      threadId,
      item,
      timestamp: new Date().toISOString(),
    });

    logger.info('Broadcast item added', { organizationId, threadId, itemId: item.id });
  } catch (error) {
    logger.error('Failed to broadcast item', { error });
  }
}

/**
 * Broadcast activity feed update
 */
export async function broadcastActivity(
  organizationId: string,
  activity: any
) {
  try {
    await getPusher().trigger(`private-org-${organizationId}`, 'activity:new', {
      activity,
      timestamp: new Date().toISOString(),
    });

    logger.info('Broadcast activity', { organizationId, activityId: activity.id });
  } catch (error) {
    logger.error('Failed to broadcast activity', { error });
  }
}

/**
 * Broadcast thread status change
 */
export async function broadcastThreadStatusChange(
  organizationId: string,
  threadId: string,
  oldStatus: string,
  newStatus: string
) {
  try {
    await getPusher().trigger(`private-org-${organizationId}`, 'thread:status_changed', {
      threadId,
      oldStatus,
      newStatus,
      timestamp: new Date().toISOString(),
    });

    logger.info('Broadcast thread status change', { organizationId, threadId, oldStatus, newStatus });
  } catch (error) {
    logger.error('Failed to broadcast status change', { error });
  }
}
