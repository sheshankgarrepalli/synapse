/**
 * Integration Recommendations Logic
 *
 * Smart recommendations for which integrations users should connect next
 * based on their current integrations and usage patterns.
 */

export type IntegrationType = 'linear' | 'github' | 'figma' | 'slack';

export interface IntegrationRecommendation {
  integration: IntegrationType;
  reason: string;
  impact: 'high' | 'medium' | 'low';
  exampleThreads: string[];
  valueProp: {
    title: string;
    description: string;
    example: string;
  };
}

/**
 * Get recommended integrations based on what the user already has connected
 */
export function getRecommendedIntegrations(
  userIntegrations: IntegrationType[]
): IntegrationRecommendation[] {
  const recommendations: IntegrationRecommendation[] = [];

  // Linear + GitHub combo
  if (userIntegrations.includes('linear') && !userIntegrations.includes('github')) {
    recommendations.push({
      integration: 'github',
      reason: 'Auto-link PRs to Linear issues',
      impact: 'high',
      exampleThreads: ['Code Review', 'Feature Launch', 'Bug Fix'],
      valueProp: {
        title: 'Auto-link PRs to Issues',
        description: 'See which code changes are connected to which Linear issues—automatically.',
        example: 'LIN-123 → PR #456 → Deploy ✓',
      },
    });
  }

  if (userIntegrations.includes('github') && !userIntegrations.includes('linear')) {
    recommendations.push({
      integration: 'linear',
      reason: 'Link code to issues automatically',
      impact: 'high',
      exampleThreads: ['Code Review', 'Feature Launch', 'Bug Tracking'],
      valueProp: {
        title: 'Link Code to Issues',
        description: 'Track which PRs implement which issues and see feature progress.',
        example: 'PR #456 → LIN-123 → Merged & Deployed',
      },
    });
  }

  // Figma + GitHub combo
  if (userIntegrations.includes('figma') && !userIntegrations.includes('github')) {
    recommendations.push({
      integration: 'github',
      reason: 'Track design → code implementation',
      impact: 'high',
      exampleThreads: ['Design Review', 'Design-Code Drift', 'Feature Launch'],
      valueProp: {
        title: 'Track Design → Code',
        description: 'Know when designs are implemented and catch design-code drift early.',
        example: 'Figma "Onboarding v2" → PR #457 → Deployed',
      },
    });
  }

  if (userIntegrations.includes('github') && !userIntegrations.includes('figma')) {
    recommendations.push({
      integration: 'figma',
      reason: 'Detect design-code drift automatically',
      impact: 'high',
      exampleThreads: ['Design Review', 'Design-Code Drift', 'Component Library'],
      valueProp: {
        title: 'Detect Design-Code Drift',
        description: "Get alerts when designs are updated but code hasn't changed.",
        example: "⚠️ Design updated but code hasn't changed",
      },
    });
  }

  // Figma + Linear combo
  if (userIntegrations.includes('figma') && !userIntegrations.includes('linear')) {
    recommendations.push({
      integration: 'linear',
      reason: 'Connect designs to implementation tasks',
      impact: 'medium',
      exampleThreads: ['Design Review', 'Feature Launch', 'Design System'],
      valueProp: {
        title: 'Design Implementation Status',
        description: 'Track which designs have been assigned and implemented.',
        example: 'Figma "Dashboard" → LIN-234 → In Progress',
      },
    });
  }

  if (userIntegrations.includes('linear') && !userIntegrations.includes('figma')) {
    recommendations.push({
      integration: 'figma',
      reason: 'Know which designs are ready for dev',
      impact: 'medium',
      exampleThreads: ['Design Review', 'Feature Launch', 'Design System'],
      valueProp: {
        title: 'Connect Designs to Tasks',
        description: 'Know which designs are ready for dev and track design → dev → deploy.',
        example: 'Figma "Onboarding" → LIN-123 → Deployed',
      },
    });
  }

  // Slack (recommended after any 2+ integrations)
  if (userIntegrations.length >= 2 && !userIntegrations.includes('slack')) {
    recommendations.push({
      integration: 'slack',
      reason: 'Get notified when threads update',
      impact: 'medium',
      exampleThreads: ['All threads'],
      valueProp: {
        title: 'Get Notified of Changes',
        description: 'Receive alerts in Slack when threads update or drift is detected.',
        example: "💬 \"⚠️ Design updated but code hasn't changed\"",
      },
    });
  }

  // If user has only 1 integration, recommend completing the golden triangle
  if (userIntegrations.length === 1) {
    // Sort recommendations by impact (high first)
    recommendations.sort((a, b) => {
      const impactOrder = { high: 0, medium: 1, low: 2 };
      return impactOrder[a.impact] - impactOrder[b.impact];
    });
  }

  return recommendations;
}

