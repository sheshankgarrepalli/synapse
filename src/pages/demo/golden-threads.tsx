/**
 * Golden Threads Visualization Demo Page
 * Showcases all visualization components with mock data
 */

import { LayoutNew } from '@/components/layout/LayoutNew';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import {
  ThreadTimeline,
  ThreadConnections,
  ThreadFlowDiagram,
  ThreadStatus,
  IntegrationIcon,
} from '@/components/visualization';

export default function GoldenThreadsDemo() {
  // Mock data for demonstrations
  const mockActivities = [
    {
      id: '1',
      type: 'created' as const,
      title: 'Thread Created',
      description: 'Feature Launch: Onboarding v2 thread was created',
      timestamp: '3 days ago',
      active: false,
    },
    {
      id: '2',
      type: 'connected' as const,
      title: 'Design File Connected',
      description: 'Figma design file "Onboarding v2 Final" was connected',
      timestamp: 'Yesterday',
      integration: 'figma' as const,
      active: false,
    },
    {
      id: '3',
      type: 'connected' as const,
      title: 'Issues Created',
      description: 'Created 2 Linear issues: LIN-456, LIN-457',
      timestamp: '4 hours ago',
      integration: 'linear' as const,
      active: false,
    },
    {
      id: '4',
      type: 'status_change' as const,
      title: 'Development Started',
      description: 'GitHub branch feature/onboarding-v2 was created',
      timestamp: '2 hours ago',
      integration: 'github' as const,
      active: true,
    },
  ];

  const mockIntegrations = [
    { type: 'figma' as const, status: 'connected' as const },
    { type: 'linear' as const, status: 'syncing' as const },
    { type: 'github' as const, status: 'connected' as const },
    { type: 'slack' as const, status: 'connected' as const },
  ];

  const mockNodes = [
    { id: '1', type: 'figma' as const, label: 'Design', x: 100, y: 200 },
    { id: '2', type: 'linear' as const, label: 'Issues', x: 250, y: 150 },
    { id: '3', type: 'github' as const, label: 'Code', x: 250, y: 250 },
    { id: '4', type: 'slack' as const, label: 'Team', x: 400, y: 200 },
  ];

  const mockConnections = [
    { from: '1', to: '2', status: 'active' as const },
    { from: '1', to: '3', status: 'active' as const },
    { from: '2', to: '4', status: 'active' as const },
    { from: '3', to: '4', status: 'active' as const },
  ];

  return (
    <LayoutNew>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold font-heading text-gray-900 dark:text-white mb-2">
            Golden Threads Visualization Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            The signature feature - visualizing connections with animated golden threads
          </p>
        </div>

        {/* Integration Icons */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Icons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <IntegrationIcon type="figma" size={40} />
                <span className="text-sm text-muted-foreground">Figma</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <IntegrationIcon type="linear" size={40} />
                <span className="text-sm text-muted-foreground">Linear</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <IntegrationIcon type="github" size={40} />
                <span className="text-sm text-muted-foreground">GitHub</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <IntegrationIcon type="slack" size={40} />
                <span className="text-sm text-muted-foreground">Slack</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thread Status Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Thread Status Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col gap-3">
                <ThreadStatus status="healthy" />
                <p className="text-xs text-muted-foreground">All connections working</p>
              </div>
              <div className="flex flex-col gap-3">
                <ThreadStatus status="syncing" />
                <p className="text-xs text-muted-foreground">Updates in progress</p>
              </div>
              <div className="flex flex-col gap-3">
                <ThreadStatus status="drift" />
                <p className="text-xs text-muted-foreground">Design-code drift detected</p>
              </div>
              <div className="flex flex-col gap-3">
                <ThreadStatus status="error" />
                <p className="text-xs text-muted-foreground">Connection error</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thread Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Golden Thread Timeline</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Vertical timeline with animated golden line and activity nodes
            </p>
          </CardHeader>
          <CardContent>
            <ThreadTimeline activities={mockActivities} />
          </CardContent>
        </Card>

        {/* Thread Connections */}
        <Card>
          <CardHeader>
            <CardTitle>Thread Connections</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Horizontal view showing connected integrations with animated flow
            </p>
          </CardHeader>
          <CardContent>
            <ThreadConnections integrations={mockIntegrations} />
          </CardContent>
        </Card>

        {/* Thread Flow Diagram */}
        <Card>
          <CardHeader>
            <CardTitle>Thread Flow Diagram</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Canvas-based network view with bezier curves and animated connections
            </p>
          </CardHeader>
          <CardContent>
            <ThreadFlowDiagram
              nodes={mockNodes}
              connections={mockConnections}
              onNodeClick={(nodeId) => {
                alert(`Clicked node: ${nodeId}`);
              }}
            />
          </CardContent>
        </Card>

        {/* Animation Details */}
        <Card>
          <CardHeader>
            <CardTitle>Animation Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold mb-3">Golden Thread Animations</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong>Thread Flow:</strong> Shimmer effect flowing along connection lines (2s infinite)
                </li>
                <li>
                  <strong>Thread Pulse:</strong> Pulsing glow on active nodes with expanding shadow (2s infinite)
                </li>
                <li>
                  <strong>Golden Glow:</strong> Breathing effect on connected nodes
                </li>
                <li>
                  <strong>Color Gradient:</strong> Linear gradient from gold-300 → gold-500 → gold-300
                </li>
                <li>
                  <strong>Accessibility:</strong> All animations respect prefers-reduced-motion
                </li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-3">Design Principles</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Premium and sophisticated visual language</li>
                <li>Smooth, purposeful animations (no arbitrary effects)</li>
                <li>Consistent golden color palette across all visualizations</li>
                <li>Clear visual hierarchy with integration icons and status indicators</li>
                <li>Interactive elements with hover states and click handlers</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutNew>
  );
}
