import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/20/solid';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  success?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      success,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const showSuccess = success && !hasError && !disabled;

    // Base input styles matching design specs
    const baseStyles = cn(
      'w-full h-11',
      'px-4 py-3',
      'bg-background text-foreground',
      'border-2 rounded-lg',
      'font-sans text-base',
      'transition-all duration-200',
      'placeholder:text-muted-foreground',
      'focus:outline-none',
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

      // With left icon - add left padding
      'pl-11': !!leftIcon,

      // With right icon or success/error indicator - add right padding
      'pr-11': !!rightIcon || hasError || showSuccess,
    });

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block mb-2 text-sm font-semibold',
              hasError ? 'text-error' : 'text-foreground'
            )}
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <span className="w-5 h-5 text-muted-foreground">{leftIcon}</span>
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(baseStyles, stateStyles, className)}
            disabled={disabled}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            {...props}
          />

          {/* Right Icon or State Indicator */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            {hasError && (
              <ExclamationCircleIcon className="w-5 h-5 text-error" aria-hidden="true" />
            )}
            {showSuccess && (
              <CheckCircleIcon className="w-5 h-5 text-success" aria-hidden="true" />
            )}
            {!hasError && !showSuccess && rightIcon && (
              <span className="w-5 h-5 text-muted-foreground">{rightIcon}</span>
            )}
          </div>
        </div>

        {/* Helper Text */}
        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="mt-1.5 text-xs text-muted-foreground"
          >
            {helperText}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={`${inputId}-error`}
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

Input.displayName = 'Input';

export { Input };
