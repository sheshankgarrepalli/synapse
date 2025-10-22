import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  success?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      success,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const showSuccess = success && !hasError && !disabled;

    // Base textarea styles matching design specs
    const baseStyles = cn(
      'w-full min-h-[100px]',
      'px-4 py-3',
      'bg-background text-foreground',
      'border-2 rounded-lg',
      'font-sans text-base',
      'transition-all duration-200',
      'placeholder:text-muted-foreground',
      'focus:outline-none',
      'resize-y',
      'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-muted'
    );

    // State-specific styles
    const stateStyles = cn({
      // Default state
      'border-input hover:border-gray-400 dark:hover:border-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/30':
        !hasError && !showSuccess && !disabled,

      // Error state - red border + shadow ring
      'border-error hover:border-error focus:border-error focus:ring-2 focus:ring-error/30':
        hasError && !disabled,

      // Success state - green border + shadow ring
      'border-success hover:border-success focus:border-success focus:ring-2 focus:ring-success/30':
        showSuccess,
    });

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              'block mb-2 text-sm font-semibold',
              hasError ? 'text-error' : 'text-foreground'
            )}
          >
            {label}
          </label>
        )}

        {/* Textarea Field */}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(baseStyles, stateStyles, className)}
          disabled={disabled}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : helperText
              ? `${textareaId}-helper`
              : undefined
          }
          {...props}
        />

        {/* Helper Text */}
        {helperText && !error && (
          <p
            id={`${textareaId}-helper`}
            className="mt-1.5 text-xs text-muted-foreground"
          >
            {helperText}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={`${textareaId}-error`}
            className="mt-1.5 text-xs text-error flex items-center gap-1"
            role="alert"
          >
            <ExclamationCircleIcon className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
