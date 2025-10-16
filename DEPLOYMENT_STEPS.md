# Quick Deployment Guide - Synapse AI Features

## Prerequisites

- [x] Production build succeeds (`npm run build` ✅)
- [x] All TypeScript errors fixed
- [x] PostgreSQL database with pgvector extension
- [ ] OpenAI API key
- [ ] Inngest account (optional for background jobs)
- [ ] Vercel account

## Step 1: Environment Variables

Add these to your Vercel project or `.env.production`:

```bash
# Required for AI features
OPENAI_API_KEY=sk-proj-...

# Required for Inngest background jobs (optional for MVP)
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# Database (should already be configured)
DATABASE_URL=postgresql://...
```

### Getting Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-proj-`)
4. Add to Vercel environment variables

**Cost estimate:** ~$0.00003 per item (very cheap!)

### Getting Inngest Keys (Optional)

1. Go to https://app.inngest.com
2. Create a free account
3. Create a new app
4. Copy the event key and signing key
5. Add to Vercel environment variables

**Note:** Background jobs will run automatically every 15 minutes once configured.

## Step 2: Database Setup

Ensure pgvector extension is enabled and indexes are created:

```sql
-- Enable pgvector (may already be done)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create indexes for fast vector search
CREATE INDEX IF NOT EXISTS idx_threads_embedding
ON golden_threads USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_items_embedding
ON connected_items USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Verify setup
SELECT COUNT(*) as threads_with_embeddings
FROM golden_threads
WHERE embedding IS NOT NULL;
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add OPENAI_API_KEY production
vercel env add INNGEST_EVENT_KEY production
vercel env add INNGEST_SIGNING_KEY production
```

### Option B: Using Vercel Dashboard

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Add environment variables in Project Settings
5. Deploy

## Step 4: Configure Inngest (Optional)

If you want background relationship detection every 15 minutes:

1. Go to Inngest dashboard
2. Add your Vercel deployment URL: `https://your-app.vercel.app/api/inngest`
3. Verify the endpoint is accessible
4. Monitor function runs in the Inngest dashboard

**Alternative:** Skip Inngest and use manual triggers via tRPC for now.

## Step 5: Verify Deployment

### Test 1: Embedding Generation

1. Create a new thread via the UI
2. Check database: `SELECT id, title, embedding IS NOT NULL FROM golden_threads ORDER BY created_at DESC LIMIT 1;`
3. Should show `true` for embedding

### Test 2: Semantic Search

1. Create multiple threads with similar content:
   - "Button size too small"
   - "Increase button dimensions"
   - "Submit button is tiny"
2. Open any thread
3. Check "Related Threads" section
4. Should show the other similar threads

### Test 3: Manual Relationship Detection

If Inngest is not configured, you can manually trigger:

```typescript
// In your tRPC router or API endpoint
import { triggerRelationshipDetection } from '@/lib/jobs/detect-relationships';

// Trigger for a specific organization
await triggerRelationshipDetection('org-id');

// Or trigger for all organizations
await triggerRelationshipDetection();
```

## Step 6: Monitor & Optimize

### Check OpenAI Costs

Go to https://platform.openai.com/usage to monitor costs.

**Expected costs:**
- Text embeddings: $0.00002 per 1K tokens
- ~100 words = 133 tokens
- 1000 threads = ~$0.03
- Very affordable! 🎉

### Check Inngest Runs

Go to Inngest dashboard to see:
- Function execution history
- Success/failure rates
- Execution duration
- Error logs

### Check Application Logs

Look for these log messages:
```
✓ AI relationship detection started
✓ Clusters found (count: 5)
✓ Auto-created thread from cluster
✓ Semantic search completed
```

## Troubleshooting

### Embeddings not generating

**Symptoms:** `embedding IS NULL` in database

**Solutions:**
1. Verify OPENAI_API_KEY is set correctly
2. Check OpenAI API status: https://status.openai.com
3. Check Vercel function logs for errors
4. Try regenerating: Update the thread title/description

### Inngest endpoint returning 404

**Symptoms:** Cannot connect Inngest to `/api/inngest`

**Solutions:**
1. Verify endpoint exists: `curl https://your-app.vercel.app/api/inngest`
2. Check it's deployed: Look for `/api/inngest` in Vercel deployment logs
3. Fallback: Use manual triggers via tRPC

### Vector search slow or timing out

**Symptoms:** Related threads take >5 seconds to load

**Solutions:**
1. Verify indexes exist: `\d golden_threads` in psql
2. Check index is being used: `EXPLAIN ANALYZE SELECT ... ORDER BY embedding <=> ...`
3. Increase `lists` parameter in IVFFlat index
4. Consider upgrading to PostgreSQL 15+ with HNSW index

### High OpenAI costs

**Symptoms:** Unexpected charges on OpenAI account

**Solutions:**
1. Set usage limits in OpenAI dashboard
2. Cache embeddings (already implemented)
3. Only regenerate on content changes (already implemented)
4. Consider rate limiting thread creation

## Post-Deployment Tasks

- [ ] Set up monitoring alerts (Vercel, Inngest, OpenAI)
- [ ] Add OpenAI usage limit
- [ ] Test with real user data
- [ ] Gather feedback on AI-generated threads
- [ ] Adjust clustering parameters based on results
- [ ] Document findings in team wiki

## Success Metrics

Track these KPIs after deployment:

1. **Adoption Rate:** % of AI-generated threads accepted by users
2. **Accuracy:** % of clustered items that actually belong together
3. **Coverage:** % of items that get auto-connected
4. **Engagement:** Time spent on AI-suggested threads vs manual threads
5. **Cost:** Monthly OpenAI API spend per active user

## Support

For issues or questions:
- Check `AI_IMPLEMENTATION_COMPLETE.md` for detailed technical info
- Review Vercel function logs
- Check Inngest dashboard for background job errors
- Monitor OpenAI API usage dashboard

---

**🚀 Ready to deploy!** Follow the steps above and you'll have AI-powered relationship detection live in production.

**Estimated deployment time:** 20-30 minutes

**Required:** OpenAI API key
**Optional:** Inngest configuration (can add later)
