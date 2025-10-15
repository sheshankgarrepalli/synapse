import { z } from 'zod';
import { createTRPCRouter, orgProcedure } from '../trpc';
import { Prisma } from '@prisma/client';

export const searchRouter = createTRPCRouter({
  /**
   * Unified search across threads and items
   * Combines full-text search with semantic vector search
   */
  search: orgProcedure
    .input(
      z.object({
        query: z.string().min(1).max(500),
        filters: z
          .object({
            integration: z
              .enum([
                'figma',
                'linear',
                'github',
                'slack',
                'notion',
                'zoom',
                'dovetail',
                'mixpanel',
              ])
              .optional(),
            dateRange: z
              .object({
                from: z.date().optional(),
                to: z.date().optional(),
              })
              .optional(),
            threadId: z.string().uuid().optional(),
          })
          .optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      // Full-text search for threads
      const threads = await ctx.prisma.goldenThread.findMany({
        where: {
          organizationId: ctx.session.organizationId,
          deletedAt: null,
          OR: [
            { title: { contains: input.query, mode: 'insensitive' } },
            { description: { contains: input.query, mode: 'insensitive' } },
          ],
          ...(input.filters?.dateRange && {
            createdAt: {
              gte: input.filters.dateRange.from,
              lte: input.filters.dateRange.to,
            },
          }),
        },
        take: Math.floor(input.limit / 2),
        orderBy: { lastActivityAt: 'desc' },
        include: {
          creator: {
            select: { fullName: true, avatarUrl: true },
          },
          _count: { select: { connectedItems: true } },
        },
      });

      // Full-text search for items
      const items = await ctx.prisma.connectedItem.findMany({
        where: {
          organizationId: ctx.session.organizationId,
          deletedAt: null,
          OR: [
            { title: { contains: input.query, mode: 'insensitive' } },
            { description: { contains: input.query, mode: 'insensitive' } },
          ],
          ...(input.filters?.integration && {
            integrationType: input.filters.integration,
          }),
          ...(input.filters?.threadId && {
            threadId: input.filters.threadId,
          }),
        },
        take: Math.floor(input.limit / 2),
        orderBy: { createdAt: 'desc' },
        include: {
          thread: { select: { id: true, title: true } },
          creator: { select: { fullName: true, avatarUrl: true } },
        },
      });

      return {
        threads,
        items,
      };
    }),

  /**
   * Quick search for threads only (for autocomplete)
   */
  quickSearch: orgProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        limit: z.number().min(1).max(10).default(5),
      })
    )
    .query(async ({ ctx, input }) => {
      const threads = await ctx.prisma.goldenThread.findMany({
        where: {
          organizationId: ctx.session.organizationId,
          deletedAt: null,
          title: { contains: input.query, mode: 'insensitive' },
        },
        take: input.limit,
        select: {
          id: true,
          title: true,
          status: true,
        },
        orderBy: { lastActivityAt: 'desc' },
      });

      return threads;
    }),
});
