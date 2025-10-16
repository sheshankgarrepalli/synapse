/**
 * Pusher client-side client
 * Used in browser to receive real-time events
 */

import Pusher from 'pusher-js';

// Singleton instance
let pusherInstance: Pusher | null = null;

export function getPusherClient(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
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
