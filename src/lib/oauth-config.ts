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
  jira: {
    authUrl: 'https://auth.atlassian.com/authorize',
    tokenUrl: 'https://auth.atlassian.com/oauth/token',
    scopes: ['read:jira-work', 'write:jira-work', 'read:jira-user'],
    clientId: process.env.JIRA_CLIENT_ID!,
    clientSecret: process.env.JIRA_CLIENT_SECRET!,
  },
  asana: {
    authUrl: 'https://app.asana.com/-/oauth_authorize',
    tokenUrl: 'https://app.asana.com/-/oauth_token',
    scopes: ['default'],
    clientId: process.env.ASANA_CLIENT_ID!,
    clientSecret: process.env.ASANA_CLIENT_SECRET!,
  },
  trello: {
    authUrl: 'https://trello.com/1/authorize',
    tokenUrl: 'https://trello.com/1/OAuthGetAccessToken',
    scopes: ['read', 'write'],
    clientId: process.env.TRELLO_CLIENT_ID!,
    clientSecret: process.env.TRELLO_CLIENT_SECRET!,
  },
  'microsoft-teams': {
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scopes: ['User.Read', 'Team.ReadBasic.All', 'Channel.ReadBasic.All', 'ChannelMessage.Read.All'],
    clientId: process.env.MICROSOFT_TEAMS_CLIENT_ID!,
    clientSecret: process.env.MICROSOFT_TEAMS_CLIENT_SECRET!,
  },
  discord: {
    authUrl: 'https://discord.com/api/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    scopes: ['identify', 'guilds', 'messages.read'],
    clientId: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  },
  gitlab: {
    authUrl: 'https://gitlab.com/oauth/authorize',
    tokenUrl: 'https://gitlab.com/oauth/token',
    scopes: ['api', 'read_user', 'read_repository'],
    clientId: process.env.GITLAB_CLIENT_ID!,
    clientSecret: process.env.GITLAB_CLIENT_SECRET!,
  },
  bitbucket: {
    authUrl: 'https://bitbucket.org/site/oauth2/authorize',
    tokenUrl: 'https://bitbucket.org/site/oauth2/access_token',
    scopes: ['repository', 'issue:write', 'pullrequest:write'],
    clientId: process.env.BITBUCKET_CLIENT_ID!,
    clientSecret: process.env.BITBUCKET_CLIENT_SECRET!,
  },
  confluence: {
    authUrl: 'https://auth.atlassian.com/authorize',
    tokenUrl: 'https://auth.atlassian.com/oauth/token',
    scopes: ['read:confluence-content.all', 'write:confluence-content', 'read:confluence-space.summary'],
    clientId: process.env.CONFLUENCE_CLIENT_ID!,
    clientSecret: process.env.CONFLUENCE_CLIENT_SECRET!,
  },
  'google-drive': {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.metadata.readonly'],
    clientId: process.env.GOOGLE_DRIVE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET!,
  },
  dropbox: {
    authUrl: 'https://www.dropbox.com/oauth2/authorize',
    tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
    scopes: ['files.metadata.read', 'files.content.read'],
    clientId: process.env.DROPBOX_CLIENT_ID!,
    clientSecret: process.env.DROPBOX_CLIENT_SECRET!,
  },
  miro: {
    authUrl: 'https://miro.com/oauth/authorize',
    tokenUrl: 'https://api.miro.com/v1/oauth/token',
    scopes: ['boards:read', 'boards:write'],
    clientId: process.env.MIRO_CLIENT_ID!,
    clientSecret: process.env.MIRO_CLIENT_SECRET!,
  },
  sketch: {
    authUrl: 'https://api.sketch.com/oauth/authorize',
    tokenUrl: 'https://api.sketch.com/oauth/token',
    scopes: ['read'],
    clientId: process.env.SKETCH_CLIENT_ID!,
    clientSecret: process.env.SKETCH_CLIENT_SECRET!,
  },
  'google-analytics': {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    clientId: process.env.GOOGLE_ANALYTICS_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_ANALYTICS_CLIENT_SECRET!,
  },
  amplitude: {
    authUrl: 'https://analytics.amplitude.com/oauth/authorize',
    tokenUrl: 'https://analytics.amplitude.com/oauth/token',
    scopes: ['read'],
    clientId: process.env.AMPLITUDE_CLIENT_ID!,
    clientSecret: process.env.AMPLITUDE_CLIENT_SECRET!,
  },
  sentry: {
    authUrl: 'https://sentry.io/oauth/authorize/',
    tokenUrl: 'https://sentry.io/oauth/token/',
    scopes: ['project:read', 'event:read', 'org:read'],
    clientId: process.env.SENTRY_CLIENT_ID!,
    clientSecret: process.env.SENTRY_CLIENT_SECRET!,
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
