import { z } from 'zod';
import { createTRPCRouter, orgProcedure } from '../trpc';
import { Prisma } from '@prisma/client';
import { semanticSearch } from '@/lib/ai/semantic-search';

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
      // Use AI-powered semantic search
      const results = await semanticSearch(input.query, {
        organizationId: ctx.session.organizationId,
        limit: input.limit,
        type: 'both',
        threshold: 0.5, // Moderate similarity threshold
        filters: {
          integration: input.filters?.integration,
          dateRange: input.filters?.dateRange
            ? {
                from: input.filters.dateRange.from,
                to: input.filters.dateRange.to,
              }
            : undefined,
          threadId: input.filters?.threadId,
        },
      });

      return {
        threads: results.threads,
        items: results.items,
        metadata: results.metadata, // Include search metadata (type, execution time, etc.)
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
