import { Menu, Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

// Main Dropdown Menu Component
export interface DropdownMenuProps {
  children: ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      {children}
    </Menu>
  );
}

// Dropdown Trigger
export interface DropdownMenuTriggerProps {
  children: ReactNode;
  className?: string;
  asChild?: boolean;
}

export function DropdownMenuTrigger({
  children,
  className,
  asChild
}: DropdownMenuTriggerProps) {
  if (asChild) {
    return <Menu.Button as={Fragment}>{children}</Menu.Button>;
  }

  return (
    <Menu.Button
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'px-4 py-2 rounded-lg',
        'text-sm font-medium',
        'text-gray-700 dark:text-gray-300',
        'bg-white dark:bg-gray-800',
        'border border-gray-300 dark:border-gray-700',
        'hover:bg-gray-50 dark:hover:bg-gray-700',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'transition-colors duration-200',
        className
      )}
    >
      {children}
      <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
    </Menu.Button>
  );
}

// Dropdown Content
export interface DropdownMenuContentProps {
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function DropdownMenuContent({
  children,
  align = 'right',
  className
}: DropdownMenuContentProps) {
  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
  };

  return (
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items
        className={cn(
          'absolute z-50 mt-2',
          'min-w-[200px]',
          'origin-top-right',
          alignmentClasses[align],
          'rounded-lg',
          'bg-white dark:bg-gray-800',
          'border border-gray-200 dark:border-gray-700',
          'shadow-lg',
          'p-2',
          'focus:outline-none',
          className
        )}
      >
        {children}
      </Menu.Items>
    </Transition>
  );
}

// Dropdown Menu Item
export interface DropdownMenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
  icon?: ReactNode;
  className?: string;
}

export function DropdownMenuItem({
  children,
  onClick,
  disabled = false,
  variant = 'default',
  icon,
  className
}: DropdownMenuItemProps) {
  return (
    <Menu.Item disabled={disabled}>
      {({ active }) => (
        <button
          onClick={onClick}
          className={cn(
            'flex items-center gap-3 w-full',
            'px-4 py-2.5 rounded-md',
            'text-sm font-medium text-left',
            'transition-colors duration-150',
            active && !disabled && variant === 'default' && 'bg-gray-100 dark:bg-gray-700',
            active && !disabled && variant === 'danger' && 'bg-error-50 dark:bg-error-900/20',
            disabled && 'opacity-50 cursor-not-allowed',
            variant === 'default'
              ? 'text-gray-700 dark:text-gray-300'
              : 'text-error-700 dark:text-error-400',
            className
          )}
          disabled={disabled}
        >
          {icon && (
            <span className="flex-shrink-0 h-5 w-5">
              {icon}
            </span>
          )}
          {children}
        </button>
      )}
    </Menu.Item>
  );
}

// Dropdown Divider
export function DropdownMenuDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'my-1 h-px',
        'bg-gray-200 dark:bg-gray-700',
        className
      )}
    />
  );
}

// Dropdown Label (non-interactive)
export function DropdownMenuLabel({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'px-4 py-2',
        'text-xs font-semibold uppercase tracking-wider',
        'text-gray-500 dark:text-gray-400',
        className
      )}
    >
      {children}
    </div>
  );
}

// Checkbox Menu Item
export interface DropdownMenuCheckboxItemProps {
  children: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function DropdownMenuCheckboxItem({
  children,
  checked,
  onCheckedChange,
  disabled = false,
  className
}: DropdownMenuCheckboxItemProps) {
  return (
    <Menu.Item disabled={disabled}>
      {({ active }) => (
        <button
          onClick={() => onCheckedChange(!checked)}
          className={cn(
            'flex items-center gap-3 w-full',
            'px-4 py-2.5 rounded-md',
            'text-sm font-medium text-left',
            'text-gray-700 dark:text-gray-300',
            'transition-colors duration-150',
            active && !disabled && 'bg-gray-100 dark:bg-gray-700',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          disabled={disabled}
        >
          <div className={cn(
            'flex items-center justify-center',
            'w-4 h-4 rounded',
            'border-2',
            checked
              ? 'bg-primary border-primary'
              : 'border-gray-300 dark:border-gray-600'
          )}>
            {checked && (
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
          {children}
        </button>
      )}
    </Menu.Item>
  );
}
