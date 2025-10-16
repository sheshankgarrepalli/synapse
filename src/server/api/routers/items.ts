import { z } from 'zod';
import { createTRPCRouter, orgProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { invalidateThreadCache } from '@/lib/cache';
import { generateEmbedding, prepareTextForEmbedding } from '@/lib/ai/embeddings';

export const itemsRouter = createTRPCRouter({
  /**
   * Get items by thread
   */
  getByThread: orgProcedure
    .input(z.object({ threadId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.prisma.connectedItem.findMany({
        where: {
          threadId: input.threadId,
          organizationId: ctx.session.organizationId,
          deletedAt: null,
        },
        orderBy: { createdAt: 'asc' },
        include: {
          creator: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
      });

      return items;
    }),

  /**
   * Add item to thread
   */
  create: orgProcedure
    .input(
      z.object({
        threadId: z.string().uuid(),
        integrationType: z.enum([
          'figma',
          'linear',
          'github',
          'slack',
          'notion',
          'zoom',
          'dovetail',
          'mixpanel',
        ]),
        externalId: z.string(),
        externalUrl: z.string().url().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to thread
      const thread = await ctx.prisma.goldenThread.findFirst({
        where: {
          id: input.threadId,
          organizationId: ctx.session.organizationId,
          deletedAt: null,
        },
      });

      if (!thread) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Thread not found',
        });
      }

      // Check for duplicate
      const existing = await ctx.prisma.connectedItem.findFirst({
        where: {
          threadId: input.threadId,
          integrationType: input.integrationType,
          externalId: input.externalId,
        },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Item already connected to this thread',
        });
      }

      // Generate embedding for semantic search
      const embeddingText = prepareTextForEmbedding({
        title: input.title,
        description: input.description,
        additionalContext: `${input.integrationType} ${input.externalId}`,
      });
      const embedding = await generateEmbedding(embeddingText);

      // Create connected item
      const item = await ctx.prisma.connectedItem.create({
        data: {
          organizationId: ctx.session.organizationId,
          threadId: input.threadId,
          integrationType: input.integrationType,
          externalId: input.externalId,
          externalUrl: input.externalUrl,
          title: input.title,
          description: input.description,
          metadata: input.metadata || {},
          createdBy: ctx.session.internalUserId,
        },
      });

      // Store embedding separately using raw query (since Prisma doesn't support vector type)
      if (embedding) {
        await ctx.prisma.$executeRawUnsafe(`
          UPDATE connected_items
          SET embedding = '[${embedding.join(',')}]'::vector
          WHERE id = '${item.id}'
        `);
      }

      // Update thread's connected items count
      await ctx.prisma.goldenThread.update({
        where: { id: input.threadId },
        data: {
          connectedItemsCount: { increment: 1 },
          lastActivityAt: new Date(),
        },
      });

      // Create activity feed entry
      await ctx.prisma.activityFeed.create({
        data: {
          organizationId: ctx.session.organizationId,
          actorId: ctx.session.internalUserId,
          actionType: 'item_added',
          threadId: input.threadId,
          itemId: item.id,
          metadata: {
            integrationType: input.integrationType,
            title: input.title,
          },
        },
      });

      // Invalidate cache
      await invalidateThreadCache(input.threadId);

      return item;
    }),

  /**
   * Connect item from external URL
   * Fetches data from integration and creates connected item
   */
  connect: orgProcedure
    .input(
      z.object({
        threadId: z.string().uuid(),
        integrationType: z.enum([
          'figma',
          'linear',
          'github',
          'slack',
          'notion',
          'zoom',
          'dovetail',
          'mixpanel',
        ]),
        externalUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to thread
      const thread = await ctx.prisma.goldenThread.findFirst({
        where: {
          id: input.threadId,
          organizationId: ctx.session.organizationId,
          deletedAt: null,
        },
      });

      if (!thread) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Thread not found',
        });
      }

      // Check if organization has this integration connected
      const integration = await ctx.prisma.integration.findFirst({
        where: {
          organizationId: ctx.session.organizationId,
          integrationType: input.integrationType,
          status: 'active',
          deletedAt: null,
        },
      });

      if (!integration) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `${input.integrationType} integration not connected`,
        });
      }

      // Parse external ID from URL
      let externalId: string;
      let title: string;
      let description: string | undefined;
      let metadata: any = {};

      try {
        // Parse URL based on integration type
        if (input.integrationType === 'github') {
          // GitHub: https://github.com/owner/repo/issues/123
          const match = input.externalUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/(issues|pull)\/(\d+)/);
          if (!match) throw new Error('Invalid GitHub URL');
          const [, owner, repo, type, number] = match;
          externalId = `${owner}/${repo}/${type}/${number}`;
          title = `${owner}/${repo}#${number}`;
          metadata = { owner, repo, type, number };
        } else if (input.integrationType === 'linear') {
          // Linear: https://linear.app/team/issue/ABC-123
          const match = input.externalUrl.match(/linear\.app\/([^\/]+)\/issue\/([A-Z]+-\d+)/);
          if (!match) throw new Error('Invalid Linear URL');
          const [, team, issueId] = match;
          externalId = issueId;
          title = issueId;
          metadata = { team, issueId };
        } else if (input.integrationType === 'figma') {
          // Figma: https://www.figma.com/file/ABC123/Title
          const match = input.externalUrl.match(/figma\.com\/file\/([^\/]+)/);
          if (!match) throw new Error('Invalid Figma URL');
          externalId = match[1];
          title = 'Figma File';
          metadata = { fileId: externalId };
        } else if (input.integrationType === 'slack') {
          // Slack: https://workspace.slack.com/archives/C123/p456
          const match = input.externalUrl.match(/slack\.com\/archives\/([^\/]+)\/p(\d+)/);
          if (!match) throw new Error('Invalid Slack URL');
          const [, channelId, timestamp] = match;
          externalId = `${channelId}_${timestamp}`;
          title = 'Slack Message';
          metadata = { channelId, timestamp };
        } else if (input.integrationType === 'notion') {
          // Notion: https://www.notion.so/Title-123abc
          const match = input.externalUrl.match(/notion\.so\/([a-z0-9]+)$/);
          if (!match) throw new Error('Invalid Notion URL');
          externalId = match[1];
          title = 'Notion Page';
          metadata = { pageId: externalId };
        } else {
          // Generic fallback
          externalId = input.externalUrl;
          title = `${input.integrationType} item`;
        }
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Invalid ${input.integrationType} URL format`,
        });
      }

      // Check for duplicate
      const existing = await ctx.prisma.connectedItem.findFirst({
        where: {
          threadId: input.threadId,
          integrationType: input.integrationType,
          externalId: externalId,
        },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Item already connected to this thread',
        });
      }

      // Create connected item
      const item = await ctx.prisma.connectedItem.create({
        data: {
          organizationId: ctx.session.organizationId,
          threadId: input.threadId,
          integrationType: input.integrationType,
          externalId: externalId,
          externalUrl: input.externalUrl,
          title: title,
          description: description,
          metadata: metadata,
          createdBy: ctx.session.internalUserId,
        },
      });

      // Update thread's connected items count
      await ctx.prisma.goldenThread.update({
        where: { id: input.threadId },
        data: {
          connectedItemsCount: { increment: 1 },
          lastActivityAt: new Date(),
        },
      });

      // Create activity feed entry
      await ctx.prisma.activityFeed.create({
        data: {
          organizationId: ctx.session.organizationId,
          actorId: ctx.session.internalUserId,
          actionType: 'item_added',
          threadId: input.threadId,
          itemId: item.id,
          metadata: {
            integrationType: input.integrationType,
            title: title,
          },
        },
      });

      // Invalidate cache
      await invalidateThreadCache(input.threadId);

      return item;
    }),

  /**
   * Remove item from thread
   */
  delete: orgProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.prisma.connectedItem.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.session.organizationId,
        },
      });

      if (!item) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      // Soft delete
      await ctx.prisma.connectedItem.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      // Update thread's connected items count
      await ctx.prisma.goldenThread.update({
        where: { id: item.threadId },
        data: {
          connectedItemsCount: { decrement: 1 },
        },
      });

      // Invalidate cache
      await invalidateThreadCache(item.threadId);

      return { success: true };
    }),

  /**
   * Sync item data from external source
   */
  sync: orgProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.prisma.connectedItem.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.session.organizationId,
        },
      });

      if (!item) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      // TODO: Implement actual sync logic per integration type
      // This would call the respective integration API

      await ctx.prisma.connectedItem.update({
        where: { id: input.id },
        data: {
          lastSyncedAt: new Date(),
          syncStatus: 'synced',
        },
      });

      return { success: true };
    }),

  /**
   * Bulk add items to thread
   */
  bulkCreate: orgProcedure
    .input(
      z.object({
        threadId: z.string().uuid(),
        items: z.array(
          z.object({
            integrationType: z.enum([
              'figma',
              'linear',
              'github',
              'slack',
              'notion',
              'zoom',
              'dovetail',
              'mixpanel',
            ]),
            externalId: z.string(),
            externalUrl: z.string().url().optional(),
            title: z.string().optional(),
            description: z.string().optional(),
            metadata: z.record(z.any()).optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check thread exists
      const thread = await ctx.prisma.goldenThread.findFirst({
        where: {
          id: input.threadId,
          organizationId: ctx.session.organizationId,
          deletedAt: null,
        },
      });

      if (!thread) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      // Create all items
      const createdItems = await Promise.all(
        input.items.map((itemData) =>
          ctx.prisma.connectedItem.create({
            data: {
              organizationId: ctx.session.organizationId,
              threadId: input.threadId,
              integrationType: itemData.integrationType,
              externalId: itemData.externalId,
              externalUrl: itemData.externalUrl,
              title: itemData.title,
              description: itemData.description,
              metadata: itemData.metadata || {},
              createdBy: ctx.session.internalUserId,
            },
          })
        )
      );

      // Update thread
      await ctx.prisma.goldenThread.update({
        where: { id: input.threadId },
        data: {
          connectedItemsCount: { increment: createdItems.length },
          lastActivityAt: new Date(),
        },
      });

      // Invalidate cache
      await invalidateThreadCache(input.threadId);

      return createdItems;
    }),
});
