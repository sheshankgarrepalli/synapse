/**
 * Real-time comments hook
 * Subscribes to comment updates on a specific thread
 */

import { useEffect, useState } from 'react';
import { pusherClient } from '@/lib/pusher-client';
import { useAuth } from '@clerk/nextjs';

interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: any;
}

interface UseRealtimeCommentsOptions {
  organizationId?: string;
  enabled?: boolean;
}

export function useRealtimeComments(
  threadId: string,
  options: UseRealtimeCommentsOptions = {}
) {
  const { isLoaded, userId } = useAuth();
  const { organizationId, enabled = true } = options;
  const [newComment, setNewComment] = useState<Comment | null>(null);
  const [updatedComment, setUpdatedComment] = useState<Comment | null>(null);
  const [deletedCommentId, setDeletedCommentId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isLoaded || !userId || !enabled || !organizationId || !threadId) {
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

    // Comment created
    channel.bind('comment:created', (data: any) => {
      if (data.threadId === threadId) {
        setNewComment(data.comment);
      }
    });

    // Comment updated
    channel.bind('comment:updated', (data: any) => {
      if (data.threadId === threadId) {
        setUpdatedComment(data.comment);
      }
    });

    // Comment deleted
    channel.bind('comment:deleted', (data: any) => {
      if (data.threadId === threadId) {
        setDeletedCommentId(data.commentId);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      setIsConnected(false);
      setNewComment(null);
      setUpdatedComment(null);
      setDeletedCommentId(null);
    };
  }, [threadId, organizationId, isLoaded, userId, enabled]);

  return {
    newComment,
    updatedComment,
    deletedCommentId,
    isConnected,
  };
}
