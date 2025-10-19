import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  CheckCircleIcon,
  ShieldCheckIcon,
  BoltIcon,
  ClockIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export interface IntegrationPreview {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  features: string[];
  permissions: {
    name: string;
    description: string;
    required: boolean;
  }[];
  dataSynced: string[];
  syncFrequency: string;
  setupTime: string;
  benefits: string[];
  icon?: string;
}

interface IntegrationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  integration: IntegrationPreview | null;
  onConnect: () => void;
}

export function IntegrationPreviewModal({
  isOpen,
  onClose,
  integration,
  onConnect,
}: IntegrationPreviewModalProps) {
  if (!integration) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Connect ${integration.name}`}
      description={integration.description}
      size="large"
    >
      <div className="space-y-6">
        {/* Overview */}
        <div className="rounded-lg bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 p-4">
          <p className="text-sm text-gray-300">{integration.longDescription}</p>
        </div>

        {/* Benefits */}
        <div>
          <h3 className="mb-3 flex items-center text-sm font-semibold text-white">
            <BoltIcon className="mr-2 h-4 w-4 text-purple-500" />
            What you'll get
          </h3>
          <div className="space-y-2">
            {integration.benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-green-500 mt-0.5" />
                <p className="text-sm text-gray-300">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Data Synced */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Data we'll sync</h3>
          <div className="grid grid-cols-2 gap-2">
            {integration.dataSynced.map((data, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-2 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2"
              >
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span className="text-sm text-gray-300">{data}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions Required */}
        <div>
          <h3 className="mb-3 flex items-center text-sm font-semibold text-white">
            <ShieldCheckIcon className="mr-2 h-4 w-4 text-blue-500" />
            Permissions required
          </h3>
          <div className="space-y-2">
            {integration.permissions.map((permission, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between rounded-lg border border-gray-700 bg-gray-900 p-3"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-white">{permission.name}</p>
                    {permission.required && (
                      <Badge variant="warning" size="sm">
                        Required
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{permission.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Setup Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
            <div className="flex items-center space-x-2 text-gray-400">
              <ClockIcon className="h-4 w-4" />
              <p className="text-xs font-medium">Setup time</p>
            </div>
            <p className="mt-2 text-lg font-semibold text-white">{integration.setupTime}</p>
          </div>
          <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
            <div className="flex items-center space-x-2 text-gray-400">
              <BoltIcon className="h-4 w-4" />
              <p className="text-xs font-medium">Sync frequency</p>
            </div>
            <p className="mt-2 text-lg font-semibold text-white">{integration.syncFrequency}</p>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
          <div className="flex items-start space-x-3">
            <ShieldCheckIcon className="h-5 w-5 flex-shrink-0 text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-300">Your data is secure</p>
              <p className="mt-1 text-xs text-blue-200/70">
                We only read the minimum data needed to provide our service. We never modify, delete,
                or share your data with third parties. All data is encrypted in transit and at rest.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConnect}>
            <span>Connect {integration.name}</span>
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Integration data with full preview information
export const integrationPreviews: Record<string, IntegrationPreview> = {
  github: {
    id: 'github',
    name: 'GitHub',
    description: 'Connect repositories, issues, and pull requests',
    longDescription:
      'Connect GitHub to automatically track code changes, link pull requests to design updates, and detect when code drifts from design specs. Synapse will monitor your repositories and create intelligent connections between commits, PRs, issues, and other work items.',
    features: ['Repositories', 'Issues', 'Pull Requests', 'Commits'],
    permissions: [
      {
        name: 'Read repository contents',
        description: 'View code, commits, and file structures',
        required: true,
      },
      {
        name: 'Read issues and pull requests',
        description: 'Access issue details, PR descriptions, and comments',
        required: true,
      },
      {
        name: 'Read repository metadata',
        description: 'Access repository names, descriptions, and settings',
        required: true,
      },
      {
        name: 'Receive webhook notifications',
        description: 'Get real-time updates when code changes',
        required: false,
      },
    ],
    dataSynced: [
      'Repository names',
      'Commit messages',
      'PR titles & descriptions',
      'Issue details',
      'File paths',
      'Branch names',
    ],
    syncFrequency: 'Real-time',
    setupTime: '2-3 minutes',
    benefits: [
      'Automatically detect design-code drift when components change',
      'Link pull requests to design files and Linear issues',
      'Track which features are in progress vs. deployed',
      'Get AI insights about code changes related to your designs',
      'See which team members are working on what',
    ],
  },
  slack: {
    id: 'slack',
    name: 'Slack',
    description: 'Link channels and messages to your threads',
    longDescription:
      'Connect Slack to capture important discussions, decisions, and context. Synapse will automatically detect when conversations relate to specific work items and create Golden Threads connecting Slack messages to designs, code, and tasks.',
    features: ['Channels', 'Messages', 'Threads', 'Files'],
    permissions: [
      {
        name: 'Read channel messages',
        description: 'Access messages from channels the Synapse bot is added to',
        required: true,
      },
      {
        name: 'Read user information',
        description: 'View names and profiles of team members',
        required: true,
      },
      {
        name: 'Read files',
        description: 'Access files shared in monitored channels',
        required: false,
      },
    ],
    dataSynced: ['Channel names', 'Message content', 'Thread replies', 'User names', 'Timestamps'],
    syncFrequency: 'Real-time',
    setupTime: '1-2 minutes',
    benefits: [
      'Capture decisions and context from team discussions',
      'Link Slack threads to related PRs, issues, and designs',
      'Never lose important decisions buried in Slack',
      'AI detects when discussions relate to specific work items',
      'See full context of work across all your tools',
    ],
  },
  linear: {
    id: 'linear',
    name: 'Linear',
    description: 'Sync projects, issues, and workflows',
    longDescription:
      'Connect Linear to track product development from planning to completion. Synapse will automatically create connections between Linear issues, Figma designs, GitHub PRs, and team discussions.',
    features: ['Projects', 'Issues', 'Cycles', 'Labels'],
    permissions: [
      {
        name: 'Read issues',
        description: 'View issue titles, descriptions, and status',
        required: true,
      },
      {
        name: 'Read projects and cycles',
        description: 'Access project information and sprint planning',
        required: true,
      },
      {
        name: 'Read team information',
        description: 'View team members and assignments',
        required: true,
      },
    ],
    dataSynced: ['Issue titles', 'Descriptions', 'Status', 'Assignees', 'Labels', 'Projects'],
    syncFrequency: 'Every 5 minutes',
    setupTime: '2 minutes',
    benefits: [
      'Automatically link Linear issues to related designs and code',
      'Track which issues are blocked by design or code work',
      'See the complete picture of feature development',
      'Detect when designs are ready but issues aren\'t started',
      'AI-powered relationship detection across your stack',
    ],
  },
  figma: {
    id: 'figma',
    name: 'Figma',
    description: 'Connect design files and components',
    longDescription:
      'Connect Figma to enable powerful design-code drift detection. Synapse will monitor your design files and automatically alert you when implemented components drift from the original designs.',
    features: ['Files', 'Components', 'Comments', 'Versions'],
    permissions: [
      {
        name: 'Read file contents',
        description: 'View design files, components, and styles',
        required: true,
      },
      {
        name: 'Read comments',
        description: 'Access design feedback and discussions',
        required: true,
      },
      {
        name: 'Read version history',
        description: 'Track design changes over time',
        required: false,
      },
    ],
    dataSynced: [
      'File names',
      'Component properties',
      'Design tokens',
      'Comments',
      'Version history',
      'Thumbnails',
    ],
    syncFrequency: 'Every 10 minutes',
    setupTime: '2-3 minutes',
    benefits: [
      'Automatic design-code drift detection with visual comparisons',
      'Track which designs have been implemented',
      'Link design components to code components',
      'Get alerts when designs change after implementation',
      'Maintain design system consistency automatically',
    ],
  },
  notion: {
    id: 'notion',
    name: 'Notion',
    description: 'Link pages and databases',
    longDescription:
      'Connect Notion to bring your documentation and knowledge base into the context of your work. Synapse will link relevant Notion pages to related work items across all your tools.',
    features: ['Pages', 'Databases', 'Blocks', 'Comments'],
    permissions: [
      {
        name: 'Read pages',
        description: 'View page content and metadata',
        required: true,
      },
      {
        name: 'Read databases',
        description: 'Access database properties and entries',
        required: true,
      },
      {
        name: 'Read comments',
        description: 'View page discussions and feedback',
        required: false,
      },
    ],
    dataSynced: ['Page titles', 'Content blocks', 'Database entries', 'Properties', 'Comments'],
    syncFrequency: 'Every 15 minutes',
    setupTime: '1-2 minutes',
    benefits: [
      'Link documentation to related code and designs',
      'Never lose track of important context and decisions',
      'Automatically connect specs to implementation',
      'Track which features have documentation',
      'AI-powered content analysis and relationships',
    ],
  },
  zoom: {
    id: 'zoom',
    name: 'Zoom',
    description: 'Connect meetings and recordings',
    longDescription:
      'Connect Zoom to capture meeting context and decisions. Synapse will analyze meeting transcripts and automatically create connections to related work items.',
    features: ['Meetings', 'Recordings', 'Transcripts'],
    permissions: [
      {
        name: 'Read meeting information',
        description: 'View meeting titles, participants, and times',
        required: true,
      },
      {
        name: 'Access recordings',
        description: 'View and analyze meeting recordings',
        required: true,
      },
      {
        name: 'Read transcripts',
        description: 'Access automatic transcriptions',
        required: false,
      },
    ],
    dataSynced: ['Meeting titles', 'Participants', 'Recordings', 'Transcripts', 'Timestamps'],
    syncFrequency: 'After each meeting',
    setupTime: '2 minutes',
    benefits: [
      'Capture decisions made in design reviews',
      'Link meetings to related work items automatically',
      'Never forget what was discussed',
      'AI summarizes key points and action items',
      'Full context of async and sync collaboration',
    ],
  },
};
