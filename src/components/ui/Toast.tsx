import toast, { Toaster, Toast as ToastType } from 'react-hot-toast';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// Custom toast provider with styled toasts
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options
        duration: 4000,
        style: {
          background: '#1F2937', // gray-800
          color: '#F9FAFB', // gray-50
          border: '1px solid #374151', // gray-700
          borderRadius: '12px',
          padding: '16px',
          maxWidth: '500px',
        },
        // Success toast
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10B981', // green-500
            secondary: '#F9FAFB',
          },
        },
        // Error toast
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#EF4444', // red-500
            secondary: '#F9FAFB',
          },
        },
        // Loading toast
        loading: {
          iconTheme: {
            primary: '#6366F1', // primary
            secondary: '#F9FAFB',
          },
        },
      }}
    />
  );
}

// Custom toast functions with consistent styling
export const showToast = {
  success: (message: string, options?: any) => {
    return toast.custom(
      (t) => (
        <ToastContent
          toast={t}
          type="success"
          message={message}
        />
      ),
      options
    );
  },

  error: (message: string, options?: any) => {
    return toast.custom(
      (t) => (
        <ToastContent
          toast={t}
          type="error"
          message={message}
        />
      ),
      options
    );
  },

  info: (message: string, options?: any) => {
    return toast.custom(
      (t) => (
        <ToastContent
          toast={t}
          type="info"
          message={message}
        />
      ),
      options
    );
  },

  warning: (message: string, options?: any) => {
    return toast.custom(
      (t) => (
        <ToastContent
          toast={t}
          type="warning"
          message={message}
        />
      ),
      options
    );
  },

  loading: (message: string, options?: any) => {
    return toast.loading(message, options);
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: any
  ) => {
    return toast.promise(promise, messages, options);
  },

  dismiss: (toastId?: string) => {
    return toast.dismiss(toastId);
  },
};

// Toast content component
interface ToastContentProps {
  toast: ToastType;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  title?: string;
}

function ToastContent({ toast: t, type, message, title }: ToastContentProps) {
  const icons = {
    success: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
    error: <XCircleIcon className="h-5 w-5 text-red-500" />,
    info: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
    warning: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />,
  };

  const bgColors = {
    success: 'bg-green-500/10 border-green-500/20',
    error: 'bg-red-500/10 border-red-500/20',
    info: 'bg-blue-500/10 border-blue-500/20',
    warning: 'bg-yellow-500/10 border-yellow-500/20',
  };

  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } pointer-events-auto flex w-full max-w-md rounded-xl border shadow-lg ${bgColors[type]}`}
      style={{ background: '#1F2937' }}
    >
      <div className="flex flex-1 items-start p-4">
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="ml-3 flex-1">
          {title && <p className="text-sm font-medium text-white">{title}</p>}
          <p className={`text-sm ${title ? 'mt-1' : ''} text-gray-300`}>{message}</p>
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="ml-4 inline-flex flex-shrink-0 text-gray-400 hover:text-gray-300 focus:outline-none"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// Export default toast for basic usage
export default toast;
