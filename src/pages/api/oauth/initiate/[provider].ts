import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { getOAuthUrl, getCallbackUrl, OAUTH_CONFIGS, type IntegrationType } from '../../../../lib/oauth-config';
import { randomBytes } from 'crypto';

/**
 * OAuth initiation endpoint
 * Redirects user to the OAuth provider's authorization page
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { provider } = req.query;

  // Validate provider
  if (!provider || typeof provider !== 'string' || !(provider in OAUTH_CONFIGS)) {
    return res.status(400).json({ error: 'Invalid provider' });
  }

  // Check authentication
  const auth = getAuth(req);
  if (!auth.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Generate state parameter for CSRF protection
    const state = randomBytes(32).toString('hex');

    // Store state in cookie for validation in callback
    res.setHeader('Set-Cookie', [
      `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
      `oauth_provider=${provider}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
      `oauth_user=${auth.userId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
    ]);

    // Get OAuth URL
    const redirectUri = getCallbackUrl(provider as IntegrationType);
    const authUrl = getOAuthUrl(provider as IntegrationType, redirectUri, state);

    // Redirect to OAuth provider
    res.redirect(authUrl);
  } catch (error) {
    console.error('OAuth initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate OAuth' });
  }
}
