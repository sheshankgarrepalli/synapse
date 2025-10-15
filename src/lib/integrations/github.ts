import { decrypt } from '../encryption';

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  private: boolean;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  html_url: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  merged: boolean;
}

export class GitHubService {
  private accessTokenPromise: Promise<string>;
  private baseUrl = 'https://api.github.com';

  constructor(encryptedToken: string, organizationId: string) {
    this.accessTokenPromise = decrypt(encryptedToken, organizationId);
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const accessToken = await this.accessTokenPromise;
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getRepositories(): Promise<GitHubRepository[]> {
    return this.request<GitHubRepository[]>('/user/repos?per_page=100');
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return this.request<GitHubRepository>(`/repos/${owner}/${repo}`);
  }

  async getIssues(owner: string, repo: string): Promise<GitHubIssue[]> {
    return this.request<GitHubIssue[]>(`/repos/${owner}/${repo}/issues?per_page=100`);
  }

  async getIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue> {
    return this.request<GitHubIssue>(`/repos/${owner}/${repo}/issues/${issueNumber}`);
  }

  async getPullRequests(owner: string, repo: string): Promise<GitHubPullRequest[]> {
    return this.request<GitHubPullRequest[]>(`/repos/${owner}/${repo}/pulls?per_page=100`);
  }

  async getPullRequest(owner: string, repo: string, prNumber: number): Promise<GitHubPullRequest> {
    return this.request<GitHubPullRequest>(`/repos/${owner}/${repo}/pulls/${prNumber}`);
  }

  async createIssue(
    owner: string,
    repo: string,
    title: string,
    body?: string
  ): Promise<GitHubIssue> {
    return this.request<GitHubIssue>(`/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body }),
    });
  }

  async updateIssue(
    owner: string,
    repo: string,
    issueNumber: number,
    updates: { title?: string; body?: string; state?: string }
  ): Promise<GitHubIssue> {
    return this.request<GitHubIssue>(`/repos/${owner}/${repo}/issues/${issueNumber}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  }
}
