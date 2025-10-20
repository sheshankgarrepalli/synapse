import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '@/utils/api';
import { getActions, CommandAction } from './actions';
import { searchAll, SearchResults, getRecentItems, saveRecentItem, SearchResult } from './searchIndex';

export interface UseCommandPaletteOptions {
  onOpenChange?: (open: boolean) => void;
  setIsCreateThreadModalOpen?: (open: boolean) => void;
  setIsIntegrationModalOpen?: (open: boolean) => void;
}

export function useCommandPalette(options: UseCommandPaletteOptions = {}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentItems, setRecentItems] = useState<SearchResult[]>([]);

  // Fetch threads data
  const { data: threadsData } = api.threads.list.useQuery(
    { limit: 50 },
    { enabled: isOpen }
  );

  // Fetch integrations data
  const { data: integrationsData } = api.integrations.list.useQuery(undefined, {
    enabled: isOpen,
  });

  // Get all actions
  const actions = getActions({
    router,
    setIsCreateThreadModalOpen: options.setIsCreateThreadModalOpen,
    setIsIntegrationModalOpen: options.setIsIntegrationModalOpen,
  });

  // Load recent items on mount
  useEffect(() => {
    if (isOpen && query === '') {
      setRecentItems(getRecentItems(5));
    }
  }, [isOpen, query]);

  // Search results
  const results: SearchResults = query.trim()
    ? searchAll(
        query,
        {
          threads: threadsData?.threads || [],
          actions,
          integrations: integrationsData || [],
        },
        {
          maxPerCategory: 8,
          maxTotal: 30,
        }
      )
    : { threads: [], actions: [], integrations: [], settings: [] };

  // Flatten results for keyboard navigation
  const flatResults = [
    ...results.threads,
    ...results.actions,
    ...results.integrations,
    ...results.settings,
  ];

  // Get display items (recent or search results)
  const displayItems = query.trim() ? flatResults : recentItems;

  // Open/close handlers
  const open = useCallback(() => {
    setIsOpen(true);
    setQuery('');
    setSelectedIndex(0);
    options.onOpenChange?.(true);
  }, [options]);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
    options.onOpenChange?.(false);
  }, [options]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  // Handle result selection
  const selectResult = useCallback(
    (result: SearchResult) => {
      // Save to recent items
      saveRecentItem(result);

      // Execute action
      if (result.type === 'thread') {
        const thread = result.item as any;
        router.push(`/threads/${thread.id}`);
      } else if (result.type === 'action') {
        const action = result.item as CommandAction;
        action.handler();
      } else if (result.type === 'integration') {
        router.push('/integrations');
      }

      // Close palette
      close();
    },
    [router, close]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, displayItems.length - 1));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          event.preventDefault();
          if (displayItems[selectedIndex]) {
            selectResult(displayItems[selectedIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          close();
          break;
        case 'Tab':
          event.preventDefault();
          // Cycle through categories (simplified - just move down)
          setSelectedIndex((prev) => Math.min(prev + 1, displayItems.length - 1));
          break;
      }
    },
    [selectedIndex, displayItems, selectResult, close]
  );

  // Update query
  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setSelectedIndex(0); // Reset selection on query change
  }, []);

  return {
    isOpen,
    query,
    results,
    recentItems,
    displayItems,
    selectedIndex,
    open,
    close,
    toggle,
    setQuery: handleQueryChange,
    selectResult,
    handleKeyDown,
  };
}
