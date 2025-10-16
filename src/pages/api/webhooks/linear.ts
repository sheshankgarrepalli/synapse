import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { generateEmbedding, prepareTextForEmbedding } from '@/lib/ai/embeddings';
import { createHmac } from 'crypto';

/**
 * Linear webhook endpoint
 * Handles issue events, comment events, and project events
 *
 * Setup: https://developers.linear.app/docs/graphql/webhooks
 */

interface LinearWebhookPayload {
  action: 'create' | 'update' | 'remove';
  type: 'Issue' | 'Comment' | 'Project';
  createdAt: string;
  data: {
    id: string;
    title?: string;
    description?: string;
    state?: {
      id: string;
      name: string;
      type: string;
    };
    number?: number;
    identifier?: string;
    url?: string;
    team?: {
      id: string;
      name: string;
      key: string;
    };
    project?: {
      id: string;
      name: string;
      url?: string;
    };
    body?: string;
    user?: {
      id: string;
      name: string;
      email?: string;
    };
    issue?: {
      id: string;
      title: string;
      identifier: string;
      url?: string;
    };
  };
  organizationId?: string;
  webhookTimestamp: number;
  webhookId: string;
}

/**
 * Verify Linear webhook signature
 * Linear signs webhooks with HMAC SHA-256
 */
function verifyLinearSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature) return false;

  const hmac = createHmac('sha256', secret);
  hmac.update(payload);
  const digest = hmac.digest('hex');

  return signature === digest;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload: LinearWebhookPayload = req.body;
    const signature = req.headers['linear-signature'] as string;
    const rawBody = JSON.stringify(req.body);

    logger.info('Linear webhook received', {
      action: payload.action,
      type: payload.type,
      webhookId: payload.webhookId,
    });

    // Verify webhook signature
    const webhookSecret = process.env.LINEAR_WEBHOOK_SECRET;
    if (webhookSecret) {
      if (!verifyLinearSignature(rawBody, signature, webhookSecret)) {
        logger.warn('Invalid Linear webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    } else {
      logger.warn('LINEAR_WEBHOOK_SECRET not configured, skipping signature verification');
    }

    // Find the integration for this webhook
    const integration = await prisma.integration.findFirst({
      where: {
        integrationType: 'linear',
        status: 'active',
        deletedAt: null,
      },
      include: {
        organization: true,
      },
    });

    if (!integration) {
      logger.warn('No active Linear integration found');
      return res.status(404).json({ error: 'Integration not found' });
    }

    // Handle different event types
    switch (payload.type) {
      case 'Issue':
        if (payload.action === 'create' || payload.action === 'update') {
          await handleIssueEvent(payload, integration.organizationId);
        }
        break;

      case 'Comment':
        if (payload.action === 'create') {
          await handleCommentEvent(payload, integration.organizationId);
        }
        break;

      case 'Project':
        if (payload.action === 'create' || payload.action === 'update') {
          await handleProjectEvent(payload, integration.organizationId);
        }
        break;

      default:
        logger.warn('Unknown Linear event type', { type: payload.type });
    }

    // Create activity feed entry
    await prisma.activityFeed.create({
      data: {
        organizationId: integration.organizationId,
        actionType: 'integration_event',
        metadata: {
          integration: 'linear',
          event_type: payload.type,
          action: payload.action,
          identifier: payload.data.identifier || payload.data.id,
        },
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Linear webhook error', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleIssueEvent(payload: LinearWebhookPayload, organizationId: string) {
  const { data, action } = payload;

  if (!data.id) {
    logger.warn('Linear issue event missing id');
    return;
  }

  const issueIdentifier = data.identifier || data.id;
  const issueNumber = data.number;
  const issueTitle = data.title || 'Untitled Issue';
  const issueDescription = data.description || '';
  const issueState = data.state?.name || 'Unknown';
  const issueUrl = data.url || '';
  const teamKey = data.team?.key || '';

  logger.info('Processing Linear issue event', {
    action,
    identifier: issueIdentifier,
    title: issueTitle,
    state: issueState,
  });

  // Generate embedding for the issue
  const embeddingText = prepareTextForEmbedding({
    title: `Linear ${issueIdentifier}: ${issueTitle}`,
    description: issueDescription,
    additionalContext: `team ${data.team?.name || ''} state ${issueState}`,
  });
  const embedding = await generateEmbedding(embeddingText);

  // Check if item already exists
  const existingItem = await prisma.connectedItem.findFirst({
    where: {
      organizationId,
      integrationType: 'linear',
      externalId: data.id,
    },
  });

  if (existingItem) {
    // Update existing item
    const updatedItem = await prisma.connectedItem.update({
      where: { id: existingItem.id },
      data: {
        title: issueTitle,
        description: issueDescription,
        externalUrl: issueUrl,
        metadata: {
          identifier: issueIdentifier,
          number: issueNumber,
          state: issueState,
          state_type: data.state?.type,
          team_name: data.team?.name,
          team_key: teamKey,
          project_id: data.project?.id,
          project_name: data.project?.name,
        },
        lastSyncedAt: new Date(),
      },
    });

    // Update embedding
    if (embedding) {
      await prisma.$executeRawUnsafe(`
        UPDATE connected_items
        SET embedding = '[${embedding.join(',')}]'::vector
        WHERE id = '${updatedItem.id}'
      `);
    }

    logger.info('Linear issue updated', {
      itemId: updatedItem.id,
      identifier: issueIdentifier,
    });
  } else {
    // Create new item
    const newItem = await prisma.connectedItem.create({
      data: {
        organizationId,
        integrationType: 'linear',
        externalId: data.id,
        externalUrl: issueUrl,
        itemType: 'issue',
        title: issueTitle,
        description: issueDescription,
        metadata: {
          identifier: issueIdentifier,
          number: issueNumber,
          state: issueState,
          state_type: data.state?.type,
          team_name: data.team?.name,
          team_key: teamKey,
          project_id: data.project?.id,
          project_name: data.project?.name,
        },
      },
    });

    // Store embedding
    if (embedding) {
      await prisma.$executeRawUnsafe(`
        UPDATE connected_items
        SET embedding = '[${embedding.join(',')}]'::vector
        WHERE id = '${newItem.id}'
      `);
    }

    logger.info('Linear issue created', {
      itemId: newItem.id,
      identifier: issueIdentifier,
    });
  }
}

async function handleCommentEvent(payload: LinearWebhookPayload, organizationId: string) {
  const { data } = payload;

  if (!data.id || !data.body) {
    logger.warn('Linear comment event missing required fields');
    return;
  }

  const commentBody = data.body;
  const issueIdentifier = data.issue?.identifier || 'unknown';
  const issueTitle = data.issue?.title || 'Unknown Issue';
  const userName = data.user?.name || 'Unknown User';

  logger.info('Processing Linear comment event', {
    commentId: data.id,
    issueIdentifier,
    user: userName,
  });

  // Generate embedding for the comment
  const embeddingText = prepareTextForEmbedding({
    title: `Comment on Linear ${issueIdentifier}: ${issueTitle}`,
    description: commentBody,
    additionalContext: `comment by ${userName}`,
  });
  const embedding = await generateEmbedding(embeddingText);

  // Create connected item for the comment
  const item = await prisma.connectedItem.create({
    data: {
      organizationId,
      integrationType: 'linear',
      externalId: data.id,
      externalUrl: data.issue?.url || '',
      itemType: 'comment',
      title: `Comment on ${issueIdentifier}`,
      description: commentBody,
      metadata: {
        comment_id: data.id,
        issue_id: data.issue?.id,
        issue_identifier: issueIdentifier,
        issue_title: issueTitle,
        user_name: userName,
        user_email: data.user?.email,
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

  logger.info('Linear comment processed', {
    itemId: item.id,
    issueIdentifier,
    commentId: data.id,
  });
}

async function handleProjectEvent(payload: LinearWebhookPayload, organizationId: string) {
  const { data, action } = payload;

  if (!data.id || !data.name) {
    logger.warn('Linear project event missing required fields');
    return;
  }

  const projectName = data.name;
  const projectDescription = data.description || '';
  const projectUrl = data.url || '';

  logger.info('Processing Linear project event', {
    action,
    projectId: data.id,
    name: projectName,
  });

  // Generate embedding for the project
  const embeddingText = prepareTextForEmbedding({
    title: `Linear Project: ${projectName}`,
    description: projectDescription,
    additionalContext: 'linear project',
  });
  const embedding = await generateEmbedding(embeddingText);

  // Check if item already exists
  const existingItem = await prisma.connectedItem.findFirst({
    where: {
      organizationId,
      integrationType: 'linear',
      externalId: data.id,
    },
  });

  if (existingItem) {
    // Update existing item
    const updatedItem = await prisma.connectedItem.update({
      where: { id: existingItem.id },
      data: {
        title: projectName,
        description: projectDescription,
        externalUrl: projectUrl,
        metadata: {
          project_id: data.id,
          project_name: projectName,
        },
        lastSyncedAt: new Date(),
      },
    });

    // Update embedding
    if (embedding) {
      await prisma.$executeRawUnsafe(`
        UPDATE connected_items
        SET embedding = '[${embedding.join(',')}]'::vector
        WHERE id = '${updatedItem.id}'
      `);
    }

    logger.info('Linear project updated', {
      itemId: updatedItem.id,
      projectName,
    });
  } else {
    // Create new item
    const newItem = await prisma.connectedItem.create({
      data: {
        organizationId,
        integrationType: 'linear',
        externalId: data.id,
        externalUrl: projectUrl,
        itemType: 'project',
        title: projectName,
        description: projectDescription,
        metadata: {
          project_id: data.id,
          project_name: projectName,
        },
      },
    });

    // Store embedding
    if (embedding) {
      await prisma.$executeRawUnsafe(`
        UPDATE connected_items
        SET embedding = '[${embedding.join(',')}]'::vector
        WHERE id = '${newItem.id}'
      `);
    }

    logger.info('Linear project created', {
      itemId: newItem.id,
      projectName,
    });
  }
}
