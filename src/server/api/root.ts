import { createTRPCRouter } from './trpc';
import { threadsRouter } from './routers/threads';
import { itemsRouter } from './routers/items';
import { commentsRouter } from './routers/comments';
import { searchRouter } from './routers/search';
import { integrationsRouter } from './routers/integrations';
import { automationsRouter } from './routers/automations';
import { organizationsRouter } from './routers/organizations';
import { analyticsRouter } from './routers/analytics';
import { intelligenceRouter } from './routers/intelligence';
import { settingsRouter } from './routers/settings';
import { driftRouter } from './routers/drift';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  threads: threadsRouter,
  items: itemsRouter,
  comments: commentsRouter,
  search: searchRouter,
  integrations: integrationsRouter,
  automations: automationsRouter,
  organizations: organizationsRouter,
  analytics: analyticsRouter,
  intelligence: intelligenceRouter, // 🤖 AI-powered intelligence feed
  settings: settingsRouter, // ⚙️ Organization and user settings
  drift: driftRouter, // 🎨 Design-code drift detection
});

// export type definition of API
export type AppRouter = typeof appRouter;
