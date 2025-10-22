import { LayoutNew } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();

  return (
    <LayoutNew>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        {/* Large 404 with golden gradient */}
        <h1 className="text-9xl font-bold bg-gradient-to-r from-primary-300 via-primary-500 to-primary-300 bg-clip-text text-transparent mb-4 animate-fadeIn">
          404
        </h1>

        <h2 className="text-3xl font-bold font-heading mb-4 animate-slideInUp" style={{ animationDelay: '0.1s' }}>
          Thread Not Found
        </h2>

        <p className="text-muted-foreground text-lg mb-8 max-w-md animate-slideInUp" style={{ animationDelay: '0.2s' }}>
          The thread you're looking for doesn't exist or has been deleted.
          Let's get you back on track.
        </p>

        <div className="flex items-center gap-4 animate-slideInUp" style={{ animationDelay: '0.3s' }}>
          <Button
            variant="outline"
            leftIcon={<ArrowLeftIcon className="w-5 h-5" />}
            onClick={() => router.back()}
          >
            Go Back
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
