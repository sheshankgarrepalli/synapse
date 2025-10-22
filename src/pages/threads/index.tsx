import { useState } from 'react';
import { useRouter } from 'next/router';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalClose } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  useSortableTable,
  Pagination
} from '@/components/ui/Table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuDivider
} from '@/components/ui/DropdownMenu';
import { api } from '@/utils/api';
import { formatRelativeTime } from '@/lib/utils';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'planning', label: 'Planning' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

// Mock integration icons - in real implementation, these would be based on actual integrations
const getIntegrationIcons = (thread: any) => {
  const icons = ['🎨', '📋', '💻', '💬'];
  const count = Math.min(thread._count?.connectedItems || 0, 4);
  return icons.slice(0, count);
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
    case 'review':
      return 'primary';
    case 'planning':
      return 'warning';
    case 'archived':
      return 'default';
    default:
      return 'default';
  }
};

export default function ThreadsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: threadsData, isLoading } = api.threads.list.useQuery({
    limit: 100,
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? (statusFilter as 'planning' | 'in_progress' | 'review' | 'completed' | 'archived') : undefined,
  });

  const threads = threadsData?.threads || [];

  // Sort functionality
  const { sortedItems, requestSort, getSortDirection } = useSortableTable(threads, {
    key: 'updatedAt',
    direction: 'desc'
  });

  // Pagination
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const paginatedThreads = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRowClick = (threadId: string) => {
    router.push(`/threads/${threadId}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#FDFFFC] mb-2">
              Threads
            </h1>
            <p className="text-gray-500 dark:text-[#FDFFFC]/60">
              Connect and track work across all your tools
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} leftIcon={<PlusIcon className="h-5 w-5" />}>
            New Thread
          </Button>
        </div>

        {/* Filters Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search threads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" rightIcon={<FunnelIcon className="h-5 w-5" />}>
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {statusOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => {
                    setStatusFilter(option.value);
                    setCurrentPage(1);
                  }}
                >
                  {option.label}
                  {statusFilter === option.value && ' ✓'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table View */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : paginatedThreads.length === 0 ? (
          <EmptyState
            illustration="threads"
            title={searchQuery || statusFilter !== 'all' ? 'No threads found' : 'No Golden Threads yet'}
            description={
              searchQuery || statusFilter !== 'all'
                ? "Try adjusting your search or filter to find what you're looking for."
                : 'Golden Threads help you connect and track related work items across all your tools. Create your first thread to get started!'
            }
            action={{
              label: 'Create Thread',
              onClick: () => setIsCreateModalOpen(true),
            }}
            secondaryAction={
              searchQuery || statusFilter !== 'all'
                ? {
                    label: 'Clear Filters',
                    onClick: () => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    },
                  }
                : {
                    label: 'Learn More',
                    href: '/demo',
                  }
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    sortable
                    sorted={getSortDirection('title')}
                    onSort={() => requestSort('title')}
                  >
                    Name
                  </TableHead>
                  <TableHead
                    sortable
                    sorted={getSortDirection('status')}
                    onSort={() => requestSort('status')}
                  >
                    Status
                  </TableHead>
                  <TableHead>Connected Tools</TableHead>
                  <TableHead
                    sortable
                    sorted={getSortDirection('updatedAt')}
                    onSort={() => requestSort('updatedAt')}
                  >
                    Last Update
                  </TableHead>
                  <TableHead> </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedThreads.map((thread) => (
                  <TableRow
                    key={thread.id}
                    onClick={() => handleRowClick(thread.id)}
                  >
                    <TableCell className="font-medium">
                      {thread.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(thread.status)}>
                        {thread.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getIntegrationIcons(thread).map((icon, idx) => (
                          <span key={idx} className="text-xl" title="Integration">
                            {icon}
                          </span>
                        ))}
                        {thread._count?.connectedItems > 4 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                            +{thread._count.connectedItems - 4}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{formatRelativeTime(new Date(thread.updatedAt))}</span>
                        {thread._count?.connectedItems > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {thread._count.connectedItems} {thread._count.connectedItems === 1 ? 'item' : 'items'}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="right">
                          <DropdownMenuItem
                            onClick={() => {
                              router.push(`/threads/${thread.id}`);
                            }}
                            icon={<PencilIcon className="h-5 w-5" />}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              // TODO: Implement duplicate
                            }}
                            icon={<DocumentDuplicateIcon className="h-5 w-5" />}
                          >
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuDivider />
                          <DropdownMenuItem
                            onClick={() => {
                              // TODO: Implement delete
                            }}
                            variant="danger"
                            icon={<TrashIcon className="h-5 w-5" />}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, sortedItems.length)} of {sortedItems.length} threads
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Thread Modal */}
      <CreateThreadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </AppLayout>
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <div className="flex-1">
          <ModalTitle>Create Golden Thread</ModalTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a new thread to connect items across your tools
          </p>
        </div>
        <ModalClose onClose={onClose} />
      </ModalHeader>
      <ModalBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter thread title..."
            required
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter thread description..."
              className="flex min-h-[100px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {statusOptions.filter(opt => opt.value !== 'all').map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={createThread.isLoading} disabled={!title}>
              Create Thread
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}
