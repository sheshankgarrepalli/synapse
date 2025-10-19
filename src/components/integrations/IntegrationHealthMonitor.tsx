import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/utils/api';
import { formatRelativeTime } from '@/lib/utils';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ClockIcon,
  SignalIcon,
} from '@heroicons/react/24/outline';

interface IntegrationHealthMonitorProps {
  integrationType: string;
  integrationName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function IntegrationHealthMonitor({
  integrationType,
  integrationName,
  isOpen,
  onClose,
}: IntegrationHealthMonitorProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  const { data: healthStatus, refetch: refetchHealth } = api.integrations.getHealthStatus.useQuery(
    undefined,
    {
      enabled: isOpen,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const { data: syncHistory } = api.integrations.getSyncHistory.useQuery(
    {
      integrationType: integrationType as any,
      limit: 20,
    },
    {
      enabled: isOpen && activeTab === 'history',
    }
  );

  const testConnection = api.integrations.testConnection.useMutation({
    onSuccess: () => {
      refetchHealth();
    },
  });

  const integration = healthStatus?.find((i) => i.integrationType === integrationType);

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <SignalIcon className="h-6 w-6 text-gray-400" />;
    }
  };

  const getHealthBadgeVariant = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'processed':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (!integration) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${integrationName} Health Monitor`}
      size="large"
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-b-2 border-purple-500 text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'border-b-2 border-purple-500 text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Sync History
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Current Status */}
            <div className="rounded-lg border border-gray-700 bg-gray-900 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getHealthIcon(integration.healthStatus)}
                  <div>
                    <h3 className="text-lg font-semibold text-white">Current Status</h3>
                    <Badge
                      variant={getHealthBadgeVariant(integration.healthStatus) as any}
                      size="sm"
                      className="mt-1"
                    >
                      {integration.healthStatus.charAt(0).toUpperCase() +
                        integration.healthStatus.slice(1)}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testConnection.mutate({ integrationType: integrationType as any })}
                  loading={testConnection.isLoading}
                >
                  <ArrowPathIcon className="mr-2 h-4 w-4" />
                  Test Connection
                </Button>
              </div>

              {/* Issues */}
              {integration.issues.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-300">Issues:</p>
                  {integration.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3"
                    >
                      <XCircleIcon className="h-5 w-5 flex-shrink-0 text-red-400 mt-0.5" />
                      <p className="text-sm text-red-300">{issue}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Error Message */}
              {integration.errorMessage && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-300">Last Error:</p>
                  <div className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                    <p className="text-sm text-red-300">{integration.errorMessage}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Uptime */}
              <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
                <div className="flex items-center space-x-2 text-gray-400">
                  <ChartBarIcon className="h-4 w-4" />
                  <p className="text-xs font-medium">Uptime</p>
                </div>
                <p className="mt-2 text-2xl font-semibold text-white">{integration.uptime}%</p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-800">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    style={{ width: `${integration.uptime}%` }}
                  ></div>
                </div>
              </div>

              {/* Last Sync */}
              <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
                <div className="flex items-center space-x-2 text-gray-400">
                  <ClockIcon className="h-4 w-4" />
                  <p className="text-xs font-medium">Last Sync</p>
                </div>
                <p className="mt-2 text-lg font-semibold text-white">
                  {integration.lastSyncAt
                    ? formatRelativeTime(new Date(integration.lastSyncAt))
                    : 'Never'}
                </p>
              </div>

              {/* Rate Limit */}
              {integration.rateLimitRemaining !== null && (
                <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <SignalIcon className="h-4 w-4" />
                    <p className="text-xs font-medium">Rate Limit</p>
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {integration.rateLimitRemaining}
                  </p>
                  <p className="text-xs text-gray-500">
                    {integration.rateLimitResetAt &&
                      `Resets ${formatRelativeTime(new Date(integration.rateLimitResetAt))}`}
                  </p>
                </div>
              )}
            </div>

            {/* Health Tips */}
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-300">Health Tips</p>
                  <ul className="mt-2 space-y-1 text-xs text-blue-200/70">
                    <li>• Regularly test your connection to ensure it's working properly</li>
                    <li>• Monitor sync activity to catch issues early</li>
                    <li>• Check for rate limit warnings to avoid service interruptions</li>
                    {integration.healthStatus === 'error' && (
                      <li>• Try disconnecting and reconnecting the integration if issues persist</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sync History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Stats */}
            {syncHistory && (
              <div className="grid grid-cols-4 gap-4">
                <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
                  <p className="text-xs font-medium text-gray-400">Total Syncs</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {syncHistory.stats.totalSyncs}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
                  <p className="text-xs font-medium text-gray-400">Successful</p>
                  <p className="mt-2 text-2xl font-semibold text-green-500">
                    {syncHistory.stats.successfulSyncs}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
                  <p className="text-xs font-medium text-gray-400">Failed</p>
                  <p className="mt-2 text-2xl font-semibold text-red-500">
                    {syncHistory.stats.failedSyncs}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
                  <p className="text-xs font-medium text-gray-400">Success Rate</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {syncHistory.stats.successRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}

            {/* History List */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
              {syncHistory && syncHistory.history.length > 0 ? (
                <div className="space-y-2">
                  {syncHistory.history.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start justify-between rounded-lg border border-gray-700 bg-gray-900 p-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusBadgeVariant(event.status) as any} size="sm">
                            {event.status}
                          </Badge>
                          <p className="text-sm font-medium text-white">{event.eventType}</p>
                        </div>
                        {event.errorMessage && (
                          <p className="mt-2 text-xs text-red-400">{event.errorMessage}</p>
                        )}
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span>Received {formatRelativeTime(new Date(event.receivedAt))}</span>
                          {event.processedAt && (
                            <span>Processed {formatRelativeTime(new Date(event.processedAt))}</span>
                          )}
                          {event.retryCount > 0 && <span>{event.retryCount} retries</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-gray-700 bg-gray-900 p-8 text-center">
                  <p className="text-sm text-gray-400">No sync activity yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
