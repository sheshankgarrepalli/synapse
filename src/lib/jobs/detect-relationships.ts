import { inngest } from '../inngest';
import { prisma } from '../prisma';
import { logger } from '../logger';
import { findClusters, ClusterItem } from '../ai/clustering';
import { vectorToEmbedding } from '../ai/embeddings';

/**
 * Enterprise-grade AI relationship detection background job
 * Runs every 15 minutes to detect similar items and auto-create threads
 *
 * This is the "magic" feature that makes Synapse unique:
 * - Designer creates Figma comment: "Button too small"
 * - Developer creates GitHub issue: "Increase button size"
 * - AI detects they're related and auto-creates a thread connecting them
 */

export const detectRelationships = inngest.createFunction(
  {
    id: 'ai-detect-relationships',
    name: 'AI Relationship Detection',
    retries: 3,
  },
  {
    cron: '*/15 * * * *', // Every 15 minutes
  },
  async ({ event, step }) => {
    logger.info('AI relationship detection started');

    // Step 1: Get recent unconnected items from last 24 hours
    const recentItems = await step.run('fetch-recent-items', async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours

      // Use raw query to include embedding field (Unsupported type in Prisma)
      const items = await prisma.$queryRawUnsafe<Array<any>>(`
        SELECT
          id,
          title,
          description,
          integration_type as "integrationType",
          organization_id as "organizationId",
          created_by as "createdBy",
          embedding::text as embedding,
          metadata,
          thread_id as "threadId"
        FROM connected_items
        WHERE created_at >= '${since.toISOString()}'
          AND deleted_at IS NULL
        LIMIT 500
      `);

      logger.info('Fetched recent items for clustering', { count: items.length });
      return items;
    });

    if (recentItems.length < 2) {
      logger.info('Not enough items to cluster', { count: recentItems.length });
      return { clustersCreated: 0, threadsCreated: 0 };
    }

    // Step 2: Group items by organization (can't mix organizations)
    const itemsByOrg = new Map<string, typeof recentItems>();
    for (const item of recentItems) {
      if (!itemsByOrg.has(item.organizationId)) {
        itemsByOrg.set(item.organizationId, []);
      }
      itemsByOrg.get(item.organizationId)!.push(item);
    }

    let totalClustersCreated = 0;
    let totalThreadsCreated = 0;

    // Step 3: Process each organization separately
    for (const [organizationId, orgItems] of itemsByOrg.entries()) {
      const result = await step.run(`cluster-org-${organizationId}`, async () => {
        try {
          // Convert pgvector strings to number arrays
          const mappedItems = orgItems
            .map((item) => {
              try {
                return {
                  id: item.id,
                  embedding: vectorToEmbedding(item.embedding as string),
                  title: item.title,
                  description: item.description,
                  integrationType: item.integrationType,
                  metadata: {
                    ...item.metadata,
                    organizationId: item.organizationId,
                    createdBy: item.createdBy,
                    existingThreadId: item.threadId,
                  },
                };
              } catch (error) {
                logger.error('Failed to parse embedding', {
                  itemId: item.id,
                  error,
                });
                return null;
              }
            });

          const clusterItems = mappedItems.filter(item => item !== null) as ClusterItem[];

          if (clusterItems.length < 2) {
            return { clustersCreated: 0, threadsCreated: 0 };
          }

          // Find clusters of similar items
          const clusters = findClusters(clusterItems, {
            epsilon: 0.15, // High similarity required (cosine distance)
            minPoints: 2, // At least 2 items per cluster
            maxClusters: 20, // Max 20 clusters per run
          });

          logger.info('Clusters found', {
            organizationId,
            clusterCount: clusters.length,
          });

          let threadsCreated = 0;

          // Step 4: Create or update threads for each cluster
          for (const cluster of clusters) {
            try {
              // Check if items already belong to a thread
              const existingThreadIds = cluster.items
                .map((item) => item.metadata?.existingThreadId)
                .filter((id): id is string => !!id);

              const uniqueThreadIds = Array.from(new Set(existingThreadIds));

              if (uniqueThreadIds.length === 1) {
                // All items already in same thread - skip
                logger.info('Items already in same thread', {
                  threadId: uniqueThreadIds[0],
                  itemCount: cluster.items.length,
                });
                continue;
              }

              if (uniqueThreadIds.length > 1) {
                // Items spread across multiple threads - could merge, but risky
                logger.info('Items in different threads - skipping merge', {
                  threadIds: uniqueThreadIds,
                  itemCount: cluster.items.length,
                });
                continue;
              }

              // No existing thread - create new one
              const creatorId =
                cluster.items[0]?.metadata?.createdBy || cluster.items[0]?.metadata?.organizationId;

              if (!creatorId) {
                logger.warn('No creator ID found for cluster');
                continue;
              }

              const thread = await prisma.goldenThread.create({
                data: {
                  organizationId,
                  title: cluster.suggestedTitle,
                  description: generateThreadDescription(cluster),
                  status: 'planning',
                  tags: ['ai-generated'],
                  createdBy: creatorId,
                  connectedItemsCount: cluster.items.length,
                },
              });

              // Store embedding separately using raw query (since Prisma doesn't support vector type)
              await prisma.$executeRawUnsafe(`
                UPDATE golden_threads
                SET embedding = '[${cluster.centroid.join(',')}]'::vector
                WHERE id = '${thread.id}'
              `);

              // Connect all items to the new thread
              await prisma.connectedItem.updateMany({
                where: {
                  id: { in: cluster.items.map((item) => item.id) },
                },
                data: {
                  threadId: thread.id,
                },
              });

              // Add creator as collaborator
              await prisma.threadCollaborator.create({
                data: {
                  threadId: thread.id,
                  userId: creatorId,
                  role: 'owner',
                  addedBy: creatorId,
                },
              });

              // Create activity feed entry
              await prisma.activityFeed.create({
                data: {
                  organizationId,
                  actorId: creatorId,
                  actionType: 'thread_auto_created',
                  threadId: thread.id,
                  metadata: {
                    aiGenerated: true,
                    clusterSimilarity: cluster.avgSimilarity,
                    itemCount: cluster.items.length,
                    integrationTypes: Array.from(
                      new Set(
                        cluster.items
                          .map((item) => item.integrationType)
                          .filter((type): type is string => !!type)
                      )
                    ),
                  },
                },
              });

              threadsCreated++;

              logger.info('Auto-created thread from cluster', {
                threadId: thread.id,
                title: thread.title,
                itemCount: cluster.items.length,
                avgSimilarity: cluster.avgSimilarity,
              });
            } catch (error) {
              logger.error('Failed to create thread from cluster', { error, cluster });
            }
          }

          return {
            clustersCreated: clusters.length,
            threadsCreated,
          };
        } catch (error) {
          logger.error('Organization clustering failed', { organizationId, error });
          return { clustersCreated: 0, threadsCreated: 0 };
        }
      });

      totalClustersCreated += result.clustersCreated;
      totalThreadsCreated += result.threadsCreated;
    }

    logger.info('AI relationship detection completed', {
      totalClustersCreated,
      totalThreadsCreated,
      organizationsProcessed: itemsByOrg.size,
    });

    return {
      success: true,
      clustersCreated: totalClustersCreated,
      threadsCreated: totalThreadsCreated,
      organizationsProcessed: itemsByOrg.size,
    };
  }
);

