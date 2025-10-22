import { ReactNode } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

type FeedbackType = 'success' | 'error' | 'warning' | 'info';

interface FeedbackMessageProps {
  type: FeedbackType;
  title: string;
  message?: string;
  onDismiss?: () => void;
  className?: string;
  children?: ReactNode;
}

const config = {
  success: {
    icon: CheckCircleIcon,
    bg: 'bg-success/10',
    border: 'border-success',
    text: 'text-success',
    iconBg: 'bg-success/20',
  },
  error: {
    icon: ExclamationTriangleIcon,
    bg: 'bg-error/10',
    border: 'border-error',
    text: 'text-error',
    iconBg: 'bg-error/20',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    bg: 'bg-warning/10',
    border: 'border-warning',
    text: 'text-warning',
    iconBg: 'bg-warning/20',
  },
  info: {
    icon: InformationCircleIcon,
    bg: 'bg-primary/10',
    border: 'border-primary',
    text: 'text-primary',
    iconBg: 'bg-primary/20',
  },
};

export function FeedbackMessage({
  type,
  title,
  message,
  onDismiss,
  className,
  children,
}: FeedbackMessageProps) {
  const { icon: Icon, bg, border, text, iconBg } = config[type];

  return (
    <div
      className={cn(
        'rounded-lg border-l-4 p-4 animate-slideInLeft',
        border,
        bg,
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className={cn('rounded-full p-1', iconBg)}>
          <Icon className={cn('h-5 w-5', text)} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn('font-semibold', text)}>{title}</h4>
          {message && (
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          )}
          {children && <div className="mt-2">{children}</div>}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

// Convenience components for common patterns
export function SuccessMessage(props: Omit<FeedbackMessageProps, 'type'>) {
  return <FeedbackMessage {...props} type="success" />;
}

export function ErrorMessage(props: Omit<FeedbackMessageProps, 'type'>) {
  return <FeedbackMessage {...props} type="error" />;
}

export function WarningMessage(props: Omit<FeedbackMessageProps, 'type'>) {
  return <FeedbackMessage {...props} type="warning" />;
}

export function InfoMessage(props: Omit<FeedbackMessageProps, 'type'>) {
  return <FeedbackMessage {...props} type="info" />;
}
