import {
  PlusIcon,
  PuzzlePieceIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  Squares2X2Icon,
  QuestionMarkCircleIcon,
  CommandLineIcon,
  HomeIcon,
  BoltIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { KeyboardShortcutOptions } from '@/hooks/useKeyboardShortcut';

export interface CommandAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: KeyboardShortcutOptions;
  category: 'actions' | 'navigation' | 'settings';
  handler: () => void;
  keywords?: string[];
}

export function getActions(options: {
  router: any;
  setIsCreateThreadModalOpen?: (open: boolean) => void;
  setIsIntegrationModalOpen?: (open: boolean) => void;
}): CommandAction[] {
  const { router, setIsCreateThreadModalOpen, setIsIntegrationModalOpen } = options;

  return [
    // Actions
    {
      id: 'create-thread',
      title: 'Create New Thread',
      description: 'Start a new Golden Thread to connect work items',
      icon: PlusIcon,
      category: 'actions',
      shortcut: { key: 'n', metaKey: true },
      handler: () => {
        setIsCreateThreadModalOpen?.(true);
      },
      keywords: ['new', 'create', 'thread', 'golden'],
    },
    {
      id: 'connect-integration',
      title: 'Connect Integration',
      description: 'Add a new tool integration (Figma, GitHub, Linear, Slack)',
      icon: PuzzlePieceIcon,
      category: 'actions',
      handler: () => {
        if (setIsIntegrationModalOpen) {
          setIsIntegrationModalOpen(true);
        } else {
          router.push('/integrations');
        }
      },
      keywords: ['connect', 'integration', 'figma', 'github', 'linear', 'slack', 'add'],
    },
    {
      id: 'view-analytics',
      title: 'View Analytics',
      description: 'See insights about your workflow and team productivity',
      icon: ChartBarIcon,
      category: 'actions',
      handler: () => {
        router.push('/analytics');
      },
      keywords: ['analytics', 'insights', 'metrics', 'stats'],
    },
    {
      id: 'help-documentation',
      title: 'Help & Documentation',
      description: 'Learn how to use Synapse',
      icon: QuestionMarkCircleIcon,
      category: 'actions',
      shortcut: { key: '/', metaKey: true },
      handler: () => {
        window.open('https://docs.synapse.ai', '_blank');
      },
      keywords: ['help', 'docs', 'documentation', 'support', 'learn'],
    },
    {
      id: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts',
      description: 'View all available keyboard shortcuts',
      icon: CommandLineIcon,
      category: 'actions',
      shortcut: { key: '/', shiftKey: true, metaKey: true },
      handler: () => {
        // This would open a shortcuts modal in a real implementation
        alert('Keyboard Shortcuts:\n\nCmd+K - Command Palette\nCmd+N - New Thread\nCmd+/ - Help');
      },
      keywords: ['keyboard', 'shortcuts', 'hotkeys', 'commands'],
    },

    // Navigation
    {
      id: 'go-dashboard',
      title: 'Go to Dashboard',
      description: 'View your overview and recent activity',
      icon: HomeIcon,
      category: 'navigation',
      shortcut: { key: '1', metaKey: true },
      handler: () => {
        router.push('/dashboard');
      },
      keywords: ['dashboard', 'home', 'overview'],
    },
    {
      id: 'go-threads',
      title: 'Go to Threads',
      description: 'View all Golden Threads',
      icon: Squares2X2Icon,
      category: 'navigation',
      shortcut: { key: '2', metaKey: true },
      handler: () => {
        router.push('/threads');
      },
      keywords: ['threads', 'golden threads', 'all threads'],
    },
    {
      id: 'go-search',
      title: 'Go to Search',
      description: 'Search across all connected work',
      icon: MagnifyingGlassIcon,
      category: 'navigation',
      shortcut: { key: '3', metaKey: true },
      handler: () => {
        router.push('/search');
      },
      keywords: ['search', 'find'],
    },
    {
      id: 'go-integrations',
      title: 'Go to Integrations',
      description: 'Manage your connected tools',
      icon: PuzzlePieceIcon,
      category: 'navigation',
      shortcut: { key: '4', metaKey: true },
      handler: () => {
        router.push('/integrations');
      },
      keywords: ['integrations', 'tools', 'connections'],
    },
    {
      id: 'go-automations',
      title: 'Go to Automations',
      description: 'Manage your workflow automations',
      icon: BoltIcon,
      category: 'navigation',
      shortcut: { key: '5', metaKey: true },
      handler: () => {
        router.push('/automations');
      },
      keywords: ['automations', 'workflows', 'rules'],
    },
    {
      id: 'go-intelligence',
      title: 'Go to Intelligence',
      description: 'View AI-powered insights and alerts',
      icon: SparklesIcon,
      category: 'navigation',
      shortcut: { key: '6', metaKey: true },
      handler: () => {
        router.push('/intelligence');
      },
      keywords: ['intelligence', 'insights', 'ai', 'alerts'],
    },

    // Settings
    {
      id: 'user-settings',
      title: 'User Settings',
      description: 'Manage your profile and preferences',
      icon: Cog6ToothIcon,
      category: 'settings',
      shortcut: { key: ',', metaKey: true },
      handler: () => {
        router.push('/settings/profile');
      },
      keywords: ['settings', 'profile', 'preferences', 'account'],
    },
    {
      id: 'organization-settings',
      title: 'Organization Settings',
      description: 'Manage your organization and team',
      icon: BuildingOfficeIcon,
      category: 'settings',
      handler: () => {
        router.push('/settings/organization');
      },
      keywords: ['organization', 'org', 'team', 'workspace'],
    },
  ];
}
