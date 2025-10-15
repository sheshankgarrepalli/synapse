import { z } from 'zod';
import { createTRPCRouter, orgProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import {
  setupGitHubWebhooksForIntegration,
  refreshGitHubWebhooks,
  removeGitHubWebhooksForIntegration,
} from '@/lib/github-webhooks';

export const integrationsRouter = createTRPCRouter({
  /**
   * List all integrations for organization
   */
  list: orgProcedure.query(async ({ ctx }) => {
    const integrations = await ctx.prisma.integration.findMany({
      where: {
        organizationId: ctx.session.organizationId,
        deletedAt: null,
      },
      select: {
        id: true,
        integrationType: true,
        status: true,
        lastSyncAt: true,
        connectedAt: true,
        connector: {
          select: { fullName: true, avatarUrl: true },
        },
      },
    });

    return integrations;
  }),

  /**
   * Get integration status
   */
  getStatus: orgProcedure
    .input(
      z.object({
        integrationType: z.enum([
          'figma',
          'linear',
          'github',
          'slack',
          'notion',
          'zoom',
          'dovetail',
          'mixpanel',
        ]),
      })
    )
    .query(async ({ ctx, input }) => {
      const integration = await ctx.prisma.integration.findUnique({
        where: {
          organizationId_integrationType: {
            organizationId: ctx.session.organizationId,
            integrationType: input.integrationType,
          },
        },
      });

      return integration || null;
    }),

  /**
   * Connect new integration
   */
  connect: orgProcedure
    .input(
      z.object({
        integrationType: z.enum([
          'figma',
          'linear',
          'github',
          'slack',
          'notion',
          'zoom',
          'dovetail',
          'mixpanel',
        ]),
        encryptedAccessToken: z.string().optional(),
        encryptedRefreshToken: z.string().optional(),
        tokenExpiresAt: z.date().optional(),
        externalUserId: z.string().optional(),
        externalWorkspaceId: z.string().optional(),
        scopes: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if integration already exists
      const existing = await ctx.prisma.integration.findUnique({
        where: {
          organizationId_integrationType: {
            organizationId: ctx.session.organizationId,
            integrationType: input.integrationType,
          },
        },
      });

      if (existing && existing.status !== 'revoked') {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Integration already connected',
        });
      }

      // Create or update integration
      const integration = await ctx.prisma.integration.upsert({
        where: {
          organizationId_integrationType: {
            organizationId: ctx.session.organizationId,
            integrationType: input.integrationType,
          },
        },
        create: {
          organizationId: ctx.session.organizationId,
          integrationType: input.integrationType,
          status: 'active',
          encryptedAccessToken: input.encryptedAccessToken,
          encryptedRefreshToken: input.encryptedRefreshToken,
          tokenExpiresAt: input.tokenExpiresAt,
          externalUserId: input.externalUserId,
          externalWorkspaceId: input.externalWorkspaceId,
          scopes: input.scopes || [],
          connectedBy: ctx.session.internalUserId,
          connectedAt: new Date(),
        },
        update: {
          status: 'active',
          encryptedAccessToken: input.encryptedAccessToken,
          encryptedRefreshToken: input.encryptedRefreshToken,
          tokenExpiresAt: input.tokenExpiresAt,
          externalUserId: input.externalUserId,
          externalWorkspaceId: input.externalWorkspaceId,
          scopes: input.scopes || [],
          connectedBy: ctx.session.internalUserId,
          connectedAt: new Date(),
          deletedAt: null,
        },
      });

      return integration;
    }),

  /**
   * Disconnect integration
   */
  disconnect: orgProcedure
    .input(
      z.object({
        integrationType: z.enum([
          'figma',
          'linear',
          'github',
          'slack',
          'notion',
          'zoom',
          'dovetail',
          'mixpanel',
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const integration = await ctx.prisma.integration.findUnique({
        where: {
          organizationId_integrationType: {
            organizationId: ctx.session.organizationId,
            integrationType: input.integrationType,
          },
        },
      });

      if (!integration) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      // Remove webhooks if GitHub integration
      if (input.integrationType === 'github') {
        try {
          await removeGitHubWebhooksForIntegration(ctx.session.organizationId);
        } catch (error) {
          console.error('Failed to remove GitHub webhooks:', error);
          // Continue with disconnection even if webhook removal fails
        }
      }

      await ctx.prisma.integration.update({
        where: { id: integration.id },
        data: {
          status: 'revoked',
          deletedAt: new Date(),
          encryptedAccessToken: null,
          encryptedRefreshToken: null,
          metadata: {},
        },
      });

      return { success: true };
    }),

  /**
   * Setup webhooks for GitHub integration (manual trigger)
   */
  setupWebhooks: orgProcedure.mutation(async ({ ctx }) => {
    try {
      await setupGitHubWebhooksForIntegration(ctx.session.organizationId);
      return { success: true, message: 'Webhooks configured successfully' };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to setup webhooks',
      });
    }
  }),

  /**
   * Refresh/sync GitHub webhooks
   */
  refreshWebhooks: orgProcedure.mutation(async ({ ctx }) => {
    try {
      await refreshGitHubWebhooks(ctx.session.organizationId);
      return { success: true, message: 'Webhooks refreshed successfully' };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to refresh webhooks',
      });
    }
  }),

  /**
   * Get webhook status for GitHub integration
   */
  getWebhookStatus: orgProcedure.query(async ({ ctx }) => {
    const integration = await ctx.prisma.integration.findFirst({
      where: {
        organizationId: ctx.session.organizationId,
        integrationType: 'github',
        status: 'active',
        deletedAt: null,
      },
    });

    if (!integration) {
      return { configured: false, webhooks: [] };
    }

    const metadata = integration.metadata as any;
    const webhooks = metadata?.webhooks || [];

    return {
      configured: webhooks.length > 0,
      webhooks,
      configuredAt: metadata?.webhooksConfiguredAt,
    };
  }),

  /**
   * Get GitHub repositories accessible to the user
   */
  getGitHubRepositories: orgProcedure.query(async ({ ctx }) => {
    const integration = await ctx.prisma.integration.findFirst({
      where: {
        organizationId: ctx.session.organizationId,
        integrationType: 'github',
        status: 'active',
        deletedAt: null,
      },
    });

    if (!integration || !integration.encryptedAccessToken) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'GitHub integration not connected' });
    }

    // Import decryptToken function
    const { decryptToken } = await import('@/lib/github-webhooks');
    const accessToken = decryptToken(integration.encryptedAccessToken);

    // Fetch repositories from GitHub
    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch repositories' });
    }

    const repos = await response.json();
    return repos;
  }),

  /**
   * Get connected repositories (with webhooks enabled)
   */
  getConnectedRepositories: orgProcedure.query(async ({ ctx }) => {
    const integration = await ctx.prisma.integration.findFirst({
      where: {
        organizationId: ctx.session.organizationId,
        integrationType: 'github',
        status: 'active',
        deletedAt: null,
      },
    });

    if (!integration) {
      return [];
    }

    const metadata = integration.metadata as any;
    const webhooks = metadata?.webhooks || [];

    return webhooks.filter((w: any) => w.type === 'repository');
  }),

  /**
   * Connect a GitHub repository (create webhook)
   */
  connectRepository: orgProcedure
    .input(z.object({ repositoryFullName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const integration = await ctx.prisma.integration.findFirst({
        where: {
          organizationId: ctx.session.organizationId,
          integrationType: 'github',
          status: 'active',
          deletedAt: null,
        },
      });

      if (!integration || !integration.encryptedAccessToken) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const { decryptToken, createGitHubWebhook } = await import('@/lib/github-webhooks');
      const accessToken = decryptToken(integration.encryptedAccessToken);

      const [owner, repo] = input.repositoryFullName.split('/');

      try {
        const webhook = await createGitHubWebhook(accessToken, owner, repo);

        // Add to metadata
        const metadata = (integration.metadata as any) || {};
        const webhooks = metadata.webhooks || [];

        webhooks.push({
          type: 'repository',
          name: input.repositoryFullName,
          webhookId: webhook.id,
        });

        await ctx.prisma.integration.update({
          where: { id: integration.id },
          data: {
            metadata: {
              ...metadata,
              webhooks,
              lastWebhookUpdate: new Date().toISOString(),
            },
          },
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create webhook',
        });
      }
    }),

  /**
   * Disconnect a GitHub repository (remove webhook)
   */
  disconnectRepository: orgProcedure
    .input(z.object({ repositoryFullName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const integration = await ctx.prisma.integration.findFirst({
        where: {
          organizationId: ctx.session.organizationId,
          integrationType: 'github',
          status: 'active',
          deletedAt: null,
        },
      });

      if (!integration || !integration.encryptedAccessToken) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const { decryptToken, deleteGitHubWebhook } = await import('@/lib/github-webhooks');
      const accessToken = decryptToken(integration.encryptedAccessToken);

      const metadata = (integration.metadata as any) || {};
      const webhooks = metadata.webhooks || [];

      const webhook = webhooks.find(
        (w: any) => w.type === 'repository' && w.name === input.repositoryFullName
      );

      if (!webhook) {
        return { success: true }; // Already disconnected
      }

      const [owner, repo] = input.repositoryFullName.split('/');

      try {
        await deleteGitHubWebhook(accessToken, owner, repo, webhook.webhookId);

        // Remove from metadata
        const updatedWebhooks = webhooks.filter(
          (w: any) => !(w.type === 'repository' && w.name === input.repositoryFullName)
        );

        await ctx.prisma.integration.update({
          where: { id: integration.id },
          data: {
            metadata: {
              ...metadata,
              webhooks: updatedWebhooks,
              lastWebhookUpdate: new Date().toISOString(),
            },
          },
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to remove webhook',
        });
      }
    }),
});
