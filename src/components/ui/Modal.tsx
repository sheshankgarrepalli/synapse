import { Dialog, Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { XMarkIcon } from '@heroicons/react/24/outline';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'danger';
}

export function Modal({ isOpen, onClose, children, size = 'md', variant = 'default' }: ModalProps) {
  const sizes = {
    sm: 'max-w-md',      // 400px
    md: 'max-w-2xl',     // 600px
    lg: 'max-w-3xl',     // 800px
    xl: 'max-w-5xl',     // 1000px
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop with blur */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-4"
            >
              <Dialog.Panel
                className={cn(
                  'w-full transform overflow-hidden rounded-2xl',
                  'bg-white dark:bg-gray-900',
                  'border border-gray-200 dark:border-gray-800',
                  'shadow-2xl transition-all',
                  sizes[size]
                )}
              >
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// Modal subcomponents for better composition
export function ModalHeader({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      'flex items-center justify-between',
      'px-6 py-5',
      'border-b border-gray-200 dark:border-gray-800',
      className
    )}>
      {children}
    </div>
  );
}

export function ModalTitle({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Dialog.Title
      as="h3"
      className={cn(
        'text-2xl font-bold font-heading',
        'text-gray-900 dark:text-gray-50',
        className
      )}
    >
      {children}
    </Dialog.Title>
  );
}

export function ModalClose({ onClose }: { onClose?: () => void }) {
  return (
    <button
      type="button"
      className={cn(
        'rounded-lg p-2',
        'text-gray-400 hover:text-gray-600',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
      )}
      onClick={onClose}
    >
      <XMarkIcon className="h-5 w-5" />
      <span className="sr-only">Close</span>
    </button>
  );
}

export function ModalBody({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      'px-7 py-7',
      'max-h-[60vh] overflow-y-auto',
      'text-gray-700 dark:text-gray-300',
      className
    )}>
      {children}
    </div>
  );
}

export function ModalFooter({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      'flex items-center justify-end gap-3',
      'px-5 py-5',
      'border-t border-gray-200 dark:border-gray-800',
      className
    )}>
      {children}
    </div>
  );
}

// Confirmation Modal variant
export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  icon?: ReactNode;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  icon,
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" variant={variant}>
      <ModalHeader>
        <div className="flex items-center gap-3">
          {icon && (
            <div className={cn(
              'flex-shrink-0',
              variant === 'danger' ? 'text-error' : 'text-warning'
            )}>
              {icon}
            </div>
          )}
          <ModalTitle>{title}</ModalTitle>
        </div>
        <ModalClose onClose={onClose} />
      </ModalHeader>

      <ModalBody>
        <p className="text-base leading-relaxed">
          {message}
        </p>
      </ModalBody>

      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'px-6 py-3 rounded-lg font-semibold',
            'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
            'text-gray-700 dark:text-gray-300',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2'
          )}
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className={cn(
            'px-6 py-3 rounded-lg font-semibold',
            'text-white shadow-sm',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            variant === 'danger'
              ? 'bg-error hover:bg-error-700 focus:ring-error'
              : 'bg-primary hover:bg-primary-500 focus:ring-primary'
          )}
        >
          {confirmText}
        </button>
      </ModalFooter>
    </Modal>
  );
}
