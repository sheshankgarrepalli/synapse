# Phase 2 & 3 Implementation Plan

## Overview

This document outlines the complete implementation of Phase 2 (Integration Completion) and Phase 3 (Real-time Collaboration) for Synapse.

---

## Phase 2: Integration Completion

### Status: ✅ OAuth Already Implemented, 🚧 Webhooks In Progress

### Completed
- ✅ OAuth configuration for all 8 integrations (GitHub, Linear, Slack, Figma, Notion, Zoom, Dovetail, Mixpanel)
- ✅ OAuth initiate/callback flow (`/api/oauth/initiate/[provider]`, `/api/oauth/callback/[provider]`)
- ✅ Service classes for GitHub, Figma, Slack, Linear, Notion
- ✅ GitHub webhooks fully implemented
- ✅ Figma webhooks implemented (just created)

### Remaining Work

#### 1. Slack Event Subscriptions
**File:** `/src/pages/api/webhooks/slack.ts`

**Events to handle:**
- `message.channels` - New messages in channels
- `reaction_added` - Reactions to messages
- `file_shared` - Files shared in channels
- `channel_created` - New channels

**Implementation:**
```typescript
// Verify request signature
// Handle URL verification (Slack sends this on setup)
// Process events and create connected items
// Store embeddings for semantic search
```

**Setup steps:**
1. Create Slack app at api.slack.com/apps
2. Enable Event Subscriptions
3. Add Request URL: `https://your-app.vercel.app/api/webhooks/slack`
4. Subscribe to bot events
5. Reinstall app to workspace

#### 2. Notion Webhooks
**File:** `/src/pages/api/webhooks/notion.ts`

**Events to handle:**
- `page.created` - New pages
- `page.updated` - Page updates
- `database.created` - New databases
- `database.updated` - Database updates

**Note:** Notion doesn't have webhooks yet (as of 2025). Use polling or wait for webhooks API.

**Workaround:**
```typescript
// Inngest job to poll Notion API every 5 minutes
// Compare lastEditedTime with stored value
// Create connected items for changes
```

#### 3. Linear Webhooks
**File:** `/src/pages/api/webhooks/linear.ts`

**Events to handle:**
- `Issue` - Issue created/updated
- `Comment` - Comment created/updated
- `Project` - Project created/updated

**Implementation:**
```typescript
// Verify webhook signature
// Handle issue events
// Create/update connected items
// Store embeddings
```

**Setup:**
1. Go to Linear workspace settings
2. Add webhook URL: `https://your-app.vercel.app/api/webhooks/linear`
3. Select events to subscribe to
4. Save webhook secret

#### 4. Zoom Webhooks
**File:** `/src/pages/api/webhooks/zoom.ts`

**Events to handle:**
- `meeting.started` - Meeting started
- `meeting.ended` - Meeting ended
- `recording.completed` - Recording available

**Implementation:**
```typescript
// Verify webhook signature
// Handle meeting events
// Create connected items for recordings
// Extract transcripts if available
```

#### 5. Dovetail Integration
**File:** `/src/lib/integrations/dovetail.ts`

**Note:** Dovetail may not have public API. Consider:
- Email forwarding integration
- Zapier integration
- Manual upload

**Fallback:** Skip for MVP, add post-launch

#### 6. Mixpanel Integration
**File:** `/src/lib/integrations/mixpanel.ts`

**Use case:**
- Track user behavior analytics
- Create items from significant events
- Link analytics to product decisions

**Implementation:**
```typescript
// Query Mixpanel API for events
// Create connected items for significant events (e.g., "500 users hit paywall")
// Link to threads about pricing/conversion
```

---

## Phase 3: Real-time Collaboration

### Architecture

```
Client (Browser)
    ↓ WebSocket
WebSocket Server (Socket.io)
    ↓ Pub/Sub
Redis (optional, for multi-instance)
    ↓
Database (PostgreSQL)
```

### Components

#### 1. WebSocket Server
**File:** `/src/server/websocket.ts`

**Stack:**
- **Option A:** Socket.io on Vercel Serverless (NOT RECOMMENDED - limitations)
- **Option B:** Separate WebSocket server on Railway/Render/Fly.io ✅ RECOMMENDED
- **Option C:** Pusher/Ably (3rd party service) ✅ FASTEST TO SHIP

**Recommendation:** Use **Pusher** for MVP (free tier: 100 connections, 200k messages/day)

