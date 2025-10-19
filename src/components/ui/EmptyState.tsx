import { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  illustration?: 'threads' | 'integrations' | 'intelligence' | 'drift' | 'search' | 'automations' | 'generic';
}

const illustrations = {
  threads: (
    <svg className="h-48 w-48 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  integrations: (
    <svg className="h-48 w-48 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  intelligence: (
    <svg className="h-48 w-48 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  drift: (
    <svg className="h-48 w-48 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  search: (
    <svg className="h-48 w-48 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  automations: (
    <svg className="h-48 w-48 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  generic: (
    <svg className="h-48 w-48 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  illustration = 'generic',
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12">
      <div className="text-center">
        {/* Illustration or Custom Icon */}
        <div className="mb-6 flex justify-center">
          {icon || illustrations[illustration]}
        </div>

        {/* Title */}
        <h3 className="mb-2 text-2xl font-bold text-gray-900">{title}</h3>

        {/* Description */}
        <p className="mx-auto mb-8 max-w-md text-gray-600">{description}</p>

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex items-center justify-center gap-3">
            {action && (
              action.href ? (
                <Link href={action.href}>
                  <Button>{action.label}</Button>
                </Link>
              ) : (
                <Button onClick={action.onClick}>{action.label}</Button>
              )
            )}

            {secondaryAction && (
              secondaryAction.href ? (
                <Link href={secondaryAction.href}>
                  <Button variant="outline">{secondaryAction.label}</Button>
                </Link>
              ) : (
                <Button variant="outline" onClick={secondaryAction.onClick}>
                  {secondaryAction.label}
                </Button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
