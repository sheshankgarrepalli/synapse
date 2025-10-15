import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select, SelectOption } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { api } from '@/utils/api';
import { formatRelativeTime } from '@/lib/utils';
import { MagnifyingGlassIcon, FunnelIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const sourceOptions: SelectOption[] = [
  { value: 'all', label: 'All Sources' },
  { value: 'github', label: 'GitHub' },
  { value: 'slack', label: 'Slack' },
  { value: 'linear', label: 'Linear' },
  { value: 'figma', label: 'Figma' },
  { value: 'notion', label: 'Notion' },
];

const typeOptions: SelectOption[] = [
  { value: 'all', label: 'All Types' },
  { value: 'thread', label: 'Threads' },
  { value: 'item', label: 'Items' },
  { value: 'comment', label: 'Comments' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('all');
  const [type, setType] = useState('all');
  const [useSemanticSearch, setUseSemanticSearch] = useState(true);

  const { data: searchResults, isLoading, refetch } = api.search.search.useQuery(
    {
      query,
      limit: 50,
    },
    { enabled: query.length > 2 }
  );

  const handleSearch = () => {
    if (query.length > 2) {
      refetch();
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Search</h1>
          <p className="mt-1 text-gray-400">
            Find anything across all your connected tools
          </p>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search across all your tools..."
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button onClick={handleSearch} loading={isLoading}>
                  Search
                </Button>
              </div>

              {/* Filters */}
              <div className="grid gap-4 md:grid-cols-3">
                <Select value={source} onChange={setSource} options={sourceOptions} />
                <Select value={type} onChange={setType} options={typeOptions} />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="semantic"
                    checked={useSemanticSearch}
                    onChange={(e) => setUseSemanticSearch(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900"
                  />
                  <label htmlFor="semantic" className="flex items-center text-sm text-gray-300">
                    <SparklesIcon className="mr-1 h-4 w-4 text-primary" />
                    AI Semantic Search
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {query.length > 0 && (
          <div className="space-y-4">
            {query.length <= 2 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-400">Type at least 3 characters to search</p>
                </CardContent>
              </Card>
            ) : isLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                </CardContent>
              </Card>
            ) : searchResults && (searchResults.threads?.length > 0 || searchResults.items?.length > 0) ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    {(searchResults.threads?.length || 0) + (searchResults.items?.length || 0)} results found
                  </h2>
                  {useSemanticSearch && (
                    <Badge variant="primary" size="sm">
                      <SparklesIcon className="mr-1 h-3 w-3" />
                      AI-Powered
                    </Badge>
                  )}
                </div>
                {searchResults.threads?.map((thread: any) => (
                  <SearchResultCard key={`thread-${thread.id}`} result={{ ...thread, type: 'thread' }} />
                ))}
                {searchResults.items?.map((item: any) => (
                  <SearchResultCard key={`item-${item.id}`} result={{ ...item, type: 'item' }} />
                ))}
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <h3 className="text-lg font-medium text-white">No results found</h3>
                  <p className="mt-2 text-sm text-gray-400">
                    Try different keywords or filters
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty State */}
        {query.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <MagnifyingGlassIcon className="mx-auto h-16 w-16 text-gray-600" />
              <h3 className="mt-4 text-lg font-medium text-white">Start searching</h3>
              <p className="mt-2 text-sm text-gray-400">
                Search across all your threads, items, and comments
              </p>
              <div className="mt-6 space-y-2 text-sm text-gray-500">
                <p>💡 Try searching for:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['design system', 'authentication', 'API endpoint', 'user flow'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setQuery(suggestion)}
                      className="rounded-lg border border-gray-700 px-3 py-1 text-gray-400 transition-colors hover:border-primary hover:text-white"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

// Search Result Card Component
function SearchResultCard({ result }: { result: any }) {
  const getSourceBadgeVariant = (source: string) => {
    const variants: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
      github: 'info',
      slack: 'warning',
      linear: 'primary',
      figma: 'success',
      notion: 'primary',
    };
    return variants[source] || 'primary';
  };

  if (result.type === 'thread') {
    return (
      <Link href={`/threads/${result.id}`}>
        <Card hover>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Badge variant="primary" size="sm">Thread</Badge>
                  <h3 className="text-lg font-semibold text-white">{result.title}</h3>
                </div>
                {result.description && (
                  <p className="mt-2 text-sm text-gray-400 line-clamp-2">{result.description}</p>
                )}
                {result.similarity && (
                  <div className="mt-2">
                    <Badge variant="primary" size="sm">
                      {Math.round(result.similarity * 100)}% match
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  if (result.type === 'item') {
    return (
      <Card hover>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Badge variant={getSourceBadgeVariant(result.source)} size="sm">
                  {result.source}
                </Badge>
                <Badge variant="primary" size="sm">{result.itemType}</Badge>
                <h3 className="text-lg font-semibold text-white">{result.title}</h3>
              </div>
              {result.content && (
                <p className="mt-2 text-sm text-gray-400 line-clamp-2">{result.content}</p>
              )}
              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                {result.threadId && <span>Part of a thread</span>}
                {result.similarity && (
                  <Badge variant="primary" size="sm">
                    {Math.round(result.similarity * 100)}% match
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card hover>
      <CardContent className="pt-6">
        <div className="flex items-start space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <span className="text-xs font-medium text-white">C</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <Badge variant="primary" size="sm">Comment</Badge>
              {result.similarity && (
                <Badge variant="primary" size="sm">
                  {Math.round(result.similarity * 100)}% match
                </Badge>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-300">{result.content}</p>
            <p className="mt-2 text-xs text-gray-500">
              {formatRelativeTime(new Date(result.createdAt))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
