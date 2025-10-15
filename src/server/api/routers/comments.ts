import { z } from 'zod';
import { createTRPCRouter, orgProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const commentsRouter = createTRPCRouter({
  /**
   * Create comment
   */
  create: orgProcedure
    .input(
      z.object({
        threadId: z.string().uuid(),
        itemId: z.string().uuid().optional(),
        parentCommentId: z.string().uuid().optional(),
        content: z.string().min(1).max(10000),
        mentions: z.array(z.string().uuid()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify thread exists and user has access
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

      // Create comment
      const comment = await ctx.prisma.comment.create({
        data: {
          organizationId: ctx.session.organizationId,
          threadId: input.threadId,
          itemId: input.itemId,
          parentCommentId: input.parentCommentId,
          content: input.content,
          mentions: input.mentions || [],
          createdBy: ctx.session.internalUserId,
        },
        include: {
          creator: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
      });

      // Update thread's last activity
      await ctx.prisma.goldenThread.update({
        where: { id: input.threadId },
        data: { lastActivityAt: new Date() },
      });

      // Create activity feed entry
      await ctx.prisma.activityFeed.create({
        data: {
          organizationId: ctx.session.organizationId,
          actorId: ctx.session.internalUserId,
          actionType: 'comment_posted',
          threadId: input.threadId,
          commentId: comment.id,
          metadata: {
            preview: input.content.substring(0, 100),
          },
        },
      });

      // TODO: Create notifications for mentions

      return comment;
    }),

  /**
   * List comments for thread or item
   */
  list: orgProcedure
    .input(
      z.object({
        threadId: z.string().uuid(),
        itemId: z.string().uuid().optional(),
        parentCommentId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const comments = await ctx.prisma.comment.findMany({
        where: {
          threadId: input.threadId,
          itemId: input.itemId,
          parentCommentId: input.parentCommentId || null,
          organizationId: ctx.session.organizationId,
          isDeleted: false,
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
          _count: { select: { replies: true } },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (comments.length > input.limit) {
        const nextItem = comments.pop();
        nextCursor = nextItem!.id;
      }

      return { comments, nextCursor };
    }),

  /**
   * Update comment
   */
  update: orgProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        content: z.string().min(1).max(10000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check ownership
      const comment = await ctx.prisma.comment.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.session.organizationId,
        },
      });

      if (!comment) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      if (comment.createdBy !== ctx.session.internalUserId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Can only edit your own comments',
        });
      }

      const updated = await ctx.prisma.comment.update({
        where: { id: input.id },
        data: {
          content: input.content,
          isEdited: true,
          editedAt: new Date(),
        },
      });

      return updated;
    }),

  /**
   * Delete comment (soft delete)
   */
  delete: orgProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.prisma.comment.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.session.organizationId,
        },
      });

      if (!comment) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      if (comment.createdBy !== ctx.session.internalUserId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Can only delete your own comments',
        });
      }

      await ctx.prisma.comment.update({
        where: { id: input.id },
        data: { isDeleted: true },
      });

      return { success: true };
    }),
});
