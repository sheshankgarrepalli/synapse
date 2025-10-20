import { cn } from '@/lib/utils';
import { getShortcutDisplay, KeyboardShortcutOptions } from '@/hooks/useKeyboardShortcut';

export interface ResultItemProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: string;
  shortcut?: KeyboardShortcutOptions;
  isSelected?: boolean;
  onClick: () => void;
}

export function ResultItem({
  icon,
  title,
  subtitle,
  action,
  shortcut,
  isSelected,
  onClick,
}: ResultItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all',
        isSelected
          ? 'bg-purple-600/20 ring-1 ring-purple-500'
          : 'hover:bg-gray-800/50'
      )}
      onMouseEnter={onClick}
    >
      {/* Icon */}
      {icon && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-gray-800/50 text-gray-400">
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">{title}</div>
        {subtitle && (
          <div className="text-xs text-gray-400 truncate">{subtitle}</div>
        )}
      </div>

      {/* Action or Shortcut */}
      <div className="flex-shrink-0">
        {shortcut ? (
          <kbd className="inline-flex items-center gap-1 rounded border border-gray-700 bg-gray-800/50 px-2 py-1 text-xs font-mono text-gray-400">
            {getShortcutDisplay(shortcut)}
          </kbd>
        ) : action ? (
          <span className="text-gray-500">{action}</span>
        ) : null}
      </div>
    </button>
  );
}

export interface ResultGroupProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isEmpty?: boolean;
}

export function ResultGroup({ title, icon, children, isEmpty }: ResultGroupProps) {
  if (isEmpty) return null;

  return (
    <div className="space-y-2">
      {/* Group Header */}
      <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        <div className="h-4 w-4">{icon}</div>
        <span>{title}</span>
      </div>

      {/* Group Items */}
      <div className="space-y-1">{children}</div>
    </div>
  );
}
