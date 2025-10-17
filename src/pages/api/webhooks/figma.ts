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
        await handleFileComment(payload, integration);
        break;

      case 'FILE_UPDATE':
        await handleFileUpdate(payload, integration);
        break;

      case 'FILE_VERSION_UPDATE':
        await handleFileVersionUpdate(payload, integration);
        break;

      case 'LIBRARY_PUBLISH':
        await handleLibraryPublish(payload, integration);
        break;

      default:
        logger.warn('Unknown Figma event type', { event_type: payload.event_type });
    }

    // Create activity feed entry
    await prisma.activityFeed.create({
      data: {
        organizationId: integration.organizationId,
        actorId: integration.connectedBy,
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

async function handleFileComment(payload: FigmaWebhookPayload, integration: any) {
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
      organizationId: integration.organizationId,
      integrationType: 'figma',
      externalId: comment.id,
      externalUrl: `https://www.figma.com/file/${file_key}?node-id=${comment.client_meta.node_id}#${comment.id}`,
      title: `Comment in ${file_name}`,
      description: comment.message,
      threadId: '', // Will be set by AI relationship detection
      createdBy: integration.connectedBy, // Use the integration creator as fallback
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

async function handleFileUpdate(payload: FigmaWebhookPayload, integration: any) {
  logger.info('Figma file updated', {
    file_key: payload.file_key,
    file_name: payload.file_name,
  });

  // Optionally update any existing items related to this file
  // or create a new item for the update event
}

async function handleFileVersionUpdate(payload: FigmaWebhookPayload, integration: any) {
  logger.info('Figma file version updated', {
    file_key: payload.file_key,
    file_name: payload.file_name,
    version_id: payload.version_id,
  });

  // 🎨 DESIGN-CODE DRIFT DETECTION
  try {
    // Check if drift detection is enabled for this organization
    const org = await prisma.organization.findUnique({
      where: { id: integration.organizationId },
      select: { settings: true },
    });

    const orgSettings = org?.settings as any || {};
    const driftDetectionEnabled = orgSettings.driftDetectionEnabled !== false; // Default: enabled

    if (!driftDetectionEnabled) {
      logger.info('Drift detection disabled for organization', {
        organizationId: integration.organizationId,
      });
      return;
    }

    const { FigmaClient } = await import('@/lib/integrations/figma-client');
    const { queueDriftAnalysis } = await import('@/lib/drift/detect-drift');

    // Create Figma client
    const figmaClient = new FigmaClient(integration.encryptedAccessToken);

    // Fetch the updated file
    const figmaFile = await figmaClient.getFile(payload.file_key);

    // Get all components from the file
    const components = figmaClient.extractComponents(figmaFile);

    logger.info('Found components in Figma file', {
      fileKey: payload.file_key,
      componentCount: components.length,
    });

    // Create design snapshots for each component
    for (const component of components) {
      const properties = figmaClient.extractDesignProperties(component);

      // Get thumbnail
      const images = await figmaClient.getImage(payload.file_key, [component.id]);
      const thumbnailUrl = images[component.id];

      await prisma.designSnapshot.create({
        data: {
          organizationId: integration.organizationId,
          integrationType: 'figma',
          externalFileId: payload.file_key,
          externalNodeId: component.id,
          fileUrl: `https://www.figma.com/file/${payload.file_key}`,
          fileName: payload.file_name,
          nodeName: component.name,
          nodeType: component.type,
          designData: component as any,
          componentData: properties,
          stylesData: {},
          thumbnailUrl,
          versionId: payload.version_id,
          capturedAt: new Date(payload.timestamp),
        },
      });

      logger.info('Created design snapshot', {
        fileKey: payload.file_key,
        componentId: component.id,
        componentName: component.name,
      });
    }

    // Find connected item for this Figma file
    let connectedItem = await prisma.connectedItem.findFirst({
      where: {
        organizationId: integration.organizationId,
        integrationType: 'figma',
        externalId: payload.file_key,
        deletedAt: null,
      },
    });

    if (!connectedItem) {
      // Create connected item if it doesn't exist
      const thread = await findOrCreateThreadForFigmaFile(integration.organizationId, payload.file_key, payload.file_name, integration.connectedBy);

      connectedItem = await prisma.connectedItem.create({
        data: {
          organizationId: integration.organizationId,
          threadId: thread.id,
          integrationType: 'figma',
          externalId: payload.file_key,
          externalUrl: `https://www.figma.com/file/${payload.file_key}`,
          itemType: 'design-file',
          title: payload.file_name,
          description: `Figma design file: ${payload.file_name}`,
          metadata: {
            versionId: payload.version_id,
          },
          createdBy: integration.connectedBy,
        },
      });

      logger.info('Created connected item for Figma file', {
        fileKey: payload.file_key,
        fileName: payload.file_name,
      });
    }

    // Trigger drift detection for linked code items
    const designCodeLinks = await prisma.designCodeLink.findMany({
      where: {
        organizationId: integration.organizationId,
        designItemId: connectedItem.id,
        isMonitored: true,
      },
      include: {
        codeItem: true,
      },
    });

    if (designCodeLinks.length > 0) {
      logger.info('Triggering drift detection', {
        figmaFileKey: payload.file_key,
        linkedCodeItems: designCodeLinks.length,
      });

      console.log('');
      console.log('🎨 Design file updated!');
      console.log(`📝 Figma: ${payload.file_name}`);
      console.log(`🔗 Linked to ${designCodeLinks.length} code item(s)`);
      console.log('');

      // For each linked code item, queue drift analysis
      for (const link of designCodeLinks) {
        const requestId = await queueDriftAnalysis(connectedItem.id, link.codeItemId, integration.organizationId);

        logger.info('Queued drift analysis', {
          requestId,
          designItemId: connectedItem.id,
          codeItemId: link.codeItemId,
        });

        console.log(`🤖 Drift analysis queued: ${requestId}`);
        console.log(`   Design: ${payload.file_name}`);
        console.log(`   Code: ${link.codeItem.title}`);
      }

      console.log('');
      console.log('💬 Ask Claude Code: "check for design-code drift"');
      console.log('');
    }
  } catch (error) {
    logger.error('Error in drift detection', { error, payload });
  }
}

async function findOrCreateThreadForFigmaFile(organizationId: string, fileKey: string, fileName: string, userId: string) {
  // Try to find existing thread with this file
  const existingItem = await prisma.connectedItem.findFirst({
    where: {
      organizationId,
      integrationType: 'figma',
      externalId: fileKey,
      deletedAt: null,
    },
    include: {
      thread: true,
    },
  });

  if (existingItem) {
    return existingItem.thread;
  }

  // Create new thread
  const thread = await prisma.goldenThread.create({
    data: {
      organizationId,
      title: `Design: ${fileName}`,
      description: `Thread for Figma file: ${fileName}`,
      status: 'planning',
      tags: ['design', 'figma', 'auto-created'],
      visibility: 'team',
      createdBy: userId,
    },
  });

  return thread;
}

async function handleLibraryPublish(payload: FigmaWebhookPayload, integration: any) {
  logger.info('Figma library published', {
    file_key: payload.file_key,
    file_name: payload.file_name,
  });
}
