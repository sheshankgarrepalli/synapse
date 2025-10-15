import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';

/**
 * CREATE CONTEXT
 *
 * This is the context that is passed to all tRPC procedures.
 * It includes the database client and the user session.
 */
export const createTRPCContext = (opts: CreateNextContextOptions) => {
  // Get the session from Clerk using getAuth (Pages Router compatible)
  const session = getAuth(opts.req);

  return {
    prisma,
    session: session.userId
      ? {
          userId: session.userId,
          organizationId: session.orgId || null,
        }
      : null,
  };
};

/**
 * INIT TRPC
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * ROUTERS AND PROCEDURES
 *
 * This is where you export the tRPC router and procedure helpers.
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 */
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

/**
 * Organization-scoped procedure
 * Requires both authentication and organization membership
 * Auto-creates organization if it doesn't exist
 */
export const orgProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  try {
    let organizationId = ctx.session.organizationId;
    let internalUserId: string;

    // If no Clerk organization, find or create a personal organization
    if (!organizationId) {
      // Create slug based on user ID
      const slug = `user-${ctx.session.userId.slice(0, 16)}`;

      // Check if user has a personal organization by slug
      let organization = await ctx.prisma.organization.findUnique({
        where: { slug },
      });

      // Create personal organization if it doesn't exist
      if (!organization) {
        console.log('Creating personal organization for user:', ctx.session.userId);
        organization = await ctx.prisma.organization.create({
          data: {
            name: 'My Organization',
            slug,
            planTier: 'free',
            storageLimitGb: 25,
          },
        });
        console.log('Created organization:', organization.id);
      }

      organizationId = organization.id;

      // Find or create user record
      let user = await ctx.prisma.user.findUnique({
        where: { authProviderId: ctx.session.userId },
      });

      if (!user) {
        console.log('Creating user record for:', ctx.session.userId);
        user = await ctx.prisma.user.create({
          data: {
            authProviderId: ctx.session.userId,
            organizationId: organization.id,
            email: 'user@example.com', // This should be updated from Clerk webhook
            fullName: 'User',
          },
        });
        console.log('Created user:', user.id);
      }

      internalUserId = user.id;
    } else {
      // Create slug based on Clerk org ID (we know it's not null here because of the else branch)
      const slug = `org-${ctx.session.organizationId!.slice(0, 16)}`;

      // Find or create organization from Clerk org ID
      let organization = await ctx.prisma.organization.findUnique({
        where: { slug },
      });

      if (!organization) {
        organization = await ctx.prisma.organization.create({
          data: {
            name: 'Organization',
            slug,
            planTier: 'free',
            storageLimitGb: 25,
          },
        });
      }

      organizationId = organization.id;

      // Find or create user record
      let user = await ctx.prisma.user.findUnique({
        where: { authProviderId: ctx.session.userId },
      });

      if (!user) {
        user = await ctx.prisma.user.create({
          data: {
            authProviderId: ctx.session.userId,
            organizationId: organization.id,
            email: 'user@example.com', // This should be updated from Clerk webhook
            fullName: 'User',
          },
        });
      }

      internalUserId = user.id;
    }

    return next({
      ctx: {
        ...ctx,
        session: {
          ...ctx.session,
          organizationId,
          internalUserId, // Internal UUID for database relations
        },
      },
    });
  } catch (error) {
    console.error('Error in orgProcedure:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
      cause: error,
    });
  }
});
