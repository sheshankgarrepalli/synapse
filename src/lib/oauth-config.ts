/**
 * OAuth configuration for different integrations
 */

export const OAUTH_CONFIGS = {
  github: {
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    scopes: ['repo', 'read:user', 'read:org', 'write:repo_hook'],
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  },
  linear: {
    authUrl: 'https://linear.app/oauth/authorize',
    tokenUrl: 'https://api.linear.app/oauth/token',
    scopes: ['read', 'write'],
    clientId: process.env.LINEAR_CLIENT_ID!,
    clientSecret: process.env.LINEAR_CLIENT_SECRET!,
  },
  slack: {
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    scopes: ['channels:read', 'channels:history', 'chat:write', 'files:read'],
    clientId: process.env.SLACK_CLIENT_ID!,
    clientSecret: process.env.SLACK_CLIENT_SECRET!,
  },
  figma: {
    authUrl: 'https://www.figma.com/oauth',
    tokenUrl: 'https://www.figma.com/api/oauth/token',
    scopes: ['file_read'],
    clientId: process.env.FIGMA_CLIENT_ID!,
    clientSecret: process.env.FIGMA_CLIENT_SECRET!,
  },
  notion: {
    authUrl: 'https://api.notion.com/v1/oauth/authorize',
    tokenUrl: 'https://api.notion.com/v1/oauth/token',
    scopes: [],
    clientId: process.env.NOTION_CLIENT_ID!,
    clientSecret: process.env.NOTION_CLIENT_SECRET!,
  },
  zoom: {
    authUrl: 'https://zoom.us/oauth/authorize',
    tokenUrl: 'https://zoom.us/oauth/token',
    scopes: ['meeting:read', 'recording:read'],
    clientId: process.env.ZOOM_CLIENT_ID!,
    clientSecret: process.env.ZOOM_CLIENT_SECRET!,
  },
  dovetail: {
    authUrl: 'https://dovetailapp.com/oauth/authorize',
    tokenUrl: 'https://dovetailapp.com/oauth/token',
    scopes: ['read'],
    clientId: process.env.DOVETAIL_CLIENT_ID!,
    clientSecret: process.env.DOVETAIL_CLIENT_SECRET!,
  },
  mixpanel: {
    authUrl: 'https://mixpanel.com/oauth/authorize',
    tokenUrl: 'https://mixpanel.com/oauth/access_token',
    scopes: ['read'],
    clientId: process.env.MIXPANEL_CLIENT_ID!,
    clientSecret: process.env.MIXPANEL_CLIENT_SECRET!,
  },
} as const;

export type IntegrationType = keyof typeof OAUTH_CONFIGS;

export function getOAuthUrl(integrationType: IntegrationType, redirectUri: string, state: string): string {
  const config = OAUTH_CONFIGS[integrationType];

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    scope: config.scopes.join(' '),
    state,
    response_type: 'code',
  });

  return `${config.authUrl}?${params.toString()}`;
}

export function getCallbackUrl(integrationType: IntegrationType): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/api/oauth/callback/${integrationType}`;
}
