import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { generateEmbedding, prepareTextForEmbedding } from '@/lib/ai/embeddings';

/**
 * Figma webhook endpoint
 * Handles file comments, file updates, and other Figma events
 *
 * Setup: https://www.figma.com/developers/api#webhooks
 */

interface FigmaWebhookPayload {
  event_type: 'FILE_COMMENT' | 'FILE_UPDATE' | 'FILE_VERSION_UPDATE' | 'LIBRARY_PUBLISH';
  passcode: string;
  timestamp: string;
  webhook_id: string;
  file_key: string;
  file_name: string;
  comment?: {
    id: string;
    message: string;
    client_meta: {
      node_id?: string;
      node_offset?: { x: number; y: number };
    };
    created_at: string;
    user: {
      id: string;
      handle: string;
    };
  };
  version_id?: string;
  description?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload: FigmaWebhookPayload = req.body;

    logger.info('Figma webhook received', {
      event_type: payload.event_type,
      file_key: payload.file_key,
      file_name: payload.file_name,
    });

    // Verify webhook passcode (optional but recommended)
    const expectedPasscode = process.env.FIGMA_WEBHOOK_PASSCODE;
    if (expectedPasscode && payload.passcode !== expectedPasscode) {
      logger.warn('Invalid Figma webhook passcode');
      return res.status(401).json({ error: 'Invalid passcode' });
    }

    // Find the integration for this file
    // We need to determine which organization this file belongs to
    // This requires storing file_key -> organization mapping
    const integration = await prisma.integration.findFirst({
      where: {
        integrationType: 'figma',
        status: 'active',
        deletedAt: null,
      },
      include: {
        organization: true,
      },
    });

    if (!integration) {
      logger.warn('No active Figma integration found');
      return res.status(404).json({ error: 'Integration not found' });
    }

    // Handle different event types
    switch (payload.event_type) {
      case 'FILE_COMMENT':
        await handleFileComment(payload, integration.organizationId);
        break;

      case 'FILE_UPDATE':
        await handleFileUpdate(payload, integration.organizationId);
        break;

      case 'FILE_VERSION_UPDATE':
        await handleFileVersionUpdate(payload, integration.organizationId);
        break;

      case 'LIBRARY_PUBLISH':
        await handleLibraryPublish(payload, integration.organizationId);
        break;

      default:
        logger.warn('Unknown Figma event type', { event_type: payload.event_type });
    }

    // Create activity feed entry
    await prisma.activityFeed.create({
      data: {
        organizationId: integration.organizationId,
        actionType: 'integration_event',
        metadata: {
          integration: 'figma',
          event_type: payload.event_type,
          file_name: payload.file_name,
          file_key: payload.file_key,
        },
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Figma webhook error', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleFileComment(payload: FigmaWebhookPayload, organizationId: string) {
  if (!payload.comment) return;

  const { comment, file_key, file_name } = payload;

  // Generate embedding for the comment
  const embeddingText = prepareTextForEmbedding({
    title: `Figma comment in ${file_name}`,
    description: comment.message,
    additionalContext: `figma file ${file_key}`,
  });
  const embedding = await generateEmbedding(embeddingText);

  // Create connected item for the comment
  const item = await prisma.connectedItem.create({
    data: {
      organizationId,
      integrationType: 'figma',
      externalId: comment.id,
      externalUrl: `https://www.figma.com/file/${file_key}?node-id=${comment.client_meta.node_id}#${comment.id}`,
      title: `Comment in ${file_name}`,
      description: comment.message,
      metadata: {
        file_key,
        file_name,
        comment_id: comment.id,
        user_handle: comment.user.handle,
        node_id: comment.client_meta.node_id,
        created_at: comment.created_at,
      },
    },
  });

  // Store embedding
  if (embedding) {
    await prisma.$executeRawUnsafe(`
      UPDATE connected_items
      SET embedding = '[${embedding.join(',')}]'::vector
      WHERE id = '${item.id}'
    `);
  }

  logger.info('Figma comment processed', {
    itemId: item.id,
    file_name,
    comment_id: comment.id,
  });
}

async function handleFileUpdate(payload: FigmaWebhookPayload, organizationId: string) {
  logger.info('Figma file updated', {
    file_key: payload.file_key,
    file_name: payload.file_name,
  });

  // Optionally update any existing items related to this file
  // or create a new item for the update event
}

async function handleFileVersionUpdate(payload: FigmaWebhookPayload, organizationId: string) {
  logger.info('Figma file version updated', {
    file_key: payload.file_key,
    file_name: payload.file_name,
    version_id: payload.version_id,
  });
}

async function handleLibraryPublish(payload: FigmaWebhookPayload, organizationId: string) {
  logger.info('Figma library published', {
    file_key: payload.file_key,
    file_name: payload.file_name,
  });
}
