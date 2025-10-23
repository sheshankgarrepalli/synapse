/**
 * Drift Detection Service
 * Checks for design-code drift between Figma and GitHub
 */

import { PrismaClient } from '@prisma/client';
import { FigmaClient } from '@/lib/integrations/figma-client';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

interface DriftChange {
  property: string;
  oldValue: any;
  newValue: any;
  severity: 'low' | 'medium' | 'high';
}

export class DriftDetectionService {
  /**
   * Check all active drift watches
   */
  static async checkAllWatches() {
    const watches = await prisma.driftWatch.findMany({
      where: {
        isActive: true,
      },
      include: {
        organization: true,
      },
    });

    logger.info('Checking drift watches', { count: watches.length });

    const results = await Promise.allSettled(
      watches.map((watch) => this.checkWatch(watch.id))
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    logger.info('Drift check complete', { successful, failed });

    return { successful, failed, total: watches.length };
  }

  /**
   * Check a specific drift watch
   */
  static async checkWatch(watchId: string) {
    const watch = await prisma.driftWatch.findUnique({
      where: { id: watchId },
      include: { organization: true },
    });

    if (!watch || !watch.isActive) {
      return;
    }

    try {
      logger.info('Checking drift watch', {
        watchId,
        figmaFile: watch.figmaFileName,
        githubRepo: watch.githubRepoName,
      });

      // Get Figma access token
      const figmaIntegration = await prisma.integration.findUnique({
        where: {
          organizationId_integrationType: {
            organizationId: watch.organizationId,
            integrationType: 'figma',
          },
        },
      });

      if (!figmaIntegration?.encryptedAccessToken) {
        await this.updateWatchError(watchId, 'Figma integration not connected');
        return;
      }

      // Fetch current Figma data
      const figmaClient = new FigmaClient(figmaIntegration.encryptedAccessToken);
      const nodeData = await figmaClient.getFileNodes(watch.figmaFileId, [
        watch.figmaComponentId,
      ]);

      const node = nodeData[watch.figmaComponentId];
      if (!node) {
        await this.updateWatchError(watchId, 'Figma component not found');
        return;
      }

      // Extract current properties
      const currentProps = figmaClient.extractDesignProperties(node.document);

      // Compare with snapshot
      const changes = this.compareProperties(watch.snapshot as any, currentProps);

      if (changes.length > 0) {
        // Drift detected!
        await this.createDriftAlert(watchId, changes);
        await prisma.driftWatch.update({
          where: { id: watchId },
          data: {
            status: 'drift_detected',
            lastCheckedAt: new Date(),
          },
        });

        logger.info('Drift detected', {
          watchId,
          changeCount: changes.length,
        });

        // Send Slack alert if configured
        if (watch.alertOnDrift && watch.slackWebhookUrl) {
          await this.sendSlackAlert(watch, changes);
        }
      } else {
        // No drift - update watch as healthy
        await prisma.driftWatch.update({
          where: { id: watchId },
          data: {
            status: 'healthy',
            lastCheckedAt: new Date(),
            lastHealthyAt: new Date(),
          },
        });

        logger.info('No drift detected', { watchId });
      }
    } catch (error: any) {
      logger.error('Drift check failed', {
        watchId,
        error: error.message,
      });

      await this.updateWatchError(watchId, error.message);
    }
  }

  /**
   * Compare properties and detect changes
   */
  private static compareProperties(
    oldProps: Record<string, any>,
    newProps: Record<string, any>
  ): DriftChange[] {
    const changes: DriftChange[] = [];

    // Compare fills (colors)
    if (JSON.stringify(oldProps.fills) !== JSON.stringify(newProps.fills)) {
      changes.push({
        property: 'fills',
        oldValue: oldProps.fills,
        newValue: newProps.fills,
        severity: 'medium',
      });
    }

    // Compare background color
    if (oldProps.backgroundColor !== newProps.backgroundColor) {
      changes.push({
        property: 'backgroundColor',
        oldValue: oldProps.backgroundColor,
        newValue: newProps.backgroundColor,
        severity: 'medium',
      });
    }

    // Compare corner radius
    if (oldProps.cornerRadius !== newProps.cornerRadius) {
      changes.push({
        property: 'cornerRadius',
        oldValue: oldProps.cornerRadius,
        newValue: newProps.cornerRadius,
        severity: 'low',
      });
    }

    // Compare layout (spacing, padding)
    if (JSON.stringify(oldProps.layout) !== JSON.stringify(newProps.layout)) {
      changes.push({
        property: 'layout',
        oldValue: oldProps.layout,
        newValue: newProps.layout,
        severity: 'medium',
      });
    }

    // Compare typography
    if (JSON.stringify(oldProps.typography) !== JSON.stringify(newProps.typography)) {
      changes.push({
        property: 'typography',
        oldValue: oldProps.typography,
        newValue: newProps.typography,
        severity: 'medium',
      });
    }

    // Compare size
    if (JSON.stringify(oldProps.size) !== JSON.stringify(newProps.size)) {
      changes.push({
        property: 'size',
        oldValue: oldProps.size,
        newValue: newProps.size,
        severity: 'low',
      });
    }

    return changes;
  }

  /**
   * Create a drift alert
   */
  private static async createDriftAlert(watchId: string, changes: DriftChange[]) {
    const severity = changes.some((c) => c.severity === 'high')
      ? 'high'
      : changes.some((c) => c.severity === 'medium')
      ? 'medium'
      : 'low';

    await prisma.driftAlert.create({
      data: {
        watchId,
        changes,
        changeCount: changes.length,
        severity,
        acknowledged: false,
        slackSent: false,
      },
    });
  }

  /**
   * Send Slack alert
   */
  private static async sendSlackAlert(
    watch: any,
    changes: DriftChange[]
  ): Promise<void> {
    if (!watch.slackWebhookUrl) return;

    try {
      const changeList = changes
        .map((c) => `• *${c.property}* changed`)
        .join('\n');

      const payload = {
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🚨 Design-Code Drift Detected',
              emoji: true,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Figma Component:*\n${watch.figmaComponentName}`,
              },
              {
                type: 'mrkdwn',
                text: `*GitHub File:*\n${watch.githubFilePath}`,
              },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Changes Detected (${changes.length}):*\n${changeList}`,
            },
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View in Synapse',
                  emoji: true,
                },
                url: `${process.env.NEXT_PUBLIC_APP_URL}/drift/${watch.id}`,
                style: 'primary',
              },
            ],
          },
        ],
      };

      const response = await fetch(watch.slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status}`);
      }

      // Mark alert as sent
      const alert = await prisma.driftAlert.findFirst({
        where: { watchId: watch.id },
        orderBy: { detectedAt: 'desc' },
      });

      if (alert) {
        await prisma.driftAlert.update({
          where: { id: alert.id },
          data: {
            slackSent: true,
            slackSentAt: new Date(),
          },
        });
      }

      logger.info('Slack alert sent', { watchId: watch.id });
    } catch (error: any) {
      logger.error('Failed to send Slack alert', {
        watchId: watch.id,
        error: error.message,
      });
    }
  }

  /**
   * Update watch with error status
   */
  private static async updateWatchError(watchId: string, errorMessage: string) {
    await prisma.driftWatch.update({
      where: { id: watchId },
      data: {
        status: 'error',
        lastCheckedAt: new Date(),
      },
    });
  }
}
