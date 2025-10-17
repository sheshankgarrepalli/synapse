/**
 * Settings Router
 * Manage organization and user settings
 */

import { z } from 'zod';
import { createTRPCRouter, orgProcedure } from '../trpc';
import { logger } from '@/lib/logger';

export const settingsRouter = createTRPCRouter({
  /**
   * Get organization settings
   */
  getOrganizationSettings: orgProcedure.query(async ({ ctx }) => {
    const organization = await ctx.prisma.organization.findUnique({
      where: { id: ctx.session.organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        settings: true,
      },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    const settings = organization.settings as any || {};

    return {
      organizationId: organization.id,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      // Drift Detection Settings
      driftDetectionEnabled: settings.driftDetectionEnabled !== false, // Default: true
      driftDetectionSeverityThreshold: settings.driftDetectionSeverityThreshold || 'medium',
      driftDetectionAutoCreateIssues: settings.driftDetectionAutoCreateIssues !== false, // Default: true
      driftDetectionNotifications: settings.driftDetectionNotifications !== false, // Default: true
      // Auto-Threading Settings
      autoThreadingEnabled: settings.autoThreadingEnabled !== false, // Default: true
      autoThreadingMinConfidence: settings.autoThreadingMinConfidence || 0.7,
      // Notification Settings
      emailNotificationsEnabled: settings.emailNotificationsEnabled !== false, // Default: true
      slackNotificationsEnabled: settings.slackNotificationsEnabled || false,
      // Intelligence Feed Settings
      intelligenceFeedEnabled: settings.intelligenceFeedEnabled !== false, // Default: true
    };
  }),

  /**
   * Update organization settings
   */
  updateOrganizationSettings: orgProcedure
    .input(
      z.object({
        driftDetectionEnabled: z.boolean().optional(),
        driftDetectionSeverityThreshold: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        driftDetectionAutoCreateIssues: z.boolean().optional(),
        driftDetectionNotifications: z.boolean().optional(),
        autoThreadingEnabled: z.boolean().optional(),
        autoThreadingMinConfidence: z.number().min(0).max(1).optional(),
        emailNotificationsEnabled: z.boolean().optional(),
        slackNotificationsEnabled: z.boolean().optional(),
        intelligenceFeedEnabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const organization = await ctx.prisma.organization.findUnique({
        where: { id: ctx.session.organizationId },
        select: { settings: true },
      });

      if (!organization) {
        throw new Error('Organization not found');
      }

      const currentSettings = organization.settings as any || {};
      const updatedSettings = {
        ...currentSettings,
        ...input,
      };

      await ctx.prisma.organization.update({
        where: { id: ctx.session.organizationId },
        data: {
          settings: updatedSettings,
        },
      });

      logger.info('Organization settings updated', {
        organizationId: ctx.session.organizationId,
        updatedFields: Object.keys(input),
      });

      return {
        success: true,
        settings: updatedSettings,
      };
    }),

  /**
   * Get user preferences
   */
  getUserPreferences: orgProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.userId },
      select: {
        preferences: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const preferences = user.preferences as any || {};

    return {
      // Notification Preferences
      emailNotifications: preferences.emailNotifications !== false,
      mentionNotifications: preferences.mentionNotifications !== false,
      threadActivityNotifications: preferences.threadActivityNotifications !== false,
      driftAlertNotifications: preferences.driftAlertNotifications !== false,
      // UI Preferences
      defaultView: preferences.defaultView || 'intelligence',
      compactMode: preferences.compactMode || false,
      theme: preferences.theme || 'dark',
    };
  }),

  /**
   * Update user preferences
   */
  updateUserPreferences: orgProcedure
    .input(
      z.object({
        emailNotifications: z.boolean().optional(),
        mentionNotifications: z.boolean().optional(),
        threadActivityNotifications: z.boolean().optional(),
        driftAlertNotifications: z.boolean().optional(),
        defaultView: z.enum(['intelligence', 'threads', 'activity']).optional(),
        compactMode: z.boolean().optional(),
        theme: z.enum(['light', 'dark', 'system']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.userId },
        select: { preferences: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const currentPreferences = user.preferences as any || {};
      const updatedPreferences = {
        ...currentPreferences,
        ...input,
      };

      await ctx.prisma.user.update({
        where: { id: ctx.session.userId },
        data: {
          preferences: updatedPreferences,
        },
      });

      logger.info('User preferences updated', {
        userId: ctx.session.userId,
        updatedFields: Object.keys(input),
      });

      return {
        success: true,
        preferences: updatedPreferences,
      };
    }),
});
