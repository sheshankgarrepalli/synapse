/**
 * Inngest client configuration
 * Handles background job processing for AI relationship detection
 */

import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'synapse-ai',
  name: 'Synapse AI Background Jobs',
  eventKey: process.env.INNGEST_EVENT_KEY,
});
