import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuth, clerkClient } from '@clerk/nextjs/server';

/**
 * CREATE CONTEXT
 *
 * This is the context that is passed to all tRPC procedures.
 * It includes the database client and the request/response objects.
 */
export const createTRPCContext = (opts: CreateNextContextOptions) => {
  // Return req and res so we can access them in middleware
  return {
    prisma,
    req: opts.req,
    res: opts.res,
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
  // Get auth from request object
  const auth = getAuth(ctx.req);

  if (!auth.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      ...ctx,
      session: {
        userId: auth.userId,
        organizationId: auth.orgId || null,
      },
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

        // Fetch user data from Clerk
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

        user = await ctx.prisma.user.create({
          data: {
            authProviderId: ctx.session.userId,
            organizationId: organization.id,
            email: userEmail,
            fullName: userFullName,
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
        // Fetch user data from Clerk
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

        user = await ctx.prisma.user.create({
          data: {
            authProviderId: ctx.session.userId,
            organizationId: organization.id,
            email: userEmail,
            fullName: userFullName,
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
