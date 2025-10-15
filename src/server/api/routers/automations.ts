import { z } from 'zod';
import { createTRPCRouter, orgProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const automationsRouter = createTRPCRouter({
  /**
   * List all automations
   */
  list: orgProcedure.query(async ({ ctx }) => {
    const automations = await ctx.prisma.automation.findMany({
      where: {
        organizationId: ctx.session.organizationId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: { fullName: true, avatarUrl: true },
        },
      },
    });

    return automations;
  }),

  /**
   * Get automation by ID
   */
  getById: orgProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const automation = await ctx.prisma.automation.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.session.organizationId,
          deletedAt: null,
        },
        include: {
          creator: true,
          automationRuns: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!automation) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return automation;
    }),

  /**
   * Create automation
   */
  create: orgProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        templateId: z.string().optional(),
        trigger: z.record(z.any()),
        conditions: z.array(z.any()).default([]),
        actions: z.array(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const automation = await ctx.prisma.automation.create({
        data: {
          organizationId: ctx.session.organizationId,
          name: input.name,
          description: input.description,
          templateId: input.templateId,
          trigger: input.trigger,
          conditions: input.conditions,
          actions: input.actions,
          createdBy: ctx.session.internalUserId,
        },
      });

      return automation;
    }),

  /**
   * Toggle automation active status
   */
  toggle: orgProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const automation = await ctx.prisma.automation.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.session.organizationId,
        },
      });

      if (!automation) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      await ctx.prisma.automation.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      });

      return { success: true };
    }),

  /**
   * Delete automation
   */
  delete: orgProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const automation = await ctx.prisma.automation.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.session.organizationId,
        },
      });

      if (!automation) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      if (automation.createdBy !== ctx.session.internalUserId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only creator can delete automation',
        });
      }

      await ctx.prisma.automation.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),
});
