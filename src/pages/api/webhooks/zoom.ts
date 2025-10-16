import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { generateEmbedding, prepareTextForEmbedding } from '@/lib/ai/embeddings';

/**
 * Zoom webhook endpoint
 * Handles meeting events and recording completions
 *
 * Setup: https://marketplace.zoom.us/docs/api-reference/webhook-reference
 */

interface ZoomWebhookPayload {
  event: string;
  event_ts: number;
  payload: {
    account_id: string;
    object: {
      uuid?: string;
      id?: string | number;
      host_id?: string;
      topic?: string;
      type?: number;
      start_time?: string;
      duration?: number;
      timezone?: string;
      recording_files?: Array<{
        id: string;
        recording_start: string;
        recording_end: string;
        file_type: string;
        file_size: number;
        play_url: string;
        download_url: string;
        recording_type: string;
      }>;
      transcript_files?: Array<{
        id: string;
        file_type: string;
        file_size: number;
        download_url: string;
      }>;
    };
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload: ZoomWebhookPayload = req.body;

    // Verify webhook signature
    const signature = req.headers['x-zm-signature'] as string;
    const timestamp = req.headers['x-zm-request-timestamp'] as string;

    if (signature && timestamp) {
      const isValid = verifyZoomSignature(
        JSON.stringify(req.body),
        signature,
        timestamp
      );

      if (!isValid) {
        logger.warn('Invalid Zoom webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    logger.info('Zoom webhook received', {
      event: payload.event,
      meeting_id: payload.payload.object.id,
    });

    // Find the integration for this Zoom account
    const integration = await prisma.integration.findFirst({
      where: {
        integrationType: 'zoom',
        status: 'active',
        deletedAt: null,
      },
      include: {
        organization: true,
      },
    });

    if (!integration) {
      logger.warn('No active Zoom integration found');
      return res.status(404).json({ error: 'Integration not found' });
    }

    // Handle different event types
    switch (payload.event) {
      case 'meeting.started':
        await handleMeetingStarted(payload, integration.organizationId);
        break;

      case 'meeting.ended':
        await handleMeetingEnded(payload, integration.organizationId);
        break;

      case 'recording.completed':
        await handleRecordingCompleted(payload, integration.organizationId);
        break;

      case 'recording.transcript_completed':
        await handleTranscriptCompleted(payload, integration.organizationId);
        break;

      default:
        logger.info('Unhandled Zoom event type', { event: payload.event });
    }

    // Create activity feed entry
    await prisma.activityFeed.create({
      data: {
        organizationId: integration.organizationId,
        actionType: 'integration_event',
        metadata: {
          integration: 'zoom',
          event: payload.event,
          meeting_id: payload.payload.object.id,
          meeting_topic: payload.payload.object.topic,
        },
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Zoom webhook error', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
}

function verifyZoomSignature(
  body: string,
  signature: string,
  timestamp: string
): boolean {
  const secret = process.env.ZOOM_WEBHOOK_SECRET;
  if (!secret) {
    logger.warn('ZOOM_WEBHOOK_SECRET not configured');
    return true; // Skip verification if not configured
  }

  // Check timestamp is within 5 minutes
  const now = Math.floor(Date.now() / 1000);
  const requestTime = parseInt(timestamp, 10);
  if (Math.abs(now - requestTime) > 300) {
    logger.warn('Zoom webhook timestamp too old');
    return false;
  }

  // Verify signature
  const message = `v0:${timestamp}:${body}`;
  const hashForVerify = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');
  const expectedSignature = `v0=${hashForVerify}`;

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

async function handleMeetingStarted(
  payload: ZoomWebhookPayload,
  organizationId: string
) {
  const { object } = payload.payload;

  logger.info('Zoom meeting started', {
    meeting_id: object.id,
    topic: object.topic,
  });

  // Optionally create a connected item when meeting starts
  // This could be useful for tracking meeting attendance
}

async function handleMeetingEnded(
  payload: ZoomWebhookPayload,
  organizationId: string
) {
  const { object } = payload.payload;

  logger.info('Zoom meeting ended', {
    meeting_id: object.id,
    topic: object.topic,
    duration: object.duration,
  });

  // Create connected item for the meeting
  const embeddingText = prepareTextForEmbedding({
    title: object.topic || 'Zoom Meeting',
    description: `Meeting duration: ${object.duration} minutes`,
    additionalContext: `zoom meeting ${object.id}`,
  });
  const embedding = await generateEmbedding(embeddingText);

  const item = await prisma.connectedItem.create({
    data: {
      organizationId,
      integrationType: 'zoom',
      externalId: String(object.id),
      externalUrl: `https://zoom.us/recording/${object.uuid}`,
      title: object.topic || 'Zoom Meeting',
      description: `Meeting ended. Duration: ${object.duration} minutes`,
      metadata: {
        meeting_id: object.id,
        uuid: object.uuid,
        host_id: object.host_id,
        start_time: object.start_time,
        duration: object.duration,
        timezone: object.timezone,
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

  logger.info('Zoom meeting item created', {
    itemId: item.id,
    meeting_id: object.id,
  });
}

async function handleRecordingCompleted(
  payload: ZoomWebhookPayload,
  organizationId: string
) {
  const { object } = payload.payload;

  if (!object.recording_files || object.recording_files.length === 0) {
    logger.info('No recording files in completed event');
    return;
  }

  // Process each recording file
  for (const recording of object.recording_files) {
    // Generate embedding for the recording
    const embeddingText = prepareTextForEmbedding({
      title: `${object.topic} - Recording`,
      description: `Zoom recording from ${object.start_time}`,
      additionalContext: `zoom recording ${recording.recording_type}`,
    });
    const embedding = await generateEmbedding(embeddingText);

    // Create connected item for the recording
    const item = await prisma.connectedItem.create({
      data: {
        organizationId,
        integrationType: 'zoom',
        externalId: recording.id,
        externalUrl: recording.play_url,
        title: `${object.topic} - Recording`,
        description: `${recording.recording_type} recording (${formatFileSize(recording.file_size)})`,
        itemType: 'recording',
        metadata: {
          meeting_id: object.id,
          meeting_uuid: object.uuid,
          recording_id: recording.id,
          recording_type: recording.recording_type,
          file_type: recording.file_type,
          file_size: recording.file_size,
          recording_start: recording.recording_start,
          recording_end: recording.recording_end,
          play_url: recording.play_url,
          download_url: recording.download_url,
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

    logger.info('Zoom recording item created', {
      itemId: item.id,
      recording_id: recording.id,
      recording_type: recording.recording_type,
    });
  }
}

async function handleTranscriptCompleted(
  payload: ZoomWebhookPayload,
  organizationId: string
) {
  const { object } = payload.payload;

  if (!object.transcript_files || object.transcript_files.length === 0) {
    logger.info('No transcript files in completed event');
    return;
  }

  // Process each transcript file
  for (const transcript of object.transcript_files) {
    // TODO: Download and parse transcript for better embeddings
    // For now, create a connected item with the transcript URL

    const embeddingText = prepareTextForEmbedding({
      title: `${object.topic} - Transcript`,
      description: `Zoom meeting transcript from ${object.start_time}`,
      additionalContext: 'zoom transcript',
    });
    const embedding = await generateEmbedding(embeddingText);

    const item = await prisma.connectedItem.create({
      data: {
        organizationId,
        integrationType: 'zoom',
        externalId: transcript.id,
        externalUrl: transcript.download_url,
        title: `${object.topic} - Transcript`,
        description: `Meeting transcript (${formatFileSize(transcript.file_size)})`,
        itemType: 'transcript',
        metadata: {
          meeting_id: object.id,
          meeting_uuid: object.uuid,
          transcript_id: transcript.id,
          file_type: transcript.file_type,
          file_size: transcript.file_size,
          download_url: transcript.download_url,
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

    logger.info('Zoom transcript item created', {
      itemId: item.id,
      transcript_id: transcript.id,
    });
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
