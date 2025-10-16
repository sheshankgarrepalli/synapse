import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { generateEmbedding, prepareTextForEmbedding } from '@/lib/ai/embeddings';
import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Slack webhook endpoint
 * Handles Slack event subscriptions (URL verification + events)
 *
 * Setup: https://api.slack.com/events-api
 * Events: message.channels, reaction_added, file_shared
 */

// Slack event payload types
interface SlackEventBase {
  token: string;
  team_id: string;
  api_app_id: string;
  event: {
    type: string;
    event_ts: string;
  };
  type: string;
  event_id: string;
  event_time: number;
}

interface SlackUrlVerification {
  type: 'url_verification';
  token: string;
  challenge: string;
}

interface SlackMessageEvent extends SlackEventBase {
  event: {
    type: 'message';
    subtype?: string;
    channel: string;
    user: string;
    text: string;
    ts: string;
    event_ts: string;
    channel_type: string;
    thread_ts?: string;
  };
}

interface SlackReactionEvent extends SlackEventBase {
  event: {
    type: 'reaction_added';
    user: string;
    reaction: string;
    item: {
      type: string;
      channel: string;
      ts: string;
    };
    event_ts: string;
  };
}

interface SlackFileEvent extends SlackEventBase {
  event: {
    type: 'file_shared';
    file_id: string;
    user_id: string;
    file: {
      id: string;
      name: string;
      title: string;
      mimetype: string;
      permalink: string;
      url_private: string;
    };
    event_ts: string;
  };
}

type SlackWebhookPayload = SlackUrlVerification | SlackMessageEvent | SlackReactionEvent | SlackFileEvent;

/**
 * Verify Slack request signature
 * Slack signs webhooks with HMAC SHA-256 using a signing secret
 * https://api.slack.com/authentication/verifying-requests-from-slack
 */
