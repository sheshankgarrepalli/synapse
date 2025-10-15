import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectOption } from '@/components/ui/Select';
import { api } from '@/utils/api';
import { formatRelativeTime } from '@/lib/utils';
import { PlusIcon, BoltIcon, PlayIcon, PauseIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AutomationsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: automations, isLoading } = api.automations.list.useQuery();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Automations</h1>
            <p className="mt-1 text-gray-400">
              Create workflows that run automatically across your tools
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusIcon className="mr-2 h-5 w-5" />
            New Automation
          </Button>
        </div>

        {/* Automation Templates */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-white">Popular Templates</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AutomationTemplate
              title="Sync GitHub PRs to Linear"
              description="Automatically create Linear issues when a PR is opened"
              trigger="GitHub: Pull Request Opened"
              actions={['Create Linear Issue', 'Add to Thread']}
            />
            <AutomationTemplate
              title="Slack Notifications"
              description="Send Slack message when thread status changes"
              trigger="Thread: Status Changed"
              actions={['Send Slack Message']}
            />
            <AutomationTemplate
              title="Figma to Notion Sync"
              description="Update Notion page when Figma file is updated"
              trigger="Figma: File Updated"
              actions={['Update Notion Page', 'Add Comment']}
            />
          </div>
        </div>

        {/* Active Automations */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-white">Your Automations</h2>
          {isLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              </CardContent>
            </Card>
          ) : automations && automations.length > 0 ? (
            <div className="space-y-4">
              {automations.map((automation) => (
                <AutomationCard key={automation.id} automation={automation} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <BoltIcon className="mx-auto h-16 w-16 text-gray-600" />
                <h3 className="mt-4 text-lg font-medium text-white">No automations yet</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Create your first automation to streamline your workflow
                </p>
                <Button className="mt-6" onClick={() => setIsCreateModalOpen(true)}>
                  <PlusIcon className="mr-2 h-5 w-5" />
                  Create Automation
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Automation Modal */}
      <CreateAutomationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </Layout>
  );
}

// Automation Template Component
function AutomationTemplate({
  title,
  description,
  trigger,
  actions,
}: {
  title: string;
  description: string;
  trigger: string;
  actions: string[];
}) {
  return (
    <Card hover>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="mb-2 text-xs font-medium text-gray-400">Trigger:</p>
            <Badge variant="primary" size="sm">{trigger}</Badge>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-gray-400">Actions:</p>
            <div className="space-y-1">
              {actions.map((action, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="h-1 w-1 rounded-full bg-gray-500" />
                  <span className="text-xs text-gray-300">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button size="sm" className="w-full">
          Use Template
        </Button>
      </CardFooter>
    </Card>
  );
}

// Automation Card Component
function AutomationCard({ automation }: { automation: any }) {
  const utils = api.useUtils();
  const toggleAutomation = api.automations.toggle.useMutation({
    onSuccess: () => {
      utils.automations.list.invalidate();
    },
  });

  const deleteAutomation = api.automations.delete.useMutation({
    onSuccess: () => {
      utils.automations.list.invalidate();
    },
  });

  const isActive = automation.isActive;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-white">{automation.name}</h3>
              <Badge variant={isActive ? 'success' : 'default'} size="sm">
                {isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {automation.description && (
              <p className="mt-2 text-sm text-gray-400">{automation.description}</p>
            )}
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-medium text-gray-400">Trigger:</span>
                <Badge variant="primary" size="sm">
                  {automation.trigger?.type || 'Custom'}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-medium text-gray-400">Runs:</span>
                <span className="text-gray-300">{automation.executionCount || 0} times</span>
              </div>
              <div className="text-xs text-gray-500">
                Last run: {automation.lastTriggeredAt ? formatRelativeTime(new Date(automation.lastTriggeredAt)) : 'Never'}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={isActive ? 'outline' : 'primary'}
              size="sm"
              onClick={() => toggleAutomation.mutate({ id: automation.id, isActive: !isActive })}
              loading={toggleAutomation.isLoading}
            >
              {isActive ? (
                <>
                  <PauseIcon className="h-4 w-4" />
                </>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4" />
                </>
              )}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => deleteAutomation.mutate({ id: automation.id })}
              loading={deleteAutomation.isLoading}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Create Automation Modal
function CreateAutomationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState('github.issue');
  const [triggerAction, setTriggerAction] = useState('opened');
  const [repository, setRepository] = useState('');
  const [threadStatus, setThreadStatus] = useState('planning');

  const utils = api.useUtils();
  const createAutomation = api.automations.create.useMutation({
    onSuccess: () => {
      utils.automations.list.invalidate();
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setName('');
    setDescription('');
    setTriggerType('github.issue');
    setTriggerAction('opened');
    setRepository('');
    setThreadStatus('planning');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build trigger configuration
    const trigger: any = {
      type: triggerType,
      action: triggerAction,
    };

    if (repository) {
      trigger.repository = repository;
    }

    // Build actions configuration
    const actions = [
      {
        type: 'create_thread',
        config: {
          status: threadStatus,
        },
      },
    ];

    createAutomation.mutate({
      name,
      description: description || undefined,
      trigger,
      actions,
    });
  };

  const triggerTypeOptions: SelectOption[] = [
    { value: 'github.issue', label: 'GitHub Issue' },
    { value: 'github.pull_request', label: 'GitHub Pull Request' },
    { value: 'github.push', label: 'GitHub Push' },
    { value: 'github.issue_comment', label: 'GitHub Issue Comment' },
  ];

  const triggerActionOptions: SelectOption[] =
    triggerType === 'github.issue' || triggerType === 'github.pull_request'
      ? [
          { value: 'opened', label: 'Opened' },
          { value: 'closed', label: 'Closed' },
          { value: 'reopened', label: 'Reopened' },
          { value: 'edited', label: 'Edited' },
        ]
      : triggerType === 'github.issue_comment'
      ? [
          { value: 'created', label: 'Created' },
          { value: 'edited', label: 'Edited' },
          { value: 'deleted', label: 'Deleted' },
        ]
      : [{ value: 'push', label: 'Push' }];

  const threadStatusOptions: SelectOption[] = [
    { value: 'planning', label: 'Planning' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create GitHub Automation"
      description="Automatically create threads when GitHub events occur"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Automation Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Create thread for new GitHub issues"
          required
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this automation does..."
        />

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white">Trigger Configuration</h4>

          <Select
            label="Trigger Type"
            value={triggerType}
            onChange={setTriggerType}
            options={triggerTypeOptions}
          />

          <Select
            label="Trigger Action"
            value={triggerAction}
            onChange={setTriggerAction}
            options={triggerActionOptions}
          />

          <Input
            label="Repository Filter (Optional)"
            value={repository}
            onChange={(e) => setRepository(e.target.value)}
            placeholder="e.g., owner/repo-name"
            helperText="Leave empty to trigger for all repositories"
          />
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white">Action Configuration</h4>

          <Select
            label="Thread Status"
            value={threadStatus}
            onChange={setThreadStatus}
            options={threadStatusOptions}
          />

          <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
            <p className="text-xs text-gray-400">
              <strong>What this automation will do:</strong>
              <br />
              • Create a new thread in Synapse when the trigger occurs
              <br />
              • Automatically link the GitHub item to the thread
              <br />
              • Set the thread status to "{threadStatusOptions.find(o => o.value === threadStatus)?.label}"
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createAutomation.isLoading} disabled={!name}>
            Create Automation
          </Button>
        </div>
      </form>
    </Modal>
  );
}
