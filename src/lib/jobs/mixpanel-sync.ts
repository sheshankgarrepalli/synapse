/**
 * Mixpanel Analytics Sync Job
 * Runs daily to detect significant analytics insights and create connected items
 */

import { inngest } from '../inngest';
import { prisma } from '../prisma';
import { logger } from '../logger';
import { createMixpanelService, formatInsightDescription } from '../integrations/mixpanel';
import { generateEmbedding, prepareTextForEmbedding } from '../ai/embeddings';

export const mixpanelSync = inngest.createFunction(
  {
    id: 'mixpanel-sync',
    name: 'Mixpanel Analytics Sync',
    retries: 3,
  },
  {
    // Run daily at 9 AM UTC
    cron: '0 9 * * *',
  },
  async ({ event, step }) => {
    logger.info('Starting Mixpanel sync job');

    // Get all active Mixpanel integrations
    const integrations = await step.run('fetch-mixpanel-integrations', async () => {
      return prisma.integration.findMany({
        where: {
          integrationType: 'mixpanel',
          status: 'active',
          deletedAt: null,
        },
        include: {
          organization: true,
        },
      });
    });

    if (integrations.length === 0) {
      logger.info('No active Mixpanel integrations found');
      return { status: 'skipped', reason: 'no_integrations' };
    }

    logger.info(`Found ${integrations.length} active Mixpanel integration(s)`);

    const results = {
      processed: 0,
      insights: 0,
      errors: 0,
    };

    // Process each integration
    for (const integration of integrations) {
      try {
        await step.run(
          `sync-mixpanel-${integration.id}`,
          async () => {
            logger.info('Syncing Mixpanel analytics', {
              integrationId: integration.id,
              organizationId: integration.organizationId,
            });

            // Create Mixpanel service
            const credentials = (integration as any).credentials as Record<string, any>;
            const mixpanel = await createMixpanelService(credentials);

            // Get date range (last 7 days)
            const toDate = new Date();
            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - 7);

            const formatDate = (date: Date) => {
              return date.toISOString().split('T')[0]; // YYYY-MM-DD
            };

            // Detect significant insights
            const insights = await mixpanel.detectSignificantInsights({
              fromDate: formatDate(fromDate),
              toDate: formatDate(toDate),
              thresholds: {
                minEventCount: 100, // Events with 100+ occurrences
                minFunnelDrop: 0.2, // 20% funnel drop
                minRetentionChange: 0.1, // 10% retention change
              },
            });

            logger.info(`Detected ${insights.length} Mixpanel insights`, {
              integrationId: integration.id,
            });

            // Create connected items for each insight
            for (const insight of insights) {
              const description = formatInsightDescription(insight);

              // Check if we already have this insight (avoid duplicates)
              const existing = await prisma.connectedItem.findFirst({
                where: {
                  organizationId: integration.organizationId,
                  integrationType: 'mixpanel',
                  externalId: `${insight.type}-${insight.name}`,
                  createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                  },
                },
              });

              if (existing) {
                logger.info('Insight already exists, skipping', {
                  insightType: insight.type,
                  insightName: insight.name,
                });
                continue;
              }

              // Generate embedding
              const embeddingText = prepareTextForEmbedding({
                title: `Analytics: ${insight.name}`,
                description,
                additionalContext: `mixpanel ${insight.type} analytics`,
              });
              const embedding = await generateEmbedding(embeddingText);

              // Create connected item
              const item = await prisma.connectedItem.create({
                data: {
                  organizationId: integration.organizationId,
                  integrationType: 'mixpanel',
                  externalId: `${insight.type}-${insight.name}`,
                  externalUrl: insight.url,
                  title: `${insight.name}`,
                  description,
                  itemType: insight.type,
                  metadata: {
                    type: insight.type,
                    value: insight.value,
                    change: insight.change,
                    dateRange: {
                      from: formatDate(fromDate),
                      to: formatDate(toDate),
                    },
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

              logger.info('Mixpanel insight item created', {
                itemId: item.id,
                insightType: insight.type,
                insightName: insight.name,
              });

              results.insights++;
            }

            // Update lastSyncAt timestamp
            await prisma.integration.update({
              where: { id: integration.id },
              data: { lastSyncAt: new Date() },
            });

            results.processed++;
          }
        );
      } catch (error) {
        logger.error('Failed to sync Mixpanel integration', {
          integrationId: integration.id,
          error,
        });
        results.errors++;
      }
    }

    logger.info('Mixpanel sync job completed', results);

    return {
      status: 'completed',
      results,
    };
  }
);
