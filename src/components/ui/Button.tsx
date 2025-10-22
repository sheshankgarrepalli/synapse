import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, leftIcon, rightIcon, fullWidth, ...props }, ref) => {
    // Base styles with smooth transitions and focus states
    const baseStyles = cn(
      'inline-flex items-center justify-center gap-2',
      'font-semibold tracking-wide',
      'rounded-lg',
      'transition-all duration-200 ease-smooth',
      'focus-visible:outline-none',
      'disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none',
      'active:translate-y-0'
    );

    // Variant styles matching design specs
    const variants = {
      // Primary: Gold button with shadow + glow
      primary: cn(
        'bg-primary text-white',
        'shadow-sm shadow-primary/20',
        'hover:bg-primary-500 hover:shadow-md hover:shadow-primary/30 hover:-translate-y-0.5',
        'active:bg-primary-600 active:shadow-xs',
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'focus-visible:shadow-focus-primary'
      ),

      // Secondary: Outline style with gold border
      secondary: cn(
        'bg-transparent text-primary-700 dark:text-primary-300',
        'border-2 border-primary-400',
        'hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-500',
        'active:bg-primary-100 dark:active:bg-primary-900/30',
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
      ),

      // Outline: Gray border outline (alias for secondary but with gray)
      outline: cn(
        'bg-transparent text-card-foreground',
        'border-2 border-border',
        'hover:bg-muted hover:border-gray-400 dark:hover:border-gray-500',
        'active:bg-muted/80',
        'focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2'
      ),

      // Ghost: Minimal style
      ghost: cn(
        'bg-transparent text-gray-700 dark:text-gray-300',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'active:bg-gray-200 dark:active:bg-gray-700',
        'focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2'
      ),

      // Danger: Red button for destructive actions
      danger: cn(
        'bg-error text-white',
        'shadow-sm shadow-error/20',
        'hover:bg-red-600 hover:shadow-md hover:shadow-error/30 hover:-translate-y-0.5',
        'active:bg-red-700 active:shadow-xs',
        'focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2',
        'focus-visible:shadow-focus-error'
      ),

      // Success: Green button for positive actions
      success: cn(
        'bg-success text-white',
        'shadow-sm shadow-success/20',
        'hover:bg-green-600 hover:shadow-md hover:shadow-success/30 hover:-translate-y-0.5',
        'active:bg-success-700 active:shadow-xs',
        'focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2',
        'focus-visible:shadow-focus-success'
      ),
    };

    // Size styles matching design specs
    const sizes = {
      xs: 'h-8 px-4 text-xs gap-1.5',      // 32px height, 8px×16px padding
      sm: 'h-9 px-5 text-sm gap-2',        // 36px height, 8px×20px padding
      md: 'h-11 px-6 text-base gap-2',     // 44px height, 12px×24px padding (default)
      lg: 'h-12 px-7 text-lg gap-2.5',     // 48px height, 14px×28px padding
      xl: 'h-14 px-8 text-xl gap-3',       // 56px height, 16px×32px padding
    };

    // Icon sizes based on button size
    const iconSizes = {
      xs: 'w-3.5 h-3.5',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-5 h-5',
      xl: 'w-6 h-6',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className={cn('animate-spin', iconSizes[size])}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && (
          <span className={cn('inline-flex', iconSizes[size])} aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && (
          <span className={cn('inline-flex', iconSizes[size])} aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
