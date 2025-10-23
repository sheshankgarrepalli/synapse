/**
 * Drift Watch Dashboard
 * Monitor all design-code drift watches
 */

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/Button';
import { api } from '@/utils/api';
import { Plus, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { formatDistanceToNow } from 'date-fns';

type WatchStatus = 'healthy' | 'drift_detected' | 'error';
type FilterTab = 'all' | WatchStatus;

export default function DriftDashboard() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<FilterTab>('all');

  // Fetch all drift watches
  const { data: watchesData, isLoading } = api.drift.getWatches.useQuery({
    status: selectedFilter === 'all' ? undefined : selectedFilter,
    limit: 100,
    offset: 0,
  });

  const watches = watchesData?.watches || [];
  const total = watchesData?.total || 0;

  // Calculate stats for filter tabs
  const healthyCount = watches.filter((w) => w.status === 'healthy').length;
  const driftCount = watches.filter((w) => w.status === 'drift_detected').length;
  const errorCount = watches.filter((w) => w.status === 'error').length;

  const getStatusBadge = (status: WatchStatus) => {
    switch (status) {
      case 'healthy':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Healthy
          </span>
        );
      case 'drift_detected':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF9F1C]/10 px-3 py-1 text-xs font-medium text-[#FF9F1C]">
            <AlertCircle className="h-3.5 w-3.5" />
            Drift Detected
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
            <XCircle className="h-3.5 w-3.5" />
            Error
          </span>
        );
      default:
        return null;
    }
  };

  const filterTabs: { label: string; value: FilterTab; count?: number }[] = [
    { label: 'All', value: 'all', count: total },
    { label: 'Healthy', value: 'healthy', count: healthyCount },
    { label: 'Drift Detected', value: 'drift_detected', count: driftCount },
    { label: 'Error', value: 'error', count: errorCount },
  ];

  return (
    <AppLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 mb-2">
              Drift Watch Dashboard
            </h1>
            <p className="text-gray-500 dark:text-[#FDFFFC]/60 minimal:text-gray-600">
              Monitor design-code drift between Figma components and GitHub files
            </p>
          </div>
          <Link href="/drift/create">
            <Button className="bg-[#FCA311] dark:bg-[#FF9F1C] minimal:bg-gray-900 hover:bg-[#FCA311]/90 dark:hover:bg-[#FF9F1C]/90 minimal:hover:bg-gray-800 text-white shadow-lg shadow-[#FCA311]/20 dark:shadow-[#FF9F1C]/20 minimal:shadow-none">
              <Plus className="w-5 h-5 mr-2" />
              Create Watch
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-[#2EC4B6]/20 minimal:border-gray-300">
          <nav className="flex gap-6">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedFilter(tab.value)}
                className={`
                  relative pb-4 px-1 text-sm font-medium transition-colors
                  ${
                    selectedFilter === tab.value
                      ? 'text-[#FCA311] dark:text-[#FF9F1C] minimal:text-gray-900'
                      : 'text-gray-500 dark:text-[#FDFFFC]/60 minimal:text-gray-600 hover:text-gray-700 dark:hover:text-[#FDFFFC]/80 minimal:hover:text-gray-900'
                  }
                `}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`
                      ml-2 rounded-full px-2 py-0.5 text-xs
                      ${
                        selectedFilter === tab.value
                          ? 'bg-[#FCA311]/10 dark:bg-[#FF9F1C]/10 minimal:bg-gray-900/10 text-[#FCA311] dark:text-[#FF9F1C] minimal:text-gray-900'
                          : 'bg-gray-100 dark:bg-[#011627] minimal:bg-gray-200 text-gray-600 dark:text-[#FDFFFC]/60 minimal:text-gray-600'
                      }
                    `}
                  >
                    {tab.count}
                  </span>
                )}
                {selectedFilter === tab.value && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FCA311] dark:bg-[#FF9F1C] minimal:bg-gray-900" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#FCA311] dark:border-[#FF9F1C] border-r-transparent"></div>
              <p className="mt-4 text-gray-500 dark:text-[#FDFFFC]/60">Loading watches...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && watches.length === 0 && (
          <div className="bg-white dark:bg-[#011627] minimal:bg-white border border-gray-200 dark:border-[#2EC4B6]/20 minimal:border-gray-300 rounded-2xl shadow-sm dark:shadow-[#2EC4B6]/5 minimal:shadow-sm p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FCA311]/10 dark:bg-[#FF9F1C]/10 minimal:bg-gray-100 mb-4">
                <AlertCircle className="w-8 h-8 text-[#FCA311] dark:text-[#FF9F1C] minimal:text-gray-900" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 mb-2">
                {selectedFilter === 'all' ? 'No drift watches yet' : `No ${selectedFilter.replace('_', ' ')} watches`}
              </h3>
              <p className="text-gray-500 dark:text-[#FDFFFC]/60 minimal:text-gray-600 mb-6 max-w-md mx-auto">
                {selectedFilter === 'all'
                  ? 'Create your first drift watch to monitor design-code consistency between Figma and GitHub.'
                  : 'No watches match this filter. Try selecting a different filter or create a new watch.'}
              </p>
              {selectedFilter === 'all' && (
                <Link href="/drift/create">
                  <Button className="bg-[#FCA311] dark:bg-[#FF9F1C] minimal:bg-gray-900 hover:bg-[#FCA311]/90 dark:hover:bg-[#FF9F1C]/90 minimal:hover:bg-gray-800 text-white">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Watch
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Watch Cards Grid */}
        {!isLoading && watches.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {watches.map((watch) => (
              <div
                key={watch.id}
                onClick={() => router.push(`/drift/${watch.id}`)}
                className="bg-white dark:bg-[#011627] minimal:bg-white border border-gray-200 dark:border-[#2EC4B6]/20 minimal:border-gray-300 rounded-2xl shadow-sm dark:shadow-[#2EC4B6]/5 minimal:shadow-sm p-6 cursor-pointer transition-all hover:shadow-md dark:hover:shadow-[#2EC4B6]/10 hover:border-[#FCA311]/30 dark:hover:border-[#FF9F1C]/30 minimal:hover:border-gray-400 group"
              >
                {/* Header with Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusBadge(watch.status as WatchStatus)}
                      {!watch.isActive && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-500/10 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                          Paused
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 group-hover:text-[#FCA311] dark:group-hover:text-[#FF9F1C] minimal:group-hover:text-gray-900 transition-colors truncate">
                      {watch.figmaComponentName}
                    </h3>
                  </div>

                  {/* Unacknowledged Alert Count */}
                  {watch._count.alerts > 0 && (
                    <div className="ml-3 flex-shrink-0">
                      <div className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full bg-red-500/10 text-red-400 text-sm font-semibold">
                        {watch._count.alerts}
                      </div>
                    </div>
                  )}
                </div>

                {/* Figma & GitHub Info */}
                <div className="space-y-2.5 mb-4">
                  {/* Figma */}
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 mt-0.5 text-[#FCA311] dark:text-[#FF9F1C]">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 24c2.208 0 4-1.792 4-4v-4H8c-2.208 0-4 1.792-4 4s1.792 4 4 4z" />
                        <path d="M4 12c0-2.208 1.792-4 4-4h4v8H8c-2.208 0-4-1.792-4-4z" />
                        <path d="M4 4c0-2.208 1.792-4 4-4h4v8H8C5.792 8 4 6.208 4 4z" />
                        <path d="M12 0h4c2.208 0 4 1.792 4 4s-1.792 4-4 4h-4V0z" />
                        <path d="M20 12c0 2.208-1.792 4-4 4s-4-1.792-4-4 1.792-4 4-4 4 1.792 4 4z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 dark:text-[#FDFFFC]/60 minimal:text-gray-600 mb-0.5">
                        Figma Component
                      </p>
                      <p className="text-sm text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 truncate">
                        {watch.figmaFileName}
                      </p>
                    </div>
                  </div>

                  {/* GitHub */}
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 mt-0.5 text-gray-700 dark:text-[#FDFFFC]/80">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 dark:text-[#FDFFFC]/60 minimal:text-gray-600 mb-0.5">
                        GitHub File
                      </p>
                      <p className="text-sm text-gray-900 dark:text-[#FDFFFC] minimal:text-gray-900 truncate font-mono">
                        {watch.githubFilePath}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer: Last Checked Time */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-[#2EC4B6]/10 minimal:border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#FDFFFC]/60 minimal:text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      Last checked{' '}
                      {watch.lastCheckedAt
                        ? formatDistanceToNow(new Date(watch.lastCheckedAt), { addSuffix: true })
                        : 'never'}
                    </span>
                  </div>

                  {/* Check Frequency Badge */}
                  <div className="text-xs font-medium text-gray-500 dark:text-[#FDFFFC]/50 minimal:text-gray-500 capitalize">
                    {watch.checkFrequency}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Info */}
        {!isLoading && watches.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-[#FDFFFC]/60 minimal:text-gray-600">
            Showing {watches.length} of {total} watch{total !== 1 ? 'es' : ''}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
