/**
 * IntegrationPrompt Component
 *
 * In-app prompt to encourage users to connect additional integrations
 * after they've seen value from their first integration.
 *
 * Shows:
 * - Dynamic value proposition based on current integrations
 * - Visual preview of integration pipeline
 * - One-click connection
 * - Dismissible (respects 7-day cooldown)
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SparklesIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import {
  type IntegrationType,
  getNextIntegration,
  getIntegrationName,
  getIntegrationIcon,
} from '@/lib/integrations/recommendations';

interface IntegrationPromptProps {
  userIntegrations: IntegrationType[];
  onConnect: (integration: IntegrationType) => void;
  onDismiss: () => void;
  className?: string;
}

export function IntegrationPrompt({
  userIntegrations,
  onConnect,
  onDismiss,
  className = '',
}: IntegrationPromptProps) {
  const [isDismissing, setIsDismissing] = useState(false);

  const recommendation = getNextIntegration(userIntegrations);

  if (!recommendation) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissing(true);
    setTimeout(() => {
      onDismiss();
    }, 200);
  };

  const handleConnect = () => {
    onConnect(recommendation.integration);
  };

  // Get all integrations for the preview visualization
  const allIntegrations: IntegrationType[] = ['linear', 'github', 'figma', 'slack'];
  const previewIntegrations = [
    ...userIntegrations,
    recommendation.integration,
  ].filter((int, index, self) => self.indexOf(int) === index).slice(0, 3);

  return (
    <Card
      className={`relative border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5 transition-all duration-200 ${
        isDismissing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      } ${className}`}
    >
      <CardContent className="pt-6">
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
          aria-label="Dismiss"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left side: Content */}
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <SparklesIcon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Unlock more with {getIntegrationName(recommendation.integration)}
                </h3>
                <p className="text-sm text-gray-400">
                  {recommendation.valueProp.description}
                </p>
              </div>
            </div>

            {/* Value prop example */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 mb-4">
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Example</p>
              <p className="text-sm font-mono text-gray-300">
                {recommendation.valueProp.example}
              </p>
            </div>

            {/* Integration pipeline preview */}
            <div className="flex items-center gap-2 mb-4">
              {previewIntegrations.map((integration, index) => (
                <div key={integration} className="flex items-center">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center text-lg ${
                      integration === recommendation.integration
                        ? 'bg-primary/20 border-2 border-primary ring-2 ring-primary/30'
                        : 'bg-gray-800 border border-gray-700'
                    }`}
                  >
                    {getIntegrationIcon(integration)}
                  </div>
                  {index < previewIntegrations.length - 1 && (
                    <ArrowRightIcon className="h-4 w-4 text-gray-600 mx-1" />
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button onClick={handleConnect} size="sm">
                Connect {getIntegrationName(recommendation.integration)} (30 seconds)
              </Button>
              <button
                onClick={handleDismiss}
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>

          {/* Right side: Impact badge (optional) */}
          {recommendation.impact === 'high' && (
            <div className="hidden md:flex flex-col items-center justify-center px-6 border-l border-gray-800">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 mb-2">
                  <span className="text-xs font-semibold text-primary uppercase">High Impact</span>
                </div>
                <p className="text-xs text-gray-500">
                  Most valuable for your workflow
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact version for smaller spaces (e.g., sidebar)
 */
export function IntegrationPromptCompact({
  userIntegrations,
  onConnect,
  onDismiss,
  className = '',
}: IntegrationPromptProps) {
  const recommendation = getNextIntegration(userIntegrations);

  if (!recommendation) {
    return null;
  }

  return (
    <div
      className={`relative rounded-lg border border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5 p-4 ${className}`}
    >
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-300 transition-colors"
        aria-label="Dismiss"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 mb-3">
        <div className="text-2xl">{getIntegrationIcon(recommendation.integration)}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white mb-1">
            Add {getIntegrationName(recommendation.integration)}
          </h4>
          <p className="text-xs text-gray-400 line-clamp-2">
            {recommendation.reason}
          </p>
        </div>
      </div>

      <Button onClick={() => onConnect(recommendation.integration)} size="xs" fullWidth>
        Connect (30s)
      </Button>
    </div>
  );
}
