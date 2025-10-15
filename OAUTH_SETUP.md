# OAuth Integration Setup Guide

This guide will help you set up OAuth integrations for all 8 supported tools in Synapse.

## Overview

Synapse supports OAuth 2.0 integrations with:
- **Tier 1**: GitHub, Slack, Linear
- **Tier 2**: Figma, Notion
- **Tier 3**: Zoom, Dovetail, Mixpanel

## General Setup Steps

For each integration, you'll need to:
1. Create an OAuth app in the provider's developer portal
2. Configure the callback URL
3. Add credentials to your `.env` file
4. Test the integration

## Callback URLs

All OAuth providers should redirect to:
```
http://localhost:3000/api/auth/callback?provider={PROVIDER_NAME}
```

For production:
```
https://yourdomain.com/api/auth/callback?provider={PROVIDER_NAME}
```

---

## 1. GitHub Integration

### Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Synapse
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback?provider=github`
4. Click "Register application"
5. Copy the **Client ID**
6. Generate a new **Client Secret** and copy it

### Add to .env

```env
GITHUB_CLIENT_ID="your_client_id"
GITHUB_CLIENT_SECRET="your_client_secret"
```

### Scopes Required
- `repo` - Access repositories
- `read:user` - Read user profile
- `read:org` - Read organization data

---

## 2. Slack Integration

### Create Slack App

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name your app "Synapse" and select your workspace
4. Go to "OAuth & Permissions" in the sidebar
5. Add a redirect URL:
   - `http://localhost:3000/api/auth/callback?provider=slack`
6. Scroll to "Scopes" and add:
   - **User Token Scopes**: `channels:read`, `channels:history`, `chat:write`
7. Copy **Client ID** and **Client Secret** from "App Credentials" section

### Add to .env

```env
SLACK_CLIENT_ID="your_client_id"
SLACK_CLIENT_SECRET="your_client_secret"
```

### Scopes Required
- `channels:read` - View channels
- `channels:history` - View messages
- `chat:write` - Post messages

---

## 3. Linear Integration

### Create Linear OAuth App

1. Go to [Linear Settings → API](https://linear.app/settings/api)
2. Click "Create new OAuth application"
3. Fill in the details:
   - **Name**: Synapse
   - **Callback URLs**: `http://localhost:3000/api/auth/callback?provider=linear`
4. Copy the **Client ID** and **Client Secret**

### Add to .env

```env
LINEAR_CLIENT_ID="your_client_id"
LINEAR_CLIENT_SECRET="your_client_secret"
```

### Scopes Required
- `read` - Read issues and projects
- `write` - Create and update issues

---

## 4. Figma Integration

### Create Figma OAuth App

1. Go to [Figma Developers](https://www.figma.com/developers/apps)
2. Click "Create an app"
3. Fill in the details:
   - **App name**: Synapse
   - **Callback URL**: `http://localhost:3000/api/auth/callback?provider=figma`
4. Copy the **Client ID** and **Client Secret**

### Add to .env

```env
FIGMA_CLIENT_ID="your_client_id"
FIGMA_CLIENT_SECRET="your_client_secret"
```

### Scopes Required
- `file_read` - Read file data
- `file_comments:write` - Post comments

---

## 5. Notion Integration

### Create Notion Integration

1. Go to [Notion My Integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Fill in the details:
   - **Name**: Synapse
   - **Capabilities**: Read content, Update content, Insert content
4. Click "Submit"
5. Copy the **OAuth client ID** and **OAuth client secret**
6. Add redirect URI:
   - `http://localhost:3000/api/auth/callback?provider=notion`

### Add to .env

```env
NOTION_CLIENT_ID="your_client_id"
NOTION_CLIENT_SECRET="your_client_secret"
```

### Capabilities Required
- Read content
- Update content
- Insert content

---

## 6. Zoom Integration (Optional)

### Create Zoom OAuth App

1. Go to [Zoom App Marketplace](https://marketplace.zoom.us/)
2. Click "Develop" → "Build App"
3. Choose "OAuth" app type
4. Fill in the details:
   - **App name**: Synapse
   - **Redirect URL**: `http://localhost:3000/api/auth/callback?provider=zoom`
5. Copy the **Client ID** and **Client Secret**

### Add to .env

```env
ZOOM_CLIENT_ID="your_client_id"
ZOOM_CLIENT_SECRET="your_client_secret"
```

### Scopes Required
- `meeting:read` - Read meetings
- `recording:read` - Read recordings

---

## 7. Dovetail Integration (Optional)

### Create Dovetail OAuth App

1. Contact Dovetail support for API access
2. Request OAuth credentials for your application
3. Provide callback URL: `http://localhost:3000/api/auth/callback?provider=dovetail`

### Add to .env

```env
DOVETAIL_CLIENT_ID="your_client_id"
DOVETAIL_CLIENT_SECRET="your_client_secret"
```

---

## 8. Mixpanel Integration (Optional)

### Create Mixpanel Service Account

1. Go to [Mixpanel Project Settings](https://mixpanel.com/settings/project)
2. Click "Service Accounts"
3. Create a new service account
4. Copy the **Username** and **Secret**

### Add to .env

```env
MIXPANEL_USERNAME="your_username"
MIXPANEL_SECRET="your_secret"
```

**Note**: Mixpanel uses service accounts, not OAuth. The integration works differently.

---

## Testing Your Integrations

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. Sign in with Clerk

4. Go to **Integrations** page

5. Click "Connect" on any integration

6. Complete the OAuth flow

7. You should be redirected back to the Integrations page with "Connected" status

---

## Troubleshooting

### "Invalid redirect_uri" error

- Double-check that the callback URL in your OAuth app matches exactly:
  ```
  http://localhost:3000/api/auth/callback?provider={PROVIDER}
  ```
- Make sure there are no trailing slashes
- Ensure the provider name is lowercase

### "Invalid state parameter" error

- This is a CSRF protection error
- Clear your browser cookies and try again
- Ensure your server is running and can set cookies

### "Failed to obtain access token" error

- Verify your Client ID and Client Secret are correct
- Check that you've added all required scopes
- Ensure the OAuth app is not in "development mode" if applicable

### Integration shows as "inactive"

- Check the database to ensure the integration was saved
- Run: `npx prisma studio` and look in the `Integration` table
- Verify the encryption key is set correctly

---

## Production Deployment

When deploying to production:

1. Update callback URLs in all OAuth apps to use your production domain
2. Use production credentials (not development/test credentials)
3. Enable HTTPS on your domain (required for OAuth)
4. Update `NEXT_PUBLIC_APP_URL` in `.env`
5. Use secure environment variable storage (Vercel, Railway, etc.)

---

## Security Best Practices

1. **Never commit OAuth secrets** to version control
2. **Use different credentials** for development and production
3. **Rotate secrets** regularly (every 90 days recommended)
4. **Limit scopes** to only what you need
5. **Monitor usage** in each provider's dashboard
6. **Enable 2FA** on all OAuth provider accounts

---

## Support

If you encounter issues:

1. Check the [GitHub Issues](https://github.com/yourusername/synapse/issues)
2. Review provider-specific documentation
3. Verify your environment variables are loaded correctly
4. Check server logs for detailed error messages

---

## Quick Start Checklist

- [ ] Set up Supabase database
- [ ] Configure Clerk authentication
- [ ] Generate encryption master key
- [ ] Create GitHub OAuth app
- [ ] Create Slack OAuth app
- [ ] Create Linear OAuth app
- [ ] Create Figma OAuth app
- [ ] Create Notion integration
- [ ] Test all integrations
- [ ] Deploy to production
- [ ] Update production callback URLs
