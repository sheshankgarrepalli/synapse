/**
 * Settings - Integrations Page
 *
 * Integration hub with smart recommendations and connection management.
 * Shows all available integrations with specific value props based on
 * what user already has connected.
 */

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { IntegrationCelebration } from '@/components/IntegrationCelebration';
import { SparklesIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import {
  type IntegrationType,
  getRecommendedIntegrations,
  getIntegrationName,
  getIntegrationIcon,
} from '@/lib/integrations/recommendations';

export default function IntegrationsSettingsPage() {
  const [connectedIntegrations, setConnectedIntegrations] = useState<IntegrationType[]>(['linear']);
  const [showCelebration, setShowCelebration] = useState(false);
  const [justConnectedIntegration, setJustConnectedIntegration] = useState<IntegrationType | null>(null);

  const recommendations = getRecommendedIntegrations(connectedIntegrations);

  const allIntegrations: Array<{
    id: IntegrationType;
    name: string;
    description: string;
    logo: string;
    category: 'Project Management' | 'Code' | 'Design' | 'Communication';
  }> = [
    {
      id: 'linear',
      name: 'Linear',
      description: 'Issue tracking and project management',
      logo: '📋',
      category: 'Project Management',
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Code repository and version control',
      logo: '💻',
      category: 'Code',
    },
    {
      id: 'figma',
      name: 'Figma',
      description: 'Design and prototyping tool',
      logo: '🎨',
      category: 'Design',
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team communication and collaboration',
      logo: '💬',
      category: 'Communication',
    },
  ];

  const handleConnect = (integration: IntegrationType) => {
    // TODO: Trigger actual OAuth flow
    console.log('Connecting integration:', integration);

    // Simulate successful connection
    setConnectedIntegrations([...connectedIntegrations, integration]);
    setJustConnectedIntegration(integration);
    setShowCelebration(true);
  };

  const handleDisconnect = (integration: IntegrationType) => {
    // TODO: Implement actual disconnect logic
    console.log('Disconnecting integration:', integration);
    setConnectedIntegrations(connectedIntegrations.filter(i => i !== integration));
  };

  // Group recommendations by impact
  const highImpactRecs = recommendations.filter(r => r.impact === 'high');
  const otherRecs = recommendations.filter(r => r.impact !== 'high');

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Integrations</h1>
          <p className="mt-1 text-gray-400">
            Connect your tools to unlock powerful Golden Threads
          </p>
        </div>

        {/* Connection status overview */}
        <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {connectedIntegrations.length} of 4 integrations connected
                </h3>
                <p className="text-sm text-gray-400">
                  {connectedIntegrations.length < 2
                    ? 'Connect more tools to unlock automatic Golden Threads'
                    : connectedIntegrations.length < 4
                    ? 'Great progress! Connect more to maximize value'
                    : 'All integrations connected! You have full Golden Thread power'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {allIntegrations.map((integration) => (
                  <div
                    key={integration.id}
                    className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                      connectedIntegrations.includes(integration.id)
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-gray-800 border border-gray-700 opacity-40'
                    }`}
                  >
                    {integration.logo}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* High impact recommendations */}
        {highImpactRecs.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-white">
                Recommended for you
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {highImpactRecs.map((rec) => {
                const integration = allIntegrations.find(i => i.id === rec.integration);
                if (!integration) return null;

                return (
                  <Card
                    key={rec.integration}
                    className="border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{integration.logo}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {integration.name}
                            </h3>
                            <Badge variant="primary" size="sm">High Impact</Badge>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">
                            {rec.valueProp.description}
                          </p>

                          {/* Value prop example */}
                          <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 mb-3">
                            <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                              Example
                            </p>
                            <p className="text-xs font-mono text-gray-300">
                              {rec.valueProp.example}
                            </p>
                          </div>

                          {/* Example threads */}
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-1">Unlocks thread types:</p>
                            <div className="flex flex-wrap gap-1">
                              {rec.exampleThreads.slice(0, 3).map((thread) => (
                                <span
                                  key={thread}
                                  className="px-2 py-0.5 text-xs bg-gray-800 border border-gray-700 rounded text-gray-400"
                                >
                                  {thread}
                                </span>
                              ))}
                            </div>
                          </div>

                          <Button
                            onClick={() => handleConnect(rec.integration)}
                            size="sm"
                            fullWidth
                          >
                            Connect {integration.name} (30 seconds)
                            <ArrowRightIcon className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* All integrations */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">All Integrations</h2>

          <div className="grid gap-4 md:grid-cols-2">
            {allIntegrations.map((integration) => {
              const isConnected = connectedIntegrations.includes(integration.id);
              const recommendation = recommendations.find(r => r.integration === integration.id);

              return (
                <Card
                  key={integration.id}
                  className={
                    isConnected
                      ? 'border-green-700/50 bg-green-900/10'
                      : 'border-gray-700'
                  }
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{integration.logo}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {integration.name}
                          </h3>
                          {isConnected && (
                            <Badge variant="success" size="sm">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-400 mb-2">
                          {integration.description}
                        </p>

                        <div className="mb-3">
                          <span className="text-xs text-gray-500">{integration.category}</span>
                        </div>

                        {/* Show value prop if recommended */}
                        {recommendation && !isConnected && (
                          <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 mb-3">
                            <p className="text-xs font-semibold text-primary mb-1">
                              {recommendation.valueProp.title}
                            </p>
                            <p className="text-xs text-gray-400">
                              {recommendation.reason}
                            </p>
                          </div>
                        )}

                        {isConnected ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // TODO: Navigate to integration settings
                                console.log('Manage integration:', integration.id);
                              }}
                            >
                              Manage
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDisconnect(integration.id)}
                            >
                              Disconnect
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleConnect(integration.id)}
                            size="sm"
                            fullWidth
                          >
                            Connect {integration.name}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Additional integrations coming soon */}
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <SparklesIcon className="h-8 w-8 text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">
                More integrations coming soon
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                We're working on Jira, Notion, Zoom, and more
              </p>
              <Button variant="outline" size="sm">
                Request an integration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Celebration modal */}
      {showCelebration && justConnectedIntegration && (
        <IntegrationCelebration
          isOpen={showCelebration}
          onClose={() => {
            setShowCelebration(false);
            setJustConnectedIntegration(null);
          }}
          integration={justConnectedIntegration}
          existingIntegrations={connectedIntegrations.filter(i => i !== justConnectedIntegration)}
          onCreateThread={() => {
            setShowCelebration(false);
            // TODO: Navigate to thread creation with template
          }}
        />
      )}
    </Layout>
  );
}
