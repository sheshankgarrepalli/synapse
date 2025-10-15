# GitHub Webhooks Setup Guide

This guide explains how to set up GitHub webhooks to enable automation triggers in Synapse.

## What GitHub Webhooks Do

GitHub webhooks allow Synapse to automatically create threads and link GitHub items when events occur in your repositories, such as:
- New issues opened
- Pull requests created
- Code pushed
- Comments added

## Prerequisites

1. **GitHub OAuth Integration**: You must first connect GitHub integration via OAuth in Synapse
2. **Active Automation**: Create an automation in Synapse with GitHub triggers
3. **Repository Admin Access**: You need admin access to the GitHub repository to configure webhooks

## Setup Steps

### 1. Get Your Webhook URL

Your Synapse webhook endpoint is:
```
https://your-synapse-domain.com/api/webhooks/github
```

For local development:
```
http://localhost:3000/api/webhooks/github
```

**Note**: For local development, you'll need to use a service like [ngrok](https://ngrok.com/) or [localtunnel](https://localtunnel.github.io/www/) to expose your local server to GitHub.

### 2. Get Your Webhook Secret

The webhook secret is located in your `.env` file:
```bash
GITHUB_WEBHOOK_SECRET="020b82d2c4c440ceaf309f56a87cd4075dd5d0dee396ad57bb343aec3c75dd6d"
```

This secret is used to verify that webhook requests are coming from GitHub.

### 3. Configure GitHub Webhook

1. Go to your GitHub repository
2. Click **Settings** → **Webhooks** → **Add webhook**
3. Fill in the webhook form:

   **Payload URL**:
   ```
   https://your-synapse-domain.com/api/webhooks/github
   ```

   **Content type**:
   ```
   application/json
   ```

   **Secret**:
   ```
   Paste your GITHUB_WEBHOOK_SECRET from .env
   ```

   **Which events would you like to trigger this webhook?**
   - Select "Let me select individual events"
   - Check the events you want to trigger automations:
     - ☑ Issues
     - ☑ Pull requests
     - ☑ Issue comments
     - ☑ Pushes (optional)

   **Active**:
   - ☑ Enable webhook

4. Click **Add webhook**

### 4. Test Your Webhook

After creating the webhook, GitHub will send a ping event. You can verify it worked by:

1. In GitHub, go to **Settings** → **Webhooks** → Click on your webhook
2. Scroll to **Recent Deliveries**
3. You should see a ping event with a green checkmark (200 response)

### 5. Create an Automation in Synapse

1. Go to **Automations** in Synapse
2. Click **New Automation**
3. Configure your automation:
   - **Name**: e.g., "Create thread for new GitHub issues"
   - **Trigger Type**: GitHub Issue
   - **Trigger Action**: Opened
   - **Repository Filter**: (optional) e.g., `owner/repo-name`
   - **Thread Status**: Planning (or your preferred status)
4. Click **Create Automation**
5. Make sure the automation is **Active** (toggle on)

### 6. Test the Automation

1. Create a new issue in your GitHub repository
2. The automation should:
   - Create a new thread in Synapse
   - Link the GitHub issue to the thread
   - Set the thread status according to your configuration
3. Check the **Threads** page in Synapse to see the auto-created thread

## Troubleshooting

### Webhook Not Triggering

1. **Check webhook deliveries** in GitHub:
   - Go to repository **Settings** → **Webhooks** → Click on your webhook
   - Look at **Recent Deliveries** for any failed requests
   - Click on a delivery to see the request/response details

2. **Check webhook secret** matches:
   - Ensure the secret in GitHub matches `GITHUB_WEBHOOK_SECRET` in your `.env`

3. **Check automation is active**:
   - Go to **Automations** in Synapse
   - Verify the automation has the "Active" badge
   - Check the automation's trigger configuration matches the event

4. **Check repository filter**:
   - If you set a repository filter in the automation, ensure it matches exactly
   - Format: `owner/repo-name` (e.g., `facebook/react`)
   - Leave empty to trigger for all repositories

### Webhook Returns 401 Unauthorized

- The webhook secret doesn't match
- Verify `GITHUB_WEBHOOK_SECRET` in `.env` is correct
- Update the secret in GitHub webhook settings

### Webhook Returns 500 Internal Server Error

- Check your server logs for errors
- Common issues:
  - Database connection problems
  - Missing environment variables
  - Prisma schema not migrated

## Supported Events

### GitHub Issue Events
- `opened` - New issue created
- `closed` - Issue closed
- `reopened` - Issue reopened
- `edited` - Issue edited

### GitHub Pull Request Events
- `opened` - New PR created
- `closed` - PR closed or merged
- `reopened` - PR reopened
- `edited` - PR edited

### GitHub Push Events
- `push` - Code pushed to repository

### GitHub Issue Comment Events
- `created` - New comment added
- `edited` - Comment edited
- `deleted` - Comment deleted

## Automation Actions

Currently supported actions:

1. **Create Thread**
   - Creates a new thread in Synapse
   - Automatically links the GitHub item
   - Sets thread status

2. **Update Thread**
   - Updates existing thread properties
   - Updates last activity timestamp

3. **Add Comment**
   - Adds a comment to the thread

4. **Connect Item**
   - Connects a GitHub item to an existing thread

## Security Notes

1. **Webhook Secret**: Always use a strong, randomly-generated secret
2. **HTTPS**: Use HTTPS in production to encrypt webhook payloads
3. **Signature Verification**: Synapse verifies all webhook signatures using HMAC SHA-256
4. **IP Allowlisting**: Consider allowlisting GitHub's webhook IPs in your firewall

## GitHub Webhook IPs

GitHub webhook requests come from these IP ranges (check [GitHub's Meta API](https://api.github.com/meta) for updates):
- `192.30.252.0/22`
- `185.199.108.0/22`
- `140.82.112.0/20`
- `143.55.64.0/20`

## Local Development with ngrok

For local testing:

1. Install ngrok: `npm install -g ngrok` or download from [ngrok.com](https://ngrok.com/)
2. Start your dev server: `npm run dev`
3. Start ngrok: `ngrok http 3000`
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Use this URL for your webhook: `https://abc123.ngrok.io/api/webhooks/github`

## Need Help?

- Check the [Synapse documentation](docs/)
- Review webhook delivery logs in GitHub
- Check server logs for detailed error messages
- Open an issue in the Synapse repository
