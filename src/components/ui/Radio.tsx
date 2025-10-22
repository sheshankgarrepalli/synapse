import { forwardRef, InputHTMLAttributes, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

// Radio Group Context
interface RadioGroupContextValue {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

// Radio Group Component
export interface RadioGroupProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  label?: string;
  error?: string;
  helperText?: string;
  orientation?: 'vertical' | 'horizontal';
}

export const RadioGroup = ({
  name,
  value,
  onChange,
  disabled,
  children,
  className,
  label,
  error,
  helperText,
  orientation = 'vertical',
}: RadioGroupProps) => {
  return (
    <RadioGroupContext.Provider value={{ name, value, onChange, disabled }}>
      <div className={cn('w-full', className)}>
        {label && (
          <div className="mb-3 text-sm font-semibold text-gray-300">{label}</div>
        )}
        <div
          className={cn(
            'flex gap-4',
            orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
          )}
          role="radiogroup"
          aria-label={label}
        >
          {children}
        </div>
        {error && <p className="mt-2 text-sm text-error-500">{error}</p>}
        {helperText && !error && <p className="mt-2 text-sm text-gray-500">{helperText}</p>}
      </div>
    </RadioGroupContext.Provider>
  );
};

// Radio Component
export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  value: string;
  description?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, value, description, disabled, ...props }, ref) => {
    const context = useContext(RadioGroupContext);

    if (!context) {
      console.error('Radio must be used within a RadioGroup');
      return null;
    }

    const { name, value: groupValue, onChange, disabled: groupDisabled } = context;
    const isChecked = groupValue === value;
    const isDisabled = disabled || groupDisabled;
    const radioId = `radio-${name}-${value}`;

    const handleChange = () => {
      if (!isDisabled && onChange) {
        onChange(value);
      }
    };

    return (
      <div className="flex items-start">
        <div className="relative flex items-center">
          <input
            id={radioId}
            ref={ref}
            type="radio"
            name={name}
            value={value}
            checked={isChecked}
            disabled={isDisabled}
            onChange={handleChange}
            className={cn(
              // Base styles - hidden native radio
              'peer h-5 w-5 cursor-pointer appearance-none',
              'rounded-full border-2 transition-all duration-200',

              // Default state
              'border-gray-400 bg-transparent',

              // Hover state
              'hover:border-primary-400',

              // Focus state
              'focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:ring-offset-2',

              // Checked state (border only)
              'checked:border-primary-400',

              // Disabled state
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-400',

              className
            )}
            {...props}
          />

          {/* Inner filled circle for checked state */}
          <div
            className={cn(
              'pointer-events-none absolute left-1 top-1 h-3 w-3 rounded-full bg-primary-400 transition-all duration-200',
              isChecked ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            )}
            aria-hidden="true"
          />
        </div>

        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label
                htmlFor={radioId}
                className={cn(
                  'block select-none text-sm font-medium text-gray-300',
                  isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p
                className={cn(
                  'mt-1 text-sm text-gray-500',
                  isDisabled && 'opacity-50'
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

export { Radio };
