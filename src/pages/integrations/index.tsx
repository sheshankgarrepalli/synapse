import { useState } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { IntegrationPreviewModal, integrationPreviews } from '@/components/integrations/IntegrationPreviewModal';
import { IntegrationHealthMonitor } from '@/components/integrations/IntegrationHealthMonitor';
import { api } from '@/utils/api';
import { formatRelativeTime } from '@/lib/utils';
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';

const integrations = [
  // Tier 1: Core Integrations - Project Management
  {
    id: 'github',
    name: 'GitHub',
    description: 'Connect repositories, issues, and pull requests',
    icon: '/integrations/github.svg',
    tier: 1,
    category: 'Version Control',
    features: ['Repositories', 'Issues', 'Pull Requests', 'Commits'],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Link channels and messages to your threads',
    icon: '/integrations/slack.svg',
    tier: 1,
    category: 'Communication',
    features: ['Channels', 'Messages', 'Threads', 'Files'],
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Sync projects, issues, and workflows',
    icon: '/integrations/linear.svg',
    tier: 1,
    category: 'Project Management',
    features: ['Projects', 'Issues', 'Cycles', 'Labels'],
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Connect Jira projects, issues, and sprints',
    icon: '/integrations/jira.svg',
    tier: 1,
    category: 'Project Management',
    features: ['Projects', 'Issues', 'Sprints', 'Workflows'],
  },
  {
    id: 'asana',
    name: 'Asana',
    description: 'Sync tasks, projects, and team workflows',
    icon: '/integrations/asana.svg',
    tier: 1,
    category: 'Project Management',
    features: ['Tasks', 'Projects', 'Sections', 'Tags'],
  },
  {
    id: 'trello',
    name: 'Trello',
    description: 'Connect boards, lists, and cards',
    icon: '/integrations/trello.svg',
    tier: 1,
    category: 'Project Management',
    features: ['Boards', 'Lists', 'Cards', 'Labels'],
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    description: 'Connect teams, channels, and messages',
    icon: '/integrations/microsoft-teams.svg',
    tier: 1,
    category: 'Communication',
    features: ['Teams', 'Channels', 'Messages', 'Files'],
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Link servers, channels, and messages',
    icon: '/integrations/discord.svg',
    tier: 1,
    category: 'Communication',
    features: ['Servers', 'Channels', 'Messages', 'Threads'],
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'Connect repositories, merge requests, and pipelines',
    icon: '/integrations/gitlab.svg',
    tier: 1,
    category: 'Version Control',
    features: ['Repositories', 'Merge Requests', 'Pipelines', 'Issues'],
  },
  {
    id: 'bitbucket',
    name: 'Bitbucket',
    description: 'Sync repositories, pull requests, and pipelines',
    icon: '/integrations/bitbucket.svg',
    tier: 1,
    category: 'Version Control',
    features: ['Repositories', 'Pull Requests', 'Pipelines', 'Issues'],
  },
  // Tier 2: Design & Documentation
  {
    id: 'figma',
    name: 'Figma',
    description: 'Connect design files and components',
    icon: '/integrations/figma.svg',
    tier: 2,
    category: 'Design Tools',
    features: ['Files', 'Components', 'Comments', 'Versions'],
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Link pages and databases',
    icon: '/integrations/notion.svg',
    tier: 2,
    category: 'Documentation',
    features: ['Pages', 'Databases', 'Blocks', 'Comments'],
  },
  {
    id: 'confluence',
    name: 'Confluence',
    description: 'Connect spaces, pages, and documentation',
    icon: '/integrations/confluence.svg',
    tier: 2,
    category: 'Documentation',
    features: ['Spaces', 'Pages', 'Comments', 'Attachments'],
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Link files, folders, and documents',
    icon: '/integrations/google-drive.svg',
    tier: 2,
    category: 'Documentation',
    features: ['Files', 'Folders', 'Docs', 'Sheets'],
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Connect files and folders',
    icon: '/integrations/dropbox.svg',
    tier: 2,
    category: 'Documentation',
    features: ['Files', 'Folders', 'Paper', 'Sharing'],
  },
  {
    id: 'miro',
    name: 'Miro',
    description: 'Sync boards and collaborative workspaces',
    icon: '/integrations/miro.svg',
    tier: 2,
    category: 'Design Tools',
    features: ['Boards', 'Frames', 'Widgets', 'Comments'],
  },
  {
    id: 'sketch',
    name: 'Sketch',
    description: 'Connect design documents and libraries',
    icon: '/integrations/sketch.svg',
    tier: 2,
    category: 'Design Tools',
    features: ['Documents', 'Libraries', 'Artboards', 'Symbols'],
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Connect analytics data and reports',
    icon: '/integrations/google-analytics.svg',
    tier: 2,
    category: 'Analytics',
    features: ['Properties', 'Reports', 'Events', 'Goals'],
  },
  {
    id: 'amplitude',
    name: 'Amplitude',
    description: 'Link product analytics and insights',
    icon: '/integrations/amplitude.svg',
    tier: 2,
    category: 'Analytics',
    features: ['Events', 'Charts', 'Cohorts', 'Dashboards'],
  },
  {
    id: 'sentry',
    name: 'Sentry',
    description: 'Connect error tracking and monitoring',
    icon: '/integrations/sentry.svg',
    tier: 2,
    category: 'Error Tracking',
    features: ['Errors', 'Issues', 'Releases', 'Performance'],
  },
  // Tier 3: Analytics & Research
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Connect meetings and recordings',
    icon: '/integrations/zoom.svg',
    tier: 3,
    category: 'Communication',
    features: ['Meetings', 'Recordings', 'Transcripts'],
  },
  {
    id: 'dovetail',
    name: 'Dovetail',
    description: 'Link research insights and highlights',
    icon: '/integrations/dovetail.svg',
    tier: 3,
    category: 'Research',
    features: ['Projects', 'Insights', 'Highlights', 'Tags'],
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    description: 'Connect analytics events and insights',
    icon: '/integrations/mixpanel.svg',
    tier: 3,
    category: 'Analytics',
    features: ['Events', 'Funnels', 'Cohorts', 'Reports'],
  },
  // Additional Tier 1 Integrations
  {
    id: 'clickup',
    name: 'ClickUp',
    description: 'Connect tasks, docs, and project management',
    icon: '/integrations/clickup.svg',
    tier: 1,
    category: 'Project Management',
    features: ['Tasks', 'Docs', 'Goals', 'Time Tracking'],
  },
  {
    id: 'monday',
    name: 'Monday.com',
    description: 'Sync work OS boards and workflows',
    icon: '/integrations/monday.svg',
    tier: 1,
    category: 'Project Management',
    features: ['Boards', 'Items', 'Columns', 'Automations'],
  },
  {
    id: 'intercom',
    name: 'Intercom',
    description: 'Connect customer conversations and support',
    icon: '/integrations/intercom.svg',
    tier: 1,
    category: 'Communication',
    features: ['Conversations', 'Users', 'Tags', 'Articles'],
  },
  // Additional Tier 2 Integrations
  {
    id: 'invision',
    name: 'InVision',
    description: 'Link design prototypes and feedback',
    icon: '/integrations/invision.svg',
    tier: 2,
    category: 'Design Tools',
    features: ['Prototypes', 'Boards', 'Comments', 'Inspect'],
  },
  {
    id: 'abstract',
    name: 'Abstract',
    description: 'Connect design version control',
    icon: '/integrations/abstract.svg',
    tier: 2,
    category: 'Design Tools',
    features: ['Projects', 'Branches', 'Commits', 'Collections'],
  },
  {
    id: 'framer',
    name: 'Framer',
    description: 'Sync interactive design prototypes',
    icon: '/integrations/framer.svg',
    tier: 2,
    category: 'Design Tools',
    features: ['Projects', 'Components', 'Variants', 'CMS'],
  },
  {
    id: 'zeplin',
    name: 'Zeplin',
    description: 'Connect design handoff and specs',
    icon: '/integrations/zeplin.svg',
    tier: 2,
    category: 'Design Tools',
    features: ['Projects', 'Screens', 'Components', 'Styleguides'],
  },
  {
    id: 'airtable',
    name: 'Airtable',
    description: 'Link spreadsheet-database hybrid',
    icon: '/integrations/airtable.svg',
    tier: 2,
    category: 'Documentation',
    features: ['Bases', 'Tables', 'Records', 'Views'],
  },
  {
    id: 'coda',
    name: 'Coda',
    description: 'Connect docs that bring words and data together',
    icon: '/integrations/coda.svg',
    tier: 2,
    category: 'Documentation',
    features: ['Docs', 'Tables', 'Formulas', 'Packs'],
  },
  {
    id: 'productboard',
    name: 'Productboard',
    description: 'Sync product management and roadmaps',
    icon: '/integrations/productboard.svg',
    tier: 2,
    category: 'Product Management',
    features: ['Features', 'Roadmaps', 'Insights', 'Releases'],
  },
  {
    id: 'aha',
    name: 'Aha!',
    description: 'Connect roadmaps and product strategy',
    icon: '/integrations/aha.svg',
    tier: 2,
    category: 'Product Management',
    features: ['Ideas', 'Features', 'Releases', 'Roadmaps'],
  },
  {
    id: 'pendo',
    name: 'Pendo',
    description: 'Link product analytics and guidance',
    icon: '/integrations/pendo.svg',
    tier: 2,
    category: 'Analytics',
    features: ['Events', 'Guides', 'Feedback', 'Roadmaps'],
  },
  {
    id: 'fullstory',
    name: 'FullStory',
    description: 'Connect session replay and analytics',
    icon: '/integrations/fullstory.svg',
    tier: 2,
    category: 'Analytics',
    features: ['Sessions', 'Events', 'Funnels', 'Heatmaps'],
  },
  {
    id: 'hotjar',
    name: 'Hotjar',
    description: 'Sync heatmaps and user behavior',
    icon: '/integrations/hotjar.svg',
    tier: 2,
    category: 'Analytics',
    features: ['Heatmaps', 'Recordings', 'Surveys', 'Feedback'],
  },
  {
    id: 'segment',
    name: 'Segment',
    description: 'Connect customer data platform',
    icon: '/integrations/segment.svg',
    tier: 2,
    category: 'Analytics',
    features: ['Sources', 'Destinations', 'Events', 'Personas'],
  },
  {
    id: 'datadog',
    name: 'Datadog',
    description: 'Link monitoring and observability',
    icon: '/integrations/datadog.svg',
    tier: 2,
    category: 'Monitoring',
    features: ['Metrics', 'Logs', 'Traces', 'Dashboards'],
  },
  {
    id: 'new-relic',
    name: 'New Relic',
    description: 'Connect observability platform',
    icon: '/integrations/new-relic.svg',
    tier: 2,
    category: 'Monitoring',
    features: ['APM', 'Infrastructure', 'Logs', 'Alerts'],
  },
  {
    id: 'logr ocket',
    name: 'LogRocket',
    description: 'Sync session replay and monitoring',
    icon: '/integrations/logrocket.svg',
    tier: 2,
    category: 'Monitoring',
    features: ['Sessions', 'Errors', 'Performance', 'Console'],
  },
  // Additional Tier 3 Integrations
  {
    id: 'calendly',
    name: 'Calendly',
    description: 'Connect scheduling and meetings',
    icon: '/integrations/calendly.svg',
    tier: 3,
    category: 'Productivity',
    features: ['Events', 'Scheduling', 'Invitees', 'Webhooks'],
  },
  {
    id: 'loom',
    name: 'Loom',
    description: 'Link video messages and recordings',
    icon: '/integrations/loom.svg',
    tier: 3,
    category: 'Communication',
    features: ['Videos', 'Comments', 'Transcripts', 'Insights'],
  },
  {
    id: 'typeform',
    name: 'Typeform',
    description: 'Connect forms and surveys',
    icon: '/integrations/typeform.svg',
    tier: 3,
    category: 'Research',
    features: ['Forms', 'Responses', 'Logic', 'Webhooks'],
  },
  {
    id: 'surveymonkey',
    name: 'SurveyMonkey',
    description: 'Sync surveys and feedback',
    icon: '/integrations/surveymonkey.svg',
    tier: 3,
    category: 'Research',
    features: ['Surveys', 'Responses', 'Analysis', 'Reports'],
  },
  {
    id: 'maze',
    name: 'Maze',
    description: 'Link rapid user testing platform',
    icon: '/integrations/maze.svg',
    tier: 3,
    category: 'Research',
    features: ['Tests', 'Results', 'Paths', 'Heatmaps'],
  },
  {
    id: 'usertesting',
    name: 'UserTesting',
    description: 'Connect user research and insights',
    icon: '/integrations/usertesting.svg',
    tier: 3,
    category: 'Research',
    features: ['Tests', 'Videos', 'Highlights', 'Reports'],
  },
  {
    id: 'lookback',
    name: 'Lookback',
    description: 'Sync user research interviews',
    icon: '/integrations/lookback.svg',
    tier: 3,
    category: 'Research',
    features: ['Sessions', 'Recordings', 'Notes', 'Highlights'],
  },
  {
    id: 'heap',
    name: 'Heap',
    description: 'Connect digital insights platform',
    icon: '/integrations/heap.svg',
    tier: 3,
    category: 'Analytics',
    features: ['Events', 'Users', 'Funnels', 'Retention'],
  },
  {
    id: 'customer-io',
    name: 'Customer.io',
    description: 'Link customer messaging automation',
    icon: '/integrations/customer-io.svg',
    tier: 3,
    category: 'Marketing',
    features: ['Messages', 'Campaigns', 'Segments', 'Events'],
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Connect email marketing platform',
    icon: '/integrations/mailchimp.svg',
    tier: 3,
    category: 'Marketing',
    features: ['Campaigns', 'Audiences', 'Reports', 'Automation'],
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Sync CRM and marketing hub',
    icon: '/integrations/hubspot.svg',
    tier: 3,
    category: 'Marketing',
    features: ['Contacts', 'Deals', 'Campaigns', 'Analytics'],
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Connect CRM and customer platform',
    icon: '/integrations/salesforce.svg',
    tier: 3,
    category: 'Sales',
    features: ['Accounts', 'Opportunities', 'Leads', 'Reports'],
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Link customer support platform',
    icon: '/integrations/zendesk.svg',
    tier: 3,
    category: 'Support',
    features: ['Tickets', 'Users', 'Articles', 'Satisfaction'],
  },
  {
    id: 'front',
    name: 'Front',
    description: 'Connect shared inbox platform',
    icon: '/integrations/front.svg',
    tier: 3,
    category: 'Support',
    features: ['Conversations', 'Teams', 'Tags', 'Analytics'],
  },
  {
    id: 'circle-ci',
    name: 'CircleCI',
    description: 'Sync CI/CD pipelines',
    icon: '/integrations/circleci.svg',
    tier: 3,
    category: 'CI/CD',
    features: ['Pipelines', 'Workflows', 'Jobs', 'Artifacts'],
  },
  {
    id: 'jenkins',
    name: 'Jenkins',
    description: 'Connect automation server',
    icon: '/integrations/jenkins.svg',
    tier: 3,
    category: 'CI/CD',
    features: ['Jobs', 'Builds', 'Pipelines', 'Plugins'],
  },
  {
    id: 'travis-ci',
    name: 'Travis CI',
    description: 'Link continuous integration platform',
    icon: '/integrations/travis-ci.svg',
    tier: 3,
    category: 'CI/CD',
    features: ['Builds', 'Jobs', 'Branches', 'Logs'],
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Connect deployment platform',
    icon: '/integrations/vercel.svg',
    tier: 3,
    category: 'Deployment',
    features: ['Deployments', 'Projects', 'Domains', 'Analytics'],
  },
  {
    id: 'netlify',
    name: 'Netlify',
    description: 'Sync web development platform',
    icon: '/integrations/netlify.svg',
    tier: 3,
    category: 'Deployment',
    features: ['Sites', 'Deploys', 'Forms', 'Functions'],
  },
  {
    id: 'heroku',
    name: 'Heroku',
    description: 'Link cloud application platform',
    icon: '/integrations/heroku.svg',
    tier: 3,
    category: 'Deployment',
    features: ['Apps', 'Dynos', 'Pipelines', 'Add-ons'],
  },
];

