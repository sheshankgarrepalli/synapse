import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';

export interface GreetingHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Subtitle text to display below greeting
   */
  subtitle?: string;
}

/**
 * Displays a personalized time-based greeting to the user
 */
export function GreetingHeader({
  subtitle = "Track and manage your Golden Threads across all integrations",
  className,
  ...props
}: GreetingHeaderProps) {
  const { user } = useUser();

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon';
    } else if (hour >= 17 && hour < 22) {
      return 'Good evening';
    } else {
      return 'Good night';
    }
  };

  const greeting = getTimeBasedGreeting();
  const firstName = user?.firstName || user?.username || 'there';

  return (
    <div className={cn("mb-8", className)} {...props}>
      <h1 className="text-4xl font-bold text-foreground font-heading mb-2 flex items-center gap-2">
        {greeting}, {firstName} <span className="wave">👋</span>
      </h1>
      <p className="text-base text-muted-foreground">
        {subtitle}
      </p>

      <style jsx>{`
        .wave {
          display: inline-block;
          animation: wave 1s ease-in-out;
        }

        @keyframes wave {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
