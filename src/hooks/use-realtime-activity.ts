/**
 * Real-time activity feed hook
 * Subscribes to organization-wide activity updates
 */

import { useEffect, useState } from 'react';
import { pusherClient } from '@/lib/pusher-client';
import { useAuth } from '@clerk/nextjs';

interface ActivityFeedItem {
  id: string;
  actionType: string;
  metadata?: any;
  timestamp: string;
  [key: string]: any;
}

interface UseRealtimeActivityOptions {
  organizationId?: string;
  enabled?: boolean;
}

export function useRealtimeActivity(options: UseRealtimeActivityOptions = {}) {
  const { isLoaded, userId } = useAuth();
  const { organizationId, enabled = true } = options;
  const [latestActivity, setLatestActivity] = useState<ActivityFeedItem | null>(null);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isLoaded || !userId || !enabled || !organizationId) {
      return;
    }

    const channelName = `private-org-${organizationId}`;
    const channel = pusherClient.subscribe(channelName);

    // Connection state
    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true);
    });

    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('Pusher subscription error:', error);
      setIsConnected(false);
    });

    // Activity events
    channel.bind('activity:new', (data: any) => {
      const activity = data.activity;
      setLatestActivity(activity);
      setActivityFeed((prev) => [activity, ...prev].slice(0, 50)); // Keep last 50
    });

    // Item events (also treated as activities)
    channel.bind('item:added', (data: any) => {
      const activity: ActivityFeedItem = {
        id: `item-${data.item.id}`,
        actionType: 'item_added',
        metadata: {
          threadId: data.threadId,
          item: data.item,
        },
        timestamp: data.timestamp,
      };
      setLatestActivity(activity);
      setActivityFeed((prev) => [activity, ...prev].slice(0, 50));
    });

    // Comment events
    channel.bind('comment:created', (data: any) => {
      const activity: ActivityFeedItem = {
        id: `comment-${data.comment.id}`,
        actionType: 'comment_created',
        metadata: {
          threadId: data.threadId,
          comment: data.comment,
        },
        timestamp: data.timestamp,
      };
      setLatestActivity(activity);
      setActivityFeed((prev) => [activity, ...prev].slice(0, 50));
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      setIsConnected(false);
    };
  }, [organizationId, isLoaded, userId, enabled]);

  return {
    latestActivity,
    activityFeed,
    isConnected,
  };
}
