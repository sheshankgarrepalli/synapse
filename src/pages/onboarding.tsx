import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { AhaMoment } from '@/components/onboarding/AhaMoment';
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
type OnboardingStep = 'welcome' | 'role' | 'goals' | 'integrations' | 'aha' | 'more-integrations' | 'demo' | 'complete';
type IntegrationType = 'linear' | 'github' | 'figma' | 'slack';

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
    id: 'product_manager',
    title: 'Product Manager',
    description: 'Define what gets built',
    icon: ChartBarIcon,
    color: 'bg-purple-500',
    integrations: ['Linear', 'Figma', 'GitHub', 'Slack'],
    useCases: [
      'See holistic project progress',
      'Identify bottlenecks automatically',
      'Track feature lifecycles end-to-end',
      'Get AI-powered insights on team velocity',
    ],
  },
  {
    id: 'designer',
    title: 'Designer',
    description: 'Create the user experience',
    icon: PaintBrushIcon,
    color: 'bg-pink-500',
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
    title: 'Engineer',
    description: 'Build and ship features',
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
    id: 'team_lead',
    title: 'Founder / Solo',
    description: 'Wear all the hats',
    icon: SparklesIcon,
    color: 'bg-orange-500',
    integrations: ['Linear', 'GitHub', 'Figma', 'Slack'],
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
  const [connectedIntegration, setConnectedIntegration] = useState<IntegrationType | null>(null);

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
            onNext={(integration: IntegrationType) => {
              setConnectedIntegration(integration);
              setCurrentStep('aha');
            }}
            onBack={() => setCurrentStep('goals')}
            onSkip={() => setCurrentStep('demo')}
          />
        );

      case 'aha':
        if (!connectedIntegration) return null;
        return (
          <AhaMoment
            connectedIntegration={connectedIntegration}
            onCreateFirstThread={(thread) => {
              // Here we would create the actual thread
              // For now, just move to more integrations step
              setTimeout(() => {
                setCurrentStep('more-integrations');
              }, 2000);
            }}
            onSkip={() => setCurrentStep('more-integrations')}
          />
        );

      case 'more-integrations':
        return (
          <MoreIntegrationsStep
            connectedIntegration={connectedIntegration}
            onNext={() => setCurrentStep('demo')}
            onSkip={() => setCurrentStep('demo')}
          />
        );

      case 'demo':
        return (
          <DemoStep
            selectedRole={selectedRoleData}
            onComplete={handleComplete}
            onBack={() => setCurrentStep('more-integrations')}
            isLoading={createOnboarding.isLoading}
          />
        );

      default:
        return null;
    }
  };

  const stepNumber = ['welcome', 'role', 'goals', 'integrations', 'aha', 'more-integrations', 'demo'].indexOf(currentStep) + 1;
  const totalSteps = 7;

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
    <div className="text-center max-w-3xl mx-auto">
      {/* Hero visual - Problem to Solution */}
      <div className="mb-12 relative">
        {/* Problem: Scattered tools */}
        <div className="mb-8 flex justify-center items-center gap-4 opacity-40">
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 rounded-lg bg-purple-500/20 flex items-center justify-center border-2 border-purple-500/30">
              <span className="text-2xl">🎨</span>
            </div>
            <span className="text-xs text-gray-500">Figma</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 rounded-lg bg-blue-500/20 flex items-center justify-center border-2 border-blue-500/30">
              <span className="text-2xl">💻</span>
            </div>
            <span className="text-xs text-gray-500">GitHub</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 rounded-lg bg-green-500/20 flex items-center justify-center border-2 border-green-500/30">
              <span className="text-2xl">📋</span>
            </div>
            <span className="text-xs text-gray-500">Linear</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 rounded-lg bg-orange-500/20 flex items-center justify-center border-2 border-orange-500/30">
              <span className="text-2xl">💬</span>
            </div>
            <span className="text-xs text-gray-500">Slack</span>
          </div>
        </div>

        {/* Arrow down showing transformation */}
        <div className="mb-8 flex justify-center">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
            <SparklesIcon className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>

        {/* Solution: Connected thread */}
        <div className="mb-8 flex justify-center items-center">
          <div className="relative">
            {/* Golden thread line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 transform -translate-y-1/2" />
            {/* Connected tools */}
            <div className="relative flex justify-center items-center gap-8">
              <div className="h-12 w-12 rounded-lg bg-purple-500/40 flex items-center justify-center border-2 border-purple-500">
                <span className="text-lg">🎨</span>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/40 flex items-center justify-center border-2 border-blue-500">
                <span className="text-lg">💻</span>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/40 flex items-center justify-center border-2 border-green-500">
                <span className="text-lg">📋</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pain-focused headline */}
      <h1 className="mb-6 text-5xl font-bold text-white leading-tight">
        Stop losing context between tools
      </h1>

      {/* Benefit-driven subheadline */}
      <p className="mb-12 text-xl text-gray-300 max-w-2xl mx-auto">
        Golden Threads keep your design, code, and tasks connected—automatically.
      </p>

      {/* Time expectation */}
      <p className="mb-8 text-base text-gray-400 font-medium">
        Takes 2 minutes to set up
      </p>

      {/* CTA */}
      <Button size="lg" onClick={onNext}>
        Get started
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
          What's your primary role?
        </h2>
        <p className="text-lg text-gray-400">
          We'll customize your experience
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6 max-w-3xl mx-auto">
        {roleOptions.map((role) => (
          <Card
            key={role.id}
            hover
            onClick={() => onSelectRole(role.id)}
            className={`cursor-pointer transition-all duration-200 ${
              selectedRole === role.id
                ? 'ring-2 ring-primary border-primary bg-primary/5 shadow-lg shadow-primary/20 scale-[1.02]'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-4">
                {/* Radio button indicator */}
                <div
                  className={`flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedRole === role.id
                      ? 'border-primary bg-primary'
                      : 'border-gray-600'
                  }`}
                >
                  {selectedRole === role.id && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>

                {/* Role icon */}
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${role.color} shadow-md flex-shrink-0`}>
                  <role.icon className="h-6 w-6 text-white" />
                </div>

                {/* Role info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {role.title}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {role.description}
                  </p>
                </div>

                {/* Check indicator for selected */}
                {selectedRole === role.id && (
                  <CheckCircleIcon className="h-6 w-6 text-primary flex-shrink-0" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reassurance text */}
      <p className="text-center text-sm text-gray-500 mb-8">
        You can change this later in settings
      </p>

      <div className="flex justify-between max-w-3xl mx-auto">
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
  onNext: (integration: IntegrationType) => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationType | null>(null);

  if (!selectedRole) return null;

  const integrations = [
    { id: 'linear' as IntegrationType, name: 'Linear', description: 'Track issues and features', logo: '📋' },
    { id: 'github' as IntegrationType, name: 'GitHub', description: 'Connect your code', logo: '💻' },
    { id: 'figma' as IntegrationType, name: 'Figma', description: 'Link your designs', logo: '🎨' },
    { id: 'slack' as IntegrationType, name: 'Slack', description: 'Get notifications', logo: '💬' },
  ];

  const handleConnect = () => {
    if (!selectedIntegration) return;
    // TODO: Trigger OAuth flow for selected integration
    // For now, simulate successful connection and proceed to Aha Moment
    onNext(selectedIntegration);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="mb-4 text-4xl font-bold text-white">
          Connect your first tool
        </h2>
        <p className="text-lg text-gray-400 mb-3">
          We'll show you the magic with just one connection
        </p>
        <p className="text-base text-gray-500">
          You can add more tools anytime
        </p>
      </div>

      <div className="grid gap-3 mb-6 max-w-2xl mx-auto">
        {integrations.map((integration) => (
          <Card
            key={integration.id}
            hover
            onClick={() => setSelectedIntegration(integration.id)}
            className={`cursor-pointer transition-all duration-200 ${
              selectedIntegration === integration.id
                ? 'ring-2 ring-primary border-primary bg-primary/5 shadow-lg shadow-primary/20 scale-[1.02]'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-4">
                {/* Radio button indicator */}
                <div
                  className={`flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedIntegration === integration.id
                      ? 'border-primary bg-primary'
                      : 'border-gray-600'
                  }`}
                >
                  {selectedIntegration === integration.id && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>

                {/* Integration icon */}
                <div className="text-3xl flex-shrink-0">{integration.logo}</div>

                {/* Integration info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white mb-0.5">
                    {integration.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {integration.description}
                  </p>
                </div>

                {/* Check indicator for selected */}
                {selectedIntegration === integration.id && (
                  <CheckCircleIcon className="h-6 w-6 text-primary flex-shrink-0" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Privacy and security reassurance */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔒</div>
          <div className="flex-1">
            <p className="text-sm text-gray-300 mb-2">
              <span className="font-semibold text-white">Your data stays private.</span> We only read data, never write.
            </p>
            <p className="text-xs text-gray-500">
              You can disconnect anytime in settings • Takes 30 seconds
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between max-w-2xl mx-auto">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex items-center gap-3">
          <button
            onClick={onSkip}
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors px-4"
          >
            Skip for now
          </button>
          <Button onClick={handleConnect} disabled={!selectedIntegration}>
            {selectedIntegration
              ? `Connect ${integrations.find(i => i.id === selectedIntegration)?.name}`
              : 'Select an integration'}
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MoreIntegrationsStep({
  connectedIntegration,
  onNext,
  onSkip,
}: {
  connectedIntegration: IntegrationType | null;
  onNext: () => void;
  onSkip: () => void;
}) {
  const [selectedIntegrations, setSelectedIntegrations] = useState<IntegrationType[]>([]);

  // Get value propositions based on what's already connected
  const getValueProp = (integrationId: IntegrationType): { title: string; description: string; example: string } => {
    if (connectedIntegration === 'linear' && integrationId === 'github') {
      return {
        title: 'Auto-link PRs to Issues',
        description: 'See which code changes are connected to which Linear issues—automatically.',
        example: 'LIN-123 → PR #456 → Deploy ✓',
      };
    }
    if (connectedIntegration === 'linear' && integrationId === 'figma') {
      return {
        title: 'Connect Designs to Tasks',
        description: 'Know which designs are ready for dev and track design → dev → deploy.',
        example: 'Figma "Onboarding" → LIN-123 → Deployed',
      };
    }
    if (connectedIntegration === 'github' && integrationId === 'figma') {
      return {
        title: 'Track Design → Code',
        description: 'Know when designs are implemented and catch design-code drift early.',
        example: 'Figma "Onboarding v2" → PR #457 → Deployed',
      };
    }
    if (connectedIntegration === 'github' && integrationId === 'linear') {
      return {
        title: 'Link Code to Issues',
        description: 'Track which PRs implement which issues and see feature progress.',
        example: 'PR #456 → LIN-123 → Merged & Deployed',
      };
    }
    if (connectedIntegration === 'figma' && integrationId === 'github') {
      return {
        title: 'Detect Design-Code Drift',
        description: "Get alerts when designs are updated but code hasn't changed.",
        example: "⚠️ Design updated but code hasn't changed",
      };
    }
    if (connectedIntegration === 'figma' && integrationId === 'linear') {
      return {
        title: 'Design Implementation Status',
        description: 'Track which designs have been assigned and implemented.',
        example: 'Figma "Dashboard" → LIN-234 → In Progress',
      };
    }
    if (integrationId === 'slack') {
      return {
        title: 'Get Notified of Changes',
        description: 'Receive alerts in Slack when threads update or drift is detected.',
        example: "💬 \"⚠️ Design updated but code hasn't changed\"",
      };
    }

    // Fallback
    return {
      title: `Unlock ${integrationId === 'github' ? 'GitHub' : integrationId === 'linear' ? 'Linear' : integrationId === 'figma' ? 'Figma' : 'Slack'} Power`,
      description: 'Connect more tools to automatically create Golden Threads across your workflow.',
      example: 'Design → Code → Task → Deploy',
    };
  };

  const allIntegrations = [
    { id: 'linear' as IntegrationType, name: 'Linear', description: 'Track issues and features', logo: '📋' },
    { id: 'github' as IntegrationType, name: 'GitHub', description: 'Connect your code', logo: '💻' },
    { id: 'figma' as IntegrationType, name: 'Figma', description: 'Link your designs', logo: '🎨' },
    { id: 'slack' as IntegrationType, name: 'Slack', description: 'Get notifications', logo: '💬' },
  ];

  // Filter out already connected integration
  const availableIntegrations = allIntegrations.filter(
    (integration) => integration.id !== connectedIntegration
  );

  const toggleIntegration = (integrationId: IntegrationType) => {
    setSelectedIntegrations((prev) =>
      prev.includes(integrationId)
        ? prev.filter((id) => id !== integrationId)
        : [...prev, integrationId]
    );
  };

  const handleConnect = () => {
    // TODO: Trigger OAuth flow for selected integrations
    // For now, just proceed to next step
    onNext();
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="mb-4 flex justify-center">
          <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircleIcon className="h-10 w-10 text-green-400" />
          </div>
        </div>

        <h2 className="mb-4 text-4xl font-bold text-white">
          Unlock more with additional integrations
        </h2>
        <p className="text-lg text-gray-400 mb-2">
          See what becomes possible when you connect more tools
        </p>
        <p className="text-base text-gray-500">
          You can always add these later
        </p>
      </div>

      {/* Why connect more section */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-8 max-w-3xl mx-auto">
        <div className="flex items-start gap-4">
          <SparklesIcon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Why connect more tools?
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-white">Automatic connections:</strong> We link your work across all tools—no manual effort</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-white">Complete visibility:</strong> See the full lifecycle from design → code → deploy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-white">Proactive alerts:</strong> Get notified when things drift or need attention</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Value proposition cards */}
      <div className="grid gap-4 mb-6 max-w-3xl mx-auto">
        {availableIntegrations.map((integration) => {
          const valueProp = getValueProp(integration.id);
          return (
            <Card
              key={integration.id}
              hover
              onClick={() => toggleIntegration(integration.id)}
              className={`cursor-pointer transition-all duration-200 ${
                selectedIntegrations.includes(integration.id)
                  ? 'ring-2 ring-primary border-primary bg-primary/5 shadow-lg shadow-primary/20'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div
                    className={`flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-all mt-1 ${
                      selectedIntegrations.includes(integration.id)
                        ? 'border-primary bg-primary'
                        : 'border-gray-600'
                    }`}
                  >
                    {selectedIntegrations.includes(integration.id) && (
                      <CheckCircleIcon className="h-4 w-4 text-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Integration header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl flex-shrink-0">{integration.logo}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {integration.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Takes 30 seconds
                        </p>
                      </div>
                    </div>

                    {/* Value proposition */}
                    <div className="pl-1">
                      <h4 className="text-base font-semibold text-white mb-1">
                        {valueProp.title}
                      </h4>
                      <p className="text-sm text-gray-400 mb-2">
                        {valueProp.description}
                      </p>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-xs font-mono text-gray-300">
                        {valueProp.example}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center gap-3 mb-8">
        <button
          onClick={onSkip}
          className="text-sm text-gray-400 hover:text-gray-300 transition-colors underline decoration-dotted underline-offset-4"
        >
          Maybe later
        </button>
      </div>

      {selectedIntegrations.length > 0 && (
        <div className="text-center">
          <Button onClick={handleConnect} size="lg">
            Connect {selectedIntegrations.length} {selectedIntegrations.length === 1 ? 'tool' : 'tools'} (30 seconds)
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}
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
