/**
 * Email Preferences Helper
 * Utilities for managing user email preferences for daily digest
 */

import { prisma } from '../prisma';
import { EmailPreferences, DEFAULT_EMAIL_PREFERENCES } from './digestTypes';

/**
 * Get email preferences for a user
 */
export async function getEmailPreferences(userId: string): Promise<EmailPreferences> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  const preferences = (user.preferences as any) || {};
  const emailPrefs = preferences.email || {};

  // Merge with defaults
  return {
    ...DEFAULT_EMAIL_PREFERENCES,
    ...emailPrefs,
  };
}

/**
 * Update email preferences for a user
 */
export async function updateEmailPreferences(
  userId: string,
  preferences: Partial<EmailPreferences>
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  const currentPrefs = (user.preferences as any) || {};
  const currentEmailPrefs = currentPrefs.email || {};

  const updatedPrefs = {
    ...currentPrefs,
    email: {
      ...currentEmailPrefs,
      ...preferences,
    },
  };

  await prisma.user.update({
    where: { id: userId },
    data: { preferences: updatedPrefs },
  });
}

/**
 * Enable digest for a user
 */
export async function enableDigest(userId: string): Promise<void> {
  await updateEmailPreferences(userId, {
    digestEnabled: true,
    digestFrequency: 'daily',
  });
}

/**
 * Disable digest for a user
 */
export async function disableDigest(userId: string): Promise<void> {
  await updateEmailPreferences(userId, {
    digestEnabled: false,
    digestFrequency: 'off',
  });
}

/**
 * Update digest frequency
 */
export async function setDigestFrequency(
  userId: string,
  frequency: 'daily' | 'weekly' | 'off'
): Promise<void> {
  await updateEmailPreferences(userId, {
    digestFrequency: frequency,
    digestEnabled: frequency !== 'off',
  });
}

/**
 * Update digest time (HH:MM format)
 */
export async function setDigestTime(userId: string, time: string): Promise<void> {
  // Validate time format
  if (!/^\d{2}:\d{2}$/.test(time)) {
    throw new Error('Invalid time format. Use HH:MM (e.g., "09:00")');
  }

  const [hours, minutes] = time.split(':').map(Number);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error('Invalid time. Hours must be 0-23, minutes must be 0-59');
  }

  await updateEmailPreferences(userId, {
    digestTime: time,
  });
}

/**
 * Update timezone
 */
export async function setTimezone(userId: string, timezone: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  const currentPrefs = (user.preferences as any) || {};

  await prisma.user.update({
    where: { id: userId },
    data: {
      preferences: {
        ...currentPrefs,
        timezone,
      },
    },
  });
}

/**
 * Get unsubscribe token for a user (for unsubscribe links)
 */
export function generateUnsubscribeToken(userId: string, email: string): string {
  // In production, use a proper token generation method (JWT, signed token, etc.)
  // For now, use a simple base64 encoding (NOT SECURE - replace in production)
  const data = JSON.stringify({ userId, email, timestamp: Date.now() });
  return Buffer.from(data).toString('base64url');
}

/**
 * Verify and decode unsubscribe token
 */
export function verifyUnsubscribeToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const data = JSON.parse(decoded);

    // Check if token is not too old (30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    if (data.timestamp < thirtyDaysAgo) {
      return null;
    }

    return { userId: data.userId, email: data.email };
  } catch {
    return null;
  }
}

/**
 * Handle unsubscribe request
 */
export async function handleUnsubscribe(token: string): Promise<boolean> {
  const decoded = verifyUnsubscribeToken(token);
  if (!decoded) {
    return false;
  }

  await disableDigest(decoded.userId);
  return true;
}