export default function IntegrationsPage() {
  const [previewIntegration, setPreviewIntegration] = useState<string | null>(null);
  const [healthMonitorIntegration, setHealthMonitorIntegration] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: connections, isLoading } = api.integrations.list.useQuery();
  const { data: webhookStatus } = api.integrations.getWebhookStatus.useQuery();
  const { data: healthStatus } = api.integrations.getHealthStatus.useQuery(undefined, {
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const utils = api.useUtils();

  const disconnectIntegration = api.integrations.disconnect.useMutation({
    onSuccess: async () => {
      // Invalidate all integration-related queries
      await utils.integrations.list.invalidate();
      await utils.integrations.getStatus.invalidate();
      await utils.integrations.getWebhookStatus.invalidate();
    },
  });

  const setupWebhooks = api.integrations.setupWebhooks.useMutation({
    onSuccess: () => {
      utils.integrations.getWebhookStatus.invalidate();
    },
  });

  const refreshWebhooks = api.integrations.refreshWebhooks.useMutation({
    onSuccess: () => {
      utils.integrations.getWebhookStatus.invalidate();
    },
  });

  const getConnectionStatus = (integrationId: string) => {
    return connections?.find((conn) => conn.integrationType === integrationId);
  };

  const getHealthStatusForIntegration = (integrationId: string) => {
    return healthStatus?.find((h) => h.integrationType === integrationId);
  };

  const getHealthIcon = (status?: string) => {
    if (!status) return null;

    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const handleConnect = (integrationId: string) => {
    // Redirect to OAuth initiation endpoint
    window.location.href = `/api/oauth/initiate/${integrationId}`;
  };

  const handleDisconnect = (integrationId: string) => {
    disconnectIntegration.mutate({ integrationType: integrationId as any });
  };

  const handleSetupWebhooks = () => {
    setupWebhooks.mutate();
  };

  const handleRefreshWebhooks = () => {
    refreshWebhooks.mutate();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 mb-2">Integrations</h1>
          <p className="text-gray-500 dark:text-[#FDFFFC]/60 minimal:text-gray-600">
            Connect your tools to create Golden Threads across your workflow
          </p>
        </div>

        {/* Tier 1: Core Integrations */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900">Core Integrations</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {integrations
              .filter((int) => int.tier === 1)
              .map((integration) => {
                const connection = getConnectionStatus(integration.id);
                const isConnected = !!connection && connection.status === 'active';

                return (
                  <Card key={integration.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-800 minimal:bg-gray-100">
                            <span className="text-xl font-bold text-[#FCA311] dark:text-primary minimal:text-gray-900">
                              {integration.name[0]}
                            </span>
                          </div>
                          <div>
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                            {isConnected && (
                              <Badge variant="success" size="sm" className="mt-1">
                                Connected
                              </Badge>
                            )}
                          </div>
                        </div>
                        {isConnected ? (
                          <CheckCircleIcon className="h-6 w-6 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-6 w-6 text-gray-500" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">{integration.description}</CardDescription>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-400 minimal:text-gray-600">Features:</p>
                        <div className="flex flex-wrap gap-2">
                          {integration.features.map((feature) => (
                            <Badge key={feature} variant="default" size="sm">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {connection && isConnected && (
                        <>
                          <p className="mt-4 text-xs text-gray-500 minimal:text-gray-600">
                            Connected {formatRelativeTime(new Date(connection.connectedAt))}
                          </p>
                          {(() => {
                            const health = getHealthStatusForIntegration(integration.id);
                            return health && (
                              <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 minimal:border-gray-200 minimal:bg-gray-50 p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    {getHealthIcon(health.healthStatus)}
                                    <div>
                                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 minimal:text-gray-900">Health Status</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-500 minimal:text-gray-600">
                                        {health.lastSyncAt
                                          ? `Last sync ${formatRelativeTime(new Date(health.lastSyncAt))}`
                                          : 'No sync data'}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setHealthMonitorIntegration({ id: integration.id, name: integration.name })}
                                    title="View health details"
                                  >
                                    <ChartBarIcon className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })()}
                          {integration.id === 'github' && webhookStatus && (
                            <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 minimal:border-gray-200 minimal:bg-gray-50 p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 minimal:text-gray-900">Automation Webhooks</p>
                                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500 minimal:text-gray-600">
                                    {webhookStatus.configured
                                      ? `${webhookStatus.webhooks.length} organization${webhookStatus.webhooks.length !== 1 ? 's' : ''} configured`
                                      : 'Not configured'}
                                  </p>
                                </div>
                                {webhookStatus.configured ? (
                                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                ) : (
                                  <XCircleIcon className="h-5 w-5 text-gray-500" />
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                    <CardFooter>
                      {isConnected ? (
                        <div className="flex w-full flex-col space-y-2">
                          {integration.id === 'github' && (
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-full"
                              onClick={() => window.location.href = '/integrations/github/repositories'}
                            >
                              Manage Repositories
                            </Button>
                          )}
                          <div className="flex w-full space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleDisconnect(integration.id)}
                              loading={disconnectIntegration.isLoading}
                            >
                              Disconnect
                            </Button>
                            {integration.id === 'github' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRefreshWebhooks}
                                loading={refreshWebhooks.isLoading}
                                title="Refresh webhooks"
                              >
                                <ArrowPathIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {integration.id === 'github' && webhookStatus && !webhookStatus.configured && (
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-full"
                              onClick={handleSetupWebhooks}
                              loading={setupWebhooks.isLoading}
                            >
                              Configure Webhooks
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="flex w-full space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewIntegration(integration.id)}
                            className="flex-shrink-0"
                            title="Learn more"
                          >
                            <InformationCircleIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            className="flex-1"
                            size="sm"
                            onClick={() => setPreviewIntegration(integration.id)}
                          >
                            Connect
                          </Button>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
          </div>
        </div>

        {/* Tier 2: Enhanced Integrations */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900">Enhanced Integrations</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {integrations
              .filter((int) => int.tier === 2)
              .map((integration) => {
                const connection = getConnectionStatus(integration.id);
                const isConnected = !!connection && connection.status === 'active';

                return (
                  <Card key={integration.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-800 minimal:bg-gray-100">
                            <span className="text-xl font-bold text-[#FCA311] dark:text-primary minimal:text-gray-900">
                              {integration.name[0]}
                            </span>
                          </div>
                          <div>
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                            {isConnected && (
                              <Badge variant="success" size="sm" className="mt-1">
                                Connected
                              </Badge>
                            )}
                          </div>
                        </div>
                        {isConnected ? (
                          <CheckCircleIcon className="h-6 w-6 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-6 w-6 text-gray-500" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">{integration.description}</CardDescription>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-400 minimal:text-gray-600">Features:</p>
                        <div className="flex flex-wrap gap-2">
                          {integration.features.map((feature) => (
                            <Badge key={feature} variant="default" size="sm">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      {isConnected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleDisconnect(integration.id)}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <div className="flex w-full space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewIntegration(integration.id)}
                            className="flex-shrink-0"
                            title="Learn more"
                          >
                            <InformationCircleIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            className="flex-1"
                            size="sm"
                            onClick={() => setPreviewIntegration(integration.id)}
                          >
                            Connect
                          </Button>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
          </div>
        </div>

        {/* Tier 3: Specialized Tools */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900">Specialized Tools</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {integrations
              .filter((int) => int.tier === 3)
              .map((integration) => {
                const connection = getConnectionStatus(integration.id);
                const isConnected = !!connection && connection.status === 'active';

                return (
                  <Card key={integration.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-800 minimal:bg-gray-100">
                            <span className="text-xl font-bold text-[#FCA311] dark:text-primary minimal:text-gray-900">
                              {integration.name[0]}
                            </span>
                          </div>
                          <div>
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                            {isConnected && (
                              <Badge variant="success" size="sm" className="mt-1">
                                Connected
                              </Badge>
                            )}
                          </div>
                        </div>
                        {isConnected ? (
                          <CheckCircleIcon className="h-6 w-6 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-6 w-6 text-gray-500" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">{integration.description}</CardDescription>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-400 minimal:text-gray-600">Features:</p>
                        <div className="flex flex-wrap gap-2">
                          {integration.features.map((feature) => (
                            <Badge key={feature} variant="default" size="sm">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      {isConnected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleDisconnect(integration.id)}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <div className="flex w-full space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewIntegration(integration.id)}
                            className="flex-shrink-0"
                            title="Learn more"
                          >
                            <InformationCircleIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            className="flex-1"
                            size="sm"
                            onClick={() => setPreviewIntegration(integration.id)}
                          >
                            Connect
                          </Button>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
          </div>
        </div>
      </div>

      {/* Integration Preview Modal */}
      <IntegrationPreviewModal
        isOpen={!!previewIntegration}
        onClose={() => setPreviewIntegration(null)}
        integration={previewIntegration ? integrationPreviews[previewIntegration] : null}
        onConnect={() => {
          if (previewIntegration) {
            handleConnect(previewIntegration);
          }
        }}
      />

      {/* Integration Health Monitor Modal */}
      {healthMonitorIntegration && (
        <IntegrationHealthMonitor
          isOpen={!!healthMonitorIntegration}
          onClose={() => setHealthMonitorIntegration(null)}
          integrationType={healthMonitorIntegration.id}
          integrationName={healthMonitorIntegration.name}
        />
      )}
    </AppLayout>
  );
}
