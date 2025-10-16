/**
 * Inngest API endpoint
 * Serves background jobs for AI relationship detection
 *
 * Note: This endpoint may not work in Next.js 15 development mode due to
 * Inngest's serve() function compatibility issues. It should work in production.
 * For local testing, use the manual trigger: triggerRelationshipDetection()
 */

import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { detectRelationships } from '@/lib/jobs/detect-relationships';
import { notionSync } from '@/lib/jobs/notion-sync';
import { mixpanelSync } from '@/lib/jobs/mixpanel-sync';

// Export Inngest serve handler directly
// Let TypeScript infer the correct types from the serve function
export default serve({
  client: inngest,
  functions: [
    detectRelationships, // AI relationship detection (runs every 15 min)
    notionSync, // Notion page sync (runs every 5 min)
    mixpanelSync, // Mixpanel analytics sync (runs daily at 9 AM)
  ],
});
