'use client';

import { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalClose,
  ModalBody,
  ModalFooter,
  ConfirmationModal
} from '@/components/ui/Modal';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  useSortableTable,
  Pagination
} from '@/components/ui/Table';
import { Tooltip, SimpleTooltip } from '@/components/ui/Tooltip';
import {
  Spinner,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  ProgressBar,
  LoadingOverlay,
  LoadingDots
} from '@/components/ui/Loading';
import { showToast } from '@/components/ui/Toast';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuDivider,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem
} from '@/components/ui/DropdownMenu';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  InboxIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

// Sample data for table
const sampleThreads = [
  { id: 1, name: 'Feature Launch: Onboarding v2', status: 'active', owner: 'John Doe', date: '2 hours ago' },
  { id: 2, name: 'Bug Fix: Login Error', status: 'active', owner: 'Jane Smith', date: '1 day ago' },
  { id: 3, name: 'Design Drift: Homepage', status: 'error', owner: 'Mike Johnson', date: '3 days ago' },
  { id: 4, name: 'A/B Test: New Pricing', status: 'paused', owner: 'Sarah Wilson', date: '1 week ago' },
  { id: 5, name: 'Sprint Planning Q4 2025', status: 'completed', owner: 'Tom Brown', date: '2 weeks ago' },
];

