import { forwardRef, InputHTMLAttributes, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  indeterminate?: boolean;
  error?: string;
  helperText?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, indeterminate, error, helperText, id, disabled, ...props }, ref) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const checkboxRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;

    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    // Handle indeterminate state
    useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate || false;
      }
    }, [indeterminate, checkboxRef]);

    return (
      <div className="w-full">
        <div className="flex items-start">
          <div className="relative flex items-center">
            <input
              id={checkboxId}
              ref={checkboxRef}
              type="checkbox"
              disabled={disabled}
              className={cn(
                // Base styles - hidden native checkbox
                'peer h-5 w-5 cursor-pointer appearance-none',
                'rounded border-2 transition-all duration-200',

                // Default state
                'border-gray-400 bg-transparent',

                // Hover state
                'hover:border-primary-400',

                // Focus state
                'focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:ring-offset-2',

                // Checked state
                'checked:border-primary-400 checked:bg-primary-400',

                // Indeterminate state (via ref)
                'indeterminate:border-primary-400 indeterminate:bg-primary-400',

                // Disabled state
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-400',

                // Error state
                error && 'border-error-500 hover:border-error-600 focus:ring-error-500/30',

                className
              )}
              {...props}
            />

            {/* Checkmark icon */}
            <svg
              className={cn(
                'pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 text-white opacity-0 transition-opacity duration-200',
                'peer-checked:opacity-100'
              )}
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"
                fill="currentColor"
              />
            </svg>

            {/* Indeterminate dash icon */}
            <svg
              className={cn(
                'pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 text-white opacity-0 transition-opacity duration-200',
                indeterminate && 'opacity-100'
              )}
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect x="4" y="7" width="8" height="2" rx="1" fill="currentColor" />
            </svg>
          </div>

          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'ml-3 select-none text-sm font-medium text-gray-300',
                disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                error && 'text-error-500'
              )}
            >
              {label}
            </label>
          )}
        </div>

        {error && <p className="mt-1 text-sm text-error-500">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
