import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/utils/api';
import {
  CheckCircleIcon,
  PaintBrushIcon,
  CodeBracketIcon,
  ChartBarIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

type UserRole = 'designer' | 'developer' | 'product_manager' | 'team_lead';
type OnboardingStep = 'welcome' | 'role' | 'goals' | 'integrations' | 'demo' | 'complete';

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  integrations: string[];
  useCases: string[];
}

const roleOptions: RoleOption[] = [
  {
    id: 'designer',
    title: 'Product Designer',
    description: 'I design interfaces and want to track design-to-code implementation',
    icon: PaintBrushIcon,
    color: 'bg-purple-500',
    integrations: ['Figma', 'Linear', 'Slack'],
    useCases: [
      'Track design implementation status',
      'Detect design-code drift automatically',
      'Get notified when designs need updates',
      'Visualize design system coverage',
    ],
  },
  {
    id: 'developer',
    title: 'Software Developer',
    description: 'I build products and want to connect code with design and tasks',
    icon: CodeBracketIcon,
    color: 'bg-blue-500',
    integrations: ['GitHub', 'Linear', 'Figma'],
    useCases: [
      'Link PRs to designs automatically',
      'See design context in code reviews',
      'Track implementation progress',
      'Get design specs inline with code',
    ],
  },
  {
    id: 'product_manager',
    title: 'Product Manager',
    description: 'I manage products and want visibility into the entire workflow',
    icon: ChartBarIcon,
    color: 'bg-green-500',
    integrations: ['Linear', 'Figma', 'GitHub', 'Slack'],
    useCases: [
      'See holistic project progress',
      'Identify bottlenecks automatically',
      'Track feature lifecycles end-to-end',
      'Get AI-powered insights on team velocity',
    ],
  },
  {
    id: 'team_lead',
    title: 'Team Lead / Manager',
    description: 'I lead teams and need insights into workflow efficiency',
    icon: ChartBarIcon,
    color: 'bg-orange-500',
    integrations: ['Linear', 'GitHub', 'Slack', 'Zoom'],
    useCases: [
      'Monitor team health and velocity',
      'Identify process inefficiencies',
      'Get executive summaries automatically',
      'Optimize team workflows with AI insights',
    ],
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [organizationName, setOrganizationName] = useState('');
  const [teamSize, setTeamSize] = useState<string>('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const createOnboarding = api.onboarding.complete.useMutation({
    onSuccess: () => {
      router.push('/dashboard');
    },
  });

  const selectedRoleData = roleOptions.find((r) => r.id === selectedRole);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const roleData = roleOptions.find((r) => r.id === role);
    if (roleData) {
      setSelectedGoals(roleData.useCases);
    }
  };

  const handleComplete = () => {
    if (!selectedRole) return;

    createOnboarding.mutate({
      role: selectedRole,
      organizationName: organizationName || undefined,
      teamSize: teamSize || undefined,
      goals: selectedGoals,
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep onNext={() => setCurrentStep('role')} />;

      case 'role':
        return (
          <RoleSelectionStep
            selectedRole={selectedRole}
            onSelectRole={handleRoleSelect}
            onNext={() => setCurrentStep('goals')}
            onBack={() => setCurrentStep('welcome')}
          />
        );

      case 'goals':
        return (
          <GoalsStep
            selectedRole={selectedRoleData}
            selectedGoals={selectedGoals}
            onToggleGoal={(goal) => {
              setSelectedGoals((prev) =>
                prev.includes(goal)
                  ? prev.filter((g) => g !== goal)
                  : [...prev, goal]
              );
            }}
            organizationName={organizationName}
            setOrganizationName={setOrganizationName}
            teamSize={teamSize}
            setTeamSize={setTeamSize}
            onNext={() => setCurrentStep('integrations')}
            onBack={() => setCurrentStep('role')}
          />
        );

      case 'integrations':
        return (
          <IntegrationsStep
            selectedRole={selectedRoleData}
            onNext={() => setCurrentStep('demo')}
            onBack={() => setCurrentStep('goals')}
            onSkip={() => setCurrentStep('demo')}
          />
        );

      case 'demo':
        return (
          <DemoStep
            selectedRole={selectedRoleData}
            onComplete={handleComplete}
            onBack={() => setCurrentStep('integrations')}
            isLoading={createOnboarding.isLoading}
          />
        );

      default:
        return null;
    }
  };

  const stepNumber = ['welcome', 'role', 'goals', 'integrations', 'demo'].indexOf(currentStep) + 1;
  const totalSteps = 5;

  return (
    <>
      <Head>
        <title>Welcome to Synapse</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1A1F28]">
        {/* Progress Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#0F1419] border-b border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-lg font-bold text-white">S</span>
                </div>
                <span className="text-xl font-bold text-white">Synapse</span>
              </div>
              <span className="text-sm text-gray-400">
                Step {stepNumber} of {totalSteps}
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto">
            {renderStep()}
          </div>
        </div>
      </div>
    </>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
        <SparklesIcon className="h-10 w-10 text-primary" />
      </div>
      <h1 className="mb-4 text-5xl font-bold text-white">
        Welcome to Synapse
      </h1>
      <p className="mb-8 text-xl text-gray-400 max-w-2xl mx-auto">
        The AI-powered work intelligence platform that automatically connects your design, code,
        and project management tools—eliminating manual tracking and revealing insights you never knew existed.
      </p>

      <div className="grid gap-6 md:grid-cols-3 mb-12 text-left">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
              <CheckCircleIcon className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Automatic Integration
            </h3>
            <p className="text-sm text-gray-400">
              Connect Figma, GitHub, Linear, Slack, and Zoom. We'll automatically track relationships across all your tools.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
              <SparklesIcon className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              AI-Powered Insights
            </h3>
            <p className="text-sm text-gray-400">
              Detect design-code drift, identify bottlenecks, and get actionable recommendations—all automatically.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20">
              <ChartBarIcon className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Golden Threads
            </h3>
            <p className="text-sm text-gray-400">
              See the full story: from design file to PR to deployment, all connected in one intelligent timeline.
            </p>
          </CardContent>
        </Card>
      </div>

      <Button size="lg" onClick={onNext}>
        Get Started
        <ArrowRightIcon className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}

function RoleSelectionStep({
  selectedRole,
  onSelectRole,
  onNext,
  onBack,
}: {
  selectedRole: UserRole | null;
  onSelectRole: (role: UserRole) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="mb-4 text-4xl font-bold text-white">
          What's your role?
        </h2>
        <p className="text-lg text-gray-400">
          We'll personalize your experience based on how you work
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {roleOptions.map((role) => (
          <Card
            key={role.id}
            hover
            onClick={() => onSelectRole(role.id)}
            className={`cursor-pointer transition-all ${
              selectedRole === role.id
                ? 'ring-2 ring-primary border-primary'
                : ''
            }`}
          >
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${role.color}`}>
                  <role.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {role.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {role.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {role.integrations.map((integration) => (
                      <Badge key={integration} variant="outline">
                        {integration}
                      </Badge>
                    ))}
                  </div>
                </div>
                {selectedRole === role.id && (
                  <CheckCircleIcon className="h-6 w-6 text-primary flex-shrink-0" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!selectedRole}>
          Continue
          <ArrowRightIcon className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

function GoalsStep({
  selectedRole,
  selectedGoals,
  onToggleGoal,
  organizationName,
  setOrganizationName,
  teamSize,
  setTeamSize,
  onNext,
  onBack,
}: {
  selectedRole: RoleOption | undefined;
  selectedGoals: string[];
  onToggleGoal: (goal: string) => void;
  organizationName: string;
  setOrganizationName: (name: string) => void;
  teamSize: string;
  setTeamSize: (size: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  if (!selectedRole) return null;

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="mb-4 text-4xl font-bold text-white">
          What are your goals?
        </h2>
        <p className="text-lg text-gray-400">
          Select the outcomes that matter most to you
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Input
              label="Organization Name (Optional)"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Acme Inc."
            />
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Team Size (Optional)
              </label>
              <select
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select team size</option>
                <option value="1-5">1-5 people</option>
                <option value="6-20">6-20 people</option>
                <option value="21-50">21-50 people</option>
                <option value="51-200">51-200 people</option>
                <option value="201+">201+ people</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3 mb-8">
        {selectedRole.useCases.map((useCase) => (
          <Card
            key={useCase}
            hover
            onClick={() => onToggleGoal(useCase)}
            className={`cursor-pointer transition-all ${
              selectedGoals.includes(useCase)
                ? 'ring-2 ring-primary border-primary'
                : ''
            }`}
          >
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <p className="text-white">{useCase}</p>
                <div
                  className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                    selectedGoals.includes(useCase)
                      ? 'bg-primary border-primary'
                      : 'border-gray-600'
                  }`}
                >
                  {selectedGoals.includes(useCase) && (
                    <CheckCircleIcon className="h-4 w-4 text-white" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={selectedGoals.length === 0}>
          Continue
          <ArrowRightIcon className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

function IntegrationsStep({
  selectedRole,
  onNext,
  onBack,
  onSkip,
}: {
  selectedRole: RoleOption | undefined;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  if (!selectedRole) return null;

  const integrations = [
    { name: 'Figma', description: 'Design files and components', logo: '🎨', connected: false },
    { name: 'GitHub', description: 'Code repositories and PRs', logo: '💻', connected: false },
    { name: 'Linear', description: 'Issues and project tracking', logo: '📋', connected: false },
    { name: 'Slack', description: 'Team communication', logo: '💬', connected: false },
    { name: 'Zoom', description: 'Meeting recordings and transcripts', logo: '🎥', connected: false },
  ];

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="mb-4 text-4xl font-bold text-white">
          Connect your tools
        </h2>
        <p className="text-lg text-gray-400 mb-4">
          Recommended integrations for {selectedRole.title}s
        </p>
        <Badge variant="outline">You can add more integrations later</Badge>
      </div>

      <div className="grid gap-4 mb-8">
        {integrations.map((integration) => {
          const isRecommended = selectedRole.integrations.includes(integration.name);
          return (
            <Card
              key={integration.name}
              hover
              className={isRecommended ? 'border-primary' : ''}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{integration.logo}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-white">
                          {integration.name}
                        </h3>
                        {isRecommended && (
                          <Badge variant="primary" size="sm">Recommended</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onSkip}>
            Skip for now
          </Button>
          <Button onClick={onNext}>
            Continue
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function DemoStep({
  selectedRole,
  onComplete,
  onBack,
  isLoading,
}: {
  selectedRole: RoleOption | undefined;
  onComplete: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  if (!selectedRole) return null;

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="mb-4 text-4xl font-bold text-white">
          You're all set!
        </h2>
        <p className="text-lg text-gray-400">
          Here's what you can do next
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Explore Demo Mode</CardTitle>
            <CardDescription>
              See Synapse in action with sample data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Pre-populated Golden Threads</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Sample drift detection alerts</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>AI-powered insights examples</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Interactive relationship graphs</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connect Real Tools</CardTitle>
            <CardDescription>
              Start tracking your actual work
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>OAuth integration in 2 clicks</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Automatic data sync</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Real-time updates</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Secure, encrypted data</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onComplete} loading={isLoading}>
          Go to Dashboard
          <ArrowRightIcon className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
