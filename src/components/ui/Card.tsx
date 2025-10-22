import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Card variant
   * - default: Standard card with subtle shadow
   * - interactive: Hoverable card with lift effect
   * - elevated: Higher elevation with prominent shadow
   * - golden: Golden gradient left border (signature Golden Thread style)
   */
  variant?: 'default' | 'interactive' | 'elevated' | 'golden';

  /**
   * @deprecated Use variant="interactive" instead. Will be removed in future versions.
   * Makes card hoverable with lift effect (backward compatibility)
   */
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, ...props }, ref) => {
    // Backward compatibility: if hover prop is used, set variant to interactive
    const effectiveVariant = hover ? 'interactive' : variant;

    const variants = {
      default: 'border border-border bg-card shadow-sm',
      interactive: 'border border-border bg-card shadow-sm hover:shadow-lg hover:-translate-y-0.5 cursor-pointer transition-all duration-200',
      elevated: 'border border-border bg-card shadow-lg',
      golden: 'relative border border-primary/30 bg-card shadow-md before:absolute before:top-0 before:left-0 before:h-full before:w-1 before:rounded-l-xl before:bg-gradient-to-b before:from-primary-300 before:via-primary-500 before:to-primary-300',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl p-6',
          variants[effectiveVariant],
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4 space-y-1.5', className)} {...props} />
  )
);

CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('font-heading text-xl font-semibold leading-tight tracking-tight text-card-foreground', className)}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
);

CardDescription.displayName = 'CardDescription';

const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-card-foreground', className)} {...props} />
  )
);

CardBody.displayName = 'CardBody';

// Alias for consistency with existing code
const CardContent = CardBody;
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-6 flex items-center justify-between pt-4 border-t border-border/50', className)}
      {...props}
    />
  )
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardBody, CardContent, CardFooter };
