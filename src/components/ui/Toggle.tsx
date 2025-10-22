import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      className,
      label,
      description,
      error,
      helperText,
      size = 'md',
      disabled,
      checked,
      id,
      ...props
    },
    ref
  ) => {
    const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

    // Size configurations matching design specs
    // Medium (default): 48px × 26px, circle: 20px diameter
    const sizes = {
      sm: {
        track: 'w-10 h-5',     // 40px × 20px
        circle: 'w-4 h-4',     // 16px diameter
        translate: 'translate-x-5', // 20px translate
      },
      md: {
        track: 'w-12 h-[26px]', // 48px × 26px
        circle: 'w-5 h-5',      // 20px diameter
        translate: 'translate-x-6', // 24px translate
      },
      lg: {
        track: 'w-14 h-8',      // 56px × 32px
        circle: 'w-7 h-7',      // 28px diameter
        translate: 'translate-x-6', // 24px translate
      },
    };

    const sizeConfig = sizes[size];

    return (
      <div className="w-full">
        <div className="flex items-start gap-3">
          {/* Toggle Switch */}
          <div className="relative inline-flex items-center">
            <input
              ref={ref}
              id={toggleId}
              type="checkbox"
              checked={checked}
              disabled={disabled}
              className="sr-only peer"
              aria-describedby={
                error
                  ? `${toggleId}-error`
                  : helperText
                  ? `${toggleId}-helper`
                  : description
                  ? `${toggleId}-description`
                  : undefined
              }
              {...props}
            />

            {/* Track */}
            <div
              className={cn(
                // Base styles
                sizeConfig.track,
                'relative rounded-full transition-all duration-250 ease-smooth',
                'cursor-pointer',

                // Off state: gray-300 background
                'bg-gray-700',

                // On state: gold-400 background
                'peer-checked:bg-primary-400',

                // Hover state
                'hover:bg-gray-600 peer-checked:hover:bg-primary-500',

                // Focus state
                'peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-400/30 peer-focus:ring-offset-2',

                // Disabled state
                'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                'peer-disabled:hover:bg-gray-700 peer-disabled:peer-checked:hover:bg-primary-400',

                // Error state
                error && 'ring-2 ring-error-500/50',

                className
              )}
            >
              {/* Circle (sliding thumb) */}
              <div
                className={cn(
                  // Base styles
                  sizeConfig.circle,
                  'absolute left-0.5 top-1/2 -translate-y-1/2',
                  'rounded-full bg-white shadow-md',

                  // Smooth slide animation: 0.25s cubic-bezier
                  'transition-transform duration-250 ease-smooth',

                  // On state: slide to right
                  `peer-checked:${sizeConfig.translate}`,

                  // Add subtle shadow
                  'shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                )}
              />
            </div>
          </div>

          {/* Label and Description */}
          {(label || description) && (
            <div className="flex-1">
              {label && (
                <label
                  htmlFor={toggleId}
                  className={cn(
                    'block text-sm font-medium text-gray-300',
                    disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                    error && 'text-error-500'
                  )}
                >
                  {label}
                </label>
              )}
              {description && (
                <p
                  id={`${toggleId}-description`}
                  className={cn(
                    'mt-1 text-sm text-gray-500',
                    disabled && 'opacity-50'
                  )}
                >
                  {description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p
            id={`${toggleId}-error`}
            className="mt-1.5 text-sm text-error-500"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p
            id={`${toggleId}-helper`}
            className="mt-1.5 text-sm text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle };
