import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  id?: string;
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  error,
  helperText,
  disabled,
  id
}: SelectProps) {
  const selected = options.find(opt => opt.value === value);
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-2 block text-sm font-semibold text-gray-300">
          {label}
        </label>
      )}
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button
            id={selectId}
            className={cn(
              // Base styles - matching Input component specs
              'relative h-11 w-full cursor-pointer rounded-lg',
              'border-2 bg-gray-900 px-4 py-3',
              'text-left text-base text-white',
              'transition-all duration-200',

              // Focus state - gold ring
              'focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:ring-offset-2',

              // Default border
              'border-gray-700',

              // Hover state
              'hover:border-gray-600',

              // Focus border - gold
              'focus:border-primary-400',

              // Disabled state
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-700',

              // Error state
              error && 'border-error-500 focus:border-error-500 focus:ring-error-500/30',

              // Placeholder styling
              !selected && 'text-gray-500'
            )}
          >
            <span className="block truncate pr-8">
              {selected?.label || placeholder}
            </span>
            {/* Chevron icon - 16px, right side, gray-500 */}
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronUpDownIcon
                className={cn(
                  'h-4 w-4 transition-colors',
                  error ? 'text-error-500' : 'text-gray-500'
                )}
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          {/* Dropdown menu with smooth transition */}
          <Transition
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Listbox.Options
              className={cn(
                // Dropdown menu: 8px radius, shadow-lg
                'absolute z-10 mt-2 max-h-60 w-full overflow-auto',
                'rounded-lg border border-gray-700 bg-gray-900 py-1',
                'shadow-lg',
                'focus:outline-none'
              )}
            >
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={({ active, disabled }) =>
                    cn(
                      // Menu items: 40px height
                      'relative cursor-pointer select-none py-2.5 pl-10 pr-4',
                      'transition-colors duration-150',

                      // Hover state - gray-100 (adjusted for dark mode)
                      active && !disabled && 'bg-gray-800 text-white',

                      // Default state
                      !active && !disabled && 'text-gray-300',

                      // Disabled state
                      disabled && 'cursor-not-allowed opacity-50'
                    )
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={cn(
                          'block truncate',
                          selected ? 'font-semibold' : 'font-normal'
                        )}
                      >
                        {option.label}
                      </span>
                      {/* Checkmark for selected item */}
                      {selected && (
                        <span
                          className={cn(
                            'absolute inset-y-0 left-0 flex items-center pl-3',
                            active ? 'text-white' : 'text-primary-400'
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>

      {/* Error and helper text */}
      {error && <p className="mt-1 text-sm text-error-500">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}
