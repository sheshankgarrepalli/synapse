import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/20/solid';

export interface FormFieldProps {
  children: ReactNode;
  label?: string;
  labelOptional?: boolean;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  id?: string;
  layout?: 'vertical' | 'horizontal';
}

/**
 * FormField - Reusable wrapper for form fields
 *
 * Provides consistent spacing and layout for:
 * - Label (with optional indicator)
 * - Input/control (passed as children)
 * - Helper text (informational)
 * - Error message (validation)
 *
 * @example
 * <FormField label="Email" error={errors.email} helperText="We'll never share your email.">
 *   <Input type="email" />
 * </FormField>
 */
export function FormField({
  children,
  label,
  labelOptional,
  error,
  helperText,
  required,
  className,
  id,
  layout = 'vertical',
}: FormFieldProps) {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  if (layout === 'horizontal') {
    return (
      <div className={cn('flex items-start gap-6', className)}>
        {/* Label Section */}
        {label && (
          <div className="flex-shrink-0 w-48 pt-3">
            <label
              htmlFor={fieldId}
              className={cn(
                'block text-sm font-semibold',
                hasError ? 'text-error' : 'text-foreground'
              )}
            >
              {label}
              {required && <span className="ml-1 text-error" aria-label="required">*</span>}
              {labelOptional && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">(Optional)</span>
              )}
            </label>
          </div>
        )}

        {/* Field Section */}
        <div className="flex-1 min-w-0">
          {/* Input/Control */}
          <div id={fieldId}>{children}</div>

          {/* Helper Text */}
          {helperText && !hasError && (
            <div className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
              <InformationCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p>{helperText}</p>
            </div>
          )}

          {/* Error Message */}
          {hasError && (
            <div className="mt-2 flex items-start gap-1.5 text-sm text-error" role="alert">
              <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vertical Layout (default)
  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={fieldId}
          className={cn(
            'block mb-2 text-sm font-semibold',
            hasError ? 'text-error' : 'text-foreground'
          )}
        >
          {label}
          {required && <span className="ml-1 text-error" aria-label="required">*</span>}
          {labelOptional && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">(Optional)</span>
          )}
        </label>
      )}

      {/* Input/Control */}
      <div id={fieldId}>{children}</div>

      {/* Helper Text */}
      {helperText && !hasError && (
        <div className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
          <InformationCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p>{helperText}</p>
        </div>
      )}

      {/* Error Message */}
      {hasError && (
        <div className="mt-2 flex items-start gap-1.5 text-sm text-error" role="alert">
          <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

// Compound component pattern for more complex layouts
FormField.displayName = 'FormField';

/**
 * FormRow - Group multiple form fields horizontally
 */
export interface FormRowProps {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

export function FormRow({ children, className, columns = 2, gap = 'md' }: FormRowProps) {
  const gapSizes = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid', columnClasses[columns], gapSizes[gap], className)}>
      {children}
    </div>
  );
}

FormRow.displayName = 'FormRow';

/**
 * FormSection - Group related form fields with optional heading
 */
export interface FormSectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function FormSection({ children, title, description, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

FormSection.displayName = 'FormSection';
