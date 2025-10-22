import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

// Table Container
export interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={cn(
      'border border-gray-200 dark:border-gray-800',
      'rounded-xl overflow-hidden',
      'shadow-sm',
      className
    )}>
      <table className="w-full table-auto">
        {children}
      </table>
    </div>
  );
}

// Table Header
export function TableHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <thead className={cn(
      'bg-gray-50 dark:bg-gray-900',
      'border-b border-gray-200 dark:border-gray-800',
      className
    )}>
      {children}
    </thead>
  );
}

// Table Body
export function TableBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tbody className={cn('divide-y divide-gray-100 dark:divide-gray-800', className)}>
      {children}
    </tbody>
  );
}

// Table Row
export interface TableRowProps {
  children: ReactNode;
  className?: string;
  selected?: boolean;
  onClick?: () => void;
}

export function TableRow({ children, className, selected, onClick }: TableRowProps) {
  return (
    <tr
      className={cn(
        'transition-colors duration-150',
        onClick && 'cursor-pointer',
        selected
          ? 'bg-primary-50 dark:bg-primary-900/20 border-l-3 border-l-primary'
          : 'hover:bg-gray-50 dark:hover:bg-gray-900/50',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

// Table Head (Header Cell)
export interface TableHeadProps {
  children: ReactNode;
  className?: string;
  sortable?: boolean;
  sorted?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

export function TableHead({
  children,
  className,
  sortable,
  sorted,
  onSort
}: TableHeadProps) {
  return (
    <th
      className={cn(
        'px-5 py-3.5',
        'text-left text-xs font-semibold uppercase tracking-wider',
        'text-gray-600 dark:text-gray-400',
        sortable && 'cursor-pointer select-none hover:text-gray-900 dark:hover:text-gray-200',
        className
      )}
      onClick={sortable ? onSort : undefined}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && (
          <div className="flex flex-col">
            <ChevronUpIcon
              className={cn(
                'h-3 w-3 -mb-1',
                sorted === 'asc' ? 'text-primary' : 'text-gray-400'
              )}
            />
            <ChevronDownIcon
              className={cn(
                'h-3 w-3',
                sorted === 'desc' ? 'text-primary' : 'text-gray-400'
              )}
            />
          </div>
        )}
      </div>
    </th>
  );
}

// Table Cell
export function TableCell({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={cn(
      'px-5 py-4',
      'text-sm text-gray-700 dark:text-gray-300',
      className
    )}>
      {children}
    </td>
  );
}

// Sortable Table Hook
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export function useSortableTable<T>(items: T[], defaultSort?: SortConfig) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort || null);

  const sortedItems = [...items].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = (a as any)[sortConfig.key];
    const bValue = (b as any)[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortDirection = (key: string): 'asc' | 'desc' | null => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction;
  };

  return { sortedItems, requestSort, getSortDirection };
}

// Pagination Component
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const maxVisible = 5;

  let visiblePages = pages;
  if (totalPages > maxVisible) {
    const start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible);
    visiblePages = pages.slice(start, end);
  }

  return (
    <div className={cn(
      'flex items-center justify-between',
      'px-5 py-4',
      'border-t border-gray-200 dark:border-gray-800',
      className
    )}>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Page {currentPage} of {totalPages}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'px-3 py-2 rounded-lg text-sm font-medium',
            'border border-gray-300 dark:border-gray-700',
            'transition-colors duration-200',
            currentPage === 1
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          Previous
        </button>

        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium',
              'transition-colors duration-200',
              page === currentPage
                ? 'bg-primary text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'px-3 py-2 rounded-lg text-sm font-medium',
            'border border-gray-300 dark:border-gray-700',
            'transition-colors duration-200',
            currentPage === totalPages
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          Next
        </button>
      </div>
    </div>
  );
}
