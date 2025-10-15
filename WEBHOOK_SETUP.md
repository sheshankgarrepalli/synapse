# GitHub Webhook Setup Guide

## Overview

Synapse uses GitHub webhooks to automatically create threads from GitHub issues, pull requests, and comments. This guide explains how to set up webhooks for both local development and production environments.

## Why Webhooks Need Public URLs

GitHub webhooks require a **publicly accessible URL** that GitHub's servers can reach over the internet. This means:

- ✅ Production URLs (e.g., `https://yourapp.com`)
- ✅ Public tunneling services (e.g., ngrok, localhost.run)
- ❌ `localhost:3000` or `127.0.0.1` (not reachable from GitHub's servers)

## Production Setup

### Requirements

1. Your application deployed to a public domain
2. Environment variables configured:
   ```bash
   NEXT_PUBLIC_APP_URL=https://your-production-domain.com
   GITHUB_WEBHOOK_SECRET=your-webhook-secret-here
   ```

### Automatic Configuration

Once deployed, webhooks are created automatically when:
1. User connects their GitHub account via OAuth
2. User selects repositories in the "Manage Repositories" page

No manual configuration required! 🎉

---

## Local Development Setup

For local development, you need to expose your localhost to the internet using a tunneling service.

### Option 1: ngrok (Recommended)

ngrok creates a secure tunnel to your localhost and provides a public URL.

#### Installation

```bash
# Using npm
npm install -g ngrok

# Or using Homebrew (macOS)
brew install ngrok

# Or download from https://ngrok.com/download
```

#### Setup Steps

1. **Start your Next.js dev server:**
   ```bash
   npm run dev
   ```

2. **In a new terminal, start ngrok:**
   ```bash
   ngrok http 3000
   ```

3. **Copy the HTTPS URL** from ngrok output:
   ```
   Forwarding   https://abc123.ngrok.io -> http://localhost:3000
                ^^^^^^^^^^^^^^^^^^^^^^^^
                Copy this URL
   ```

4. **Update your `.env` file:**
   ```bash
   NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
   GITHUB_WEBHOOK_SECRET=your-local-webhook-secret
   ```

5. **Restart your dev server** to pick up the new environment variable:
   ```bash
   # Stop the dev server (Ctrl+C) and restart
   npm run dev
   ```

6. **Access your app** using the ngrok URL:
   ```
   https://abc123.ngrok.io
   ```

#### Important Notes

- Keep the ngrok terminal window open while developing
- The URL changes each time you restart ngrok (unless you have a paid ngrok account with reserved domains)
- If the URL changes, update `.env` and restart your dev server
- Use the ngrok URL for both accessing the app and for GitHub webhooks

---

### Option 2: Other Tunneling Services

#### localhost.run (Free, No Installation)

```bash
ssh -R 80:localhost:3000 localhost.run
```

Then update your `.env` with the provided URL.

#### Cloudflare Tunnel (Free)

```bash
npm install -g cloudflared
cloudflared tunnel --url http://localhost:3000
```

#### localtunnel (Free)

```bash
npx localtunnel --port 3000
```

---

## Testing Webhooks

### 1. Enable Repository Automation

1. Navigate to **Integrations** → **GitHub** → **Manage Repositories**
2. Select repositories you want to automate
3. Click "Enable Automation"

### 2. Trigger Webhook Events

Create a test issue or pull request in the selected repository:

```bash
# Using GitHub CLI
gh issue create --title "Test webhook" --body "Testing Synapse automation"
```

Or manually create an issue on GitHub.

### 3. Verify Thread Creation

1. Go to the **Threads** page in Synapse
2. You should see a new thread created from the GitHub issue
3. Check the thread details to verify data was captured correctly

---

## Troubleshooting

### Error: "url is not supported because it isn't reachable over the public Internet (localhost)"

**Cause:** The application is trying to create webhooks using a localhost URL.

**Solution:**
1. Set up ngrok or another tunneling service (see above)
2. Update `NEXT_PUBLIC_APP_URL` in `.env` with the public URL
3. Restart your dev server

### Webhooks Not Firing

1. **Check webhook status** in GitHub:
   - Go to your repository → Settings → Webhooks
   - Click on the Synapse webhook
   - Check "Recent Deliveries" for errors

2. **Verify ngrok is running:**
   ```bash
   # Check ngrok status
   curl http://127.0.0.1:4040/api/tunnels
   ```

3. **Check webhook secret:**
   - Make sure `GITHUB_WEBHOOK_SECRET` matches in:
     - Your `.env` file
     - GitHub webhook configuration

4. **Inspect webhook payload:**
   - Use ngrok's web interface: http://127.0.0.1:4040
   - View all incoming requests and responses
   - Helpful for debugging webhook issues

### ngrok URL Changed

If you restart ngrok, the URL changes:

1. Copy the new ngrok URL
2. Update `.env`:
   ```bash
   NEXT_PUBLIC_APP_URL=https://new-url.ngrok.io
   ```
3. Restart dev server
4. Go to Integrations → GitHub → Click refresh button
5. The system will update webhooks with the new URL

---

## Architecture

### Webhook Flow

```
GitHub Event
    ↓
GitHub Webhook POST → https://your-app.com/api/webhooks/github
    ↓
Webhook Handler (validates signature)
    ↓
Event Processor (creates thread, updates data)
    ↓
Database Updated
    ↓
UI Reflects Changes
```

### Webhook Events

Synapse listens for these GitHub events:

- `issues` - Issue created, edited, closed, reopened
- `pull_request` - PR created, edited, merged, closed
- `push` - Commits pushed to repository
- `issue_comment` - Comments on issues and PRs

### Security

- Webhooks are validated using HMAC-SHA256 signature
- `GITHUB_WEBHOOK_SECRET` must match between GitHub and Synapse
- Only authenticated requests are processed

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL for webhooks | `https://abc123.ngrok.io` |
| `GITHUB_WEBHOOK_SECRET` | Yes | Secret for webhook validation | Generate with `openssl rand -hex 32` |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth App ID | From GitHub OAuth App settings |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth App Secret | From GitHub OAuth App settings |

---

## Advanced: ngrok Pro Features

With ngrok Pro, you get:

- **Reserved domains** - URL stays the same across restarts
- **Custom domains** - Use your own subdomain
- **No connection limits**

Example with reserved domain:
```bash
ngrok http 3000 --domain=myapp.ngrok.io
```

Then you can set in `.env` permanently:
```bash
NEXT_PUBLIC_APP_URL=https://myapp.ngrok.io
```

---

## Production Checklist

Before deploying to production:

- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Generate secure `GITHUB_WEBHOOK_SECRET` (32+ characters)
- [ ] Update GitHub OAuth App redirect URLs
- [ ] Test webhook delivery in production
- [ ] Monitor webhook logs for errors
- [ ] Set up error alerting for failed webhooks

---

## Support

For issues or questions:
- Check the [GitHub Issues](https://github.com/your-repo/issues)
- Review webhook delivery logs in GitHub
- Use ngrok's request inspector for debugging

---

## Additional Resources

- [GitHub Webhooks Documentation](https://docs.github.com/en/developers/webhooks-and-events/webhooks)
- [ngrok Documentation](https://ngrok.com/docs)
- [Webhook Security Best Practices](https://docs.github.com/en/developers/webhooks-and-events/webhooks/securing-your-webhooks)