/**
 * Get the next best integration to recommend
 */
export function getNextIntegration(
  userIntegrations: IntegrationType[]
): IntegrationRecommendation | null {
  const recommendations = getRecommendedIntegrations(userIntegrations);
  return recommendations.length > 0 ? recommendations[0] : null;
}

/**
 * Check if user should see integration prompt
 */
export function shouldShowIntegrationPrompt(
  userIntegrations: IntegrationType[],
  threadCount: number,
  lastDismissedAt?: Date
): boolean {
  // Don't show if user has all integrations
  if (userIntegrations.length >= 4) {
    return false;
  }

  // Don't show if user has no threads yet (hasn't seen value)
  if (threadCount === 0) {
    return false;
  }

  // Don't show if dismissed in last 7 days
  if (lastDismissedAt) {
    const daysSinceDismissed = (Date.now() - lastDismissedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDismissed < 7) {
      return false;
    }
  }

  // Show if user has 1-3 integrations and has created at least 1 thread
  return userIntegrations.length >= 1 && userIntegrations.length < 4 && threadCount >= 1;
}

/**
 * Get integration display name
 */
export function getIntegrationName(integration: IntegrationType): string {
  const names: Record<IntegrationType, string> = {
    linear: 'Linear',
    github: 'GitHub',
    figma: 'Figma',
    slack: 'Slack',
  };
  return names[integration];
}

/**
 * Get integration icon emoji
 */
export function getIntegrationIcon(integration: IntegrationType): string {
  const icons: Record<IntegrationType, string> = {
    linear: '📋',
    github: '💻',
    figma: '🎨',
    slack: '💬',
  };
  return icons[integration];
}

/**
 * Get capabilities unlocked when connecting a new integration
 * (used in celebration modal)
 */
export function getNewCapabilities(
  integration: IntegrationType,
  existingIntegrations: IntegrationType[]
): Array<{
  icon: string;
  title: string;
  description: string;
  action?: string;
}> {
  const capabilities: Array<{
    icon: string;
    title: string;
    description: string;
    action?: string;
  }> = [];

  // Base capability for the integration itself
  const baseCapabilities: Record<IntegrationType, typeof capabilities[0]> = {
    github: {
      icon: '💻',
      title: 'Track Code Changes',
      description: 'Automatically connect PRs, commits, and code reviews to your threads',
      action: 'View your repositories',
    },
    linear: {
      icon: '📋',
      title: 'Connect Issues & Tasks',
      description: 'Link Linear issues to designs and code automatically',
      action: 'Import your issues',
    },
    figma: {
      icon: '🎨',
      title: 'Track Design Files',
      description: 'Connect designs to implementation and detect drift',
      action: 'Browse your designs',
    },
    slack: {
      icon: '💬',
      title: 'Get Notifications',
      description: 'Receive updates when threads change or drift is detected',
      action: 'Configure notifications',
    },
  };

  capabilities.push(baseCapabilities[integration]);

  // Add combo capabilities based on existing integrations
  if (integration === 'github' && existingIntegrations.includes('linear')) {
    capabilities.push({
      icon: '🔗',
      title: 'Auto-link PRs to Issues',
      description: 'See which code changes implement which Linear issues',
    });
  }

  if (integration === 'github' && existingIntegrations.includes('figma')) {
    capabilities.push({
      icon: '⚠️',
      title: 'Detect Design-Code Drift',
      description: 'Get alerts when designs and code diverge',
    });
  }

  if (integration === 'figma' && existingIntegrations.includes('github')) {
    capabilities.push({
      icon: '🎯',
      title: 'Track Design Implementation',
      description: 'See which designs have been coded and deployed',
    });
  }

  if (integration === 'linear' && existingIntegrations.includes('figma')) {
    capabilities.push({
      icon: '📊',
      title: 'Design → Dev Pipeline',
      description: 'Track progress from design to implementation',
    });
  }

  if (integration === 'slack') {
    capabilities.push({
      icon: '🔔',
      title: 'Daily Digests',
      description: 'Get summaries of critical alerts and updates',
    });
  }

  return capabilities;
}
