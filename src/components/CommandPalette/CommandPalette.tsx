import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  BoltIcon,
  PuzzlePieceIcon,
  Cog6ToothIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useCommandPalette, UseCommandPaletteOptions } from './useCommandPalette';
import { ResultItem, ResultGroup } from './ResultItem';
import { CommandAction } from './actions';
import { formatRelativeTime } from '@/lib/utils';

export interface CommandPaletteProps extends UseCommandPaletteOptions {
  isOpen?: boolean;
  onClose?: () => void;
}

export function CommandPalette(props: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isOpen,
    query,
    results,
    recentItems,
    displayItems,
    selectedIndex,
    close,
    setQuery,
    selectResult,
    handleKeyDown,
  } = useCommandPalette({
    onOpenChange: (open) => {
      if (!open) props.onClose?.();
    },
    setIsCreateThreadModalOpen: props.setIsCreateThreadModalOpen,
    setIsIntegrationModalOpen: props.setIsIntegrationModalOpen,
  });

  // Use external control if provided
  const isActuallyOpen = props.isOpen !== undefined ? props.isOpen : isOpen;
  const handleClose = props.onClose || close;

  // Focus input when opened
  useEffect(() => {
    if (isActuallyOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isActuallyOpen]);

  // Scroll selected item into view
  useEffect(() => {
    const element = document.querySelector(`[data-result-index="${selectedIndex}"]`);
    if (element) {
      element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  return (
    <Transition appear show={isActuallyOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" />
        </Transition.Child>

        {/* Content */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 pt-[10vh]">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl border border-gray-800 bg-[#1A1F28] shadow-2xl transition-all">
                {/* Search Input */}
                <div className="relative border-b border-gray-800">
                  <MagnifyingGlassIcon className="absolute left-4 top-4 h-5 w-5 text-gray-500" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search threads, actions, settings..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full border-0 bg-transparent py-4 pl-12 pr-16 text-white placeholder-gray-500 focus:outline-none focus:ring-0"
                  />
                  <kbd className="absolute right-4 top-4 rounded border border-gray-700 bg-gray-800/50 px-2 py-1 text-xs font-mono text-gray-500">
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto p-2">
                  {query === '' && recentItems.length > 0 ? (
                    // Recent Items
                    <ResultGroup
                      title="Recent"
                      icon={<ClockIcon className="h-4 w-4" />}
                      isEmpty={false}
                    >
                      {recentItems.map((result, index) => (
                        <div key={index} data-result-index={index}>
                          <ResultItem
                            icon={getResultIcon(result)}
                            title={getResultTitle(result)}
                            subtitle={getResultSubtitle(result)}
                            isSelected={index === selectedIndex}
                            onClick={() => selectResult(result)}
                          />
                        </div>
                      ))}
                    </ResultGroup>
                  ) : query === '' ? (
                    // Empty State
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <MagnifyingGlassIcon className="mb-4 h-12 w-12 text-gray-600" />
                      <p className="text-sm text-gray-500">
                        Type to search threads, actions, and settings
                      </p>
                      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-600">
                        <kbd className="rounded border border-gray-700 bg-gray-800/50 px-2 py-1 font-mono">
                          ↑
                        </kbd>
                        <kbd className="rounded border border-gray-700 bg-gray-800/50 px-2 py-1 font-mono">
                          ↓
                        </kbd>
                        <span>to navigate</span>
                        <kbd className="rounded border border-gray-700 bg-gray-800/50 px-2 py-1 font-mono">
                          ↵
                        </kbd>
                        <span>to select</span>
                      </div>
                    </div>
                  ) : displayItems.length === 0 ? (
                    // No Results
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <MagnifyingGlassIcon className="mb-4 h-12 w-12 text-gray-600" />
                      <p className="text-sm text-gray-500">
                        No results found for &ldquo;{query}&rdquo;
                      </p>
                    </div>
                  ) : (
                    // Search Results
                    <div className="space-y-4">
                      {/* Threads */}
                      <ResultGroup
                        title="Threads"
                        icon={<Squares2X2Icon className="h-4 w-4" />}
                        isEmpty={results.threads.length === 0}
                      >
                        {results.threads.map((result, index) => {
                          const globalIndex = index;
                          const thread = result.item as any;
                          return (
                            <div key={thread.id} data-result-index={globalIndex}>
                              <ResultItem
                                icon={<Squares2X2Icon className="h-5 w-5" />}
                                title={thread.title}
                                subtitle={`${thread._count?.connectedItems || 0} items · Updated ${formatRelativeTime(new Date(thread.updatedAt))}`}
                                action="→"
                                isSelected={globalIndex === selectedIndex}
                                onClick={() => selectResult(result)}
                              />
                            </div>
                          );
                        })}
                      </ResultGroup>

                      {/* Actions */}
                      <ResultGroup
                        title="Actions"
                        icon={<BoltIcon className="h-4 w-4" />}
                        isEmpty={results.actions.length === 0}
                      >
                        {results.actions.map((result, index) => {
                          const globalIndex = results.threads.length + index;
                          const action = result.item as CommandAction;
                          return (
                            <div key={action.id} data-result-index={globalIndex}>
                              <ResultItem
                                icon={<action.icon className="h-5 w-5" />}
                                title={action.title}
                                subtitle={action.description}
                                shortcut={action.shortcut}
                                isSelected={globalIndex === selectedIndex}
                                onClick={() => selectResult(result)}
                              />
                            </div>
                          );
                        })}
                      </ResultGroup>

                      {/* Integrations */}
                      <ResultGroup
                        title="Integrations"
                        icon={<PuzzlePieceIcon className="h-4 w-4" />}
                        isEmpty={results.integrations.length === 0}
                      >
                        {results.integrations.map((result, index) => {
                          const globalIndex =
                            results.threads.length + results.actions.length + index;
                          const integration = result.item as any;
                          return (
                            <div key={integration.id} data-result-index={globalIndex}>
                              <ResultItem
                                icon={<PuzzlePieceIcon className="h-5 w-5" />}
                                title={integration.integrationType}
                                subtitle={
                                  integration.status === 'active' ? 'Connected' : 'Not connected'
                                }
                                isSelected={globalIndex === selectedIndex}
                                onClick={() => selectResult(result)}
                              />
                            </div>
                          );
                        })}
                      </ResultGroup>

                      {/* Settings */}
                      <ResultGroup
                        title="Settings"
                        icon={<Cog6ToothIcon className="h-4 w-4" />}
                        isEmpty={results.settings.length === 0}
                      >
                        {results.settings.map((result, index) => {
                          const globalIndex =
                            results.threads.length +
                            results.actions.length +
                            results.integrations.length +
                            index;
                          const action = result.item as CommandAction;
                          return (
                            <div key={action.id} data-result-index={globalIndex}>
                              <ResultItem
                                icon={<action.icon className="h-5 w-5" />}
                                title={action.title}
                                subtitle={action.description}
                                shortcut={action.shortcut}
                                isSelected={globalIndex === selectedIndex}
                                onClick={() => selectResult(result)}
                              />
                            </div>
                          );
                        })}
                      </ResultGroup>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-800 bg-gray-900/50 px-4 py-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <kbd className="rounded border border-gray-700 bg-gray-800/50 px-1.5 py-0.5 font-mono">
                          ↑
                        </kbd>
                        <kbd className="rounded border border-gray-700 bg-gray-800/50 px-1.5 py-0.5 font-mono">
                          ↓
                        </kbd>
                        <span className="ml-1">Navigate</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="rounded border border-gray-700 bg-gray-800/50 px-1.5 py-0.5 font-mono">
                          ↵
                        </kbd>
                        <span className="ml-1">Select</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="rounded border border-gray-700 bg-gray-800/50 px-1.5 py-0.5 font-mono">
                          ESC
                        </kbd>
                        <span className="ml-1">Close</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// Helper functions to extract result data
function getResultIcon(result: any): React.ReactNode {
  if (result.type === 'thread') {
    return <Squares2X2Icon className="h-5 w-5" />;
  } else if (result.type === 'action') {
    const action = result.item as CommandAction;
    return <action.icon className="h-5 w-5" />;
  } else if (result.type === 'integration') {
    return <PuzzlePieceIcon className="h-5 w-5" />;
  }
  return null;
}

function getResultTitle(result: any): string {
  if (result.type === 'thread') {
    return result.item.title;
  } else if (result.type === 'action') {
    return result.item.title;
  } else if (result.type === 'integration') {
    return result.item.integrationType;
  }
  return 'Unknown';
}

function getResultSubtitle(result: any): string | undefined {
  if (result.type === 'thread') {
    const thread = result.item;
    return `${thread._count?.connectedItems || 0} items · Updated ${formatRelativeTime(new Date(thread.updatedAt))}`;
  } else if (result.type === 'action') {
    return result.item.description;
  } else if (result.type === 'integration') {
    return result.item.status === 'active' ? 'Connected' : 'Not connected';
  }
  return undefined;
}
