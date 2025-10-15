# Testing GitHub Webhook Automation

## Overview

This guide will help you test that your GitHub webhook automation is working correctly from end to end.

## Prerequisites

Before testing, ensure you have:

1. ✅ Localtunnel or ngrok running
2. ✅ Dev server running
3. ✅ GitHub OAuth connected
4. ✅ At least one repository selected with webhook enabled
5. ✅ At least one automation created

## Step-by-Step Testing Guide

### Step 1: Verify Your Setup

Check that everything is configured correctly:

```bash
# Check your .env file
grep NEXT_PUBLIC_APP_URL .env
grep GITHUB_WEBHOOK_SECRET .env

# Ensure localtunnel is running
# You should see: "your url is: https://xxx.loca.lt"
```

Expected output:
```
NEXT_PUBLIC_APP_URL="https://chilly-grapes-beam.loca.lt"
GITHUB_WEBHOOK_SECRET="020b82d2c4c440ceaf309f56a87cd4075dd5d0dee396ad57bb343aec3c75dd6d"
```

### Step 2: Check What's Connected

1. Go to: http://localhost:3000/integrations/github/repositories
2. Verify you see repositories with "Automated" badge
3. Note which repository has automation enabled

### Step 3: Check Your Automation Rules

1. Go to: http://localhost:3000/automations
2. You should see at least one automation rule
3. Check the automation details:
   - **Trigger**: Should be "GitHub Issue" or "GitHub PR"
   - **Action**: Should be "opened" (or whatever you configured)
   - **Status**: Should show as "Active"

### Step 4: Create a Test GitHub Issue

Now let's trigger the automation by creating a GitHub issue.

**Option A: Using GitHub Web Interface**

1. Go to the repository that has automation enabled
2. Click "Issues" tab
3. Click "New Issue"
4. Enter:
   - Title: "Test webhook automation"
   - Body: "Testing if Synapse automation creates a thread automatically"
5. Click "Submit new issue"

**Option B: Using GitHub CLI**

```bash
# Replace OWNER/REPO with your repository
gh issue create \
  --title "Test webhook automation" \
  --body "Testing if Synapse automation creates a thread automatically" \
  --repo OWNER/REPO
```

### Step 5: Watch the Server Logs

After creating the issue, watch your dev server terminal. You should see logs like:

```
🔔 GitHub webhook received: {
  method: 'POST',
  event: 'issues',
  delivery: '12345678-1234-1234-1234-123456789abc'
}
📦 Webhook payload received: { event: 'issues', hasSignature: true, payloadSize: 15234 }
✅ Webhook signature verified
📝 Handling issues event: opened
🔍 Looking for automations for issue event: {
  action: 'opened',
  repository: 'yourname/your-repo',
  issue: '#1'
}
📋 Found 1 active automations for github.issue
🔎 Checking automation "Create thread from GitHub issues" {
  automationId: 'abc123...',
  triggerAction: 'opened',
  actualAction: 'opened',
  repoFilter: 'yourname/your-repo',
  actualRepo: 'yourname/your-repo'
}
✅ Automation "Create thread from GitHub issues" matches! Executing...
🧵 Creating thread: {
  title: 'yourname/your-repo#1: Test webhook automation',
  status: 'planning',
  organizationId: 'xyz789...'
}
✅ Thread created successfully: {
  threadId: 'thread123...',
  title: 'yourname/your-repo#1: Test webhook automation'
}
✅ Automation "Create thread from GitHub issues" executed successfully
✅ Finished processing issue event (1 automations checked)
✅ Webhook processed successfully
```

### Step 6: Verify Thread Created

1. Go to: http://localhost:3000/threads
2. You should see a new thread with title: "yourname/your-repo#1: Test webhook automation"
3. Click on the thread to see details
4. The thread should have:
   - The issue description as the thread description
   - A connected item linking to the GitHub issue
   - Status: "Planning" (or whatever you configured)

### Step 7: Verify in Activity Feed

1. Go to: http://localhost:3000/activity (if available)
2. You should see an activity log entry showing the thread was created by automation

---

## Troubleshooting

### No Webhook Logs Appearing

**Problem**: You created an issue but see no webhook logs in your dev server.

**Possible Causes**:

1. **Localtunnel not running**
   ```bash
   # Check if localtunnel is still running
   # You should see it in another terminal
   npx localtunnel --port 3000
   ```

2. **Webhook URL mismatch**
   - The webhook was created with a different URL than your current localtunnel URL
   - **Solution**: Go to GitHub repository → Settings → Webhooks → Edit webhook → Update URL

3. **GitHub webhook delivery failed**
   - Go to your GitHub repository
   - Click Settings → Webhooks
   - Click on the Synapse webhook
   - Check "Recent Deliveries"
   - Look for failed deliveries (red X)
   - Click on a failed delivery to see the error message

### Logs Show "Found 0 active automations"

**Problem**: Webhook received but no automations found.

**Possible Causes**:

1. **No automation created**
   - Go to http://localhost:3000/automations
   - If empty, you need to create an automation

2. **Automation is inactive**
   - Check automation status in the UI
   - Ensure it's active (not paused)

3. **Trigger type mismatch**
   - Check automation trigger matches the event you're testing
   - For issue creation, trigger should be "GitHub Issue" with action "opened"

### Logs Show "Skipping: action mismatch"

**Problem**: Automation found but action doesn't match.

**Example Log**:
```
🔎 Checking automation "My Automation" {
  triggerAction: 'closed',
  actualAction: 'opened',
  ...
}
⏭️ Skipping: action mismatch (expected closed, got opened)
```

