import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const onboardingRouter = createTRPCRouter({
  complete: protectedProcedure
    .input(
      z.object({
        role: z.enum(['designer', 'developer', 'product_manager', 'team_lead']),
        organizationName: z.string().optional(),
        teamSize: z.string().optional(),
        goals: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // For now, we'll store onboarding data in organization metadata
      // In production, you might want a dedicated onboarding table

      const orgId = ctx.session.organizationId;
      if (!orgId) {
        throw new Error('No organization ID found');
      }

      // Update organization with onboarding metadata
      await ctx.prisma.organization.update({
        where: { id: orgId },
        data: {
          settings: {
            onboarding: {
              completed: true,
              role: input.role,
              organizationName: input.organizationName,
              teamSize: input.teamSize,
              goals: input.goals,
              completedAt: new Date().toISOString(),
            },
          },
        },
      });

      return {
        success: true,
        message: 'Onboarding completed successfully',
      };
    }),

  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.session.organizationId;
    if (!orgId) {
      return {
        completed: false,
        role: undefined,
        organizationName: undefined,
        teamSize: undefined,
        goals: [],
      };
    }

    const org = await ctx.prisma.organization.findUnique({
      where: { id: orgId },
    });

    const onboardingData = org?.settings as any;

    return {
      completed: onboardingData?.onboarding?.completed || false,
      role: onboardingData?.onboarding?.role,
      organizationName: onboardingData?.onboarding?.organizationName,
      teamSize: onboardingData?.onboarding?.teamSize,
      goals: onboardingData?.onboarding?.goals || [],
    };
  }),
});
