import { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, CircleStackIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';
import { api } from '@/utils/api';
import confetti from 'canvas-confetti';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  weight: number; // Contribution to overall progress (should sum to 100)
  href?: string;
}

interface OnboardingChecklistProps {
  onDismiss?: () => void;
}

export function OnboardingChecklist({ onDismiss }: OnboardingChecklistProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastMilestone, setLastMilestone] = useState<number>(0);

  // Fetch onboarding status
  const { data: onboardingStatus } = api.onboarding.getStatus.useQuery();
  const { data: threadsData } = api.threads.list.useQuery({ limit: 1 });
  const { data: integrationsData } = api.integrations.list.useQuery();

  // Check completion status
  const hasConnectedIntegration = (integrationsData?.integrations?.length || 0) > 0 || onboardingStatus?.hasCompletedOnboarding;
  const hasCreatedThread = (threadsData?.threads?.length || 0) > 0;
  const hasInvitedTeamMember = false; // TODO: Add team member check when team functionality is built
  const hasEnabledDriftDetection = onboardingStatus?.hasCompletedOnboarding || false;

  const items: ChecklistItem[] = [
    {
      id: 'connect_integration',
      title: 'Connect your first integration',
      description: 'Link Figma, GitHub, Linear, Slack, or Zoom',
      completed: hasConnectedIntegration,
      weight: 25,
      href: '/integrations',
    },
    {
      id: 'create_thread',
      title: 'Create your first Golden Thread',
      description: 'Connect work items across your tools',
      completed: hasCreatedThread,
      weight: 25,
      href: '/dashboard',
    },
    {
      id: 'invite_team',
      title: 'Invite a team member',
      description: 'Collaborate with your team',
      completed: hasInvitedTeamMember,
      weight: 25,
      href: '/settings/team',
    },
    {
      id: 'enable_drift',
      title: 'Enable drift detection',
      description: 'Get alerts when design and code diverge',
      completed: hasEnabledDriftDetection,
      weight: 25,
      href: '/settings/automations',
    },
  ];

  // Calculate progress
  const progress = items.reduce((acc, item) => {
    return acc + (item.completed ? item.weight : 0);
  }, 0);

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;

  // Check for milestone achievements (every 25%)
  useEffect(() => {
    const milestones = [25, 50, 75, 100];
    const currentMilestone = milestones.find(m => progress >= m && lastMilestone < m);

    if (currentMilestone) {
      setLastMilestone(currentMilestone);
      setShowCelebration(true);
      triggerConfetti();

      // Auto-hide celebration after 3 seconds
      setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
    }
  }, [progress, lastMilestone]);

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
    // Store dismissal in localStorage
    localStorage.setItem('onboarding_checklist_dismissed', 'true');
  };

  // Check if previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('onboarding_checklist_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  // Auto-dismiss when 100% complete
  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => {
        handleDismiss();
      }, 5000); // Dismiss after 5 seconds to allow celebration
    }
  }, [progress]);

  if (isDismissed) {
    return null;
  }

  return (
    <>
      <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Get Started with Synapse</h3>
            <p className="mt-1 text-sm text-gray-600">
              Complete these steps to unlock the full power of your workspace
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Dismiss checklist"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">
              {completedCount} of {totalCount} completed
            </span>
            <span className="font-semibold text-purple-600">{progress}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Checklist Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                'group rounded-xl border-2 p-4 transition-all',
                item.completed
                  ? 'border-green-200 bg-green-50/50'
                  : 'border-gray-200 bg-white hover:border-purple-200 hover:shadow-sm'
              )}
            >
              <div className="flex items-start space-x-3">
                {/* Checkbox Icon */}
                <div className="flex-shrink-0">
                  {item.completed ? (
                    <CheckCircleSolidIcon className="h-6 w-6 text-green-600" />
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-gray-300 group-hover:border-purple-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h4
                    className={cn(
                      'text-sm font-medium',
                      item.completed ? 'text-gray-600 line-through' : 'text-gray-900'
                    )}
                  >
                    {item.title}
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-500">{item.description}</p>

                  {/* Action Button */}
                  {!item.completed && item.href && (
                    <a
                      href={item.href}
                      className="mt-2 inline-flex items-center text-xs font-medium text-purple-600 hover:text-purple-700"
                    >
                      Get started →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Motivational Message */}
        {progress > 0 && progress < 100 && (
          <div className="mt-4 rounded-lg bg-purple-100 px-4 py-3">
            <p className="text-sm font-medium text-purple-900">
              {progress >= 75
                ? "🎉 Almost there! You're doing great!"
                : progress >= 50
                ? "💪 You're halfway there! Keep going!"
                : "🚀 Great start! Keep going to unlock all features!"}
            </p>
          </div>
        )}
      </div>

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 max-w-md rounded-2xl border border-purple-200 bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600">
              <CheckCircleSolidIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              {progress === 100 ? '🎉 Congratulations!' : '🎊 Milestone Achieved!'}
            </h2>
            <p className="mb-6 text-gray-600">
              {progress === 100
                ? "You've completed your onboarding! You're all set to get the most out of Synapse."
                : `You've reached ${progress}% completion! Keep up the great work!`}
            </p>
            <button
              onClick={() => setShowCelebration(false)}
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:from-purple-700 hover:to-purple-800"
            >
              {progress === 100 ? "Let's Go!" : 'Continue'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
