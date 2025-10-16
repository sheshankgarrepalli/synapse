import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { getPusher } from '@/lib/pusher';
import { prisma } from '@/lib/prisma';

/**
 * Pusher authentication endpoint
 * Verifies user has access to the requested channel
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const auth = getAuth(req);
    if (!auth.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { socket_id, channel_name } = req.body;

    if (!socket_id || !channel_name) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { authProviderId: auth.userId },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        organizationId: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify user has access to this channel
    // Channel format: private-org-{organizationId} or presence-thread-{threadId}
    if (channel_name.startsWith('private-org-')) {
      const organizationId = channel_name.replace('private-org-', '');

      if (user.organizationId !== organizationId) {
        return res.status(403).json({ error: 'Access denied to this organization' });
      }

      // Authorize private channel
      const authResponse = getPusher().authorizeChannel(socket_id, channel_name);
      return res.json(authResponse);
    }

    if (channel_name.startsWith('presence-thread-')) {
      const threadId = channel_name.replace('presence-thread-', '');

      // Verify user has access to this thread
      const thread = await prisma.goldenThread.findFirst({
        where: {
          id: threadId,
          organizationId: user.organizationId,
          deletedAt: null,
        },
      });

      if (!thread) {
        return res.status(403).json({ error: 'Access denied to this thread' });
      }

      // Authorize presence channel with user info
      const authResponse = getPusher().authorizeChannel(socket_id, channel_name, {
        user_id: user.id,
        user_info: {
          id: user.id,
          name: user.fullName,
          avatar: user.avatarUrl,
        },
      });

      return res.json(authResponse);
    }

    return res.status(400).json({ error: 'Invalid channel name' });
  } catch (error) {
    console.error('Pusher auth error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
