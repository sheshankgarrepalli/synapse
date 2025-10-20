import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectOption } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyStateWithTemplates, Template } from '@/components/EmptyStateWithTemplates';
import { IntegrationPrompt } from '@/components/IntegrationPrompt';
import { api } from '@/utils/api';
import { formatRelativeTime, getStatusColor } from '@/lib/utils';
import { shouldShowIntegrationPrompt, type IntegrationType } from '@/lib/integrations/recommendations';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const statusOptions: SelectOption[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'planning', label: 'Planning' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'planning' | 'in_progress' | 'review' | 'completed' | 'archived'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [integrationPromptDismissed, setIntegrationPromptDismissed] = useState(false);

  // Fetch threads
  const { data: threadsData, isLoading } = api.threads.list.useQuery({
    limit: 20,
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  // Fetch analytics
  const { data: analytics } = api.analytics.getDashboard.useQuery();

  // Mock user integrations for now - TODO: fetch from API
  const userIntegrations: IntegrationType[] = ['linear']; // Example: user has only Linear connected
  const threadCount = threadsData?.threads.length || 0;

  // Determine if we should show integration prompt
  const showIntegrationPrompt =
    !integrationPromptDismissed &&
    shouldShowIntegrationPrompt(userIntegrations, threadCount);

  const handleConnectIntegration = (integration: IntegrationType) => {
    // TODO: Trigger OAuth flow for integration
    console.log('Connecting integration:', integration);
    // For now, just dismiss the prompt
    setIntegrationPromptDismissed(true);
  };

  const handleDismissPrompt = () => {
    setIntegrationPromptDismissed(true);
    // TODO: Store dismissal in localStorage or user preferences with timestamp
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-gray-600">Manage your Golden Threads across all tools</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusIcon className="mr-2 h-5 w-5" />
            New Thread
          </Button>
        </div>

        {/* Analytics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Metric Alerts</p>
                <div className="mt-2 text-3xl font-bold text-gray-900">{analytics?.totalThreads || 2686}</div>
                <p className="mt-1 text-xs text-gray-500">Metric wins</p>
              </div>
              <div className="rounded-lg bg-purple-100 p-2">
                <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 bg-purple-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Connect Users</p>
                <div className="mt-2 text-3xl font-bold text-gray-900">{analytics?.activeThreads || '57.2'}</div>
                <p className="mt-1 text-xs text-gray-500">Metric wins</p>
              </div>
              <div className="rounded-lg bg-blue-100 p-2">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '57%' }} />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-white border-pink-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Workflow Progress</p>
                <div className="mt-2 text-3xl font-bold text-gray-900">{analytics?.totalItems || '27.7'}</div>
                <p className="mt-1 text-xs text-gray-500">2d/4h</p>
              </div>
              <div className="rounded-lg bg-pink-100 p-2">
                <svg className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 bg-pink-100 rounded-full overflow-hidden">
                <div className="h-full bg-pink-600 rounded-full" style={{ width: '28%' }} />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Thread Activity</p>
                <div className="mt-2 text-3xl font-bold text-gray-900">{analytics?.activeIntegrations || 10}</div>
                <p className="mt-1 text-xs text-gray-500">Weekly</p>
              </div>
              <div className="rounded-lg bg-indigo-100 p-2">
                <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
          </Card>
        </div>

        {/* Integration Prompt (shown when conditions are met) */}
        {showIntegrationPrompt && (
          <IntegrationPrompt
            userIntegrations={userIntegrations}
            onConnect={handleConnectIntegration}
            onDismiss={handleDismissPrompt}
          />
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="Search threads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as typeof statusFilter)}
                options={statusOptions}
                placeholder="Filter by status"
              />
            </div>
          </CardContent>
        </Card>

        {/* Threads List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              </CardContent>
            </Card>
          ) : threadsData?.threads.length === 0 ? (
            <EmptyStateWithTemplates
              onCreateFromTemplate={(template: Template) => {
                // Pre-populate the create modal with template data
                setIsCreateModalOpen(true);
                // TODO: Pass template data to modal to pre-fill
              }}
              onCreateBlank={() => setIsCreateModalOpen(true)}
            />
          ) : (
            threadsData?.threads.map((thread) => (
              <Link key={thread.id} href={`/threads/${thread.id}`}>
                <Card hover>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-white">{thread.title}</h3>
                          <Badge variant={thread.status === 'completed' ? 'success' : 'primary'}>
                            {thread.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        {thread.description && (
                          <p className="mt-2 text-sm text-gray-400 line-clamp-2">{thread.description}</p>
                        )}
                        <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                          <span>Updated {formatRelativeTime(new Date(thread.updatedAt))}</span>
                          {thread._count?.connectedItems > 0 && (
                            <span>{thread._count.connectedItems} connected items</span>
                          )}
                        </div>
                      </div>
                      <div className={`h-3 w-3 rounded-full ${getStatusColor(thread.status)}`} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {threadsData && threadsData.nextCursor && (
          <div className="flex justify-center">
            <Button variant="outline">Load More</Button>
          </div>
        )}
      </div>

      {/* Create Thread Modal */}
      <CreateThreadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </Layout>
  );
}

// Create Thread Modal Component
function CreateThreadModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'planning' | 'in_progress' | 'review' | 'completed' | 'archived'>('planning');

  const utils = api.useUtils();
  const createThread = api.threads.create.useMutation({
    onSuccess: () => {
      utils.threads.list.invalidate();
      utils.analytics.getDashboard.invalidate();
      onClose();
      setTitle('');
      setDescription('');
      setStatus('planning');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createThread.mutate({
      title,
      description: description || undefined,
      status,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Golden Thread"
      description="Create a new thread to connect items across your tools"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter thread title..."
          required
        />
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter thread description..."
            className="flex min-h-[100px] w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Select
          label="Status"
          value={status}
          onChange={(value) => setStatus(value as typeof status)}
          options={statusOptions.filter(opt => opt.value !== 'all')}
        />
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createThread.isLoading} disabled={!title}>
            Create Thread
          </Button>
        </div>
      </form>
    </Modal>
  );
}
