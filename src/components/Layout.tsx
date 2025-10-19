import { ReactNode, useEffect, useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import {
  HomeIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
  BoltIcon,
  Cog6ToothIcon,
  PuzzlePieceIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';
import { ProductTour } from '@/components/tour/ProductTour';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Threads', href: '/threads', icon: Squares2X2Icon },
  { name: 'Search', href: '/search', icon: MagnifyingGlassIcon },
  { name: 'Integrations', href: '/integrations', icon: PuzzlePieceIcon },
  { name: 'Automations', href: '/automations', icon: BoltIcon },
  { name: 'Intelligence', href: '/intelligence', icon: SparklesIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [startTour, setStartTour] = useState(false);

  // Auto-start tour for first-time users on dashboard
  useEffect(() => {
    const hasCompletedTour = localStorage.getItem('product_tour_completed');
    const hasSeenTourPrompt = localStorage.getItem('tour_prompt_seen');

    if (!hasCompletedTour && !hasSeenTourPrompt && router.pathname === '/dashboard') {
      // Show tour after a short delay when user lands on dashboard for the first time
      const timer = setTimeout(() => {
        setStartTour(true);
        localStorage.setItem('tour_prompt_seen', 'true');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [router.pathname]);

  return (
    <div className="min-h-screen bg-black">
      {/* Sidebar with Purple Gradient */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-[#7C3AED] via-[#6D28D9] to-[#5B21B6] shadow-xl">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <span className="text-xl font-bold text-white">S</span>
              </div>
              <span className="text-xl font-bold text-white">Synapse</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-6">
            {navigation.map((item) => {
              const isActive = router.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-white/10 p-4 space-y-3">
            {/* Help/Tour Button */}
            <button
              onClick={() => setStartTour(true)}
              className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
            >
              <QuestionMarkCircleIcon className="h-5 w-5" />
              <span>Take Product Tour</span>
            </button>

            <div className="flex items-center space-x-3 rounded-xl bg-white/10 p-3 backdrop-blur-sm">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'h-10 w-10',
                  },
                }}
              />
              <div className="flex-1 text-sm">
                <p className="font-medium text-white">User</p>
                <p className="text-white/60 text-xs">Free Plan</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 min-h-screen bg-black">
        <div className="px-8 py-6 max-h-screen overflow-y-auto">
          {/* Onboarding Checklist - Only shown if not dismissed */}
          <div className="mb-6">
            <OnboardingChecklist />
          </div>
          {children}
        </div>
      </main>

      {/* Product Tour */}
      <ProductTour startTour={startTour} onComplete={() => setStartTour(false)} />
    </div>
  );
}
