import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useOrganization } from '@clerk/nextjs';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectOption } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalClose } from '@/components/ui/Modal';
import { api } from '@/utils/api';
import { formatRelativeTime } from '@/lib/utils';
import { useRealtimeThread } from '@/hooks/use-realtime-thread';
import { usePresence } from '@/hooks/use-presence';
import { useRealtimeComments } from '@/hooks/use-realtime-comments';
import { useRealtimeActivity } from '@/hooks/use-realtime-activity';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowTopRightOnSquareIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import {
  ThreadTimeline,
  ThreadConnections,
  ThreadFlowDiagram,
  ThreadStatus,
} from '@/components/visualization';

const statusOptions: SelectOption[] = [
  { value: 'planning', label: 'Planning' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

export default function ThreadDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { organization } = useOrganization();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [localThread, setLocalThread] = useState<any>(null);
  const [localComments, setLocalComments] = useState<any[]>([]);

  const { data: thread, isLoading } = api.threads.getById.useQuery(
    { id: id as string },
    { enabled: !!id }
  );

  const { data: items } = api.items.getByThread.useQuery(
    { threadId: id as string },
    { enabled: !!id }
  );

  const { data: comments } = api.comments.list.useQuery(
    { threadId: id as string },
    { enabled: !!id }
  );

  const { data: activity } = api.threads.getActivity.useQuery(
    { threadId: id as string },
    { enabled: !!id }
  );

  // Real-time hooks
  const { threadUpdate } = useRealtimeThread(id as string, {
    organizationId: organization?.id,
    enabled: !!id && !!organization?.id,
  });

  const { members: viewers } = usePresence(id as string, {
    enabled: !!id,
  });

  const { newComment, updatedComment, deletedCommentId } = useRealtimeComments(
    id as string,
    {
      organizationId: organization?.id,
      enabled: !!id && !!organization?.id,
    }
  );

  const { latestActivity } = useRealtimeActivity({
    organizationId: organization?.id,
    enabled: !!organization?.id,
  });

  // Initialize local state from server data
  useEffect(() => {
    if (thread) {
      setLocalThread(thread);
    }
  }, [thread]);

  useEffect(() => {
    if (comments?.comments) {
      setLocalComments(comments.comments);
    }
  }, [comments]);

  // Apply real-time thread updates
  useEffect(() => {
    if (threadUpdate && localThread) {
      setLocalThread((prev: any) => ({
        ...prev,
        ...threadUpdate,
      }));
    }
  }, [threadUpdate, localThread]);

  // Apply real-time comment updates
  useEffect(() => {
    if (newComment) {
      setLocalComments((prev) => [newComment, ...prev]);
    }
  }, [newComment]);

  useEffect(() => {
    if (updatedComment) {
      setLocalComments((prev) =>
        prev.map((comment) =>
          comment.id === updatedComment.id ? updatedComment : comment
        )
      );
    }
  }, [updatedComment]);

  useEffect(() => {
    if (deletedCommentId) {
      setLocalComments((prev) =>
        prev.filter((comment) => comment.id !== deletedCommentId)
      );
    }
  }, [deletedCommentId]);

  const utils = api.useUtils();
  const deleteThread = api.threads.delete.useMutation({
    onSuccess: () => {
      router.push('/threads');
    },
  });

  const displayThread = localThread || thread;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </AppLayout>
    );
  }

  if (!displayThread && !isLoading) {
    return (
      <AppLayout>
        <div className="py-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-[#FDFFFC]">Thread not found</h3>
          <Button className="mt-4" onClick={() => router.push('/threads')}>
            Back to Threads
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (!displayThread) {
    return null;
  }

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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back Navigation */}
        <Button
          variant="ghost"
          leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          onClick={() => router.push('/threads')}
          className="mb-6 text-gray-600 dark:text-[#FDFFFC]/60 hover:text-gray-900 dark:hover:text-[#FDFFFC]"
        >
          Back to Threads
        </Button>

        {/* Thread Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#FDFFFC]">
              {displayThread.title}
            </h1>
            <Button
              variant="outline"
              leftIcon={<PencilIcon className="h-5 w-5" />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-[#FDFFFC]/60">
            <Badge variant={getStatusBadgeVariant(displayThread.status)}>
              {displayThread.status.replace('_', ' ')}
            </Badge>
            <span>Owner: User</span>
            <span>Created {formatRelativeTime(new Date(displayThread.createdAt))}</span>
            {viewers.length > 0 && (
              <div className="flex items-center space-x-2">
                <UserGroupIcon className="h-4 w-4" />
                <span>{viewers.length} viewing</span>
                <div className="flex -space-x-2">
                  {viewers.slice(0, 3).map((viewer) => (
                    <div
                      key={viewer.id}
                      className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary text-xs font-medium text-white"
                      title={viewer.name}
                    >
                      {viewer.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {viewers.length > 3 && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-gray-700 text-xs font-medium text-white">
                      +{viewers.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {displayThread.description && (
            <p className="mt-3 text-gray-500 dark:text-[#FDFFFC]/60">{displayThread.description}</p>
          )}
        </div>

        {/* Connected Tools Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-[#FDFFFC] mb-6">
            Connected Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items && items.length > 0 ? (
              items.map((item) => {
                const integrationIcon = {
                  figma: '🎨',
                  linear: '📋',
                  github: '💻',
                  slack: '💬'
                }[item.integrationType] || '🔗';

                return (
                  <Card key={item.id} hover>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">{integrationIcon}</span>
                        <span>{item.integrationType.charAt(0).toUpperCase() + item.integrationType.slice(1)}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {item.itemType || 'Item'}: {item.title || 'Untitled'}
                      </p>
                      <Badge variant="primary" size="sm">
                        Active
                      </Badge>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Updated: {formatRelativeTime(new Date(item.updatedAt))}
                      </p>
                      {item.externalUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-3 w-full justify-between"
                          rightIcon={<ArrowTopRightOnSquareIcon className="h-4 w-4" />}
                          onClick={() => window.open(item.externalUrl!, '_blank')}
                        >
                          Open in {item.integrationType.charAt(0).toUpperCase() + item.integrationType.slice(1)}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 mb-4">No connected items yet</p>
                <Button onClick={() => setIsConnectModalOpen(true)} leftIcon={<PlusIcon className="h-5 w-5" />}>
                  Connect First Item
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Golden Thread Visualizations */}
        {items && items.length > 0 && (
          <>
            {/* Thread Connections Visualization */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold font-heading text-gray-900 dark:text-white mb-4">
                Golden Thread Connections
              </h2>
              <Card>
                <CardContent className="pt-6">
                  <ThreadConnections
                    integrations={items.map((item) => ({
                      type: item.integrationType as 'figma' | 'linear' | 'github' | 'slack',
                      status: 'connected' as const,
                    }))}
                  />
                  <div className="mt-4 text-center">
                    <ThreadStatus status="healthy" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Thread Flow Diagram */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold font-heading text-gray-900 dark:text-white mb-4">
                Thread Flow View
              </h2>
              <ThreadFlowDiagram
                nodes={items.map((item, index) => ({
                  id: item.id,
                  type: item.integrationType as 'figma' | 'linear' | 'github' | 'slack',
                  label: item.title?.substring(0, 10) || item.integrationType,
                  x: 100 + index * 150,
                  y: 200,
                }))}
                connections={
                  items.length > 1
                    ? items.slice(0, -1).map((item, index) => ({
                        from: item.id,
                        to: items[index + 1].id,
                        status: 'active' as const,
                      }))
                    : []
                }
                onNodeClick={(nodeId) => {
                  const item = items.find((i) => i.id === nodeId);
                  if (item?.externalUrl) {
                    window.open(item.externalUrl, '_blank');
                  }
                }}
              />
            </div>
          </>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">

            {/* Golden Thread Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Golden Thread Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ThreadTimeline
                  activities={
                    activity && activity.activities
                      ? activity.activities.map((event: any) => {
                          const integrationMap: Record<string, 'figma' | 'linear' | 'github' | 'slack' | undefined> = {
                            'item_connected': items?.find((i) => i.id === event.metadata?.itemId)?.integrationType as any,
                          };

                          const titleMap: Record<string, string> = {
                            'thread_created': 'Thread Created',
                            'item_connected': 'Item Connected',
                            'comment_added': 'Comment Added',
                            'status_changed': 'Status Changed',
                            'updated': 'Thread Updated',
                          };

                          return {
                            id: event.id,
                            type: event.type as any,
                            title: titleMap[event.type] || event.type,
                            description: event.metadata?.description || 'Activity occurred',
                            timestamp: formatRelativeTime(new Date(event.createdAt)),
                            integration: integrationMap[event.type],
                            active: event.type === 'status_changed' && displayThread.status === 'in_progress',
                          };
                        })
                      : []
                  }
                />
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle>Comments ({localComments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {localComments.length > 0 ? (
                  <div className="space-y-4 mb-4">
                    {localComments.map((comment: any) => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                          <span className="text-xs font-medium text-white">U</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">User</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatRelativeTime(new Date(comment.createdAt))}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                    <p>No comments yet. Be the first to comment!</p>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <CommentForm threadId={displayThread.id} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  leftIcon={<PlusIcon className="h-4 w-4" />}
                  onClick={() => setIsConnectModalOpen(true)}
                >
                  Add Item
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  leftIcon={<PencilIcon className="h-4 w-4" />}
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Edit Thread
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full justify-start"
                  leftIcon={<TrashIcon className="h-4 w-4" />}
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  Delete Thread
                </Button>
              </CardContent>
            </Card>

            {/* Thread Details */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400 block mb-1">Status</span>
                  <Badge variant={getStatusBadgeVariant(displayThread.status)}>
                    {displayThread.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400 block mb-1">Created</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatRelativeTime(new Date(displayThread.createdAt))}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400 block mb-1">Last Updated</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatRelativeTime(new Date(displayThread.updatedAt))}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400 block mb-1">Connected Items</span>
                  <span className="text-gray-900 dark:text-white">
                    {items?.length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditThreadModal
        thread={displayThread}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Delete Confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        size="sm"
      >
        <ModalHeader>
          <div className="flex-1">
            <ModalTitle>Delete Thread</ModalTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Are you sure you want to delete this thread? This action cannot be undone.
            </p>
          </div>
          <ModalClose onClose={() => setIsDeleteModalOpen(false)} />
        </ModalHeader>
        <ModalBody>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteThread.isLoading}
              onClick={() => deleteThread.mutate({ id: displayThread.id })}
            >
              Delete Thread
            </Button>
          </div>
        </ModalBody>
      </Modal>

      {/* Connect Items Modal */}
      <ConnectItemsModal
        threadId={displayThread.id}
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />
    </AppLayout>
  );
}

// Comment Form Component
function CommentForm({ threadId }: { threadId: string }) {
  const [content, setContent] = useState('');

  const utils = api.useUtils();
  const createComment = api.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.list.invalidate({ threadId });
      setContent('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createComment.mutate({ threadId, content });
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <Button type="submit" size="sm" loading={createComment.isLoading} disabled={!content.trim()}>
        <ChatBubbleLeftIcon className="h-4 w-4" />
      </Button>
    </form>
  );
}

// Edit Thread Modal
function EditThreadModal({
  thread,
  isOpen,
  onClose,
}: {
  thread: any;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(thread.title);
  const [description, setDescription] = useState(thread.description || '');
  const [status, setStatus] = useState(thread.status);

  const utils = api.useUtils();
  const updateThread = api.threads.update.useMutation({
    onSuccess: () => {
      utils.threads.getById.invalidate({ id: thread.id });
      utils.threads.list.invalidate();
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateThread.mutate({
      id: thread.id,
      title,
      description: description || undefined,
      status,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Edit Thread</ModalTitle>
        <ModalClose onClose={onClose} />
      </ModalHeader>
      <ModalBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Select label="Status" value={status} onChange={setStatus} options={statusOptions} />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={updateThread.isLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}

// Connect Items Modal
function ConnectItemsModal({
  threadId,
  isOpen,
  onClose,
}: {
  threadId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');
  const [externalUrl, setExternalUrl] = useState('');

  const { data: integrations } = api.integrations.list.useQuery();
  const utils = api.useUtils();

  const connectItem = api.items.connect.useMutation({
    onSuccess: () => {
      utils.items.getByThread.invalidate({ threadId });
      setExternalUrl('');
      setSelectedIntegration('');
      onClose();
    },
  });

  const activeIntegrations = integrations?.filter((int) => int.status === 'active') || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntegration || !externalUrl.trim()) return;

    connectItem.mutate({
      threadId,
      integrationType: selectedIntegration as any,
      externalUrl: externalUrl.trim(),
    });
  };

  const integrationOptions: SelectOption[] = activeIntegrations.map((int) => ({
    value: int.integrationType,
    label: int.integrationType.charAt(0).toUpperCase() + int.integrationType.slice(1),
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Connect Item</ModalTitle>
        <ModalClose onClose={onClose} />
      </ModalHeader>
      <ModalBody>
        {activeIntegrations.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-400 mb-4">No active integrations found.</p>
            <p className="text-sm text-gray-500 mb-4">
              You need to connect an integration before you can add items to threads.
            </p>
            <Button onClick={() => window.location.href = '/integrations'}>
              Go to Integrations
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Integration"
              value={selectedIntegration}
              onChange={setSelectedIntegration}
              options={integrationOptions}
              placeholder="Select an integration"
            />
            <Input
              label="Item URL"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://github.com/user/repo/issues/123"
              required
              helperText="Paste the URL from your connected integration (e.g., GitHub issue, Linear ticket, etc.)"
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={connectItem.isLoading}
                disabled={!selectedIntegration || !externalUrl.trim()}
              >
                Connect Item
              </Button>
            </div>
          </form>
        )}
      </ModalBody>
    </Modal>
  );
}
