/**
 * Presence tracking hook
 * Shows which users are currently viewing a thread
 */

import { useEffect, useState } from 'react';
import { pusherClient } from '@/lib/pusher-client';
import { useAuth } from '@clerk/nextjs';

interface PresenceMember {
  id: string;
  name: string;
  avatar?: string;
}

interface UsePresenceOptions {
  enabled?: boolean;
}

export function usePresence(
  threadId: string,
  options: UsePresenceOptions = {}
) {
  const { isLoaded, userId } = useAuth();
  const { enabled = true } = options;
  const [members, setMembers] = useState<PresenceMember[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isLoaded || !userId || !enabled || !threadId) {
      return;
    }

    const channelName = `presence-thread-${threadId}`;
    const channel = pusherClient.subscribe(channelName);

    // Initial members when subscription succeeds
    channel.bind('pusher:subscription_succeeded', (members: any) => {
      const membersList: PresenceMember[] = [];
      members.each((member: any) => {
        membersList.push({
          id: member.id,
          name: member.info.name,
          avatar: member.info.avatar,
        });
      });
      setMembers(membersList);
      setIsConnected(true);
    });

    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('Pusher presence subscription error:', error);
      setIsConnected(false);
    });

    // Member added
    channel.bind('pusher:member_added', (member: any) => {
      setMembers((prev) => {
        // Don't add if already exists
        if (prev.some((m) => m.id === member.id)) {
          return prev;
        }
        return [
          ...prev,
          {
            id: member.id,
            name: member.info.name,
            avatar: member.info.avatar,
          },
        ];
      });
    });

    // Member removed
    channel.bind('pusher:member_removed', (member: any) => {
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      setMembers([]);
      setIsConnected(false);
    };
  }, [threadId, isLoaded, userId, enabled]);

  return {
    members,
    isConnected,
    memberCount: members.length,
  };
}
