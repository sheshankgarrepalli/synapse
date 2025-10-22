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
  {
    id: 'github',
    name: 'GitHub',
    description: 'Connect repositories, issues, and pull requests',
    icon: '/integrations/github.svg',
    tier: 1,
    features: ['Repositories', 'Issues', 'Pull Requests', 'Commits'],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Link channels and messages to your threads',
    icon: '/integrations/slack.svg',
    tier: 1,
    features: ['Channels', 'Messages', 'Threads', 'Files'],
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Sync projects, issues, and workflows',
    icon: '/integrations/linear.svg',
    tier: 1,
    features: ['Projects', 'Issues', 'Cycles', 'Labels'],
  },
  {
    id: 'figma',
    name: 'Figma',
    description: 'Connect design files and components',
    icon: '/integrations/figma.svg',
    tier: 2,
    features: ['Files', 'Components', 'Comments', 'Versions'],
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Link pages and databases',
    icon: '/integrations/notion.svg',
    tier: 2,
    features: ['Pages', 'Databases', 'Blocks', 'Comments'],
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Connect meetings and recordings',
    icon: '/integrations/zoom.svg',
    tier: 3,
    features: ['Meetings', 'Recordings', 'Transcripts'],
  },
  {
    id: 'dovetail',
    name: 'Dovetail',
    description: 'Link research insights and highlights',
    icon: '/integrations/dovetail.svg',
    tier: 3,
    features: ['Projects', 'Insights', 'Highlights', 'Tags'],
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    description: 'Connect analytics events and insights',
    icon: '/integrations/mixpanel.svg',
    tier: 3,
    features: ['Events', 'Funnels', 'Cohorts', 'Reports'],
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#FDFFFC] mb-2">Integrations</h1>
          <p className="text-gray-500 dark:text-[#FDFFFC]/60">
            Connect your tools to create Golden Threads across your workflow
          </p>
        </div>

        {/* Tier 1: Core Integrations */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-[#FDFFFC]">Core Integrations</h2>
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
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-800">
                            <span className="text-xl font-bold text-[#FCA311] dark:text-primary">
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
                        <p className="text-xs font-medium text-gray-400">Features:</p>
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
                          <p className="mt-4 text-xs text-gray-500">
                            Connected {formatRelativeTime(new Date(connection.connectedAt))}
                          </p>
                          {(() => {
                            const health = getHealthStatusForIntegration(integration.id);
                            return health && (
                              <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    {getHealthIcon(health.healthStatus)}
                                    <div>
                                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Health Status</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-500">
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
                            <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Automation Webhooks</p>
                                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
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

        {/* Tier 2: Design & Documentation */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-[#FDFFFC]">Design & Documentation</h2>
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
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-800">
                            <span className="text-xl font-bold text-[#FCA311] dark:text-primary">
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
                        <p className="text-xs font-medium text-gray-400">Features:</p>
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

        {/* Tier 3: Analytics & Research */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-[#FDFFFC]">Analytics & Research</h2>
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
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-800">
                            <span className="text-xl font-bold text-[#FCA311] dark:text-primary">
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
                        <p className="text-xs font-medium text-gray-400">Features:</p>
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
