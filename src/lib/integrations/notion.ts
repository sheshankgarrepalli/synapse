import { decrypt } from '../encryption';

export interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  url: string;
  properties: Record<string, any>;
}

export interface NotionDatabase {
  id: string;
  title: Array<{ plain_text: string }>;
  created_time: string;
  last_edited_time: string;
  url: string;
}

export class NotionService {
  private accessTokenPromise: Promise<string>;
  private baseUrl = 'https://api.notion.com/v1';

  constructor(encryptedToken: string, organizationId: string) {
    this.accessTokenPromise = decrypt(encryptedToken, organizationId);
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const accessToken = await this.accessTokenPromise;
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.statusText}`);
    }

    return response.json();
  }

  async search(query?: string): Promise<(NotionPage | NotionDatabase)[]> {
    const response = await this.request<{ results: (NotionPage | NotionDatabase)[] }>('/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
    return response.results;
  }

  async getPage(pageId: string): Promise<NotionPage> {
    return this.request<NotionPage>(`/pages/${pageId}`);
  }

  async getDatabase(databaseId: string): Promise<NotionDatabase> {
    return this.request<NotionDatabase>(`/databases/${databaseId}`);
  }

  async queryDatabase(databaseId: string): Promise<NotionPage[]> {
    const response = await this.request<{ results: NotionPage[] }>(
      `/databases/${databaseId}/query`,
      {
        method: 'POST',
        body: JSON.stringify({}),
      }
    );
    return response.results;
  }

  async createPage(
    parentId: string,
    properties: Record<string, any>,
    children?: any[]
  ): Promise<NotionPage> {
    return this.request<NotionPage>('/pages', {
      method: 'POST',
      body: JSON.stringify({
        parent: { page_id: parentId },
        properties,
        children,
      }),
    });
  }

  async updatePage(pageId: string, properties: Record<string, any>): Promise<NotionPage> {
    return this.request<NotionPage>(`/pages/${pageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties }),
    });
  }
}
