/**
 * Drift Watch Detail Page
 * View a specific drift watch and its alerts
 */

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/Button';
import { api } from '@/utils/api';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Pause,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { formatDistanceToNow } from 'date-fns';

type WatchStatus = 'healthy' | 'drift_detected' | 'error';

export default function DriftWatchDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());

  const { data: watch, isLoading } = api.drift.getWatchById.useQuery(
    { id: id as string },
    { enabled: !!id }
  );

  const { data: alertsData } = api.drift.getAlerts.useQuery(
    { watchId: id as string, limit: 50, offset: 0 },
    { enabled: !!id }
  );

  const updateWatchMutation = api.drift.updateWatch.useMutation({
    onSuccess: () => {
      // Refetch the watch data
      api.useContext().drift.getWatchById.invalidate();
    },
  });

  const deleteWatchMutation = api.drift.deleteWatch.useMutation({
    onSuccess: () => {
      router.push('/drift');
    },
  });

  const acknowledgeAlertMutation = api.drift.acknowledgeAlert.useMutation({
    onSuccess: () => {
      api.useContext().drift.getAlerts.invalidate();
    },
  });

  const toggleAlert = (alertId: string) => {
    setExpandedAlerts((prev) => {
      const next = new Set(prev);
      if (next.has(alertId)) {
        next.delete(alertId);
      } else {
        next.add(alertId);
      }
      return next;
    });
  };

  const handleToggleWatch = () => {
    if (!id || !watch) return;
    updateWatchMutation.mutate({ id: id as string, isActive: !watch.isActive });
  };

  const handleDeleteWatch = () => {
    if (!id) return;
    if (
      confirm(
        'Are you sure you want to delete this drift watch? This action cannot be undone.'
      )
    ) {
      deleteWatchMutation.mutate({ id: id as string });
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    acknowledgeAlertMutation.mutate({ id: alertId });
  };

  const getStatusBadge = (status: WatchStatus) => {
    switch (status) {
      case 'healthy':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            Healthy
          </span>
        );
      case 'drift_detected':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF9F1C]/10 px-3 py-1 text-sm font-medium text-[#FF9F1C]">
            <AlertCircle className="h-4 w-4" />
            Drift Detected
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-sm font-medium text-red-400">
            <XCircle className="h-4 w-4" />
            Error
          </span>
        );
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return 'text-red-400 bg-red-500/10';
      case 'medium':
        return 'text-[#FF9F1C] bg-[#FF9F1C]/10';
      case 'low':
        return 'text-yellow-400 bg-yellow-500/10';
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#FCA311] dark:border-[#FF9F1C] border-r-transparent"></div>
            <p className="mt-4 text-gray-500 dark:text-[#FDFFFC]/60">
              Loading watch...
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!watch) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-[#FDFFFC]/60">Watch not found</p>
        </div>
      </AppLayout>
    );
  }

  const alerts = alertsData?.alerts || [];

  return (
    <AppLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/drift"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-[#FDFFFC]/60 minimal:text-gray-600 hover:text-[#FCA311] dark:hover:text-[#FF9F1C] minimal:hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Drift Watches
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900">
                  {watch.figmaComponentName}
                </h1>
                {getStatusBadge(watch.status as WatchStatus)}
                {!watch.isActive && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-500/10 px-3 py-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Paused
                  </span>
                )}
              </div>
              <p className="text-gray-500 dark:text-[#FDFFFC]/60 minimal:text-gray-600">
                Monitoring drift between Figma and GitHub
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleToggleWatch}
                disabled={updateWatchMutation.isLoading}
                className="border-gray-300 dark:border-[#2EC4B6]/20 minimal:border-gray-300 text-gray-700 dark:text-[#FDFFFC]/80 minimal:text-gray-700 hover:bg-gray-50 dark:hover:bg-[#2EC4B6]/10 minimal:hover:bg-gray-100"
              >
                {watch.isActive ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteWatch}
                disabled={deleteWatchMutation.isLoading}
                className="border-red-300 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Watch Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Figma Info */}
          <div className="bg-white dark:bg-[#011627] minimal:bg-white border border-gray-200 dark:border-[#2EC4B6]/20 minimal:border-gray-300 rounded-2xl shadow-sm dark:shadow-[#2EC4B6]/5 minimal:shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 text-[#FCA311] dark:text-[#FF9F1C]">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 24c2.208 0 4-1.792 4-4v-4H8c-2.208 0-4 1.792-4 4s1.792 4 4 4z" />
                  <path d="M4 12c0-2.208 1.792-4 4-4h4v8H8c-2.208 0-4-1.792-4-4z" />
                  <path d="M4 4c0-2.208 1.792-4 4-4h4v8H8C5.792 8 4 6.208 4 4z" />
                  <path d="M12 0h4c2.208 0 4 1.792 4 4s-1.792 4-4 4h-4V0z" />
                  <path d="M20 12c0 2.208-1.792 4-4 4s-4-1.792-4-4 1.792-4 4-4 4 1.792 4 4z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900">
                Figma Component
              </h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-[#FDFFFC]/60 minimal:text-gray-600 mb-1">
                  File
                </p>
                <p className="text-sm text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900">
                  {watch.figmaFileName}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-[#FDFFFC]/60 minimal:text-gray-600 mb-1">
                  Component
                </p>
                <p className="text-sm text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900">
                  {watch.figmaComponentName}
                </p>
              </div>
              <a
                href={`https://figma.com/file/${watch.figmaFileId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#FCA311] dark:text-[#FF9F1C] hover:underline"
              >
                Open in Figma
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* GitHub Info */}
          <div className="bg-white dark:bg-[#011627] minimal:bg-white border border-gray-200 dark:border-[#2EC4B6]/20 minimal:border-gray-300 rounded-2xl shadow-sm dark:shadow-[#2EC4B6]/5 minimal:shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 text-gray-700 dark:text-[#FDFFFC]/80">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900">
                GitHub File
              </h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-[#FDFFFC]/60 minimal:text-gray-600 mb-1">
                  Repository
                </p>
                <p className="text-sm text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900">
                  {watch.githubRepoName}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-[#FDFFFC]/60 minimal:text-gray-600 mb-1">
                  File Path
                </p>
                <p className="text-sm text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 font-mono">
                  {watch.githubFilePath}
                </p>
              </div>
              <a
                href={`https://github.com/${watch.githubRepoName}/blob/${watch.githubBranch}/${watch.githubFilePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#FCA311] dark:text-[#FF9F1C] hover:underline"
              >
                Open in GitHub
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Watch Stats */}
        <div className="bg-white dark:bg-[#011627] minimal:bg-white border border-gray-200 dark:border-[#2EC4B6]/20 minimal:border-gray-300 rounded-2xl shadow-sm dark:shadow-[#2EC4B6]/5 minimal:shadow-sm p-6 mb-8">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-[#FDFFFC]/60 minimal:text-gray-600 mb-1">
                Check Frequency
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 capitalize">
                {watch.checkFrequency}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-[#FDFFFC]/60 minimal:text-gray-600 mb-1">
                Last Checked
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900">
                {watch.lastCheckedAt
                  ? formatDistanceToNow(new Date(watch.lastCheckedAt), {
                      addSuffix: true,
                    })
                  : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-[#FDFFFC]/60 minimal:text-gray-600 mb-1">
                Last Healthy
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900">
                {watch.lastHealthyAt
                  ? formatDistanceToNow(new Date(watch.lastHealthyAt), {
                      addSuffix: true,
                    })
                  : 'Never'}
              </p>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 mb-6">
            Drift Alerts
          </h2>

          {alerts.length === 0 ? (
            <div className="bg-white dark:bg-[#011627] minimal:bg-white border border-gray-200 dark:border-[#2EC4B6]/20 minimal:border-gray-300 rounded-2xl shadow-sm dark:shadow-[#2EC4B6]/5 minimal:shadow-sm p-12">
              <div className="text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 mb-2">
                  No drift detected
                </h3>
                <p className="text-gray-500 dark:text-[#FDFFFC]/60 minimal:text-gray-600">
                  This watch is healthy. You'll see alerts here when drift is
                  detected.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-white dark:bg-[#011627] minimal:bg-white border border-gray-200 dark:border-[#2EC4B6]/20 minimal:border-gray-300 rounded-2xl shadow-sm dark:shadow-[#2EC4B6]/5 minimal:shadow-sm overflow-hidden"
                >
                  {/* Alert Header */}
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#01121F] minimal:hover:bg-gray-50 transition-colors"
                    onClick={() => toggleAlert(alert.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getSeverityColor(
                              alert.severity as 'low' | 'medium' | 'high'
                            )}`}
                          >
                            {alert.severity.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-[#FDFFFC]/60 minimal:text-gray-600">
                            {alert.changeCount} change
                            {alert.changeCount !== 1 ? 's' : ''} detected
                          </span>
                          {alert.acknowledged && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-500/10 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                              <CheckCircle2 className="w-3 h-3" />
                              Acknowledged
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#FDFFFC]/60 minimal:text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>
                            Detected{' '}
                            {formatDistanceToNow(new Date(alert.detectedAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcknowledgeAlert(alert.id);
                            }}
                            className="border-gray-300 dark:border-[#2EC4B6]/20 minimal:border-gray-300 text-gray-700 dark:text-[#FDFFFC]/80 minimal:text-gray-700 hover:bg-gray-50 dark:hover:bg-[#2EC4B6]/10 minimal:hover:bg-gray-100"
                          >
                            Acknowledge
                          </Button>
                        )}
                        {expandedAlerts.has(alert.id) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Alert Details */}
                  {expandedAlerts.has(alert.id) && (
                    <div className="border-t border-gray-200 dark:border-[#2EC4B6]/20 minimal:border-gray-200 p-6 bg-gray-50 dark:bg-[#01121F] minimal:bg-gray-50">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 mb-3">
                        Changes Detected:
                      </h4>
                      <div className="space-y-3">
                        {(alert.changes as any[]).map((change, idx) => (
                          <div
                            key={idx}
                            className="bg-white dark:bg-[#011627] minimal:bg-white border border-gray-200 dark:border-[#2EC4B6]/20 minimal:border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900">
                                {change.property}
                              </span>
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded ${getSeverityColor(
                                  change.severity
                                )}`}
                              >
                                {change.severity}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-[#FDFFFC]/60 minimal:text-gray-600 mb-1">
                                  Old Value:
                                </p>
                                <pre className="text-xs font-mono text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 bg-gray-100 dark:bg-[#01121F] minimal:bg-gray-100 p-2 rounded overflow-auto">
                                  {JSON.stringify(change.oldValue, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-[#FDFFFC]/60 minimal:text-gray-600 mb-1">
                                  New Value:
                                </p>
                                <pre className="text-xs font-mono text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 bg-gray-100 dark:bg-[#01121F] minimal:bg-gray-100 p-2 rounded overflow-auto">
                                  {JSON.stringify(change.newValue, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
