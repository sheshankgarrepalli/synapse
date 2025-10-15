import { decrypt } from '../encryption';

export interface FigmaFile {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
}

export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export class FigmaService {
  private encryptedToken: string;
  private organizationId: string;
  private accessTokenPromise: Promise<string>;
  private baseUrl = 'https://api.figma.com/v1';

  constructor(encryptedToken: string, organizationId: string) {
    this.encryptedToken = encryptedToken;
    this.organizationId = organizationId;
    this.accessTokenPromise = decrypt(encryptedToken, organizationId);
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const accessToken = await this.accessTokenPromise;
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'X-Figma-Token': accessToken,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getFile(fileKey: string): Promise<FigmaFile> {
    return this.request<FigmaFile>(`/files/${fileKey}`);
  }

  async getFileComponents(fileKey: string): Promise<FigmaComponent[]> {
    const response = await this.request<{ meta: { components: FigmaComponent[] } }>(
      `/files/${fileKey}/components`
    );
    return response.meta.components;
  }

  async getComments(fileKey: string): Promise<any[]> {
    const response = await this.request<{ comments: any[] }>(`/files/${fileKey}/comments`);
    return response.comments;
  }

  async postComment(fileKey: string, message: string, clientMeta?: any): Promise<any> {
    return this.request(`/files/${fileKey}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, client_meta: clientMeta }),
    });
  }
}
