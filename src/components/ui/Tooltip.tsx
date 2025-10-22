import { ReactNode, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
  className
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Check if tooltip fits in viewport and adjust position if needed
      checkPosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const checkPosition = () => {
    if (!tooltipRef.current || !triggerRef.current) return;

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const triggerRect = triggerRef.current.getBoundingClientRect();

    // Check if tooltip would overflow viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newPosition = position;

    // Auto-flip logic
    if (position === 'top' && tooltipRect.top < 0) {
      newPosition = 'bottom';
    } else if (position === 'bottom' && tooltipRect.bottom > viewportHeight) {
      newPosition = 'top';
    } else if (position === 'left' && tooltipRect.left < 0) {
      newPosition = 'right';
    } else if (position === 'right' && tooltipRect.right > viewportWidth) {
      newPosition = 'left';
    }

    setActualPosition(newPosition);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-gray-800 dark:border-t-gray-700',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-gray-800 dark:border-b-gray-700',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-l-gray-800 dark:border-l-gray-700',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-r-gray-800 dark:border-r-gray-700',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      ref={triggerRef}
    >
      {children}

      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            'absolute z-[10000] px-3 py-2',
            'bg-gray-800 dark:bg-gray-700 text-white',
            'text-sm font-normal',
            'rounded-md shadow-lg',
            'max-w-[280px]',
            'whitespace-normal break-words',
            'pointer-events-none',
            'animate-fadeIn',
            positionClasses[actualPosition],
            className
          )}
          role="tooltip"
        >
          {content}

          {/* Arrow */}
          <div
            className={cn(
              'absolute w-2 h-2',
              'border-4 border-transparent',
              arrowClasses[actualPosition]
            )}
          />
        </div>
      )}
    </div>
  );
}

// Simpler tooltip without auto-positioning
export function SimpleTooltip({
  content,
  children,
  className
}: {
  content: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="group relative inline-block">
      {children}
      <div
        className={cn(
          'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
          'px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-md',
          'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
          'transition-all duration-200',
          'pointer-events-none whitespace-nowrap',
          'z-[10000]',
          className
        )}
        role="tooltip"
      >
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 border-4 border-transparent border-t-gray-800 dark:border-t-gray-700" />
      </div>
    </div>
  );
}
