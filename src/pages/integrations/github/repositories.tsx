import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/utils/api';
import { useState } from 'react';
import { CheckCircleIcon, PlusCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

export default function GitHubRepositoriesPage() {
  const router = useRouter();
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set());
  const [localhostError, setLocalhostError] = useState<string | null>(null);

  const { data: repositories, isLoading } = api.integrations.getGitHubRepositories.useQuery();
  const { data: connectedRepos } = api.integrations.getConnectedRepositories.useQuery();

  const utils = api.useUtils();

  const connectRepository = api.integrations.connectRepository.useMutation({
    onSuccess: () => {
      utils.integrations.getConnectedRepositories.invalidate();
      setLocalhostError(null);
    },
    onError: (error) => {
      if (error.message.includes('LOCALHOST_NOT_SUPPORTED')) {
        setLocalhostError(error.message.replace('LOCALHOST_NOT_SUPPORTED: ', ''));
      }
    },
  });

  const disconnectRepository = api.integrations.disconnectRepository.useMutation({
    onSuccess: () => {
      utils.integrations.getConnectedRepositories.invalidate();
    },
  });

  const handleToggleRepo = (repoFullName: string) => {
    const newSelected = new Set(selectedRepos);
    if (newSelected.has(repoFullName)) {
      newSelected.delete(repoFullName);
    } else {
      newSelected.add(repoFullName);
    }
    setSelectedRepos(newSelected);
  };

  const handleConnectSelected = async () => {
    for (const repoFullName of selectedRepos) {
      await connectRepository.mutateAsync({ repositoryFullName: repoFullName });
    }
    setSelectedRepos(new Set());
  };

  const isConnected = (repoFullName: string) => {
    return connectedRepos?.some((r: any) => r.repositoryFullName === repoFullName);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-400">Loading repositories...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/integrations')}
            className="mb-4"
          >
            ← Back to Integrations
          </Button>
          <h1 className="text-3xl font-bold text-white">GitHub Repositories</h1>
          <p className="mt-1 text-gray-400">
            Select repositories to enable automatic thread creation from GitHub issues and PRs
          </p>
        </div>

        {/* Localhost Warning */}
        {localhostError && (
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-500 mb-2">Local Development Setup Required</h3>
                  <p className="text-sm text-gray-300 mb-3">{localhostError}</p>
                  <div className="bg-gray-900 rounded-md p-3 text-xs text-gray-300 space-y-2">
                    <p className="font-semibold text-white">Quick Setup with ngrok:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Install ngrok: <code className="text-blue-400">npm install -g ngrok</code></li>
                      <li>Start tunnel: <code className="text-blue-400">ngrok http 3000</code></li>
                      <li>Copy the https URL (e.g., https://abc123.ngrok.io)</li>
                      <li>Add to .env: <code className="text-blue-400">NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io</code></li>
                      <li>Restart your dev server</li>
                    </ol>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocalhostError(null)}
                    className="mt-3"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {selectedRepos.size > 0 && (
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <p className="text-sm text-gray-300">
                {selectedRepos.size} {selectedRepos.size === 1 ? 'repository' : 'repositories'} selected
              </p>
              <Button
                onClick={handleConnectSelected}
                loading={connectRepository.isLoading}
              >
                <PlusCircleIcon className="h-4 w-4 mr-2" />
                Enable Automation
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Repository List */}
        <div className="grid gap-4">
          {repositories?.map((repo: any) => {
            const connected = isConnected(repo.full_name);
            const selected = selectedRepos.has(repo.full_name);

            return (
              <Card key={repo.id} className={selected ? 'ring-2 ring-primary' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-white">{repo.full_name}</h3>
                        {connected && (
                          <Badge variant="success" size="sm">
                            Automated
                          </Badge>
                        )}
                        {repo.private && (
                          <Badge variant="default" size="sm">
                            Private
                          </Badge>
                        )}
                      </div>
                      {repo.description && (
                        <p className="mt-1 text-sm text-gray-400">{repo.description}</p>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        {repo.language && (
                          <span className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-primary mr-1"></span>
                            {repo.language}
                          </span>
                        )}
                        <span>⭐ {repo.stargazers_count}</span>
                        <span>🔀 {repo.forks_count}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {connected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            disconnectRepository.mutate({ repositoryFullName: repo.full_name })
                          }
                          loading={disconnectRepository.isLoading}
                        >
                          Disable
                        </Button>
                      ) : (
                        <Button
                          variant={selected ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => handleToggleRepo(repo.full_name)}
                        >
                          {selected ? (
                            <>
                              <CheckCircleIcon className="h-4 w-4 mr-2" />
                              Selected
                            </>
                          ) : (
                            'Select'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {repositories?.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-400">No repositories found</p>
              <p className="mt-2 text-sm text-gray-500">
                Make sure you have access to repositories in GitHub
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