**Why Pusher:**
- ✅ No server management
- ✅ Built-in presence
- ✅ React hooks available
- ✅ Free tier sufficient for MVP
- ✅ Deploy in 1 hour vs 1 day for custom server

#### 2. Real-time Events

**Events to broadcast:**

1. **Thread Updates**
   - `thread:created`
   - `thread:updated`
   - `thread:deleted`
   - `thread:status_changed`

2. **Item Updates**
   - `item:added`
   - `item:removed`
   - `item:updated`

3. **Comment Updates**
   - `comment:created`
   - `comment:updated`
   - `comment:deleted`

4. **Presence**
   - `user:joined` (viewing thread)
   - `user:left` (left thread)
   - `user:typing` (typing comment)

5. **Activity Feed**
   - `activity:new` (new activity)

#### 3. Pusher Implementation

**Install:**
```bash
npm install pusher pusher-js
```

**Server-side (`/src/lib/pusher.ts`):**
```typescript
import Pusher from 'pusher';

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Trigger event
export async function broadcastThreadUpdate(organizationId: string, threadId: string, data: any) {
  await pusher.trigger(`private-org-${organizationId}`, 'thread:updated', {
    threadId,
    ...data,
  });
}
```

**Client-side (`/src/lib/pusher-client.ts`):**
```typescript
import Pusher from 'pusher-js';

export const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  authEndpoint: '/api/pusher/auth',
});
```

**Auth endpoint (`/src/pages/api/pusher/auth.ts`):**
```typescript
import { pusher } from '@/lib/pusher';
import { getAuth } from '@clerk/nextjs/server';

export default function handler(req, res) {
  const auth = getAuth(req);
  if (!auth.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;

  // Verify user has access to this organization channel
  const organizationId = channel.replace('private-org-', '');
  // ... check user has access ...

  const authResponse = pusher.authorizeChannel(socketId, channel, {
    user_id: auth.userId,
    user_info: {
      name: auth.user.fullName,
    },
  });

  res.json(authResponse);
}
```

#### 4. React Hooks

**`/src/hooks/use-realtime-thread.ts`:**
```typescript
import { useEffect, useState } from 'react';
import { pusherClient } from '@/lib/pusher-client';
import { useSession } from '@clerk/nextjs';

export function useRealtimeThread(threadId: string) {
  const { session } = useSession();
  const [thread, setThread] = useState(null);

  useEffect(() => {
    if (!session?.organization?.id) return;

    const channel = pusherClient.subscribe(`private-org-${session.organization.id}`);

    channel.bind('thread:updated', (data: any) => {
      if (data.threadId === threadId) {
        setThread(prev => ({ ...prev, ...data }));
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [threadId, session]);

  return thread;
}
```

**`/src/hooks/use-presence.ts`:**
```typescript
import { useEffect, useState } from 'react';
import { pusherClient } from '@/lib/pusher-client';

export function usePresence(threadId: string) {
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const channel = pusherClient.subscribe(`presence-thread-${threadId}`);

    channel.bind('pusher:subscription_succeeded', (members: any) => {
      setUsers(Object.values(members.members));
    });

    channel.bind('pusher:member_added', (member: any) => {
      setUsers(prev => [...prev, member.info]);
    });

    channel.bind('pusher:member_removed', (member: any) => {
      setUsers(prev => prev.filter(u => u.id !== member.id));
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [threadId]);

  return users;
}
```

#### 5. UI Integration

**Thread Page (`/src/pages/threads/[id].tsx`):**
```tsx
import { useRealtimeThread } from '@/hooks/use-realtime-thread';
import { usePresence } from '@/hooks/use-presence';

export default function ThreadPage({ initialThread }) {
  const realtimeThread = useRealtimeThread(initialThread.id);
  const viewers = usePresence(initialThread.id);

  const thread = realtimeThread || initialThread;

  return (
    <div>
      <div className="flex items-center gap-2">
        <h1>{thread.title}</h1>
        {viewers.length > 0 && (
          <div className="flex -space-x-2">
            {viewers.map(user => (
              <Avatar key={user.id} name={user.name} />
            ))}
          </div>
        )}
      </div>
      {/* Rest of thread UI */}
    </div>
  );
}
```

---

## Environment Variables Required