export default function AdvancedComponentsDemo() {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);

  // Table states
  const { sortedItems, requestSort, getSortDirection } = useSortableTable(sampleThreads);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  // Loading states
  const [progress, setProgress] = useState(65);
  const [isLoading, setIsLoading] = useState(false);

  // Dropdown states
  const [filterActive, setFilterActive] = useState(true);
  const [filterPaused, setFilterPaused] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Page Header */}
        <div>
          <h1 className="text-4xl font-bold font-heading text-gray-900 dark:text-gray-50 mb-2">
            Advanced Components Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Phase 4: Modals, Tables, Tooltips, Loading States, Toasts, Dropdown Menus, and Empty States
          </p>
        </div>

        {/* Modal Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-gray-50">
            1. Modal / Dialog Component
          </h2>

          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setIsModalOpen(true)}>
              Open Modal (md)
            </Button>
            <Button variant="secondary" onClick={() => setIsConfirmModalOpen(true)}>
              Confirmation Modal
            </Button>
            <Button variant="danger" onClick={() => setIsDangerModalOpen(true)}>
              Danger Modal
            </Button>
          </div>

          {/* Standard Modal */}
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="md">
            <ModalHeader>
              <ModalTitle>Create New Thread</ModalTitle>
              <ModalClose onClose={() => setIsModalOpen(false)} />
            </ModalHeader>
            <ModalBody>
              <p className="mb-4">
                Golden Threads connect your design, code, and project management tools to ensure
                everyone stays in sync throughout the product development lifecycle.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Thread Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="e.g., Feature Launch: New Dashboard"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    rows={3}
                    placeholder="Describe what this thread tracks..."
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setIsModalOpen(false);
                showToast.success('Thread created successfully!');
              }}>
                Create Thread
              </Button>
            </ModalFooter>
          </Modal>

          {/* Confirmation Modal */}
          <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={() => showToast.info('Confirmed!')}
            title="Archive Thread?"
            message="Are you sure you want to archive this thread? You can restore it later from the archives."
            confirmText="Archive"
            cancelText="Cancel"
            icon={<ExclamationTriangleIcon className="h-6 w-6" />}
          />

          {/* Danger Modal */}
          <ConfirmationModal
            isOpen={isDangerModalOpen}
            onClose={() => setIsDangerModalOpen(false)}
            onConfirm={() => showToast.error('Thread deleted')}
            title="Delete Thread?"
            message="This action cannot be undone. All data associated with this thread will be permanently deleted."
            confirmText="Delete"
            cancelText="Cancel"
            variant="danger"
            icon={<TrashIcon className="h-6 w-6" />}
          />
        </section>

        {/* Table Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-gray-50">
            2. Table Component
          </h2>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  sortable
                  sorted={getSortDirection('name')}
                  onSort={() => requestSort('name')}
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
                <TableHead
                  sortable
                  sorted={getSortDirection('owner')}
                  onSort={() => requestSort('owner')}
                >
                  Owner
                </TableHead>
                <TableHead
                  sortable
                  sorted={getSortDirection('date')}
                  onSort={() => requestSort('date')}
                >
                  Last Update
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.map((thread) => (
                <TableRow
                  key={thread.id}
                  selected={selectedRow === thread.id}
                  onClick={() => setSelectedRow(thread.id === selectedRow ? null : thread.id)}
                >
                  <TableCell className="font-medium">{thread.name}</TableCell>
                  <TableCell>
                    <Badge variant={thread.status as any}>{thread.status}</Badge>
                  </TableCell>
                  <TableCell>{thread.owner}</TableCell>
                  <TableCell className="text-gray-500">{thread.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            currentPage={currentPage}
            totalPages={3}
            onPageChange={setCurrentPage}
          />
        </section>

        {/* Tooltip Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-gray-50">
            3. Tooltip Component
          </h2>

          <div className="flex flex-wrap gap-4">
            <Tooltip content="This tooltip appears on top" position="top">
              <Button variant="secondary">Top Tooltip</Button>
            </Tooltip>

            <Tooltip content="This tooltip appears on the right" position="right">
              <Button variant="secondary">Right Tooltip</Button>
            </Tooltip>

            <Tooltip content="This tooltip appears on the bottom" position="bottom">
              <Button variant="secondary">Bottom Tooltip</Button>
            </Tooltip>

            <Tooltip content="This tooltip appears on the left" position="left">
              <Button variant="secondary">Left Tooltip</Button>
            </Tooltip>

            <SimpleTooltip content="Simple tooltip">
              <Button variant="outline">Simple Tooltip</Button>
            </SimpleTooltip>
          </div>

          <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tooltips support{' '}
              <Tooltip content="Auto-positioning ensures tooltips stay within viewport">
                <span className="text-primary underline cursor-help">auto-positioning</span>
              </Tooltip>
              {' '}and have a{' '}
              <Tooltip content="200ms delay prevents tooltips from appearing too quickly">
                <span className="text-primary underline cursor-help">hover delay</span>
              </Tooltip>
              {' '}for better UX.
            </p>
          </div>
        </section>

        {/* Loading States */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-gray-50">
            4. Loading States
          </h2>

          {/* Spinners */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Spinners</h3>
            <div className="flex items-center gap-6">
              <div className="space-y-2">
                <Spinner size="xs" />
                <p className="text-xs text-gray-500">xs (16px)</p>
              </div>
              <div className="space-y-2">
                <Spinner size="sm" />
                <p className="text-xs text-gray-500">sm (20px)</p>
              </div>
              <div className="space-y-2">
                <Spinner size="md" />
                <p className="text-xs text-gray-500">md (24px)</p>
              </div>
              <div className="space-y-2">
                <Spinner size="lg" />
                <p className="text-xs text-gray-500">lg (32px)</p>
              </div>
              <div className="space-y-2">
                <Spinner size="xl" />
                <p className="text-xs text-gray-500">xl (40px)</p>
              </div>
              <div className="space-y-2">
                <LoadingDots />
                <p className="text-xs text-gray-500">Dots</p>
              </div>
            </div>
          </div>

          {/* Skeletons */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Skeleton Loaders</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-sm font-medium">Text Skeleton</p>
                <SkeletonText lines={3} />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium">Card Skeleton</p>
                <SkeletonCard />
              </div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Progress Bars</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm mb-2">Primary (65%)</p>
                <ProgressBar value={progress} color="primary" showLabel />
              </div>
              <div>
                <p className="text-sm mb-2">Success (100%)</p>
                <ProgressBar value={100} color="success" />
              </div>
              <div>
                <p className="text-sm mb-2">Warning (45%)</p>
                <ProgressBar value={45} color="warning" />
              </div>
              <div>
                <p className="text-sm mb-2">Indeterminate</p>
                <ProgressBar color="primary" />
              </div>
              <div className="flex gap-4">
                <Button size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>
                  Decrease
                </Button>
                <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>
                  Increase
                </Button>
              </div>
            </div>
          </div>

          {/* Loading Overlay */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Loading Overlay</h3>
            <div className="relative h-64">
              <LoadingOverlay isLoading={isLoading} message="Loading threads...">
                <div className="h-64 p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                  <h4 className="text-lg font-semibold mb-4">Thread List</h4>
                  <SkeletonTable rows={3} />
                </div>
              </LoadingOverlay>
            </div>
            <Button onClick={() => setIsLoading(!isLoading)}>
              Toggle Loading
            </Button>
          </div>
        </section>

        {/* Toast Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-gray-50">
            5. Toast Notifications
          </h2>

          <div className="flex flex-wrap gap-4">
            <Button onClick={() => showToast.success('Thread created successfully!')}>
              Success Toast
            </Button>
            <Button onClick={() => showToast.error('Failed to delete thread')}>
              Error Toast
            </Button>
            <Button onClick={() => showToast.warning('Design drift detected in 3 files')}>
              Warning Toast
            </Button>
            <Button onClick={() => showToast.info('New update available')}>
              Info Toast
            </Button>
          </div>
        </section>

        {/* Dropdown Menu Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-gray-50">
            6. Dropdown Menu
          </h2>

          <div className="flex flex-wrap gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger>
                Actions
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem icon={<PencilIcon className="h-5 w-5" />}>
                  Edit Thread
                </DropdownMenuItem>
                <DropdownMenuItem icon={<DocumentDuplicateIcon className="h-5 w-5" />}>
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuDivider />
                <DropdownMenuItem
                  icon={<TrashIcon className="h-5 w-5" />}
                  variant="danger"
                  onClick={() => showToast.error('Thread deleted')}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger>
                Filters
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filterActive}
                  onCheckedChange={setFilterActive}
                >
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterPaused}
                  onCheckedChange={setFilterPaused}
                >
                  Paused
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </section>

        {/* Empty State Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-gray-50">
            7. Empty States
          </h2>

          <EmptyState
            illustration="threads"
            title="No threads yet"
            description="Create your first Golden Thread to connect your design, code, and project management tools."
            action={{
              label: 'Create Thread',
              onClick: () => setIsModalOpen(true)
            }}
            secondaryAction={{
              label: 'Learn more',
              onClick: () => showToast.info('Opening documentation...')
            }}
          />
        </section>
      </div>
    </div>
  );
}
