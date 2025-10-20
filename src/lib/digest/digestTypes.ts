/**
 * Daily Digest Email Types
 * Types for digest data structure, alerts, warnings, and good news
 */

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';
export type AlertType = 'drift_detected' | 'blocked_pr' | 'stuck_pr' | 'stale_thread' | 'missing_connection';
export type GoodNewsType = 'pr_merged' | 'feature_deployed' | 'issue_completed' | 'thread_completed';

export interface DigestAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  threadId?: string;
  threadTitle?: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface DigestWarning {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  threadId?: string;
  threadTitle?: string;
  actionUrl?: string;
  actionLabel?: string;
  daysSince?: number;
  metadata?: Record<string, any>;
}

export interface DigestGoodNews {
  id: string;
  type: GoodNewsType;
  title: string;
  description: string;
  threadId?: string;
  threadTitle?: string;
  url?: string;
  metadata?: Record<string, any>;
  completedAt: Date;
}

export interface ThreadSummary {
  id: string;
  title: string;
  status: string;
  designCount: number;
  prCount: number;
  issueCount: number;
  slackCount: number;
  lastActivityAt: Date;
  url: string;
}

export interface DailyDigestData {
  user: {
    id: string;
    firstName: string;
    email: string;
    timezone?: string;
  };
  organization: {
    id: string;
    name: string;
  };
  date: Date;
  alerts: DigestAlert[];
  warnings: DigestWarning[];
  goodNews: DigestGoodNews[];
  activeThreads: ThreadSummary[];
  stats: {
    totalThreads: number;
    activeThreads: number;
    completedThisWeek: number;
    totalAlerts: number;
  };
}

export interface DigestEmailProps {
  data: DailyDigestData;
  unsubscribeUrl: string;
  preferencesUrl: string;
  viewInBrowserUrl?: string;
}

export interface EmailPreferences {
  digestEnabled: boolean;
  digestFrequency: 'daily' | 'weekly' | 'off';
  digestTime: string; // HH:MM format (e.g., "09:00")
  timezone: string;
  includeAlerts: boolean;
  includeWarnings: boolean;
  includeGoodNews: boolean;
  includeThreadSummary: boolean;
  minAlertSeverity: AlertSeverity;
}

export const DEFAULT_EMAIL_PREFERENCES: EmailPreferences = {
  digestEnabled: true,
  digestFrequency: 'daily',
  digestTime: '09:00',
  timezone: 'America/New_York',
  includeAlerts: true,
  includeWarnings: true,
  includeGoodNews: true,
  includeThreadSummary: true,
  minAlertSeverity: 'warning',
};