/**
 * Generate thread description from cluster
 */
function generateThreadDescription(cluster: any): string {
  const integrationTypes = Array.from(
    new Set(cluster.items.map((item: any) => item.integrationType).filter(Boolean))
  );

  const itemTitles = cluster.items
    .slice(0, 3)
    .map((item: any) => `• ${item.title || 'Untitled'}`)
    .join('\n');

  return `This thread was automatically created by AI based on semantic similarity between related items.

**Related Items:**
${itemTitles}
${cluster.items.length > 3 ? `\n...and ${cluster.items.length - 3} more` : ''}

**Integration Sources:** ${integrationTypes.join(', ')}
**Similarity Score:** ${(cluster.avgSimilarity * 100).toFixed(0)}%

*AI detected that these items are discussing related topics and grouped them together.*`;
}

/**
 * Manual trigger for relationship detection (for testing/debugging)
 * Can be called from tRPC endpoint
 */
export async function triggerRelationshipDetection(organizationId?: string) {
  logger.info('Manual relationship detection triggered', { organizationId });

  try {
    // Trigger the Inngest function manually
    await inngest.send({
      name: 'ai/detect-relationships.manual',
      data: { organizationId },
    });

    return { success: true, message: 'Relationship detection job triggered' };
  } catch (error) {
    logger.error('Failed to trigger relationship detection', { error });
    throw error;
  }
}