```bash
# Phase 2: Integrations
FIGMA_CLIENT_ID=...
FIGMA_CLIENT_SECRET=...
FIGMA_WEBHOOK_PASSCODE=...

SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
SLACK_SIGNING_SECRET=...

NOTION_CLIENT_ID=...
NOTION_CLIENT_SECRET=...

LINEAR_CLIENT_ID=...
LINEAR_CLIENT_SECRET=...
LINEAR_WEBHOOK_SECRET=...

ZOOM_CLIENT_ID=...
ZOOM_CLIENT_SECRET=...
ZOOM_WEBHOOK_SECRET=...

MIXPANEL_API_KEY=...
MIXPANEL_API_SECRET=...

# Phase 3: Real-time
PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=...

NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=...
```

---

## Testing Checklist

### Phase 2: Integrations

**Figma:**
- [ ] OAuth flow connects successfully
- [ ] Webhook receives file comment events
- [ ] Connected item created with embedding
- [ ] AI detects similar comments

**Slack:**
- [ ] OAuth flow connects successfully
- [ ] Webhook receives message events
- [ ] Connected item created for messages
- [ ] Reactions tracked

**Linear:**
- [ ] OAuth flow connects successfully
- [ ] Webhook receives issue events
- [ ] Issues auto-connected to threads
- [ ] Issue updates reflected

**Notion:**
- [ ] OAuth flow connects successfully
- [ ] Polling job fetches page updates
- [ ] Pages auto-connected

**Zoom:**
- [ ] OAuth flow connects successfully
- [ ] Webhook receives recording events
- [ ] Recordings auto-connected
- [ ] Transcripts extracted (if available)

### Phase 3: Real-time

**Basic Functionality:**
- [ ] WebSocket connection established
- [ ] User joins thread → presence updated
- [ ] New comment → all viewers see it
- [ ] Thread title updated → all viewers see it
- [ ] User leaves → presence updated

**Performance:**
- [ ] <100ms latency for updates
- [ ] No memory leaks (test with 100+ tabs)
- [ ] Reconnection works after network drop

**Security:**
- [ ] Users only see updates for their organization
- [ ] Authentication required for WebSocket
- [ ] Authorization checked for each channel

---

## Deployment Steps

### Phase 2

1. **Get OAuth credentials** for each integration:
   - Figma: https://www.figma.com/developers/apps
   - Slack: https://api.slack.com/apps
   - Linear: https://linear.app/settings/api
   - Notion: https://www.notion.so/my-integrations
   - Zoom: https://marketplace.zoom.us

2. **Add to Vercel environment variables**

3. **Deploy to production**: `npx vercel --prod`

4. **Configure webhooks** for each integration:
   - Add webhook URLs pointing to your Vercel deployment
   - Save webhook secrets
   - Test with sample events

### Phase 3

1. **Create Pusher account** (free): https://pusher.com

2. **Get Pusher credentials** from dashboard

3. **Add to Vercel environment variables**

4. **Deploy to production**: `npx vercel --prod`

5. **Test real-time features** with multiple browsers

---

## Timeline Estimate

### Phase 2 (Integrations)
- Figma webhooks: ✅ Complete
- Slack webhooks: 2-3 hours
- Linear webhooks: 1-2 hours
- Notion polling: 2-3 hours
- Zoom webhooks: 1-2 hours
- Testing & debugging: 2-3 hours

**Total: 1-2 days**

### Phase 3 (Real-time)
- Pusher setup: 1 hour
- Server-side events: 2-3 hours
- React hooks: 2-3 hours
- UI integration: 3-4 hours
- Presence system: 2-3 hours
- Testing & debugging: 2-3 hours

**Total: 1-2 days**

**Total Both Phases: 2-4 days**

---

## Success Metrics

### Phase 2
- ✅ All 8 integrations OAuth working
- ✅ 5+ integrations with working webhooks
- ✅ 95%+ webhook events processed successfully
- ✅ <1s latency for creating connected items

### Phase 3
- ✅ <100ms latency for real-time updates
- ✅ 99.9% uptime for WebSocket server
- ✅ Presence tracking works with 10+ users
- ✅ Zero message loss during reconnection

---

## Next Steps

1. **Immediate:** Complete Slack, Linear, Notion, Zoom webhooks
2. **Then:** Implement Pusher real-time system
3. **Finally:** UI polish and testing

**Current Status:** Figma webhooks complete (✅), moving to Slack...
