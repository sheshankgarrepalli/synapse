/**
 * ThreadCreationUpsell Component
 *
 * Modal shown when user tries to create a thread that would benefit from
 * an integration they don't have yet. Encourages connecting the integration
 * to get the full experience.
 */

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import {
  type IntegrationType,
  getIntegrationName,
  getIntegrationIcon,
} from '@/lib/integrations/recommendations';

interface ThreadCreationUpsellProps {
  isOpen: boolean;
  onClose: () => void;
  requiredIntegration: IntegrationType;
  threadType: string;
  onConnect: () => void;
  onCreateWithout: () => void;
}

export function ThreadCreationUpsell({
  isOpen,
  onClose,
  requiredIntegration,
  threadType,
  onConnect,
  onCreateWithout,
}: ThreadCreationUpsellProps) {
  const integrationName = getIntegrationName(requiredIntegration);
  const integrationIcon = getIntegrationIcon(requiredIntegration);

  // Get benefits based on integration and thread type
  const getBenefits = (): Array<{ icon: string; text: string }> => {
    if (requiredIntegration === 'figma' && threadType.toLowerCase().includes('design')) {
      return [
        { icon: '🎨', text: 'Track design files automatically' },
        { icon: '🔍', text: 'Detect design-code drift' },
        { icon: '📊', text: 'See design → code → deploy pipeline' },
      ];
    }

    if (requiredIntegration === 'github' && threadType.toLowerCase().includes('code')) {
      return [
        { icon: '💻', text: 'Auto-link PRs and commits' },
        { icon: '🔗', text: 'Connect code to issues and designs' },
        { icon: '⚡', text: 'Track implementation progress' },
      ];
    }

    if (requiredIntegration === 'linear' && threadType.toLowerCase().includes('issue')) {
      return [
        { icon: '📋', text: 'Link issues to code and designs' },
        { icon: '✅', text: 'Track feature progress automatically' },
        { icon: '📈', text: 'See velocity and cycle time' },
      ];
    }

    if (requiredIntegration === 'slack') {
      return [
        { icon: '💬', text: 'Connect discussions to work' },
        { icon: '🔔', text: 'Get notifications on updates' },
        { icon: '👥', text: 'Track team collaboration' },
      ];
    }

    // Default benefits
    return [
      { icon: '🔗', text: 'Automatic connections across tools' },
      { icon: '📊', text: 'Complete visibility into progress' },
      { icon: '⚡', text: 'Real-time updates and alerts' },
    ];
  };

  const benefits = getBenefits();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="lg"
    >
      <div className="text-center">
        {/* Integration icon */}
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-4xl border-2 border-primary/30">
            {integrationIcon}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
          This thread works best with {integrationName}
        </h2>
        <p className="text-gray-400 mb-8">
          {threadType} threads track {integrationName} {requiredIntegration === 'figma' ? 'designs' : requiredIntegration === 'github' ? 'code' : requiredIntegration === 'linear' ? 'issues' : 'conversations'} alongside your other tools.
          Connect {integrationName} to get the full experience.
        </p>

        {/* Benefits */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8 text-left">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-white">
              What you'll unlock:
            </h3>
          </div>
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 text-xl mt-0.5">
                  {benefit.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-300">{benefit.text}</p>
                </div>
                <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={onConnect} size="lg" fullWidth>
            Connect {integrationName} (30 seconds)
          </Button>
          <Button onClick={onCreateWithout} variant="outline" size="lg" fullWidth>
            Create without {integrationName}
          </Button>
        </div>

        {/* Reassurance */}
        <p className="mt-6 text-xs text-gray-500">
          You can connect {integrationName} anytime in settings
        </p>
      </div>
    </Modal>
  );
}

/**
 * Inline upsell banner (less intrusive than modal)
 */
export function ThreadCreationUpsellBanner({
  requiredIntegration,
  threadType,
  onConnect,
  onDismiss,
}: {
  requiredIntegration: IntegrationType;
  threadType: string;
  onConnect: () => void;
  onDismiss: () => void;
}) {
  const integrationName = getIntegrationName(requiredIntegration);
  const integrationIcon = getIntegrationIcon(requiredIntegration);

  return (
    <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-4">
        <div className="text-3xl flex-shrink-0">{integrationIcon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-white">
              Get more from {threadType} threads
            </h4>
          </div>
          <p className="text-sm text-gray-400 mb-3">
            Connect {integrationName} to automatically track {requiredIntegration === 'figma' ? 'designs' : requiredIntegration === 'github' ? 'code' : requiredIntegration === 'linear' ? 'issues' : 'conversations'} and detect drift.
          </p>
          <div className="flex items-center gap-3">
            <Button onClick={onConnect} size="xs">
              Connect {integrationName} (30s)
            </Button>
            <button
              onClick={onDismiss}
              className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
