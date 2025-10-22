import { LayoutNew } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { HomeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

export default function Custom500() {
  const router = useRouter();

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <LayoutNew>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        {/* Large 500 with error gradient */}
        <h1 className="text-9xl font-bold bg-gradient-to-r from-error/60 via-error to-error/60 bg-clip-text text-transparent mb-4 animate-fadeIn">
          500
        </h1>

        <h2 className="text-3xl font-bold font-heading mb-4 animate-slideInUp" style={{ animationDelay: '0.1s' }}>
          Something Went Wrong
        </h2>

        <p className="text-muted-foreground text-lg mb-8 max-w-md animate-slideInUp" style={{ animationDelay: '0.2s' }}>
          We're experiencing technical difficulties. Our team has been notified
          and is working to fix the issue.
        </p>

        <div className="flex items-center gap-4 animate-slideInUp" style={{ animationDelay: '0.3s' }}>
          <Button
            variant="outline"
            leftIcon={<ArrowPathIcon className="w-5 h-5" />}
            onClick={handleReload}
          >
            Try Again
          </Button>
          <Button
            variant="primary"
            leftIcon={<HomeIcon className="w-5 h-5" />}
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </LayoutNew>
  );
}