**Solution**: Your automation is configured for "closed" issues but you created an "opened" issue.

**Fix**: Either:
- Create an automation with action "opened"
- Close the issue to trigger the "closed" automation

### Logs Show "Skipping: repository mismatch"

**Problem**: Automation found but repository doesn't match.

**Example Log**:
```
⏭️ Skipping: repository mismatch (expected owner/repo-a, got owner/repo-b)
```

**Solution**: You created an issue in `owner/repo-b` but the automation is configured for `owner/repo-a`.

**Fix**: Either:
- Create the issue in the correct repository (`owner/repo-a`)
- Update the automation to match `owner/repo-b`
- Remove repository filter from automation (to match all repos)

### Webhook Signature Verification Failed

**Problem**: Logs show "Invalid GitHub webhook signature"

**Possible Causes**:

1. **Webhook secret mismatch**
   - The secret in your `.env` doesn't match the secret configured in GitHub webhook

**Solution**:
```bash
# Check your webhook secret
grep GITHUB_WEBHOOK_SECRET .env

# Go to GitHub repository → Settings → Webhooks → Edit webhook
# Update the "Secret" field to match your .env file
# Click "Update webhook"
```

### Localtunnel Shows "Warning: connection throttled"

**Problem**: Localtunnel is rate limiting requests.

**Solution**: This is normal for localtunnel free tier. Wait a moment and try again. Or:
- Use ngrok instead (requires signup but more reliable)
- Use ngrok Pro for guaranteed uptime

---

## Common Test Scenarios

### Scenario 1: Test Issue Creation → Thread Creation

1. Create automation: Trigger "GitHub Issue" → Action "opened" → Create Thread
2. Create GitHub issue
3. Verify thread appears in Synapse

### Scenario 2: Test PR Creation → Thread Creation

1. Create automation: Trigger "GitHub Pull Request" → Action "opened" → Create Thread
2. Create GitHub PR
3. Verify thread appears in Synapse

### Scenario 3: Test Issue Closure → Update Thread

1. Create automation: Trigger "GitHub Issue" → Action "closed" → Update Thread (status: "completed")
2. Create and then close a GitHub issue
3. Verify thread status updates to "completed"

---

## Manual Webhook Testing

You can also manually test the webhook endpoint without creating real GitHub issues.

### Using curl

```bash
# Test webhook endpoint
curl -X POST http://localhost:3000/api/webhooks/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: issues" \
  -H "X-Hub-Signature-256: sha256=test" \
  -d '{
    "action": "opened",
    "issue": {
      "number": 999,
      "title": "Manual Test Issue",
      "body": "This is a manual test",
      "html_url": "https://github.com/test/test/issues/999",
      "state": "open",
      "labels": []
    },
    "repository": {
      "full_name": "yourname/your-repo",
      "name": "your-repo"
    }
  }'
```

**Note**: This will fail signature verification unless you:
1. Generate the correct HMAC signature, OR
2. Temporarily disable signature verification for testing

### Using GitHub's Webhook Test

1. Go to your GitHub repository
2. Settings → Webhooks → Click on Synapse webhook
3. Scroll to "Recent Deliveries"
4. Click "Redeliver" on any previous delivery
5. This will resend the webhook event

---

## Debugging Checklist

Use this checklist to verify each part of the system:

- [ ] Localtunnel/ngrok is running and shows public URL
- [ ] `.env` has correct `NEXT_PUBLIC_APP_URL`
- [ ] Dev server is running (not crashed)
- [ ] GitHub OAuth is connected (go to /integrations)
- [ ] Repository webhook is enabled (check /integrations/github/repositories)
- [ ] Automation exists and is active (check /automations)
- [ ] Automation trigger matches the test event (e.g., "opened" issue)
- [ ] GitHub webhook exists (check repo Settings → Webhooks)
- [ ] GitHub webhook has correct URL (matches localtunnel URL)
- [ ] GitHub webhook secret matches `.env` `GITHUB_WEBHOOK_SECRET`
- [ ] Created test issue in the correct repository
- [ ] Dev server logs show webhook received
- [ ] Dev server logs show automation found and executed
- [ ] Thread appears in /threads page

---

## Getting Help

If you've gone through all troubleshooting steps and still can't get it working:

1. Check the dev server logs carefully
2. Check GitHub webhook delivery logs (repo Settings → Webhooks)
3. Verify database has the automation record (use Prisma Studio: `npx prisma studio`)
4. Check for any error messages in browser console
5. Try creating a fresh automation from scratch

---

## Quick Reference

### Useful URLs

- Threads: http://localhost:3000/threads
- Automations: http://localhost:3000/automations
- GitHub Repositories: http://localhost:3000/integrations/github/repositories
- Integrations: http://localhost:3000/integrations

### Useful Commands

```bash
# Start localtunnel
npx localtunnel --port 3000

# Start dev server
npm run dev

# Open Prisma Studio (to inspect database)
npx prisma studio

# Check logs in real-time
npm run dev | grep webhook

# Test GitHub CLI is working
gh auth status

# Create test issue with CLI
gh issue create --title "Test" --body "Test" --repo OWNER/REPO
```

### Environment Variables

```bash
NEXT_PUBLIC_APP_URL="https://xxx.loca.lt"
GITHUB_WEBHOOK_SECRET="generate_with_openssl_rand_hex_32"
GITHUB_CLIENT_ID="from_github_oauth_app"
GITHUB_CLIENT_SECRET="from_github_oauth_app"
```