function verifySlackSignature(
  body: string,
  timestamp: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !timestamp) return false;

  // Check if timestamp is recent (within 5 minutes) to prevent replay attacks
  const currentTime = Math.floor(Date.now() / 1000);
  const timestampNum = parseInt(timestamp, 10);
  if (Math.abs(currentTime - timestampNum) > 60 * 5) {
    logger.warn('Slack webhook timestamp too old', { timestamp, currentTime });
    return false;
  }

  // Create signature base string: v0:timestamp:body
  const sigBaseString = `v0:${timestamp}:${body}`;

  // Compute HMAC SHA-256
  const hmac = createHmac('sha256', secret);
  hmac.update(sigBaseString);
  const expectedSignature = `v0=${hmac.digest('hex')}`;

  // Use timing-safe comparison to prevent timing attacks
  try {
    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = JSON.stringify(req.body);
    const payload: SlackWebhookPayload = req.body;

    logger.info('Slack webhook received', {
      type: payload.type,
      team_id: 'team_id' in payload ? payload.team_id : undefined,
    });

    // Handle URL verification challenge (required for Slack app setup)
    if (payload.type === 'url_verification') {
      logger.info('Slack URL verification challenge received');
      return res.status(200).json({ challenge: (payload as SlackUrlVerification).challenge });
    }

    // Verify webhook signature for all non-verification events
    const slackSignature = req.headers['x-slack-signature'] as string;
    const slackTimestamp = req.headers['x-slack-request-timestamp'] as string;
    const signingSecret = process.env.SLACK_SIGNING_SECRET;

    if (!signingSecret) {
      logger.error('SLACK_SIGNING_SECRET not configured');
      return res.status(500).json({ error: 'Webhook signing secret not configured' });
    }

    if (!verifySlackSignature(body, slackTimestamp, slackSignature, signingSecret)) {
      logger.warn('Invalid Slack webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Find the integration for this workspace
    const integration = await prisma.integration.findFirst({
      where: {
        integrationType: 'slack',
        status: 'active',
        deletedAt: null,
        metadata: {
          path: ['team_id'],
          equals: 'team_id' in payload ? payload.team_id : undefined,
        },
      },
      include: {
        organization: true,
      },
    });

    if (!integration) {
      logger.warn('No active Slack integration found for team', {
        team_id: 'team_id' in payload ? payload.team_id : undefined,
      });
      return res.status(404).json({ error: 'Integration not found' });
    }

    // Handle different event types
    if ('event' in payload) {
      const eventType = payload.event.type;

      switch (eventType) {
        case 'message':
          await handleMessageEvent(payload as SlackMessageEvent, integration);
          break;

        case 'reaction_added':
          await handleReactionEvent(payload as SlackReactionEvent, integration);
          break;

        case 'file_shared':
          await handleFileEvent(payload as SlackFileEvent, integration);
          break;

        default:
          logger.warn('Unknown Slack event type', { event_type: eventType });
      }

      // Create activity feed entry
      await prisma.activityFeed.create({
        data: {
          organizationId: integration.organizationId,
          actorId: integration.connectedBy,
          actionType: 'integration_event',
          metadata: {
            integration: 'slack',
            event_type: eventType,
            team_id: payload.team_id,
          },
        },
      });
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    logger.error('Slack webhook error', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleMessageEvent(payload: SlackMessageEvent, integration: any) {
  const { event } = payload;

  // Skip bot messages and message edits/deletions
  if (event.subtype && event.subtype !== 'thread_broadcast') {
    logger.info('Skipping Slack message with subtype', { subtype: event.subtype });
    return;
  }

  if (!event.text || event.text.trim().length === 0) {
    logger.info('Skipping empty Slack message');
    return;
  }

  logger.info('Processing Slack message', {
    channel: event.channel,
    user: event.user,
    has_thread: !!event.thread_ts,
  });

  // Generate embedding for the message
  const embeddingText = prepareTextForEmbedding({
    title: `Slack message in #${event.channel}`,
    description: event.text,
    additionalContext: `slack channel ${event.channel} ${event.thread_ts ? 'thread' : 'message'}`,
  });
  const embedding = await generateEmbedding(embeddingText);

  // Build Slack message URL
  const teamId = payload.team_id;
  const channelId = event.channel;
  const messageTs = event.ts.replace('.', '');
  const slackUrl = `https://app.slack.com/client/${teamId}/${channelId}/thread/${channelId}-${messageTs}`;

  // Create connected item for the message
  const item = await prisma.connectedItem.create({
    data: {
      organizationId: integration.organizationId,
      integrationType: 'slack',
      externalId: `${channelId}:${event.ts}`,
      externalUrl: slackUrl,
      title: `Message in #${event.channel}`,
      description: event.text,
      threadId: '', // Will be set by AI relationship detection
      createdBy: integration.connectedBy, // Use the integration creator as fallback
      metadata: {
        team_id: teamId,
        channel: event.channel,
        user: event.user,
        ts: event.ts,
        thread_ts: event.thread_ts,
        channel_type: event.channel_type,
      },
    },
  });

  // Store embedding using raw SQL
  if (embedding) {
    await prisma.$executeRawUnsafe(`
      UPDATE connected_items
      SET embedding = '[${embedding.join(',')}]'::vector
      WHERE id = '${item.id}'
    `);
  }

  logger.info('Slack message processed', {
    itemId: item.id,
    channel: event.channel,
    ts: event.ts,
  });
}

async function handleReactionEvent(payload: SlackReactionEvent, integration: any) {
  const { event } = payload;

  logger.info('Processing Slack reaction', {
    reaction: event.reaction,
    channel: event.item.channel,
    message_ts: event.item.ts,
  });

  // Generate embedding for the reaction context
  const embeddingText = prepareTextForEmbedding({
    title: `Reaction :${event.reaction}: in Slack`,
    description: `User reacted with :${event.reaction}: to a message`,
    additionalContext: `slack reaction ${event.reaction} channel ${event.item.channel}`,
  });
  const embedding = await generateEmbedding(embeddingText);

  // Build Slack message URL for the reaction
  const teamId = payload.team_id;
  const channelId = event.item.channel;
  const messageTs = event.item.ts.replace('.', '');
  const slackUrl = `https://app.slack.com/client/${teamId}/${channelId}/thread/${channelId}-${messageTs}`;

  // Create connected item for the reaction
  const item = await prisma.connectedItem.create({
    data: {
      organizationId: integration.organizationId,
      integrationType: 'slack',
      externalId: `${event.item.channel}:${event.item.ts}:reaction:${event.reaction}`,
      externalUrl: slackUrl,
      title: `Reaction :${event.reaction}:`,
      description: `User reacted with :${event.reaction}: to a message in #${event.item.channel}`,
      threadId: '', // Will be set by AI relationship detection
      createdBy: integration.connectedBy, // Use the integration creator as fallback
      metadata: {
        team_id: teamId,
        channel: event.item.channel,
        user: event.user,
        reaction: event.reaction,
        item_ts: event.item.ts,
        event_ts: event.event_ts,
      },
    },
  });

  // Store embedding using raw SQL
  if (embedding) {
    await prisma.$executeRawUnsafe(`
      UPDATE connected_items
      SET embedding = '[${embedding.join(',')}]'::vector
      WHERE id = '${item.id}'
    `);
  }

  logger.info('Slack reaction processed', {
    itemId: item.id,
    reaction: event.reaction,
    channel: event.item.channel,
  });
}

async function handleFileEvent(payload: SlackFileEvent, integration: any) {
  const { event } = payload;

  logger.info('Processing Slack file', {
    file_id: event.file_id,
    file_name: event.file.name,
  });

  // Generate embedding for the file
  const embeddingText = prepareTextForEmbedding({
    title: `File shared in Slack: ${event.file.title || event.file.name}`,
    description: `${event.file.name} (${event.file.mimetype})`,
    additionalContext: `slack file ${event.file_id}`,
  });
  const embedding = await generateEmbedding(embeddingText);

  // Create connected item for the file
  const item = await prisma.connectedItem.create({
    data: {
      organizationId: integration.organizationId,
      integrationType: 'slack',
      externalId: event.file_id,
      externalUrl: event.file.permalink,
      title: event.file.title || event.file.name,
      description: `Shared file: ${event.file.name} (${event.file.mimetype})`,
      threadId: '', // Will be set by AI relationship detection
      createdBy: integration.connectedBy, // Use the integration creator as fallback
      metadata: {
        team_id: payload.team_id,
        file_id: event.file_id,
        file_name: event.file.name,
        mimetype: event.file.mimetype,
        url_private: event.file.url_private,
        user_id: event.user_id,
        event_ts: event.event_ts,
      },
    },
  });

  // Store embedding using raw SQL
  if (embedding) {
    await prisma.$executeRawUnsafe(`
      UPDATE connected_items
      SET embedding = '[${embedding.join(',')}]'::vector
      WHERE id = '${item.id}'
    `);
  }

  logger.info('Slack file processed', {
    itemId: item.id,
    file_id: event.file_id,
    file_name: event.file.name,
  });
}
