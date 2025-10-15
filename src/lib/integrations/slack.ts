import { decrypt } from '../encryption';

export interface SlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  is_private: boolean;
  is_archived: boolean;
}

export interface SlackMessage {
  ts: string;
  text: string;
  user: string;
  thread_ts?: string;
}

export class SlackService {
  private accessTokenPromise: Promise<string>;
  private baseUrl = 'https://slack.com/api';

  constructor(encryptedToken: string, organizationId: string) {
    this.accessTokenPromise = decrypt(encryptedToken, organizationId);
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const accessToken = await this.accessTokenPromise;
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`);
    }

    return data;
  }

  async getChannels(): Promise<SlackChannel[]> {
    const response = await this.request<{ channels: SlackChannel[] }>('/conversations.list');
    return response.channels;
  }

  async getChannel(channelId: string): Promise<SlackChannel> {
    const response = await this.request<{ channel: SlackChannel }>(
      `/conversations.info?channel=${channelId}`
    );
    return response.channel;
  }

  async getMessages(channelId: string, limit = 100): Promise<SlackMessage[]> {
    const response = await this.request<{ messages: SlackMessage[] }>(
      `/conversations.history?channel=${channelId}&limit=${limit}`
    );
    return response.messages;
  }

  async postMessage(channelId: string, text: string, threadTs?: string): Promise<SlackMessage> {
    const response = await this.request<{ message: SlackMessage }>('/chat.postMessage', {
      method: 'POST',
      body: JSON.stringify({
        channel: channelId,
        text,
        thread_ts: threadTs,
      }),
    });
    return response.message;
  }

  async updateMessage(channelId: string, ts: string, text: string): Promise<SlackMessage> {
    const response = await this.request<{ message: SlackMessage }>('/chat.update', {
      method: 'POST',
      body: JSON.stringify({
        channel: channelId,
        ts,
        text,
      }),
    });
    return response.message;
  }
}
