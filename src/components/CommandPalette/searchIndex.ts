import Fuse from 'fuse.js';
import { CommandAction } from './actions';

export interface Thread {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  updatedAt: Date | string;
  _count?: {
    connectedItems: number;
  };
}

export interface Integration {
  id: string;
  integrationType: string;
  status: string;
  lastSyncAt: Date | null;
  connectedAt: Date;
  connector: {
    fullName: string | null;
    avatarUrl: string | null;
  };
}

export interface SearchResult {
  type: 'thread' | 'action' | 'integration' | 'setting';
  item: Thread | CommandAction | Integration | any;
  score?: number;
}

export interface SearchResults {
  threads: SearchResult[];
  actions: SearchResult[];
  integrations: SearchResult[];
  settings: SearchResult[];
}

/**
 * Search across threads using fuzzy matching
 */
export function searchThreads(threads: Thread[], query: string, limit: number = 8): SearchResult[] {
  if (!query.trim()) return [];

  const fuse = new Fuse(threads, {
    keys: [
      { name: 'title', weight: 2 },
      { name: 'description', weight: 1 },
    ],
    threshold: 0.4, // Lower is more strict (0.0 = exact match, 1.0 = match anything)
    ignoreLocation: true,
    includeScore: true,
  });

  const results = fuse.search(query, { limit });

  return results.map((result) => ({
    type: 'thread',
    item: result.item,
    score: result.score,
  }));
}

/**
 * Search across actions using fuzzy matching
 */
export function searchActions(actions: CommandAction[], query: string, limit: number = 8): SearchResult[] {
  if (!query.trim()) return [];

  const fuse = new Fuse(actions, {
    keys: [
      { name: 'title', weight: 3 },
      { name: 'description', weight: 1.5 },
      { name: 'keywords', weight: 2 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
    includeScore: true,
  });

  const results = fuse.search(query, { limit });

  return results.map((result) => ({
    type: 'action',
    item: result.item,
    score: result.score,
  }));
}

/**
 * Search across integrations using fuzzy matching
 */
export function searchIntegrations(
  integrations: Integration[],
  query: string,
  limit: number = 8
): SearchResult[] {
  if (!query.trim()) return [];

  const fuse = new Fuse(integrations, {
    keys: [{ name: 'integrationType', weight: 2 }],
    threshold: 0.3,
    ignoreLocation: true,
    includeScore: true,
  });

  const results = fuse.search(query, { limit });

  return results.map((result) => ({
    type: 'integration',
    item: result.item,
    score: result.score,
  }));
}

/**
 * Main search function that searches across all categories
 */
export function searchAll(
  query: string,
  data: {
    threads: Thread[];
    actions: CommandAction[];
    integrations: Integration[];
  },
  options: {
    maxPerCategory?: number;
    maxTotal?: number;
  } = {}
): SearchResults {
  const { maxPerCategory = 8, maxTotal = 30 } = options;

  if (!query.trim()) {
    return {
      threads: [],
      actions: [],
      integrations: [],
      settings: [],
    };
  }

  // Search each category
  const threadResults = searchThreads(data.threads, query, maxPerCategory);
  const actionResults = searchActions(data.actions, query, maxPerCategory);
  const integrationResults = searchIntegrations(data.integrations, query, maxPerCategory);

  // Filter settings from actions
  const settingsResults = actionResults.filter((result) => {
    const action = result.item as CommandAction;
    return action.category === 'settings';
  });

  const nonSettingsActions = actionResults.filter((result) => {
    const action = result.item as CommandAction;
    return action.category !== 'settings';
  });

  // Combine and limit total results
  const allResults = [
    ...threadResults,
    ...nonSettingsActions,
    ...integrationResults,
    ...settingsResults,
  ];

  if (allResults.length > maxTotal) {
    // Proportionally reduce each category
    const ratio = maxTotal / allResults.length;
    return {
      threads: threadResults.slice(0, Math.ceil(threadResults.length * ratio)),
      actions: nonSettingsActions.slice(0, Math.ceil(nonSettingsActions.length * ratio)),
      integrations: integrationResults.slice(0, Math.ceil(integrationResults.length * ratio)),
      settings: settingsResults.slice(0, Math.ceil(settingsResults.length * ratio)),
    };
  }

  return {
    threads: threadResults,
    actions: nonSettingsActions,
    integrations: integrationResults,
    settings: settingsResults,
  };
}

/**
 * Get recent items from localStorage
 */
export function getRecentItems(maxItems: number = 5): SearchResult[] {
  if (typeof window === 'undefined') return [];

  try {
    const recent = localStorage.getItem('command_palette_recent');
    if (!recent) return [];

    const items = JSON.parse(recent) as SearchResult[];
    return items.slice(0, maxItems);
  } catch (error) {
    console.error('Error loading recent items:', error);
    return [];
  }
}

/**
 * Save a recent item to localStorage
 */
export function saveRecentItem(result: SearchResult): void {
  if (typeof window === 'undefined') return;

  try {
    const recent = getRecentItems(10);

    // Remove duplicate if exists
    const filtered = recent.filter((item) => {
      if (item.type !== result.type) return true;
      if (item.type === 'thread' && result.type === 'thread') {
        return (item.item as Thread).id !== (result.item as Thread).id;
      }
      if (item.type === 'action' && result.type === 'action') {
        return (item.item as CommandAction).id !== (result.item as CommandAction).id;
      }
      return true;
    });

    // Add to front
    const updated = [result, ...filtered].slice(0, 5);

    localStorage.setItem('command_palette_recent', JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recent item:', error);
  }
}
