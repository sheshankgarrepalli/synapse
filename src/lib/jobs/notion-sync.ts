import { inngest } from '../inngest';
import { prisma } from '../prisma';
import { logger } from '../logger';
import { NotionService, NotionPage, NotionDatabase } from '../integrations/notion';
import { generateEmbedding, prepareTextForEmbedding, embeddingToVector } from '../ai/embeddings';

/**
 * Enterprise-grade Notion sync background job
 * Polls Notion API every 5 minutes for page updates and creates connected items
 *
 * Features:
 * - Polls Notion API for updated pages based on last_edited_time
 * - Creates/updates ConnectedItems for new or modified pages
 * - Generates AI embeddings for semantic search and relationship detection
 * - Handles rate limiting gracefully
 * - Tracks last sync time per integration
 */

export const notionSync = inngest.createFunction(
  {
    id: 'notion-sync',
    name: 'Notion Page Sync',
    retries: 3,
  },
  {
    cron: '*/5 * * * *', // Every 5 minutes
  },
  async ({ event, step }) => {
    logger.info('Notion sync job started');

    // Step 1: Get all active Notion integrations
    const integrations = await step.run('fetch-active-integrations', async () => {
      const notionIntegrations = await prisma.integration.findMany({
        where: {
          integrationType: 'notion',
          status: 'active',
          deletedAt: null,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      logger.info('Found active Notion integrations', { count: notionIntegrations.length });
      return notionIntegrations;
    });

    if (integrations.length === 0) {
      logger.info('No active Notion integrations to sync');
      return { success: true, integrationsProcessed: 0, pagesCreated: 0, pagesUpdated: 0 };
    }

    let totalPagesCreated = 0;
    let totalPagesUpdated = 0;
    let integrationsProcessed = 0;

    // Step 2: Process each integration
    for (const integration of integrations) {
      const result = await step.run(`sync-integration-${integration.id}`, async () => {
        try {
          // Check rate limiting
          if (integration.rateLimitResetAt && integration.rateLimitRemaining !== null) {
            if (
              integration.rateLimitRemaining <= 5 &&
              new Date() < new Date(integration.rateLimitResetAt)
            ) {
              logger.warn('Rate limit approaching, skipping sync', {
                integrationId: integration.id,
                remaining: integration.rateLimitRemaining,
                resetAt: integration.rateLimitResetAt,
              });
              return { pagesCreated: 0, pagesUpdated: 0, skipped: true, error: false };
            }
          }

          // Initialize Notion service
          if (!integration.encryptedAccessToken) {
            logger.error('No access token found for integration', {
              integrationId: integration.id,
            });
            await prisma.integration.update({
              where: { id: integration.id },
              data: {
                status: 'error',
                errorMessage: 'Missing access token',
              },
            });
            return { pagesCreated: 0, pagesUpdated: 0, error: true, skipped: false };
          }

          const notionService = new NotionService(
            integration.encryptedAccessToken,
            integration.organizationId
          );

          // Get last sync time
          const lastSyncAt = integration.lastSyncAt || new Date(0);
          logger.info('Syncing Notion pages', {
            integrationId: integration.id,
            organizationId: integration.organizationId,
            lastSyncAt: lastSyncAt instanceof Date ? lastSyncAt.toISOString() : lastSyncAt,
          });

          // Search for all pages (Notion API doesn't support filtering by last_edited_time in search)
          let pages: NotionPage[];
          try {
            const results = await notionService.search();
            // Filter to only pages (not databases) and check last_edited_time
            pages = results.filter(
              (result): result is NotionPage =>
                'properties' in result &&
                new Date(result.last_edited_time) > lastSyncAt
            );
          } catch (error) {
            logger.error('Notion API search failed', {
              integrationId: integration.id,
              error,
            });

            // Check if it's a rate limit error
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('rate_limited')) {
              await prisma.integration.update({
                where: { id: integration.id },
                data: {
                  rateLimitRemaining: 0,
                  rateLimitResetAt: new Date(Date.now() + 60 * 1000), // Retry in 1 minute
                },
              });
            } else {
              await prisma.integration.update({
                where: { id: integration.id },
                data: {
                  status: 'error',
                  errorMessage: errorMessage.substring(0, 500),
                },
              });
            }

            return { pagesCreated: 0, pagesUpdated: 0, error: true, skipped: false };
          }

          logger.info('Found updated pages', {
            integrationId: integration.id,
            count: pages.length,
          });

          let pagesCreated = 0;
          let pagesUpdated = 0;

          // Step 3: Process each page
          for (const page of pages) {
            try {
              // Extract page title from properties
              const title = extractPageTitle(page);
              const description = extractPageDescription(page);

              // Check if page already exists
              const existingItem = await prisma.connectedItem.findFirst({
                where: {
                  organizationId: integration.organizationId,
                  integrationType: 'notion',
                  externalId: page.id,
                  deletedAt: null,
                },
              });

              // Generate embedding for page content
              const embeddingText = prepareTextForEmbedding({
                title,
                description,
                additionalContext: JSON.stringify(page.properties),
              });
              const embedding = await generateEmbedding(embeddingText);

              if (!embedding) {
                logger.warn('Failed to generate embedding for page', {
                  pageId: page.id,
                  title,
                });
              }

              if (existingItem) {
                // Check if actually updated (compare timestamps)
                const existingLastEditedTime = existingItem.metadata as any;
                if (
                  existingLastEditedTime?.lastEditedTime &&
                  new Date(existingLastEditedTime.lastEditedTime) >=
                    new Date(page.last_edited_time)
                ) {
                  // No actual update, skip
                  continue;
                }

                // Update existing item
                await prisma.connectedItem.update({
                  where: { id: existingItem.id },
                  data: {
                    title,
                    description,
                    metadata: {
                      lastEditedTime: page.last_edited_time,
                      createdTime: page.created_time,
                      url: page.url,
                      properties: page.properties,
                    },
                    syncStatus: 'synced',
                    lastSyncedAt: new Date(),
                    updatedAt: new Date(),
                  },
                });

                // Update embedding separately (Prisma doesn't support vector type)
                if (embedding) {
                  await prisma.$executeRawUnsafe(`
                    UPDATE connected_items
                    SET embedding = '${embeddingToVector(embedding)}'::vector
                    WHERE id = '${existingItem.id}'
                  `);
                }

                pagesUpdated++;

                logger.info('Updated Notion page', {
                  pageId: page.id,
                  itemId: existingItem.id,
                  title,
                });
              } else {
                // Create new connected item (without thread initially - AI will connect it)
                const newItem = await prisma.connectedItem.create({
                  data: {
                    organizationId: integration.organizationId,
                    threadId: '', // Will be set by AI relationship detection or manually
                    integrationType: 'notion',
                    externalId: page.id,
                    externalUrl: page.url,
                    itemType: 'page',
                    title,
                    description,
                    metadata: {
                      lastEditedTime: page.last_edited_time,
                      createdTime: page.created_time,
                      url: page.url,
                      properties: page.properties,
                    },
                    syncStatus: 'synced',
                    lastSyncedAt: new Date(),
                    createdBy: integration.connectedBy,
                  },
                });

                // Store embedding separately
                if (embedding) {
                  await prisma.$executeRawUnsafe(`
                    UPDATE connected_items
                    SET embedding = '${embeddingToVector(embedding)}'::vector
                    WHERE id = '${newItem.id}'
                  `);
                }

                // Create activity feed entry
                await prisma.activityFeed.create({
                  data: {
                    organizationId: integration.organizationId,
                    actorId: integration.connectedBy,
                    actionType: 'item_synced',
                    itemId: newItem.id,
                    metadata: {
                      integrationType: 'notion',
                      itemType: 'page',
                      title,
                      autoSynced: true,
                    },
                  },
                });

                pagesCreated++;

                logger.info('Created new Notion page item', {
                  pageId: page.id,
                  itemId: newItem.id,
                  title,
                });
              }
            } catch (error) {
              logger.error('Failed to process Notion page', {
                pageId: page.id,
                error,
              });
              // Continue with next page
            }
          }

          // Update integration last sync time
          await prisma.integration.update({
            where: { id: integration.id },
            data: {
              lastSyncAt: new Date(),
              status: 'active',
              errorMessage: null,
              // Update rate limit info if available (would come from response headers)
              // For now, we'll reset it to allow continued syncing
              rateLimitRemaining: null,
              rateLimitResetAt: null,
            },
          });

          return { pagesCreated, pagesUpdated, skipped: false, error: false };
        } catch (error) {
          logger.error('Integration sync failed', {
            integrationId: integration.id,
            error,
          });
          return { pagesCreated: 0, pagesUpdated: 0, error: true, skipped: false };
        }
      });

      if (!result.error && !result.skipped) {
        integrationsProcessed++;
      }
      totalPagesCreated += result.pagesCreated;
      totalPagesUpdated += result.pagesUpdated;
    }

    logger.info('Notion sync job completed', {
      integrationsProcessed,
      totalPagesCreated,
      totalPagesUpdated,
    });

    return {
      success: true,
      integrationsProcessed,
      pagesCreated: totalPagesCreated,
      pagesUpdated: totalPagesUpdated,
    };
  }
);

/**
 * Extract page title from Notion page properties
 * Notion pages can have different title property names
 */
function extractPageTitle(page: NotionPage): string {
  try {
    // Find title property (usually named "Name" or "Title")
    for (const [key, value] of Object.entries(page.properties)) {
      if (value && typeof value === 'object' && 'title' in value) {
        const titleArray = value.title as any[];
        if (Array.isArray(titleArray) && titleArray.length > 0) {
          return titleArray
            .map((t) => t.plain_text || t.text?.content || '')
            .join('')
            .trim();
        }
      }
    }

    // Fallback to page ID if no title found
    return `Notion Page ${page.id}`;
  } catch (error) {
    logger.error('Failed to extract page title', { pageId: page.id, error });
    return `Notion Page ${page.id}`;
  }
}

/**
 * Extract page description from Notion page properties
 * Looks for common description property names
 */
function extractPageDescription(page: NotionPage): string | null {
  try {
    // Look for common description properties
    const descriptionKeys = ['description', 'Description', 'summary', 'Summary', 'notes', 'Notes'];

    for (const key of descriptionKeys) {
      const prop = page.properties[key];
      if (!prop || typeof prop !== 'object') continue;

      // Handle rich_text property
      if ('rich_text' in prop) {
        const richTextArray = prop.rich_text as any[];
        if (Array.isArray(richTextArray) && richTextArray.length > 0) {
          return richTextArray
            .map((t) => t.plain_text || t.text?.content || '')
            .join('')
            .trim();
        }
      }
    }

    return null;
  } catch (error) {
    logger.error('Failed to extract page description', { pageId: page.id, error });
    return null;
  }
}

/**
 * Manual trigger for Notion sync (for testing/debugging)
 * Can be called from tRPC endpoint
 */
export async function triggerNotionSync(organizationId?: string) {
  logger.info('Manual Notion sync triggered', { organizationId });

  try {
    await inngest.send({
      name: 'notion/sync.manual',
      data: { organizationId },
    });

    return { success: true, message: 'Notion sync job triggered' };
  } catch (error) {
    logger.error('Failed to trigger Notion sync', { error });
    throw error;
  }
}
