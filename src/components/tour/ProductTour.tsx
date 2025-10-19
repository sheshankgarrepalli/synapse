import { useEffect, useState } from 'react';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { useRouter } from 'next/router';

interface ProductTourProps {
  startTour?: boolean;
  onComplete?: () => void;
}

export function ProductTour({ startTour = false, onComplete }: ProductTourProps) {
  const router = useRouter();
  const [tour, setTour] = useState<any>(null);

  useEffect(() => {
    // Check if user has completed the tour
    const hasCompletedTour = localStorage.getItem('product_tour_completed');
    if (hasCompletedTour === 'true' && !startTour) {
      return;
    }

    // Initialize the tour
    const newTour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: {
          enabled: true,
        },
        classes: 'shepherd-theme-custom',
        scrollTo: { behavior: 'smooth', block: 'center' },
      },
    });

    // Dashboard tour steps
    if (router.pathname === '/dashboard') {
      newTour.addStep({
        id: 'welcome',
        title: 'Welcome to Synapse! 👋',
        text: `Let's take a quick tour to help you get started with your AI-powered work intelligence platform.`,
        buttons: [
          {
            text: 'Skip Tour',
            action: newTour.cancel,
            classes: 'shepherd-button-secondary',
          },
          {
            text: 'Start Tour',
            action: newTour.next,
          },
        ],
      });

      newTour.addStep({
        id: 'metrics',
        title: 'Your Workspace Metrics',
        text: 'Track key metrics like alerts, connected users, workflow progress, and thread activity at a glance.',
        attachTo: {
          element: '.grid.gap-4.md\\:grid-cols-2.lg\\:grid-cols-4',
          on: 'bottom',
        },
        buttons: [
          {
            text: 'Back',
            action: newTour.back,
            classes: 'shepherd-button-secondary',
          },
          {
            text: 'Next',
            action: newTour.next,
          },
        ],
      });

      newTour.addStep({
        id: 'new-thread',
        title: 'Create Golden Threads',
        text: 'Golden Threads connect related work items across all your tools. Click here to create your first thread.',
        attachTo: {
          element: 'button:has(svg.h-5.w-5)',
          on: 'bottom',
        },
        buttons: [
          {
            text: 'Back',
            action: newTour.back,
            classes: 'shepherd-button-secondary',
          },
          {
            text: 'Next',
            action: newTour.next,
          },
        ],
      });

      newTour.addStep({
        id: 'search-filter',
        title: 'Search & Filter',
        text: 'Quickly find threads using search and filter by status to stay organized.',
        attachTo: {
          element: '.grid.gap-4.md\\:grid-cols-2',
          on: 'top',
        },
        buttons: [
          {
            text: 'Back',
            action: newTour.back,
            classes: 'shepherd-button-secondary',
          },
          {
            text: 'Next',
            action: newTour.next,
          },
        ],
      });

      newTour.addStep({
        id: 'sidebar-nav',
        title: 'Navigate Your Workspace',
        text: 'Access all features from the sidebar: Threads, Search, Integrations, Automations, and Settings.',
        attachTo: {
          element: 'aside nav',
          on: 'right',
        },
        buttons: [
          {
            text: 'Back',
            action: newTour.back,
            classes: 'shepherd-button-secondary',
          },
          {
            text: 'Got it!',
            action: () => {
              newTour.complete();
              localStorage.setItem('product_tour_completed', 'true');
              if (onComplete) onComplete();
            },
          },
        ],
      });
    }

    // Integrations page tour steps
    if (router.pathname === '/integrations') {
      newTour.addStep({
        id: 'integrations-welcome',
        title: 'Connect Your Tools 🔗',
        text: 'Synapse works by connecting your favorite tools. Let\'s see how to set them up.',
        buttons: [
          {
            text: 'Skip',
            action: newTour.cancel,
            classes: 'shepherd-button-secondary',
          },
          {
            text: 'Continue',
            action: newTour.next,
          },
        ],
      });

      newTour.addStep({
        id: 'integration-cards',
        title: 'Available Integrations',
        text: 'We support Figma, GitHub, Linear, Slack, and Zoom. Click "Connect" on any card to get started.',
        attachTo: {
          element: '.grid.gap-6.md\\:grid-cols-2.lg\\:grid-cols-3',
          on: 'top',
        },
        buttons: [
          {
            text: 'Back',
            action: newTour.back,
            classes: 'shepherd-button-secondary',
          },
          {
            text: 'Got it!',
            action: () => {
              newTour.complete();
              if (onComplete) onComplete();
            },
          },
        ],
      });
    }

    // Intelligence page tour steps
    if (router.pathname === '/intelligence') {
      newTour.addStep({
        id: 'intelligence-welcome',
        title: 'AI-Powered Insights 🧠',
        text: 'Synapse uses AI to automatically detect relationships between work items across your tools.',
        buttons: [
          {
            text: 'Skip',
            action: newTour.cancel,
            classes: 'shepherd-button-secondary',
          },
          {
            text: 'Continue',
            action: newTour.next,
          },
        ],
      });

      newTour.addStep({
        id: 'confidence-scores',
        title: 'Confidence Scores',
        text: 'Each relationship shows a confidence score so you know how certain the AI is about the connection.',
        buttons: [
          {
            text: 'Back',
            action: newTour.back,
            classes: 'shepherd-button-secondary',
          },
          {
            text: 'Next',
            action: newTour.next,
          },
        ],
      });

      newTour.addStep({
        id: 'reasoning',
        title: 'Explainable AI',
        text: 'Expand any item to see the reasoning behind the AI\'s detection and review the evidence.',
        buttons: [
          {
            text: 'Back',
            action: newTour.back,
            classes: 'shepherd-button-secondary',
          },
          {
            text: 'Got it!',
            action: () => {
              newTour.complete();
              if (onComplete) onComplete();
            },
          },
        ],
      });
    }

    // Drift Detection page tour steps
    if (router.pathname === '/drift') {
      newTour.addStep({
        id: 'drift-welcome',
        title: 'Design-Code Drift Detection 🎨💻',
        text: 'Automatically catch when your implemented code drifts from the original design.',
        buttons: [
          {
            text: 'Skip',
            action: newTour.cancel,
            classes: 'shepherd-button-secondary',
          },
          {
            text: 'Continue',
            action: newTour.next,
          },
        ],
      });

      newTour.addStep({
        id: 'drift-items',
        title: 'Drift Alerts',
        text: 'Each alert shows what changed, when it was detected, and the severity level.',
        buttons: [
          {
            text: 'Back',
            action: newTour.back,
            classes: 'shepherd-button-secondary',
          },
          {
            text: 'Next',
            action: newTour.next,
          },
        ],
      });

      newTour.addStep({
        id: 'visual-comparison',
        title: 'Visual Comparison',
        text: 'Click any drift item to see a side-by-side comparison of the design vs. the implemented code.',
        buttons: [
          {
            text: 'Back',
            action: newTour.back,
            classes: 'shepherd-button-secondary',
          },
          {
            text: 'Got it!',
            action: () => {
              newTour.complete();
              if (onComplete) onComplete();
            },
          },
        ],
      });
    }

    setTour(newTour);

    // Auto-start tour if requested
    if (startTour) {
      setTimeout(() => {
        newTour.start();
      }, 500);
    }

    // Cleanup
    return () => {
      if (newTour.isActive()) {
        newTour.complete();
      }
    };
  }, [router.pathname, startTour, onComplete]);

  return null;
}

// Hook to manually trigger the tour
export function useTour() {
  const [shouldStartTour, setShouldStartTour] = useState(false);

  const startTour = () => {
    setShouldStartTour(true);
  };

  const resetTour = () => {
    localStorage.removeItem('product_tour_completed');
    setShouldStartTour(true);
  };

  return {
    startTour,
    resetTour,
    shouldStartTour,
    TourComponent: () => <ProductTour startTour={shouldStartTour} onComplete={() => setShouldStartTour(false)} />,
  };
}
