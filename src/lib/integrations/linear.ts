import { decrypt } from '../encryption';

export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  state: {
    id: string;
    name: string;
  };
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinearProject {
  id: string;
  name: string;
  description?: string;
  url: string;
}

export class LinearService {
  private accessTokenPromise: Promise<string>;
  private baseUrl = 'https://api.linear.app/graphql';

  constructor(encryptedToken: string, organizationId: string) {
    this.accessTokenPromise = decrypt(encryptedToken, organizationId);
  }

  private async query<T>(query: string, variables?: Record<string, any>): Promise<T> {
    const accessToken = await this.accessTokenPromise;
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error(`Linear API error: ${data.errors[0].message}`);
    }

    return data.data;
  }

  async getIssues(): Promise<LinearIssue[]> {
    const data = await this.query<{ issues: { nodes: LinearIssue[] } }>(`
      query {
        issues(first: 100) {
          nodes {
            id
            identifier
            title
            description
            state {
              id
              name
            }
            url
            createdAt
            updatedAt
          }
        }
      }
    `);
    return data.issues.nodes;
  }

  async getIssue(issueId: string): Promise<LinearIssue> {
    const data = await this.query<{ issue: LinearIssue }>(
      `
      query($id: String!) {
        issue(id: $id) {
          id
          identifier
          title
          description
          state {
            id
            name
          }
          url
          createdAt
          updatedAt
        }
      }
    `,
      { id: issueId }
    );
    return data.issue;
  }

  async getProjects(): Promise<LinearProject[]> {
    const data = await this.query<{ projects: { nodes: LinearProject[] } }>(`
      query {
        projects(first: 100) {
          nodes {
            id
            name
            description
            url
          }
        }
      }
    `);
    return data.projects.nodes;
  }

  async createIssue(title: string, description?: string, teamId?: string): Promise<LinearIssue> {
    const data = await this.query<{ issueCreate: { issue: LinearIssue } }>(
      `
      mutation($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          issue {
            id
            identifier
            title
            description
            state {
              id
              name
            }
            url
            createdAt
            updatedAt
          }
        }
      }
    `,
      { input: { title, description, teamId } }
    );
    return data.issueCreate.issue;
  }

  async updateIssue(
    issueId: string,
    updates: { title?: string; description?: string; stateId?: string }
  ): Promise<LinearIssue> {
    const data = await this.query<{ issueUpdate: { issue: LinearIssue } }>(
      `
      mutation($id: String!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) {
          issue {
            id
            identifier
            title
            description
            state {
              id
              name
            }
            url
            createdAt
            updatedAt
          }
        }
      }
    `,
      { id: issueId, input: updates }
    );
    return data.issueUpdate.issue;
  }
}
