import { z } from 'zod';
import { createTRPCRouter, orgProcedure } from '../trpc';

export const analyticsRouter = createTRPCRouter({
  /**
   * Get dashboard stats
   */
  getDashboard: orgProcedure.query(async ({ ctx }) => {
    const [
      totalThreads,
      activeThreads,
      totalItems,
      totalAutomations,
      activeIntegrations,
    ] = await Promise.all([
      ctx.prisma.goldenThread.count({
        where: {
          organizationId: ctx.session.organizationId,
          deletedAt: null,
        },
      }),
      ctx.prisma.goldenThread.count({
        where: {
          organizationId: ctx.session.organizationId,
          status: { in: ['planning', 'in_progress', 'review'] },
          deletedAt: null,
        },
      }),
      ctx.prisma.connectedItem.count({
        where: {
          organizationId: ctx.session.organizationId,
          deletedAt: null,
        },
      }),
      ctx.prisma.automation.count({
        where: {
          organizationId: ctx.session.organizationId,
          isActive: true,
          deletedAt: null,
        },
      }),
      ctx.prisma.integration.count({
        where: {
          organizationId: ctx.session.organizationId,
          status: 'active',
          deletedAt: null,
        },
      }),
    ]);

    return {
      totalThreads,
      activeThreads,
      totalItems,
      totalAutomations,
      activeIntegrations,
    };
  }),

  /**
   * Get thread activity over time
   */
  getThreadActivity: orgProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const activity = await ctx.prisma.activityFeed.groupBy({
        by: ['actionType'],
        where: {
          organizationId: ctx.session.organizationId,
          createdAt: { gte: startDate },
        },
        _count: {
          id: true,
        },
      });

      return activity;
    }),

  /**
   * Get integration usage stats
   */
  getIntegrationStats: orgProcedure.query(async ({ ctx }) => {
    const stats = await ctx.prisma.connectedItem.groupBy({
      by: ['integrationType'],
      where: {
        organizationId: ctx.session.organizationId,
        deletedAt: null,
      },
      _count: {
        id: true,
      },
    });

    return stats;
  }),
});
