import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export function Select({ label, value, onChange, options, placeholder = 'Select...', error }: SelectProps) {
  const selected = options.find(opt => opt.value === value);

  return (
    <div className="w-full">
      {label && <label className="mb-2 block text-sm font-medium text-gray-300">{label}</label>}
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button
            className={cn(
              'relative w-full cursor-pointer rounded-lg border border-gray-700 bg-gray-900 py-2 pl-3 pr-10 text-left text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
            )}
          >
            <span className="block truncate">{selected?.label || placeholder}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-700 bg-gray-900 py-1 text-sm shadow-lg focus:outline-none">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  className={({ active }) =>
                    cn(
                      'relative cursor-pointer select-none py-2 pl-10 pr-4',
                      active ? 'bg-primary text-white' : 'text-gray-300'
                    )
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <span className={cn('block truncate', selected ? 'font-medium' : 'font-normal')}>
                        {option.label}
                      </span>
                      {selected && (
                        <span
                          className={cn(
                            'absolute inset-y-0 left-0 flex items-center pl-3',
                            active ? 'text-white' : 'text-primary'
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
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
