# Daily Digest Email System

Quick reference for working with the daily digest email system.

## Files

```
src/lib/digest/
├── digestTypes.ts           # TypeScript types
├── generateDigest.ts        # Digest data generation
├── emailPreferences.ts      # Email preferences helpers
└── README.md               # This file

src/lib/email/
└── sendDailyDigest.ts      # Email sending service

src/emails/
└── DailyDigest.tsx         # React Email template

src/pages/api/cron/
└── daily-digest.ts         # Cron job endpoint
```

## Usage Examples

### Generate Digest for a User

```typescript
import { generateDigest } from '@/lib/digest/generateDigest';

const digest = await generateDigest({
  userId: 'user-id',
  organizationId: 'org-id',
  date: new Date(),
});

console.log(digest.alerts); // Critical alerts
console.log(digest.warnings); // Warnings
console.log(digest.goodNews); // Good news
console.log(digest.activeThreads); // Thread summaries
```

### Send Test Email

```typescript
import { sendTestDigest } from '@/lib/email/sendDailyDigest';

await sendTestDigest('your-email@example.com');
```

### Get User Email Preferences

```typescript
import { getEmailPreferences } from '@/lib/digest/emailPreferences';

const prefs = await getEmailPreferences('user-id');
console.log(prefs.digestEnabled); // true/false
console.log(prefs.digestFrequency); // "daily" | "weekly" | "off"
console.log(prefs.digestTime); // "09:00"
```

### Update Email Preferences

```typescript
import {
  enableDigest,
  disableDigest,
  setDigestFrequency,
  setDigestTime
} from '@/lib/digest/emailPreferences';

// Enable digest
await enableDigest('user-id');

// Disable digest
await disableDigest('user-id');

// Change frequency
await setDigestFrequency('user-id', 'weekly');

// Change time
await setDigestTime('user-id', '08:00'); // 8 AM
```

### Check if User Should Receive Digest

```typescript
import { shouldSendDigest } from '@/lib/digest/generateDigest';

const should = await shouldSendDigest('user-id', new Date());
// Returns true if user should receive digest today
```

## Cron Job

The cron job runs every hour and sends digests to users at their local 9 AM.

### Manual Trigger

```bash
# Local development
curl -X POST http://localhost:3000/api/cron/daily-digest \
  -H "Authorization: Bearer your-cron-secret"

# Production
curl -X POST https://your-app.vercel.app/api/cron/daily-digest \
  -H "Authorization: Bearer your-cron-secret"
```

### Response Format

```json
{
  "success": true,
  "processed": 100,
  "sent": 75,
  "failed": 0,
  "skipped": 25,
  "errors": [],
  "message": "Successfully sent 75 digests"
}
```

## Email Template

The email includes four sections:

1. **🚨 Critical Alerts** - Urgent issues (drift, blocked PRs)
2. **⚠️ Warnings** - Important but not urgent (stale threads)
3. **✅ Good News** - Positive updates (merged PRs, completed issues)
4. **📊 Active Threads** - Thread summaries with stats

## Database Schema

### DigestLog Model

Tracks sent digests:

```prisma
model DigestLog {
  id     String @id @default(dbgenerated("gen_random_uuid()"))
  userId String

  digestDate    DateTime // Date the digest was for
  sentAt        DateTime // When it was sent

  alertsCount   Int
  warningsCount Int
  goodNewsCount Int
  threadsCount  Int

  status       String // "sent", "failed", "bounced"
  emailId      String? // Resend email ID
  errorMessage String?

  opened    Boolean
  openedAt  DateTime?
  clicked   Boolean
  clickedAt DateTime?
}
```

### User Preferences

Stored in `User.preferences` JSON field:

```typescript
{
  email: {
    digestEnabled: true,
    digestFrequency: "daily",
    digestTime: "09:00",
    timezone: "America/New_York",
    includeAlerts: true,
    includeWarnings: true,
    includeGoodNews: true,
    includeThreadSummary: true,
    minAlertSeverity: "warning",
    skipEmptyDigests: true
  },
  timezone: "America/New_York"
}
```

## Environment Variables

```bash
RESEND_API_KEY=re_...           # Required
CRON_SECRET=...                 # Required
NEXT_PUBLIC_APP_URL=...         # Required
LOG_DIGEST_RUNS=true            # Optional
```

## Testing

### Unit Tests (to be added)

```typescript
// Test digest generation
describe('generateDigest', () => {
  it('should generate alerts for blocked PRs', async () => {
    const digest = await generateDigest({...});
    expect(digest.alerts).toHaveLength(2);
  });
});

// Test email sending
describe('sendDailyDigest', () => {
  it('should send email successfully', async () => {
    const result = await sendDailyDigest({...});
    expect(result.success).toBe(true);
  });
});
```

### Manual Testing

1. **Test digest generation:**
   ```typescript
   const digest = await generateDigest({
     userId: 'your-user-id',
     organizationId: 'your-org-id'
   });
   console.log(JSON.stringify(digest, null, 2));
   ```

2. **Test email with mock data:**
   ```typescript
   await sendTestDigest('your-email@example.com');
   ```

3. **Test cron job:**
   ```bash
   curl -X POST http://localhost:3000/api/cron/daily-digest \
     -H "Authorization: Bearer your-cron-secret"
   ```

## Troubleshooting

### No emails received

1. Check Resend API key: `echo $RESEND_API_KEY`
2. Verify domain in Resend dashboard
3. Check user preferences: `digestEnabled: true`
4. Check timezone matches user's location
5. Check cron job logs in Vercel dashboard

### Emails look broken

1. Test in multiple email clients
2. Check inline CSS is rendering
3. Use https://www.emailonacid.com/ for testing
4. Verify React Email render output

### Wrong content

1. Check digest generation logic
2. Verify database has activity (PRs, issues, drifts)
3. Check date range filters (last 24 hours)
4. Test with mock data first

## Performance

### Database Queries

- Optimize with proper indexes (already added)
- Use `select` to fetch only needed fields
- Batch user processing (10 at a time)

### Email Sending

- Rate limiting: 10 emails per batch
- 1 second delay between batches
- Resend free tier: 100 emails/day
- Resend Pro tier: 50,000 emails/month for $20

### Cron Job

- Runs hourly (24 times per day)
- Processes all users (filters by timezone)
- Average execution time: 30-60 seconds for 1000 users
- Serverless function timeout: 10 minutes (plenty of buffer)

## Metrics to Track

1. **Delivery Rate** - % successfully sent
2. **Open Rate** - % opened
3. **Click Rate** - % clicked links
4. **Unsubscribe Rate** - % opted out
5. **Content Breakdown** - Avg alerts/warnings/good news per digest
6. **Time to Action** - How fast users respond to alerts

## Future Improvements

1. Email preferences UI in Settings page
2. Weekly digest option
3. Personalized send times (ML-based)
4. A/B testing framework
5. Digest archive (view in browser)
6. Click tracking per section
7. Engagement scoring
8. Multi-language support
