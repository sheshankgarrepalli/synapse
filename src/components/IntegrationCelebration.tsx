/**
 * IntegrationCelebration Component
 *
 * Celebration modal shown after user connects a new integration (post-onboarding).
 * Shows what's now possible with this integration and encourages first action.
 */

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import {
  type IntegrationType,
  getIntegrationName,
  getIntegrationIcon,
  getNewCapabilities,
} from '@/lib/integrations/recommendations';

interface IntegrationCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  integration: IntegrationType;
  existingIntegrations: IntegrationType[];
  onCreateThread?: () => void;
}

export function IntegrationCelebration({
  isOpen,
  onClose,
  integration,
  existingIntegrations,
  onCreateThread,
}: IntegrationCelebrationProps) {
  const capabilities = getNewCapabilities(integration, existingIntegrations);
  const integrationName = getIntegrationName(integration);
  const integrationIcon = getIntegrationIcon(integration);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="lg"
    >
      <div className="text-center">
        {/* Celebration animation */}
        <div className="mb-6 flex justify-center relative">
          <div className="relative">
            {/* Main icon */}
            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-4xl">
              {integrationIcon}
            </div>
            {/* Confetti sparkles */}
            <div className="absolute -top-2 -right-2 animate-bounce">
              <SparklesIcon className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="absolute -bottom-2 -left-2 animate-bounce animation-delay-150">
              <SparklesIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="absolute top-0 -left-4 animate-pulse animation-delay-300">
              <SparklesIcon className="h-5 w-5 text-purple-400" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">
          {integrationName} connected!
        </h1>
        <p className="text-gray-400 mb-8">
          Here's what you can do now
        </p>

        {/* New capabilities */}
        <div className="grid gap-4 md:grid-cols-2 mb-8 text-left">
          {capabilities.map((capability, index) => (
            <Card
              key={index}
              className="border-gray-700 hover:border-primary/50 transition-all"
            >
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-2xl mt-0.5">
                    {capability.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white mb-1">
                      {capability.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {capability.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onCreateThread && (
            <Button onClick={onCreateThread} size="lg">
              Create your first {integrationName} thread
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Button>
          )}
          <Button onClick={onClose} variant="outline" size="lg">
            Explore dashboard
          </Button>
        </div>

        {/* Additional info */}
        <div className="mt-8 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <div className="flex items-start gap-3 text-left">
            <SparklesIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-300">
                <strong className="text-white">Synapse is now analyzing your {integrationName} data.</strong>
                {' '}We'll automatically create Golden Threads and detect connections across your tools.
                This usually takes a few minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Simple celebration toast for less intrusive celebration
 */
export function IntegrationCelebrationToast({
  integration,
  onViewCapabilities,
  onDismiss,
}: {
  integration: IntegrationType;
  onViewCapabilities: () => void;
  onDismiss: () => void;
}) {
  const integrationName = getIntegrationName(integration);
  const integrationIcon = getIntegrationIcon(integration);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <Card className="border-primary/30 bg-gray-900 shadow-2xl max-w-md">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <div className="text-3xl">{integrationIcon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <SparklesIcon className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold text-white">
                  {integrationName} connected!
                </h4>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                You unlocked new capabilities
              </p>
              <div className="flex items-center gap-2">
                <Button onClick={onViewCapabilities} size="xs">
                  See what's new
                </Button>
                <button
                  onClick={onDismiss}
                  className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
