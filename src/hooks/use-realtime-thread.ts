/**
 * Real-time thread updates hook
 * Subscribes to thread updates and keeps thread data in sync
 */

import { useEffect, useState } from 'react';
import { pusherClient } from '@/lib/pusher-client';
import { useAuth } from '@clerk/nextjs';

interface ThreadUpdate {
  threadId: string;
  title?: string;
  description?: string;
  status?: string;
  timestamp: string;
  [key: string]: any;
}

interface UseRealtimeThreadOptions {
  organizationId?: string;
  enabled?: boolean;
}

export function useRealtimeThread(
  threadId: string,
  options: UseRealtimeThreadOptions = {}
) {
  const { isLoaded, userId } = useAuth();
  const { organizationId, enabled = true } = options;
  const [threadUpdate, setThreadUpdate] = useState<ThreadUpdate | null>(null);
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

    // Thread events
    channel.bind('thread:updated', (data: ThreadUpdate) => {
      if (data.threadId === threadId) {
        setThreadUpdate(data);
      }
    });

    channel.bind('thread:status_changed', (data: any) => {
      if (data.threadId === threadId) {
        setThreadUpdate({
          threadId,
          status: data.newStatus,
          timestamp: data.timestamp,
        });
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      setIsConnected(false);
    };
  }, [threadId, organizationId, isLoaded, userId, enabled]);

  return {
    threadUpdate,
    isConnected,
  };
}
