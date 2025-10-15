import type { NextApiRequest, NextApiResponse } from 'next';
import { OAUTH_CONFIGS, type IntegrationType } from '../../../../lib/oauth-config';
import { prisma } from '../../../../lib/prisma';
import { setupGitHubWebhooksForIntegration } from '../../../../lib/github-webhooks';
import * as cookie from 'cookie';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * Encrypt sensitive tokens before storing in database
 */
function encryptToken(token: string): string {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  const iv = randomBytes(16);
  const cipher = createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * OAuth callback endpoint
 * Exchanges authorization code for access token and stores integration
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { provider, code, state, error } = req.query;

  // Handle OAuth error
  if (error) {
    console.error('OAuth error:', error);
    return res.redirect(`/integrations?error=${error}`);
  }

  // Validate required parameters
  if (!provider || typeof provider !== 'string' || !(provider in OAUTH_CONFIGS)) {
    return res.redirect('/integrations?error=invalid_provider');
  }

  if (!code || typeof code !== 'string') {
    return res.redirect('/integrations?error=missing_code');
  }

  if (!state || typeof state !== 'string') {
    return res.redirect('/integrations?error=missing_state');
  }

  try {
    // Parse cookies
    const cookies = cookie.parse(req.headers.cookie || '');
    const storedState = cookies.oauth_state;
    const storedProvider = cookies.oauth_provider;
    const storedUser = cookies.oauth_user;

    // Validate state (CSRF protection)
    if (!storedState || storedState !== state) {
      return res.redirect('/integrations?error=invalid_state');
    }

    // Validate provider matches
    if (storedProvider !== provider) {
      return res.redirect('/integrations?error=provider_mismatch');
    }

    // Validate user
    if (!storedUser) {
      return res.redirect('/integrations?error=unauthorized');
    }

    // Get OAuth config
    const config = OAUTH_CONFIGS[provider as IntegrationType];
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/oauth/callback/${provider}`;

    // Exchange code for access token
    const params = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: params.toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return res.redirect('/integrations?error=token_exchange_failed');
    }

    const tokenData = await tokenResponse.json();

    // Extract tokens
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in;

    if (!accessToken) {
      return res.redirect('/integrations?error=no_access_token');
    }

    // Encrypt tokens
    const encryptedAccessToken = encryptToken(accessToken);
    const encryptedRefreshToken = refreshToken ? encryptToken(refreshToken) : undefined;

    // Calculate token expiration
    const tokenExpiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000)
      : undefined;

    // Get user's organization and ID
    const user = await prisma.user.findUnique({
      where: { authProviderId: storedUser },
      select: {
        id: true,
        organizationId: true
      },
    });

    if (!user) {
      return res.redirect('/integrations?error=user_not_found');
    }

    // Get provider-specific user info
    let externalUserId: string | undefined;
    let externalWorkspaceId: string | undefined;

    if (provider === 'github') {
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        externalUserId = userData.id?.toString();
      }
    } else if (provider === 'slack') {
      externalUserId = tokenData.authed_user?.id;
      externalWorkspaceId = tokenData.team?.id;
    } else if (provider === 'linear') {
      const userResponse = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: '{ viewer { id } }',
        }),
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        externalUserId = userData.data?.viewer?.id;
      }
    }

    // Store integration in database
    await prisma.integration.upsert({
      where: {
        organizationId_integrationType: {
          organizationId: user.organizationId,
          integrationType: provider as any,
        },
      },
      create: {
        organizationId: user.organizationId,
        integrationType: provider as any,
        status: 'active',
        encryptedAccessToken,
        encryptedRefreshToken,
        tokenExpiresAt,
        externalUserId,
        externalWorkspaceId,
        scopes: [...config.scopes],
        connectedBy: user.id,
        connectedAt: new Date(),
      },
      update: {
        status: 'active',
        encryptedAccessToken,
        encryptedRefreshToken,
        tokenExpiresAt,
        externalUserId,
        externalWorkspaceId,
        scopes: [...config.scopes],
        connectedBy: user.id,
        connectedAt: new Date(),
        deletedAt: null,
      },
    });

    // Automatically setup webhooks for GitHub integration
    if (provider === 'github') {
      try {
        await setupGitHubWebhooksForIntegration(user.organizationId);
        console.log('✓ GitHub webhooks configured automatically');
      } catch (error) {
        console.error('Failed to setup GitHub webhooks:', error);
        // Don't fail the OAuth flow if webhook setup fails
        // User can manually trigger webhook setup later
      }
    }

    // Clear OAuth cookies
    res.setHeader('Set-Cookie', [
      'oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
      'oauth_provider=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
      'oauth_user=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    ]);

    // Redirect back to integrations page with success
    res.redirect('/integrations?success=true');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/integrations?error=callback_failed');
  }
}
