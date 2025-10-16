/**
 * Pusher server-side client
 * Used to broadcast real-time events to connected clients
 */

import Pusher from 'pusher';
import { logger } from './logger';

// Initialize Pusher client
export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

/**
 * Broadcast thread update to all viewers
 */
export async function broadcastThreadUpdate(
  organizationId: string,
  threadId: string,
  data: any
) {
  try {
    await pusher.trigger(`private-org-${organizationId}`, 'thread:updated', {
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
    await pusher.trigger(`private-org-${organizationId}`, 'comment:created', {
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
    await pusher.trigger(`private-org-${organizationId}`, 'item:added', {
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
    await pusher.trigger(`private-org-${organizationId}`, 'activity:new', {
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
    await pusher.trigger(`private-org-${organizationId}`, 'thread:status_changed', {
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
