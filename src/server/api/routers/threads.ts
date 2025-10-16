import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, orgProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { invalidateThreadCache } from '@/lib/cache';
import { generateEmbedding, prepareTextForEmbedding } from '@/lib/ai/embeddings';
import { findRelatedContent } from '@/lib/ai/semantic-search';
import { logger } from '@/lib/logger';

export const threadsRouter = createTRPCRouter({
  /**
   * List threads with pagination and filters
   */
  list: orgProcedure
    .input(
      z.object({
        cursor: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(20),
        status: z
          .enum(['planning', 'in_progress', 'review', 'completed', 'archived'])
          .optional(),
        tags: z.array(z.string()).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const threads = await ctx.prisma.goldenThread.findMany({
        where: {
          organizationId: ctx.session.organizationId,
          status: input.status,
          tags: input.tags ? { hasSome: input.tags } : undefined,
          OR: input.search
            ? [
                { title: { contains: input.search, mode: 'insensitive' } },
                {
                  description: {
                    contains: input.search,
                    mode: 'insensitive',
                  },
                },
              ]
            : undefined,
          deletedAt: null,
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { lastActivityAt: 'desc' },
        include: {
          creator: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
          _count: {
            select: { connectedItems: true, comments: true },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (threads.length > input.limit) {
        const nextItem = threads.pop();
        nextCursor = nextItem!.id;
      }

      return { threads, nextCursor };
    }),

  /**
   * Get single thread with full details
   */
  getById: orgProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const thread = await ctx.prisma.goldenThread.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.session.organizationId,
          deletedAt: null,
        },
        include: {
          creator: true,
          collaborators: {
            include: { user: true },
          },
          connectedItems: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'asc' },
            include: {
              creator: {
                select: { id: true, fullName: true, avatarUrl: true },
              },
            },
          },
          comments: {
            where: { isDeleted: false, parentCommentId: null },
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: {
              creator: true,
              _count: { select: { replies: true } },
            },
          },
        },
      });

      if (!thread) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Thread not found',
        });
      }

      return thread;
    }),

  /**
   * Create new thread
   */
  create: orgProcedure
    .input(
      z.object({
        title: z.string().min(1).max(500),
        description: z.string().max(10000).optional(),
        status: z
          .enum(['planning', 'in_progress', 'review', 'completed', 'archived'])
          .default('planning'),
        tags: z.array(z.string()).default([]),
        collaboratorIds: z.array(z.string().uuid()).default([]),
        projectId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate embedding for semantic search
      const embeddingText = prepareTextForEmbedding({
        title: input.title,
        description: input.description,
      });
      const embedding = await generateEmbedding(embeddingText);

      // Create thread
      const thread = await ctx.prisma.goldenThread.create({
        data: {
          organizationId: ctx.session.organizationId,
          title: input.title,
          description: input.description,
          status: input.status,
          tags: input.tags,
          createdBy: ctx.session.internalUserId,
          projectId: input.projectId,
        },
      });

      // Store embedding separately using raw query (since Prisma doesn't support vector type)
      if (embedding) {
        await ctx.prisma.$executeRawUnsafe(`
          UPDATE golden_threads
          SET embedding = '[${embedding.join(',')}]'::vector
          WHERE id = '${thread.id}'
        `);
      }

      // Add creator as owner collaborator
      await ctx.prisma.threadCollaborator.create({
        data: {
          threadId: thread.id,
          userId: ctx.session.internalUserId,
          role: 'owner',
          addedBy: ctx.session.internalUserId,
        },
      });

      // Add additional collaborators
      if (input.collaboratorIds.length > 0) {
        await ctx.prisma.threadCollaborator.createMany({
          data: input.collaboratorIds.map((userId) => ({
            threadId: thread.id,
            userId,
            role: 'editor',
            addedBy: ctx.session.internalUserId,
          })),
        });
      }

      // Create activity feed entry
      await ctx.prisma.activityFeed.create({
        data: {
          organizationId: ctx.session.organizationId,
          actorId: ctx.session.internalUserId,
          actionType: 'thread_created',
          threadId: thread.id,
          metadata: {
            title: thread.title,
          },
        },
      });

      return thread;
    }),

  /**
   * Update thread
   */
  update: orgProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(500).optional(),
        description: z.string().max(10000).optional(),
        status: z
          .enum(['planning', 'in_progress', 'review', 'completed', 'archived'])
          .optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check permissions
      const isCollaborator = await ctx.prisma.threadCollaborator.findFirst({
        where: {
          threadId: input.id,
          userId: ctx.session.internalUserId,
          role: { in: ['owner', 'editor'] },
        },
      });

      if (!isCollaborator) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No permission to edit this thread',
        });
      }

      // Regenerate embedding if title or description changed
      let embedding: number[] | null | undefined;
      if (input.title || input.description) {
        const currentThread = await ctx.prisma.goldenThread.findUnique({
          where: { id: input.id },
          select: { title: true, description: true },
        });

        const embeddingText = prepareTextForEmbedding({
          title: input.title ?? currentThread?.title,
          description: input.description ?? currentThread?.description,
        });
        embedding = await generateEmbedding(embeddingText);
      }

      const thread = await ctx.prisma.goldenThread.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
          status: input.status,
          tags: input.tags,
          updatedAt: new Date(),
        },
      });

      // Update embedding separately using raw query (since Prisma doesn't support vector type)
      if (embedding) {
        await ctx.prisma.$executeRawUnsafe(`
          UPDATE golden_threads
          SET embedding = '[${embedding.join(',')}]'::vector
          WHERE id = '${input.id}'
        `);
      }

      // Invalidate cache
      await invalidateThreadCache(input.id);

      // Create activity feed entry
      await ctx.prisma.activityFeed.create({
        data: {
          organizationId: ctx.session.organizationId,
          actorId: ctx.session.internalUserId,
          actionType: 'thread_updated',
          threadId: thread.id,
          metadata: {
            changes: {
              title: input.title,
              status: input.status,
            },
          },
        },
      });

      return thread;
    }),

  /**
   * Delete thread (soft delete)
   */
  delete: orgProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Check ownership
      const thread = await ctx.prisma.goldenThread.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.session.organizationId,
        },
      });

      if (!thread) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      if (thread.createdBy !== ctx.session.internalUserId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only thread creator can delete',
        });
      }

      await ctx.prisma.goldenThread.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      // Invalidate cache
      await invalidateThreadCache(input.id);

      return { success: true };
    }),

  /**
   * Add collaborator to thread
   */
  addCollaborator: orgProcedure
    .input(
      z.object({
        threadId: z.string().uuid(),
        userId: z.string().uuid(),
        role: z.enum(['owner', 'editor', 'commenter', 'viewer']).default('viewer'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if requester has permission
      const requesterCollab = await ctx.prisma.threadCollaborator.findFirst({
        where: {
          threadId: input.threadId,
          userId: ctx.session.internalUserId,
          role: { in: ['owner', 'editor'] },
        },
      });

      if (!requesterCollab) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No permission to add collaborators',
        });
      }

      // Add collaborator
      const collaborator = await ctx.prisma.threadCollaborator.create({
        data: {
          threadId: input.threadId,
          userId: input.userId,
          role: input.role,
          addedBy: ctx.session.internalUserId,
        },
        include: {
          user: true,
        },
      });

      return collaborator;
    }),

  /**
   * Remove collaborator from thread
   */
  removeCollaborator: orgProcedure
    .input(
      z.object({
        threadId: z.string().uuid(),
        userId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if requester has permission
      const requesterCollab = await ctx.prisma.threadCollaborator.findFirst({
        where: {
          threadId: input.threadId,
          userId: ctx.session.internalUserId,
          role: { in: ['owner'] },
        },
      });

      if (!requesterCollab) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only owners can remove collaborators',
        });
      }

      await ctx.prisma.threadCollaborator.delete({
        where: {
          threadId_userId: {
            threadId: input.threadId,
            userId: input.userId,
          },
        },
      });

      return { success: true };
    }),

  /**
   * Get thread activity feed
   */
  getActivity: orgProcedure
    .input(
      z.object({
        threadId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const activities = await ctx.prisma.activityFeed.findMany({
        where: {
          threadId: input.threadId,
          organizationId: ctx.session.organizationId,
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
          item: {
            select: { id: true, title: true, integrationType: true },
          },
          comment: {
            select: { id: true, content: true },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (activities.length > input.limit) {
        const nextItem = activities.pop();
        nextCursor = nextItem!.id;
      }

      return { activities, nextCursor };
    }),

  /**
   * Get related threads and items using AI semantic similarity
   * Powers "Related Threads" and "You might also like" features
   */
  getRelated: orgProcedure
    .input(
      z.object({
        threadId: z.string().uuid(),
        limit: z.number().min(1).max(20).default(10),
        threshold: z.number().min(0).max(1).default(0.3), // Similarity threshold
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify thread exists and user has access
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

      // Find related content using AI semantic search
      const related = await findRelatedContent(
        input.threadId,
        ctx.session.organizationId,
        {
          limit: input.limit,
          threshold: input.threshold,
        }
      );

      return {
        relatedThreads: related.relatedThreads,
        relatedItems: related.relatedItems,
        metadata: {
          threshold: input.threshold,
          resultsCount:
            related.relatedThreads.length + related.relatedItems.length,
        },
      };
    }),
});
