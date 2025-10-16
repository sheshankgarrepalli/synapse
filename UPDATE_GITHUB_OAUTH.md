# Update GitHub OAuth App - Final Step

## Quick Instructions

You need to update the callback URL in your GitHub OAuth App settings. This is the **last step** to fix the connection.

### Step 1: Open GitHub OAuth App Settings

Go to: **https://github.com/settings/developers**

### Step 2: Find Your OAuth App

Look for the OAuth App with Client ID: `Ov23lioId7oM4IlMVOSW`

Click on it.

### Step 3: Update the Callback URL

In the "Authorization callback URL" field, update it to:

```
https://synpase-25plxhrei-sheshanks-projects-5275d9db.vercel.app/api/oauth/callback/github
```

**Important:** Make sure there are:
- ✅ NO spaces before or after the URL
- ✅ NO line breaks
- ✅ The URL is exactly as shown above

### Step 4: Save Changes

Click **"Update application"** button at the bottom.

### Step 5: Test

1. Go to: https://synpase-25plxhrei-sheshanks-projects-5275d9db.vercel.app
2. Login with Clerk
3. Go to Integrations → GitHub → Connect
4. You should now be redirected to GitHub successfully!

---

## Why This Happened

The deployment URL changed when we redeployed, so the callback URL in GitHub needs to match the new production URL.

---

## Alternative: Use a Custom Domain

If you want to avoid updating the callback URL every time you redeploy, consider:

1. Setting up a custom domain in Vercel
2. Using that custom domain in the GitHub OAuth callback URL
3. The custom domain won't change with each deployment

---

That's it! Once you update the callback URL in GitHub, everything will work perfectly.
