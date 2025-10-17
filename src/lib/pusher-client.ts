/**
 * Pusher client-side client
 * Used in browser to receive real-time events
 */

import Pusher from 'pusher-js';

// Singleton instance
let pusherInstance: Pusher | null = null;

export function getPusherClient(): Pusher {
  if (!pusherInstance) {
    // Check if public env vars are available
    if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      // Return a mock for server-side or missing config
      return {
        subscribe: () => ({
          bind: () => {},
          unbind: () => {},
        }),
        unsubscribe: () => {},
      } as unknown as Pusher;
    }

    pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: '/api/pusher/auth',
      auth: {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    });

    // Enable logging in development
    if (process.env.NODE_ENV === 'development') {
      Pusher.logToConsole = true;
    }
  }

  return pusherInstance;
}

export const pusherClient = getPusherClient();
