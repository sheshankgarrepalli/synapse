/**
 * AI-Powered Auto-Detection System
 * Automatically detects relationships between items across tools
 * This is the CORE ESSENCE of Synapse - zero manual work
 */

import { Anthropic } from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { generateEmbedding } from './embeddings';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface DetectedRelationship {
  sourceItemId: string;
  targetItemId: string;
  relationshipType: 'implements' | 'references' | 'blocks' | 'relates_to' | 'deploys';
  confidence: number;
  reasoning: string;
}

export interface AutoThreadCandidate {
  title: string;
  description: string;
  itemIds: string[];
  reasoning: string;
  confidence: number;
}

/**
 * Analyzes a new item and detects relationships with existing items
 * This runs automatically on every webhook event
 */
export async function detectRelationships(
  itemId: string,
  organizationId: string
): Promise<DetectedRelationship[]> {
  try {
    // Get the new item with full details
    const item = await prisma.connectedItem.findUnique({
      where: { id: itemId },
      include: {
        thread: true,
      },
    });

    if (!item) return [];

    // Get recent items from the same org (last 100)
    const recentItems = await prisma.connectedItem.findMany({
      where: {
        organizationId,
        id: { not: itemId },
        deletedAt: null,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      take: 100,
      orderBy: { createdAt: 'desc' },
    });

    if (recentItems.length === 0) return [];

    // Use AI to detect relationships
    const relationships = await analyzeRelationshipsWithAI(item, recentItems);

    // Store detected relationships
    for (const rel of relationships) {
      if (rel.confidence > 0.6) {
        // Only store high-confidence relationships
        await prisma.activityFeed.create({
          data: {
            organizationId,
            actorId: item.createdBy,
            actionType: 'relationship_detected',
            itemId: rel.sourceItemId,
            metadata: {
              targetItemId: rel.targetItemId,
              relationshipType: rel.relationshipType,
              confidence: rel.confidence,
              reasoning: rel.reasoning,
            },
          },
        });
      }
    }

    return relationships;
  } catch (error) {
    logger.error('Error detecting relationships', { error, itemId });
    return [];
  }
}

/**
 * Uses Claude to intelligently analyze relationships between items
 */
async function analyzeRelationshipsWithAI(
  newItem: any,
  existingItems: any[]
): Promise<DetectedRelationship[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return [];
  }

  const prompt = `You are analyzing connections between work items across different tools (GitHub, Linear, Figma, Slack, etc.).

NEW ITEM:
- Type: ${newItem.integrationType} ${newItem.itemType || ''}
- Title: ${newItem.title || 'Untitled'}
- Description: ${newItem.description || 'No description'}
- Metadata: ${JSON.stringify(newItem.metadata).slice(0, 500)}

EXISTING ITEMS (recent):
${existingItems
  .slice(0, 20)
  .map(
    (item, idx) => `
${idx + 1}. [${item.integrationType}] ${item.title || 'Untitled'}
   ID: ${item.id}
   Description: ${item.description?.slice(0, 200) || 'N/A'}
`
  )
  .join('\n')}

Analyze if the new item is related to any existing items. Look for:
- GitHub PRs implementing Linear issues
- Figma designs related to features being built
- Slack discussions about specific work items
- Code changes affecting design components
- Issues blocking other issues

Return a JSON array of detected relationships:
[
  {
    "targetItemId": "uuid-of-related-item",
    "relationshipType": "implements|references|blocks|relates_to|deploys",
    "confidence": 0.0-1.0,
    "reasoning": "Brief explanation of why they're related"
  }
]

Only include relationships with confidence > 0.5. Return empty array [] if no strong relationships found.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') return [];

    // Extract JSON from response
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const detectedRels = JSON.parse(jsonMatch[0]);

    return detectedRels.map((rel: any) => ({
      sourceItemId: newItem.id,
      targetItemId: rel.targetItemId,
      relationshipType: rel.relationshipType,
      confidence: rel.confidence,
      reasoning: rel.reasoning,
    }));
  } catch (error) {
    logger.error('Error in AI relationship analysis', { error });
    return [];
  }
}

/**
 * Automatically suggests or creates threads based on detected work patterns
 * This is the MAGIC - threads create themselves
 */
export async function autoCreateThreadFromPattern(
  organizationId: string,
  triggerItemId: string
): Promise<string | null> {
  try {
    // Get the trigger item
    const triggerItem = await prisma.connectedItem.findUnique({
      where: { id: triggerItemId },
    });

    if (!triggerItem) return null;

    // Detect relationships
    const relationships = await detectRelationships(triggerItemId, organizationId);

    // If we found multiple high-confidence relationships, auto-create a thread
    const highConfidenceRels = relationships.filter((r) => r.confidence > 0.7);

    if (highConfidenceRels.length >= 2) {
      // Get all related items
      const relatedItemIds = [
        triggerItemId,
        ...highConfidenceRels.map((r) => r.targetItemId),
      ];

      const relatedItems = await prisma.connectedItem.findMany({
        where: { id: { in: relatedItemIds } },
      });

      // Use AI to generate thread title and description
      const threadSuggestion = await suggestThreadWithAI(relatedItems, relationships);

      if (threadSuggestion && threadSuggestion.confidence > 0.7) {
        // Auto-create the thread
        const thread = await prisma.goldenThread.create({
          data: {
            organizationId,
            title: threadSuggestion.title,
            description: threadSuggestion.description,
            status: 'in_progress',
            tags: ['auto-detected'],
            createdBy: triggerItem.createdBy,
          },
        });

        // Connect all related items to the thread
        await prisma.connectedItem.updateMany({
          where: { id: { in: relatedItemIds } },
          data: { threadId: thread.id },
        });

        // Create activity log
        await prisma.activityFeed.create({
          data: {
            organizationId,
            actorId: triggerItem.createdBy,
            actionType: 'thread_auto_created',
            threadId: thread.id,
            metadata: {
              reasoning: threadSuggestion.reasoning,
              itemCount: relatedItemIds.length,
              confidence: threadSuggestion.confidence,
            },
          },
        });

        logger.info('Auto-created thread from pattern', {
          threadId: thread.id,
          itemCount: relatedItemIds.length,
        });

        return thread.id;
      }
    }

    return null;
  } catch (error) {
    logger.error('Error auto-creating thread', { error });
    return null;
  }
}

/**
 * Uses AI to suggest thread title/description based on related items
 */
async function suggestThreadWithAI(
  items: any[],
  relationships: DetectedRelationship[]
): Promise<AutoThreadCandidate | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const prompt = `You are analyzing a group of related work items to create a project thread.

RELATED ITEMS:
${items
  .map(
    (item, idx) => `
${idx + 1}. [${item.integrationType}] ${item.title || 'Untitled'}
   Description: ${item.description?.slice(0, 300) || 'N/A'}
`
  )
  .join('\n')}

DETECTED RELATIONSHIPS:
${relationships
  .map(
    (rel) =>
      `- ${rel.relationshipType} (${Math.round(rel.confidence * 100)}%): ${rel.reasoning}`
  )
  .join('\n')}

Create a thread that connects these items. The thread should:
1. Have a clear, concise title (max 60 chars) describing the overall work
2. Have a description explaining what this work is about
3. Feel natural - like a PM would create it

Return JSON:
{
  "title": "Clear thread title",
  "description": "2-3 sentence description of this work",
  "reasoning": "Why these items belong together",
  "confidence": 0.0-1.0
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') return null;

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const suggestion = JSON.parse(jsonMatch[0]);

    return {
      title: suggestion.title,
      description: suggestion.description,
      itemIds: items.map((i) => i.id),
      reasoning: suggestion.reasoning,
      confidence: suggestion.confidence,
    };
  } catch (error) {
    logger.error('Error suggesting thread with AI', { error });
    return null;
  }
}

