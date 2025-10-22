import { useState } from 'react';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  onCopy?: () => void;
}

export function CopyButton({
  text,
  className,
  size = 'md',
  showTooltip = true,
  onCopy,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'relative inline-flex items-center justify-center rounded-lg',
        'text-muted-foreground hover:text-foreground hover:bg-muted',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        sizes[size],
        className
      )}
      aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {/* Icon with animation */}
      <div className="relative">
        <ClipboardDocumentIcon
          className={cn(
            'transition-all duration-200',
            iconSizes[size],
            copied ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
          )}
        />
        <CheckIcon
          className={cn(
            'absolute inset-0 transition-all duration-200 text-success',
            iconSizes[size],
            copied ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          )}
        />
      </div>

      {/* Tooltip */}
      {showTooltip && copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-success text-white text-xs font-medium px-2 py-1 rounded whitespace-nowrap animate-fadeIn">
          Copied!
        </span>
      )}
    </button>
  );
}

// Inline copy button for code blocks
interface InlineCopyProps {
  text: string;
  label?: string;
  className?: string;
}

export function InlineCopy({ text, label = 'Copy', className }: InlineCopyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium',
        'text-primary hover:text-primary-600 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded',
        className
      )}
    >
      {copied ? (
        <>
          <CheckIcon className="h-4 w-4 text-success" />
          <span className="text-success">Copied!</span>
        </>
      ) : (
        <>
          <ClipboardDocumentIcon className="h-4 w-4" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
