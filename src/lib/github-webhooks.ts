import { prisma } from './prisma';
import { createDecipheriv } from 'crypto';

/**
 * Decrypt stored access token
 */
export function decryptToken(encryptedToken: string): string {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

  const parts = encryptedToken.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Create webhook in GitHub repository
 */
export async function createGitHubWebhook(
  accessToken: string,
  owner: string,
  repo: string
): Promise<{ id: number; url: string }> {
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/github`;
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET!;

  // Check if running locally (localhost URL)
  const isLocalhost = webhookUrl.includes('localhost') || webhookUrl.includes('127.0.0.1');

  if (isLocalhost) {
    throw new Error(
      'LOCALHOST_NOT_SUPPORTED: GitHub webhooks require a publicly accessible URL. ' +
      'For local development, use ngrok or a similar tunneling service. ' +
      'Set NEXT_PUBLIC_APP_URL in your .env file to your public URL (e.g., https://abc123.ngrok.io)'
    );
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/hooks`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'web',
        active: true,
        events: ['issues', 'pull_request', 'push', 'issue_comment'],
        config: {
          url: webhookUrl,
          content_type: 'json',
          secret: webhookSecret,
          insecure_ssl: '0',
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create webhook: ${error}`);
  }

  const webhook = await response.json();
  return {
    id: webhook.id,
    url: webhook.config.url,
  };
}

/**
 * Create organization-level webhook (for all repositories)
 */
export async function createGitHubOrgWebhook(
  accessToken: string,
  org: string
): Promise<{ id: number; url: string }> {
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/github`;
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET!;

  // Check if running locally (localhost URL)
  const isLocalhost = webhookUrl.includes('localhost') || webhookUrl.includes('127.0.0.1');

  if (isLocalhost) {
    throw new Error(
      'LOCALHOST_NOT_SUPPORTED: GitHub webhooks require a publicly accessible URL. ' +
      'For local development, use ngrok or a similar tunneling service. ' +
      'Set NEXT_PUBLIC_APP_URL in your .env file to your public URL (e.g., https://abc123.ngrok.io)'
    );
  }

  const response = await fetch(`https://api.github.com/orgs/${org}/hooks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'web',
      active: true,
      events: ['issues', 'pull_request', 'push', 'issue_comment'],
      config: {
        url: webhookUrl,
        content_type: 'json',
        secret: webhookSecret,
        insecure_ssl: '0',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create organization webhook: ${error}`);
  }

  const webhook = await response.json();
  return {
    id: webhook.id,
    url: webhook.config.url,
  };
}

/**
 * Get user's GitHub organizations
 */
export async function getGitHubOrganizations(accessToken: string): Promise<string[]> {
  const response = await fetch('https://api.github.com/user/orgs', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch organizations');
  }

  const orgs = await response.json();
  return orgs.map((org: any) => org.login);
}

/**
 * Check if user has admin access to organization
 */
export async function hasOrgAdminAccess(
  accessToken: string,
  org: string
): Promise<boolean> {
  const response = await fetch(`https://api.github.com/orgs/${org}/memberships/${await getGitHubUsername(accessToken)}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) return false;

  const membership = await response.json();
  return membership.role === 'admin';
}

/**
 * Get GitHub username
 */
async function getGitHubUsername(accessToken: string): Promise<string> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  const user = await response.json();
  return user.login;
}

/**
 * Delete webhook from GitHub
 */
export async function deleteGitHubWebhook(
  accessToken: string,
  owner: string,
  repo: string,
  webhookId: number
): Promise<void> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/hooks/${webhookId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    throw new Error('Failed to delete webhook');
  }
}

/**
 * Delete organization webhook from GitHub
 */
export async function deleteGitHubOrgWebhook(
  accessToken: string,
  org: string,
  webhookId: number
): Promise<void> {
  const response = await fetch(
    `https://api.github.com/orgs/${org}/hooks/${webhookId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    throw new Error('Failed to delete organization webhook');
  }
}

/**
 * Setup webhooks automatically for a GitHub integration
 * This is called after OAuth connection completes
 */
export async function setupGitHubWebhooksForIntegration(
  organizationId: string
): Promise<void> {
  // Get the GitHub integration
  const integration = await prisma.integration.findFirst({
    where: {
      organizationId,
      integrationType: 'github',
      status: 'active',
      deletedAt: null,
    },
  });

  if (!integration || !integration.encryptedAccessToken) {
    throw new Error('GitHub integration not found or not active');
  }

  // Decrypt access token
  const accessToken = decryptToken(integration.encryptedAccessToken);

  try {
    // Get user's organizations
    const orgs = await getGitHubOrganizations(accessToken);

    // Try to create organization-level webhook for each org with admin access
    const webhookResults = [];

    for (const org of orgs) {
      try {
        const hasAdmin = await hasOrgAdminAccess(accessToken, org);

        if (hasAdmin) {
          const webhook = await createGitHubOrgWebhook(accessToken, org);
          webhookResults.push({
            type: 'organization',
            name: org,
            webhookId: webhook.id,
          });

          console.log(`✓ Created organization webhook for ${org}`);
        }
      } catch (error) {
        console.error(`Failed to create webhook for org ${org}:`, error);
        // Continue with other orgs even if one fails
      }
    }

    // Store webhook configuration in integration metadata
    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        metadata: {
          webhooks: webhookResults,
          webhooksConfiguredAt: new Date().toISOString(),
        },
      },
    });

    console.log(`✓ Configured ${webhookResults.length} GitHub webhooks for organization ${organizationId}`);
  } catch (error) {
    console.error('Error setting up GitHub webhooks:', error);
    throw error;
  }
}

/**
 * Remove all webhooks for a GitHub integration
 */
export async function removeGitHubWebhooksForIntegration(
  organizationId: string
): Promise<void> {
  const integration = await prisma.integration.findFirst({
    where: {
      organizationId,
      integrationType: 'github',
    },
  });

  if (!integration || !integration.encryptedAccessToken) {
    return; // Nothing to clean up
  }

  const accessToken = decryptToken(integration.encryptedAccessToken);
  const metadata = integration.metadata as any;
  const webhooks = metadata?.webhooks || [];

  for (const webhook of webhooks) {
    try {
      if (webhook.type === 'organization') {
        await deleteGitHubOrgWebhook(accessToken, webhook.name, webhook.webhookId);
      } else if (webhook.type === 'repository') {
        const [owner, repo] = webhook.name.split('/');
        await deleteGitHubWebhook(accessToken, owner, repo, webhook.webhookId);
      }
      console.log(`✓ Removed webhook from ${webhook.name}`);
    } catch (error) {
      console.error(`Failed to remove webhook from ${webhook.name}:`, error);
    }
  }

  // Clear webhook metadata
  await prisma.integration.update({
    where: { id: integration.id },
    data: {
      metadata: {
        webhooks: [],
        webhooksRemovedAt: new Date().toISOString(),
      },
    },
  });
}

/**
 * Refresh/sync webhooks (useful if webhook URL changes or needs to be recreated)
 */
export async function refreshGitHubWebhooks(organizationId: string): Promise<void> {
  // Remove old webhooks
  await removeGitHubWebhooksForIntegration(organizationId);

  // Create new webhooks
  await setupGitHubWebhooksForIntegration(organizationId);
}