/**
 * Generates proactive insights about ongoing work
 * "Your payment flow design (Figma) is blocked by API changes in PR #234"
 */
export async function generateProactiveInsights(
  organizationId: string
): Promise<string[]> {
  if (!process.env.ANTHROPIC_API_KEY) return [];

  try {
    // Get recent activity
    const recentItems = await prisma.connectedItem.findMany({
      where: {
        organizationId,
        deletedAt: null,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      include: {
        thread: {
          select: { id: true, title: true, status: true },
        },
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    if (recentItems.length < 3) return [];

    const prompt = `Analyze this team's recent work and generate proactive insights.

RECENT WORK ITEMS:
${recentItems
  .map(
    (item, idx) => `
${idx + 1}. [${item.integrationType}] ${item.title || 'Untitled'}
   Status: ${item.syncStatus}
   Thread: ${item.thread?.title || 'None'} (${item.thread?.status || 'N/A'})
   Created: ${item.createdAt.toISOString()}
   Metadata: ${JSON.stringify(item.metadata).slice(0, 200)}
`
  )
  .join('\n')}

Generate 3-5 actionable insights like:
- "The login redesign (Figma) has been in review for 5 days - no related PRs found yet"
- "Authentication API (PR #123) affects 3 different features currently in progress"
- "Payment flow is blocked: Design approved but backend ticket still in backlog"

Return a JSON array of insight strings:
["insight 1", "insight 2", "insight 3"]

Focus on blockers, dependencies, and work that's stalled.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') return [];

    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    logger.error('Error generating insights', { error });
    return [];
  }
}
