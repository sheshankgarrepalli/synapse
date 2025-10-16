/**
 * Mixpanel Integration Service
 * Queries Mixpanel analytics data and creates connected items for significant events
 */

import { logger } from '../logger';

export interface MixpanelEvent {
  event: string;
  properties: Record<string, any>;
}

export interface MixpanelInsight {
  type: 'funnel' | 'retention' | 'event' | 'custom';
  name: string;
  value: number;
  change?: number;
  description: string;
  url?: string;
}

export class MixpanelService {
  private apiKey: string;
  private apiSecret: string;
  private projectId: string;

  constructor(config: { apiKey: string; apiSecret: string; projectId: string }) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.projectId = config.projectId;
  }

  /**
   * Get authentication headers for Mixpanel API
   */
  private getAuthHeaders(): Record<string, string> {
    const credentials = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64');
    return {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Query Mixpanel API
   */
  private async query(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const queryString = new URLSearchParams(params).toString();
    const url = `https://mixpanel.com/api/2.0/${endpoint}?${queryString}`;

    try {
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Mixpanel API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Mixpanel API query failed', { endpoint, error });
      throw error;
    }
  }

  /**
   * Get events for a date range
   */
  async getEvents(options: {
    event: string;
    fromDate: string; // YYYY-MM-DD
    toDate: string; // YYYY-MM-DD
    unit?: 'hour' | 'day' | 'week' | 'month';
  }): Promise<any> {
    return this.query('events', {
      event: JSON.stringify([options.event]),
      type: 'general',
      unit: options.unit || 'day',
      from_date: options.fromDate,
      to_date: options.toDate,
    });
  }

  /**
   * Get funnel data
   */
  async getFunnel(options: {
    funnelId: number;
    fromDate: string;
    toDate: string;
  }): Promise<any> {
    return this.query(`funnels/${options.funnelId}`, {
      from_date: options.fromDate,
      to_date: options.toDate,
    });
  }

  /**
   * Get retention data
   */
  async getRetention(options: {
    fromDate: string;
    toDate: string;
    retentionType?: string;
  }): Promise<any> {
    return this.query('retention', {
      from_date: options.fromDate,
      to_date: options.toDate,
      retention_type: options.retentionType || 'compounding',
    });
  }

  /**
   * Detect significant insights from analytics data
   * Returns insights that should be surfaced to product teams
   */
  async detectSignificantInsights(options: {
    fromDate: string;
    toDate: string;
    thresholds?: {
      minEventCount?: number;
      minFunnelDrop?: number;
      minRetentionChange?: number;
    };
  }): Promise<MixpanelInsight[]> {
    const insights: MixpanelInsight[] = [];
    const thresholds = options.thresholds || {
      minEventCount: 100,
      minFunnelDrop: 0.2, // 20% drop
      minRetentionChange: 0.1, // 10% change
    };

    try {
      // Check for high-volume events (potential viral features)
      const topEvents = await this.getTopEvents(options.fromDate, options.toDate);
      for (const event of topEvents) {
        if (event.count >= thresholds.minEventCount!) {
          insights.push({
            type: 'event',
            name: event.name,
            value: event.count,
            description: `High-volume event: ${event.name} (${event.count} occurrences)`,
            url: `https://mixpanel.com/report/${this.projectId}/insights`,
          });
        }
      }

      // TODO: Add funnel drop-off detection
      // TODO: Add retention change detection
      // TODO: Add conversion rate changes

      logger.info('Mixpanel insights detected', {
        insightCount: insights.length,
        dateRange: `${options.fromDate} to ${options.toDate}`,
      });

      return insights;
    } catch (error) {
      logger.error('Failed to detect Mixpanel insights', { error });
      return [];
    }
  }

  /**
   * Get top events by volume
   */
  private async getTopEvents(
    fromDate: string,
    toDate: string,
    limit: number = 10
  ): Promise<Array<{ name: string; count: number }>> {
    try {
      const response = await this.query('events/top', {
        type: 'general',
        from_date: fromDate,
        to_date: toDate,
        limit,
      });

      // Parse Mixpanel response format
      return Object.entries(response || {}).map(([name, count]) => ({
        name,
        count: count as number,
      }));
    } catch (error) {
      logger.error('Failed to get top events', { error });
      return [];
    }
  }

  /**
   * Create a tracking event for a user action
   * This sends data TO Mixpanel (for tracking Synapse usage)
   */
  async track(options: {
    distinctId: string;
    event: string;
    properties?: Record<string, any>;
  }): Promise<void> {
    try {
      const payload = {
        event: options.event,
        properties: {
          distinct_id: options.distinctId,
          token: this.apiKey,
          time: Date.now(),
          ...options.properties,
        },
      };

      await fetch('https://api.mixpanel.com/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([payload]),
      });

      logger.info('Mixpanel event tracked', {
        event: options.event,
        distinctId: options.distinctId,
      });
    } catch (error) {
      logger.error('Failed to track Mixpanel event', { error });
    }
  }
}

/**
 * Helper function to create Mixpanel service from integration credentials
 */
export async function createMixpanelService(
  credentials: Record<string, any>
): Promise<MixpanelService> {
  return new MixpanelService({
    apiKey: credentials.apiKey,
    apiSecret: credentials.apiSecret,
    projectId: credentials.projectId,
  });
}

/**
 * Format Mixpanel insight as a user-friendly description
 */
export function formatInsightDescription(insight: MixpanelInsight): string {
  switch (insight.type) {
    case 'event':
      return `${insight.value.toLocaleString()} users triggered "${insight.name}"`;
    case 'funnel':
      return `${insight.name}: ${(insight.value * 100).toFixed(1)}% conversion`;
    case 'retention':
      return `${insight.name}: ${(insight.value * 100).toFixed(1)}% retention`;
    case 'custom':
      return insight.description;
    default:
      return insight.description;
  }
}
