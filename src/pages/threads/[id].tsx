import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useOrganization } from '@clerk/nextjs';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectOption } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/utils/api';
import { formatRelativeTime, getStatusColor } from '@/lib/utils';
import { useRealtimeThread } from '@/hooks/use-realtime-thread';
import { usePresence } from '@/hooks/use-presence';
import { useRealtimeComments } from '@/hooks/use-realtime-comments';
import { useRealtimeActivity } from '@/hooks/use-realtime-activity';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  LinkIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

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
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (!displayThread && !isLoading) {
    return (
      <Layout>
        <div className="py-12 text-center">
          <h3 className="text-lg font-medium text-white">Thread not found</h3>
          <Button className="mt-4" onClick={() => router.push('/threads')}>
            Back to Threads
          </Button>
        </div>
      </Layout>
    );
  }

  if (!displayThread) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-white">{displayThread.title}</h1>
              <div className={`h-4 w-4 rounded-full ${getStatusColor(displayThread.status)}`} />
            </div>
            {displayThread.description && (
              <p className="mt-2 text-gray-400">{displayThread.description}</p>
            )}
            <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
              <span>Created {formatRelativeTime(new Date(displayThread.createdAt))}</span>
              <span>Updated {formatRelativeTime(new Date(displayThread.updatedAt))}</span>
              {viewers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <UserGroupIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">{viewers.length} viewing</span>
                  <div className="flex -space-x-2">
                    {viewers.slice(0, 3).map((viewer) => (
                      <div
                        key={viewer.id}
                        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-900 bg-primary text-xs font-medium text-white"
                        title={viewer.name}
                      >
                        {viewer.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {viewers.length > 3 && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-900 bg-gray-700 text-xs font-medium text-white">
                        +{viewers.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button variant="danger" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Connected Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Connected Items</CardTitle>
                  <Button size="sm" onClick={() => setIsConnectModalOpen(true)}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {items && items.length > 0 ? (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-gray-800 p-4"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                            <span className="text-xs font-medium text-primary">
                              {item.integrationType.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{item.title || 'Untitled'}</h4>
                            <p className="text-sm text-gray-500">
                              {item.integrationType.charAt(0).toUpperCase() + item.integrationType.slice(1)}
                              {item.itemType && ` • ${item.itemType}`}
                            </p>
                          </div>
                        </div>
                        {item.externalUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(item.externalUrl!, '_blank')}
                          >
                            <LinkIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-400">
                    <p>No connected items yet</p>
                    <Button className="mt-4" size="sm" onClick={() => setIsConnectModalOpen(true)}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Connect First Item
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle>Comments</CardTitle>
              </CardHeader>
              <CardContent>
                {localComments.length > 0 ? (
                  <div className="space-y-4">
                    {localComments.map((comment: any) => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                          <span className="text-xs font-medium text-white">U</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-white">User</span>
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(new Date(comment.createdAt))}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-400">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-400">
                    <p>No comments yet</p>
                  </div>
                )}
                <div className="mt-4">
                  <CommentForm threadId={displayThread.id} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={displayThread.status === 'completed' ? 'success' : 'primary'} size="md">
                  {displayThread.status.replace('_', ' ')}
                </Badge>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activity && activity.activities && activity.activities.length > 0 ? (
                  <div className="space-y-3">
                    {activity.activities.map((event: any) => (
                      <div key={event.id} className="text-sm">
                        <p className="text-gray-300">{event.type}</p>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(new Date(event.createdAt))}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No recent activity</p>
                )}
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
        title="Delete Thread"
        description="Are you sure you want to delete this thread? This action cannot be undone."
        size="sm"
      >
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
      </Modal>

      {/* Connect Items Modal */}
      <ConnectItemsModal
        threadId={displayThread.id}
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />
    </Layout>
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
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Thread">
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
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={updateThread.isLoading}>
            Save Changes
          </Button>
        </div>
      </form>
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
    <Modal isOpen={isOpen} onClose={onClose} title="Connect Item">
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
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={connectItem.isLoading}
              disabled={!selectedIntegration || !externalUrl.trim()}
            >
              Connect Item
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
