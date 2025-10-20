import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  SparklesIcon,
  RocketLaunchIcon,
  PaintBrushIcon,
  BugAntIcon,
  BeakerIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface Template {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  items: string[];
  popular?: boolean;
}

const TEMPLATES: Template[] = [
  {
    id: 'feature-launch',
    title: 'Feature Launch',
    description: 'Track a feature from design → code → deployment',
    icon: RocketLaunchIcon,
    color: 'bg-purple-500',
    items: [
      '🎨 Figma design file',
      '📋 Linear epic + issues',
      '💻 GitHub PRs',
      '🚀 Deployment',
    ],
    popular: true,
  },
  {
    id: 'design-review',
    title: 'Design Review',
    description: 'Review designs with engineering before coding',
    icon: PaintBrushIcon,
    color: 'bg-pink-500',
    items: [
      '🎨 Figma designs',
      '💬 Slack feedback thread',
      '📋 Linear implementation issues',
      '💻 GitHub branch',
    ],
  },
  {
    id: 'bug-fix',
    title: 'Bug Fix',
    description: 'Track bugs from report to resolution',
    icon: BugAntIcon,
    color: 'bg-red-500',
    items: [
      '📋 Linear bug report',
      '💻 GitHub investigation',
      '🔧 Fix PR',
      '✅ QA verification',
    ],
  },
  {
    id: 'experiment',
    title: 'A/B Test',
    description: 'Run experiments and track results',
    icon: BeakerIcon,
    color: 'bg-blue-500',
    items: [
      '📊 Hypothesis & metrics',
      '🎨 Design variants',
      '💻 Implementation',
      '📈 Results analysis',
    ],
  },
  {
    id: 'documentation',
    title: 'Documentation',
    description: 'Keep docs in sync with implementation',
    icon: DocumentTextIcon,
    color: 'bg-green-500',
    items: [
      '📝 Spec document',
      '🎨 Design system updates',
      '💻 Code changes',
      '✅ Doc review',
    ],
  },
];

export function EmptyStateWithTemplates({
  onCreateFromTemplate,
  onCreateBlank,
}: {
  onCreateFromTemplate: (template: Template) => void;
  onCreateBlank: () => void;
}) {
  return (
    <div className="py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 mb-4">
          <SparklesIcon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-2">
          Create your first Golden Thread
        </h3>
        <p className="text-gray-400">
          Golden Threads connect related work across tools. Try a template:
        </p>
      </div>

      {/* Template Gallery */}
      <div className="grid gap-4 md:grid-cols-3 max-w-5xl mx-auto">
        {TEMPLATES.map((template) => (
          <Card
            key={template.id}
            hover
            onClick={() => onCreateFromTemplate(template)}
            className="cursor-pointer border-gray-700 hover:border-primary/50 transition-all"
          >
            <CardContent className="pt-6 pb-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${template.color} shadow-lg`}>
                  <template.icon className="h-6 w-6 text-white" />
                </div>
                {template.popular && (
                  <Badge variant="primary" size="sm">
                    Most popular
                  </Badge>
                )}
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                {template.title}
              </h4>
              <p className="text-sm text-gray-400 mb-4">
                {template.description}
              </p>
              <ul className="space-y-1.5 text-xs text-gray-500">
                {template.items.map((item, idx) => (
                  <li key={idx} className="flex items-center">
                    <div className="h-1 w-1 rounded-full bg-gray-600 mr-2" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                className="mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateFromTemplate(template);
                }}
              >
                Use template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Start from Scratch */}
      <div className="text-center mt-8">
        <button
          onClick={onCreateBlank}
          className="text-sm text-gray-500 hover:text-gray-300 underline transition-colors"
        >
          Or start from scratch →
        </button>
      </div>
    </div>
  );
}

export type { Template };
export { TEMPLATES };
