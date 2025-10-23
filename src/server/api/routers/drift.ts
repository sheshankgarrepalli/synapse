/**
 * Design-Code Drift Router
 * Handle drift detection queries and actions
 */

import { z } from 'zod';
import { createTRPCRouter, orgProcedure } from '../trpc';
import { logger } from '@/lib/logger';
import { TRPCError } from '@trpc/server';

export const driftRouter = createTRPCRouter({
  // ==========================================
  // MVP Drift Watch Endpoints
  // ==========================================

  /**
   * Get all drift watches for the organization
   */
  getWatches: orgProcedure
    .input(
      z.object({
        status: z.enum(['healthy', 'drift_detected', 'error']).optional(),
        isActive: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        organizationId: ctx.session.organizationId,
      };

      if (input.status) {
        where.status = input.status;
      }

      if (input.isActive !== undefined) {
        where.isActive = input.isActive;
      }

      const [watches, total] = await Promise.all([
        ctx.prisma.driftWatch.findMany({
          where,
          include: {
            alerts: {
              where: { acknowledged: false },
              orderBy: { detectedAt: 'desc' },
              take: 1,
            },
            _count: {
              select: {
                alerts: {
                  where: { acknowledged: false },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.driftWatch.count({ where }),
      ]);

      return {
        watches,
        total,
        hasMore: total > input.offset + input.limit,
      };
    }),

  /**
   * Get watch by ID
   */
  getWatchById: orgProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const watch = await ctx.prisma.driftWatch.findUnique({
      where: { id: input.id },
      include: {
        alerts: {
          orderBy: { detectedAt: 'desc' },
          take: 20,
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!watch || watch.organizationId !== ctx.session.organizationId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Watch not found',
      });
    }

    return watch;
  }),

  /**
   * Create a new drift watch
   */
  createWatch: orgProcedure
    .input(
      z.object({
        figmaFileId: z.string(),
        figmaFileName: z.string(),
        figmaComponentId: z.string(),
        figmaComponentName: z.string(),
        githubRepoId: z.string(),
        githubRepoName: z.string(),
        githubFilePath: z.string(),
        githubBranch: z.string().default('main'),
        snapshot: z.record(z.any()).default({}),
        checkFrequency: z.enum(['hourly', 'daily', 'weekly']).default('daily'),
        slackWebhookUrl: z.string().optional(),
        alertOnDrift: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const watch = await ctx.prisma.driftWatch.create({
        data: {
          organizationId: ctx.session.organizationId,
          userId: ctx.session.userId,
          figmaFileId: input.figmaFileId,
          figmaFileName: input.figmaFileName,
          figmaComponentId: input.figmaComponentId,
          figmaComponentName: input.figmaComponentName,
          githubRepoId: input.githubRepoId,
          githubRepoName: input.githubRepoName,
          githubFilePath: input.githubFilePath,
          githubBranch: input.githubBranch,
          snapshot: input.snapshot,
          checkFrequency: input.checkFrequency,
          slackWebhookUrl: input.slackWebhookUrl,
          alertOnDrift: input.alertOnDrift,
          status: 'healthy',
          isActive: true,
        },
      });

      logger.info('Drift watch created', {
        watchId: watch.id,
        figmaFile: input.figmaFileName,
        githubRepo: input.githubRepoName,
      });

      return watch;
    }),

  /**
   * Update a drift watch
   */
  updateWatch: orgProcedure
    .input(
      z.object({
        id: z.string(),
        isActive: z.boolean().optional(),
        checkFrequency: z.enum(['hourly', 'daily', 'weekly']).optional(),
        slackWebhookUrl: z.string().optional(),
        alertOnDrift: z.boolean().optional(),
        githubBranch: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const watch = await ctx.prisma.driftWatch.findUnique({
        where: { id: input.id },
      });

      if (!watch || watch.organizationId !== ctx.session.organizationId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Watch not found',
        });
      }

      const updated = await ctx.prisma.driftWatch.update({
        where: { id: input.id },
        data: {
          isActive: input.isActive,
          checkFrequency: input.checkFrequency,
          slackWebhookUrl: input.slackWebhookUrl,
          alertOnDrift: input.alertOnDrift,
          githubBranch: input.githubBranch,
        },
      });

      logger.info('Drift watch updated', {
        watchId: input.id,
        updates: input,
      });

      return updated;
    }),

  /**
   * Delete a drift watch
   */
  deleteWatch: orgProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const watch = await ctx.prisma.driftWatch.findUnique({
      where: { id: input.id },
    });

    if (!watch || watch.organizationId !== ctx.session.organizationId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Watch not found',
      });
    }

    await ctx.prisma.driftWatch.delete({
      where: { id: input.id },
    });

    logger.info('Drift watch deleted', {
      watchId: input.id,
    });

    return { success: true };
  }),

  /**
   * Get alerts for a watch
   */
  getAlerts: orgProcedure
    .input(
      z.object({
        watchId: z.string().optional(),
        acknowledged: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.watchId) {
        where.watchId = input.watchId;
      } else {
        // Get all alerts for all watches belonging to this org
        const watches = await ctx.prisma.driftWatch.findMany({
          where: { organizationId: ctx.session.organizationId },
          select: { id: true },
        });
        where.watchId = { in: watches.map((w) => w.id) };
      }

      if (input.acknowledged !== undefined) {
        where.acknowledged = input.acknowledged;
      }

      const [alerts, total] = await Promise.all([
        ctx.prisma.driftAlert.findMany({
          where,
          include: {
            watch: {
              select: {
                id: true,
                figmaFileName: true,
                figmaComponentName: true,
                githubRepoName: true,
                githubFilePath: true,
                status: true,
              },
            },
          },
          orderBy: {
            detectedAt: 'desc',
          },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.driftAlert.count({ where }),
      ]);

      return {
        alerts,
        total,
        hasMore: total > input.offset + input.limit,
      };
    }),

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert: orgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const alert = await ctx.prisma.driftAlert.findUnique({
        where: { id: input.id },
        include: { watch: true },
      });

      if (!alert || alert.watch.organizationId !== ctx.session.organizationId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Alert not found',
        });
      }

      const updated = await ctx.prisma.driftAlert.update({
        where: { id: input.id },
        data: {
          acknowledged: true,
          acknowledgedAt: new Date(),
        },
      });

      logger.info('Alert acknowledged', {
        alertId: input.id,
        userId: ctx.session.userId,
      });

      return updated;
    }),

  // ==========================================
  // Legacy Drift Endpoints (DesignCodeDrift)
  // ==========================================

  /**
   * Get all drift alerts for the organization
   */
  getDriftAlerts: orgProcedure
    .input(
      z.object({
        status: z.enum(['detected', 'acknowledged', 'resolved', 'ignored']).optional(),
        severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        organizationId: ctx.session.organizationId,
      };

      if (input.status) {
        where.status = input.status;
      }

      if (input.severity) {
        where.severity = input.severity;
      }

      const [drifts, total] = await Promise.all([
        ctx.prisma.designCodeDrift.findMany({
          where,
          include: {
            designSnapshot: {
              select: {
                fileName: true,
                nodeName: true,
                thumbnailUrl: true,
                fileUrl: true,
              },
            },
            codeSnapshot: {
              select: {
                filePath: true,
                componentName: true,
                commitSha: true,
              },
            },
            designItem: {
              select: {
                title: true,
                externalUrl: true,
              },
            },
            codeItem: {
              select: {
                title: true,
                externalUrl: true,
              },
            },
          },
          orderBy: {
            detectedAt: 'desc',
          },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.designCodeDrift.count({ where }),
      ]);

      return {
        drifts,
        total,
        hasMore: total > input.offset + input.limit,
      };
    }),

  /**
   * Get drift alert by ID
   */
  getDriftById: orgProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const drift = await ctx.prisma.designCodeDrift.findUnique({
      where: {
        id: input.id,
      },
      include: {
        designSnapshot: true,
        codeSnapshot: true,
        designItem: true,
        codeItem: true,
      },
    });

    if (!drift || drift.organizationId !== ctx.session.organizationId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Drift alert not found',
      });
    }

    return drift;
  }),

  /**
   * Update drift status
   */
  updateDriftStatus: orgProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['detected', 'acknowledged', 'resolved', 'ignored']),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const drift = await ctx.prisma.designCodeDrift.findUnique({
        where: { id: input.id },
      });

      if (!drift || drift.organizationId !== ctx.session.organizationId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Drift alert not found',
        });
      }

      const updated = await ctx.prisma.designCodeDrift.update({
        where: { id: input.id },
        data: {
          status: input.status,
          acknowledgedAt: input.status === 'acknowledged' ? new Date() : drift.acknowledgedAt,
          resolvedAt: input.status === 'resolved' ? new Date() : drift.resolvedAt,
          resolvedBy: input.status === 'resolved' ? ctx.session.userId : drift.resolvedBy,
        },
      });

      logger.info('Drift status updated', {
        driftId: input.id,
        status: input.status,
        userId: ctx.session.userId,
      });

      return updated;
    }),

  /**
   * Get drift statistics
   */
  getDriftStats: orgProcedure.query(async ({ ctx }) => {
    const [total, bySeverity, byStatus, recentDrifts] = await Promise.all([
      // Total drift count
      ctx.prisma.designCodeDrift.count({
        where: {
          organizationId: ctx.session.organizationId,
        },
      }),

      // Count by severity
      ctx.prisma.designCodeDrift.groupBy({
        by: ['severity'],
        where: {
          organizationId: ctx.session.organizationId,
        },
        _count: true,
      }),

      // Count by status
      ctx.prisma.designCodeDrift.groupBy({
        by: ['status'],
        where: {
          organizationId: ctx.session.organizationId,
        },
        _count: true,
      }),

      // Recent drifts (last 7 days)
      ctx.prisma.designCodeDrift.count({
        where: {
          organizationId: ctx.session.organizationId,
          detectedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      total,
      bySeverity: bySeverity.reduce(
        (acc, item) => {
          acc[item.severity] = item._count;
          return acc;
        },
        {} as Record<string, number>
      ),
      byStatus: byStatus.reduce(
        (acc, item) => {
          acc[item.status] = item._count;
          return acc;
        },
        {} as Record<string, number>
      ),
      recentDrifts,
    };
  }),

  /**
   * Get design-code links for monitoring
   */
  getDesignCodeLinks: orgProcedure
    .input(
      z.object({
        isMonitored: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        organizationId: ctx.session.organizationId,
      };

      if (input.isMonitored !== undefined) {
        where.isMonitored = input.isMonitored;
      }

      const [links, total] = await Promise.all([
        ctx.prisma.designCodeLink.findMany({
          where,
          include: {
            designItem: {
              select: {
                id: true,
                title: true,
                externalUrl: true,
                integrationType: true,
                metadata: true,
              },
            },
            codeItem: {
              select: {
                id: true,
                title: true,
                externalUrl: true,
                integrationType: true,
                metadata: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.designCodeLink.count({ where }),
      ]);

      return {
        links,
        total,
        hasMore: total > input.offset + input.limit,
      };
    }),

  /**
   * Create design-code link
   */
  createDesignCodeLink: orgProcedure
    .input(
      z.object({
        designItemId: z.string(),
        codeItemId: z.string(),
        linkType: z.enum(['component', 'page', 'feature', 'manual']).default('manual'),
        isMonitored: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify items exist and belong to organization
      const [designItem, codeItem] = await Promise.all([
        ctx.prisma.connectedItem.findUnique({
          where: { id: input.designItemId },
        }),
        ctx.prisma.connectedItem.findUnique({
          where: { id: input.codeItemId },
        }),
      ]);

      if (!designItem || designItem.organizationId !== ctx.session.organizationId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Design item not found',
        });
      }

      if (!codeItem || codeItem.organizationId !== ctx.session.organizationId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Code item not found',
        });
      }

      // Check if link already exists
      const existingLink = await ctx.prisma.designCodeLink.findFirst({
        where: {
          organizationId: ctx.session.organizationId,
          designItemId: input.designItemId,
          codeItemId: input.codeItemId,
        },
      });

      if (existingLink) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Link already exists',
        });
      }

      const link = await ctx.prisma.designCodeLink.create({
        data: {
          organizationId: ctx.session.organizationId,
          designItemId: input.designItemId,
          codeItemId: input.codeItemId,
          linkType: input.linkType,
          isMonitored: input.isMonitored,
          createdBy: ctx.session.userId,
        },
      });

      logger.info('Design-code link created', {
        linkId: link.id,
        designItemId: input.designItemId,
        codeItemId: input.codeItemId,
      });

      // Create activity feed entry
      await ctx.prisma.activityFeed.create({
        data: {
          organizationId: ctx.session.organizationId,
          actorId: ctx.session.userId,
          actionType: 'design_code_link_created',
          metadata: {
            linkId: link.id,
            designItemTitle: designItem.title,
            codeItemTitle: codeItem.title,
          },
        },
      });

      return link;
    }),

  /**
   * Update design-code link
   */
  updateDesignCodeLink: orgProcedure
    .input(
      z.object({
        id: z.string(),
        isMonitored: z.boolean().optional(),
        linkType: z.enum(['component', 'page', 'feature', 'manual']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.prisma.designCodeLink.findUnique({
        where: { id: input.id },
      });

      if (!link || link.organizationId !== ctx.session.organizationId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Link not found',
        });
      }

      const updated = await ctx.prisma.designCodeLink.update({
        where: { id: input.id },
        data: {
          isMonitored: input.isMonitored,
          linkType: input.linkType,
        },
      });

      logger.info('Design-code link updated', {
        linkId: input.id,
        updates: input,
      });

      return updated;
    }),

  /**
   * Delete design-code link
   */
  deleteDesignCodeLink: orgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.prisma.designCodeLink.findUnique({
        where: { id: input.id },
      });

      if (!link || link.organizationId !== ctx.session.organizationId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Link not found',
        });
      }

      await ctx.prisma.designCodeLink.delete({
        where: { id: input.id },
      });

      logger.info('Design-code link deleted', {
        linkId: input.id,
      });

      return { success: true };
    }),

  /**
   * Get design snapshots for a design item
   */
  getDesignSnapshots: orgProcedure
    .input(
      z.object({
        designItemId: z.string().optional(),
        externalFileId: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        organizationId: ctx.session.organizationId,
      };

      if (input.designItemId) {
        // Find snapshots linked to this design item via drift records
        const drifts = await ctx.prisma.designCodeDrift.findMany({
          where: {
            organizationId: ctx.session.organizationId,
            designItemId: input.designItemId,
          },
          select: {
            designSnapshotId: true,
          },
        });

        const snapshotIds = drifts
          .map((d) => d.designSnapshotId)
          .filter((id): id is string => id !== null);

        if (snapshotIds.length > 0) {
          where.id = { in: snapshotIds };
        } else {
          where.id = 'no-match'; // Return empty if no snapshots found
        }
      } else if (input.externalFileId) {
        where.externalFileId = input.externalFileId;
      }

      const snapshots = await ctx.prisma.designSnapshot.findMany({
        where,
        orderBy: {
          capturedAt: 'desc',
        },
        take: input.limit,
      });

      return snapshots;
    }),

  /**
   * Get code snapshots for a code item
   */
  getCodeSnapshots: orgProcedure
    .input(
      z.object({
        codeItemId: z.string().optional(),
        filePath: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        organizationId: ctx.session.organizationId,
      };

      if (input.codeItemId) {
        // Find snapshots linked to this code item via drift records
        const drifts = await ctx.prisma.designCodeDrift.findMany({
          where: {
            organizationId: ctx.session.organizationId,
            codeItemId: input.codeItemId,
          },
          select: {
            codeSnapshotId: true,
          },
        });

        const snapshotIds = drifts.map((d) => d.codeSnapshotId).filter((id): id is string => id !== null);

        if (snapshotIds.length > 0) {
          where.id = { in: snapshotIds };
        } else {
          where.id = 'no-match'; // Return empty if no snapshots found
        }
      } else if (input.filePath) {
        where.filePath = input.filePath;
      }

      const snapshots = await ctx.prisma.codeSnapshot.findMany({
        where,
        orderBy: {
          capturedAt: 'desc',
        },
        take: input.limit,
      });

      return snapshots;
    }),
});
