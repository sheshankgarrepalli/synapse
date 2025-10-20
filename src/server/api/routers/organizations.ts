import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, orgProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { slugify } from '@/lib/utils';
import { clerkClient } from '@clerk/nextjs/server';

export const organizationsRouter = createTRPCRouter({
  /**
   * Get current organization
   */
  getCurrent: orgProcedure.query(async ({ ctx }) => {
    const organization = await ctx.prisma.organization.findUnique({
      where: { id: ctx.session.organizationId },
      include: {
        _count: {
          select: {
            users: true,
            goldenThreads: true,
            integrations: true,
          },
        },
      },
    });

    return organization;
  }),

  /**
   * Create new organization
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        domain: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const slug = slugify(input.name);

      // Check if slug is available
      const existing = await ctx.prisma.organization.findUnique({
        where: { slug },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Organization name already taken',
        });
      }

      const organization = await ctx.prisma.organization.create({
        data: {
          name: input.name,
          slug,
          domain: input.domain,
        },
      });

      // Create owner user with Clerk data
      let userEmail = 'user@example.com';
      let userFullName = 'User';

      try {
        const clerk = await clerkClient();
        const clerkUser = await clerk.users.getUser(ctx.session.userId);
        userEmail = clerkUser.emailAddresses[0]?.emailAddress || userEmail;
        userFullName = clerkUser.fullName || clerkUser.firstName || 'User';
      } catch (error) {
        console.error('Failed to fetch Clerk user data:', error);
      }

      await ctx.prisma.user.create({
        data: {
          organizationId: organization.id,
          authProviderId: ctx.session.userId,
          email: userEmail,
          fullName: userFullName,
          role: 'owner',
        },
      });

      return organization;
    }),

  /**
   * Update organization
   */
  update: orgProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255).optional(),
        domain: z.string().optional(),
        settings: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const organization = await ctx.prisma.organization.update({
        where: { id: ctx.session.organizationId },
        data: {
          name: input.name,
          domain: input.domain,
          settings: input.settings,
        },
      });

      return organization;
    }),

  /**
   * Get storage usage
   */
  getStorageUsage: orgProcedure.query(async ({ ctx }) => {
    const organization = await ctx.prisma.organization.findUnique({
      where: { id: ctx.session.organizationId },
      select: {
        storageLimitGb: true,
        storageUsedBytes: true,
      },
    });

    if (!organization) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    const limitBytes = organization.storageLimitGb * 1024 * 1024 * 1024;
    const usedBytes = Number(organization.storageUsedBytes);
    const percentUsed = (usedBytes / limitBytes) * 100;

    return {
      limitGb: organization.storageLimitGb,
      usedBytes,
      limitBytes,
      percentUsed,
    };
  }),
});
