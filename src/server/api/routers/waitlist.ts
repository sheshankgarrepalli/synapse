import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const waitlistRouter = createTRPCRouter({
  /**
   * Join the waitlist
   */
  join: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        source: z.string().optional(), // Where they signed up from
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if email already exists
      const existing = await ctx.prisma.waitlistEntry.findUnique({
        where: { email: input.email },
      });

      if (existing) {
        // Already on waitlist - just return success
        return {
          success: true,
          message: "You're already on the waitlist!",
        };
      }

      // Add to waitlist
      await ctx.prisma.waitlistEntry.create({
        data: {
          email: input.email,
          source: input.source || 'landing_page',
        },
      });

      return {
        success: true,
        message: 'Successfully joined the waitlist!',
      };
    }),

  /**
   * Get waitlist stats (for admin)
   */
  getStats: publicProcedure.query(async ({ ctx }) => {
    const total = await ctx.prisma.waitlistEntry.count();

    const bySource = await ctx.prisma.waitlistEntry.groupBy({
      by: ['source'],
      _count: true,
    });

    return {
      total,
      bySource,
    };
  }),
});
