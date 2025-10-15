# Enterprise-Grade GitHub Automation Setup

Synapse automatically configures GitHub webhooks when you connect your GitHub integration. No manual setup required!

## How It Works

### 1. Connect GitHub Integration

Simply click "Connect" on the GitHub integration card in Synapse:

1. Go to **Integrations** page
2. Click **Connect** on GitHub integration
3. Authorize Synapse to access your GitHub account
4. Done! Webhooks are automatically configured

### 2. Automatic Webhook Configuration

When you complete GitHub OAuth, Synapse automatically:

- ✅ Detects all GitHub organizations you have admin access to
- ✅ Creates organization-level webhooks for each organization
- ✅ Configures webhooks to listen for:
  - Issues (created, updated, closed)
  - Pull Requests (opened, merged, closed)
  - Code pushes
  - Issue comments
- ✅ Secures webhooks with HMAC SHA-256 signatures
- ✅ Stores webhook configuration in your organization

### 3. Create Automations

After GitHub is connected, create automations that trigger automatically:

1. Go to **Automations** page
2. Click **New Automation**
3. Configure your automation:
   - **Trigger Type**: GitHub Issue, Pull Request, Push, or Comment
   - **Trigger Action**: Opened, closed, edited, etc.
   - **Repository Filter**: (Optional) Filter by specific repository
   - **Thread Status**: Set initial thread status

Example automation:
```
Name: "Create thread for new GitHub issues"
Trigger: GitHub Issue → Opened
Repository: (leave empty for all repos)
Thread Status: Planning
```

4. Click **Create Automation**
5. Ensure automation is **Active** (toggle on)

### 4. Test Your Automation

1. Create a new issue in any GitHub repository
2. Synapse automatically:
   - Receives webhook from GitHub
   - Matches the event to your automation
   - Creates a new thread with the issue title
   - Links the GitHub issue to the thread
   - Sets thread status to your configured value

Check the **Threads** page to see your auto-created thread!

## Webhook Status & Management

### View Webhook Status

On the **Integrations** page, the GitHub card shows:

- **Automation Webhooks** section
- Number of organizations configured
- Green checkmark if webhooks are active
- Red X if webhooks need configuration

### Manual Webhook Actions

While webhooks are configured automatically, you can also:

**Refresh Webhooks**: Click the refresh icon to sync webhook configuration

**Manual Setup** (if needed): Click "Configure Webhooks" button if webhooks aren't auto-configured

**Disconnect**: When you disconnect GitHub, webhooks are automatically removed

## What Happens Behind the Scenes

### On GitHub OAuth Connection:

1. User authorizes Synapse GitHub app
2. Synapse receives access token with webhook permissions
3. System fetches user's GitHub organizations
4. For each organization with admin access:
   - Creates organization-level webhook
   - Points webhook to: `https://your-domain.com/api/webhooks/github`
   - Configures webhook secret from `.env`
   - Stores webhook ID in database
5. User sees "Connected" with webhook status

### On GitHub Disconnect:

1. User clicks "Disconnect"
2. Synapse automatically:
   - Removes all configured webhooks from GitHub
   - Clears webhook metadata from database
   - Revokes integration access

### On Webhook Event:

1. GitHub sends webhook to Synapse
2. Synapse verifies HMAC signature
3. Finds matching active automations
4. Executes automation actions:
   - Creates thread
   - Links GitHub item
   - Updates thread metadata
   - Logs activity
5. Updates automation execution stats

## Required Permissions

When connecting GitHub, Synapse requests these OAuth scopes:

- `repo`: Access repositories, issues, and pull requests
- `read:user`: Read user profile information
- `read:org`: Read organization membership
- `admin:org_hook`: Create/manage organization webhooks
- `admin:repo_hook`: Create/manage repository webhooks

These permissions allow Synapse to automatically configure and manage webhooks.

## Enterprise Benefits

### Zero Configuration Required

- ❌ No manual webhook setup in GitHub
- ❌ No copying webhook URLs
- ❌ No managing webhook secrets
- ❌ No configuring event types
- ✅ Just click "Connect" and start automating

### Centralized Management

- View webhook status directly in Synapse
- Refresh webhooks with one click
- Automatic cleanup on disconnect
- Multi-organization support

### Secure by Default

- Webhook signatures verified automatically
- Encrypted token storage
- HTTPS-only in production
- Automatic secret rotation support

### Scalable Architecture

- Organization-level webhooks (not per-repository)
- Handles unlimited repositories
- Automatic webhook registration for new orgs
- Efficient event processing

## Troubleshooting

### "Automation not triggering"

**Check webhook status**:
1. Go to Integrations page
2. View GitHub card
3. Verify "Automation Webhooks" shows configured

**Refresh webhooks**:
1. Click refresh icon on GitHub card
2. Wait for success message

**Check automation**:
1. Go to Automations page
2. Verify automation is **Active** (not inactive)
3. Check trigger configuration matches event

### "Webhooks not configured"

**Manual setup**:
1. Go to Integrations page
2. Click "Configure Webhooks" on GitHub card
3. Wait for success message

**Check permissions**:
- Verify you have admin access to GitHub organization
- Re-connect GitHub integration if needed

### "GitHub events not received"

**Verify webhook in GitHub**:
1. Go to GitHub organization settings
2. Navigate to Webhooks
3. Find Synapse webhook
4. Check "Recent Deliveries" for errors

**Common issues**:
- Webhook URL is not accessible (check firewall)
- Webhook secret doesn't match
- SSL certificate issues

## Advanced Features

### Multi-Organization Support

Synapse automatically creates webhooks for ALL organizations where you have admin access. No extra configuration needed.

### Repository Filtering

Create multiple automations with repository filters:

```
Automation 1: All repositories → Create thread with "Planning" status
Automation 2: prod-app repo → Create thread with "In Progress" status
Automation 3: docs repo → Create thread with "Review" status
```

### Custom Actions

Each automation can perform multiple actions:
1. Create thread
2. Update thread status
3. Add comments
4. Connect additional items
5. (Coming soon) Send notifications

### Webhook Health Monitoring

Synapse tracks:
- Number of configured webhooks
- Last configuration timestamp
- Webhook delivery status
- Execution counts per automation

## Production Deployment

When deploying to production:

1. **Update Environment Variables**:
   ```bash
   NEXT_PUBLIC_APP_URL="https://your-production-domain.com"
   GITHUB_WEBHOOK_SECRET="<strong-random-secret>"
   ```

2. **Ensure HTTPS**:
   - Webhooks require HTTPS in production
   - GitHub won't send webhooks to HTTP endpoints

3. **Firewall Configuration**:
   - Allow GitHub webhook IPs
   - Check GitHub's Meta API for current IPs: https://api.github.com/meta

4. **Re-connect Integrations**:
   - Users must reconnect GitHub integration
   - This updates webhook URLs to production domain
   - Old webhooks are automatically removed

## Need Help?

- Check webhook status on Integrations page
- View automation execution counts
- Review activity logs on thread pages
- Check server logs for detailed errors

## Benefits Over Manual Setup

| Manual Setup | Enterprise Synapse |
|--------------|-------------------|
| Configure webhooks per repository | Automatic organization-level webhooks |
| Copy/paste webhook URLs | Zero configuration required |
| Manage webhook secrets manually | Automatic secret management |
| Update webhooks on URL changes | Automatic refresh functionality |
| Remove webhooks individually | Automatic cleanup on disconnect |
| Per-repository limits | Unlimited repositories |

**Result**: 95% reduction in setup time, zero configuration errors, fully automated workflow.
