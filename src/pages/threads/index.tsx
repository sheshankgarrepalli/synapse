import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectOption } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/utils/api';
import { formatRelativeTime, getStatusColor } from '@/lib/utils';
import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const statusOptions: SelectOption[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'planning', label: 'Planning' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

export default function ThreadsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'planning' | 'in_progress' | 'review' | 'completed' | 'archived'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: threadsData, isLoading } = api.threads.list.useQuery({
    limit: 50,
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Golden Threads</h1>
            <p className="mt-1 text-gray-400">Connect and track work across all your tools</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusIcon className="mr-2 h-5 w-5" />
            New Thread
          </Button>
        </div>

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

        {/* Threads Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : threadsData?.threads.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="pt-6">
                  <div className="py-12 text-center">
                    <h3 className="text-lg font-medium text-white">No threads found</h3>
                    <p className="mt-2 text-sm text-gray-400">
                      Get started by creating your first Golden Thread
                    </p>
                    <Button className="mt-4" onClick={() => setIsCreateModalOpen(true)}>
                      <PlusIcon className="mr-2 h-5 w-5" />
                      Create Thread
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            threadsData?.threads.map((thread) => (
              <Link key={thread.id} href={`/threads/${thread.id}`}>
                <Card hover className="h-full">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-white line-clamp-2">{thread.title}</h3>
                        <div className={`ml-2 h-3 w-3 flex-shrink-0 rounded-full ${getStatusColor(thread.status)}`} />
                      </div>

                      {thread.description && (
                        <p className="text-sm text-gray-400 line-clamp-3">{thread.description}</p>
                      )}

                      <div className="space-y-2">
                        <Badge variant={thread.status === 'completed' ? 'success' : 'primary'}>
                          {thread.status.replace('_', ' ')}
                        </Badge>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Updated {formatRelativeTime(new Date(thread.updatedAt))}</span>
                          {thread._count?.connectedItems > 0 && (
                            <span>{thread._count.connectedItems} items</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
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
