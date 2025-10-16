# Manual Fix Instructions - Environment Variables

## The Problem

Your environment variables have newline characters (`\n`) embedded in them:
- `GITHUB_CLIENT_ID` has a newline: `Ov23lioId7oM4IlMVOSW\n`
- `NEXT_PUBLIC_APP_URL` has a newline in the middle: `https://...-projects-5275d9db.vercel.app\n/api/oauth/callback/github`

This causes GitHub OAuth to fail with a 404 error.

## The ONLY Solution

You **MUST** manually fix these in the Vercel Dashboard. The CLI cannot do this reliably without interactive input.

## Step-by-Step Instructions

### 1. Open Vercel Dashboard
Go to: **https://vercel.com/sheshanks-projects-5275d9db/synpase/settings/environment-variables**

### 2. Get Your Current Production URL
First, let's find out what your current production URL is. Run this command in your terminal:

```bash
npx vercel ls
```

Look for the production deployment (it will be marked with "Production"). The URL will look like:
`synpase-XXXXXXXXX-sheshanks-projects-5275d9db.vercel.app`

Copy that exact URL.

### 3. Fix GITHUB_CLIENT_ID

1. In the Vercel dashboard, find `GITHUB_CLIENT_ID`
2. Click the **three dots (⋮)** on the right
3. Click **"Delete"**
4. Confirm deletion
5. Click **"Add New"** button at the top
6. Fill in:
   - **Name:** `GITHUB_CLIENT_ID`
   - **Value:** `Ov23lioId7oM4IlMVOSW` (copy this exactly - select all the text, nothing more)
   - **Environment:** Check "Production"
7. Click **"Save"**

### 4. Fix NEXT_PUBLIC_APP_URL

1. Find `NEXT_PUBLIC_APP_URL` in the list
2. Click the **three dots (⋮)** on the right
3. Click **"Delete"**
4. Confirm deletion
5. Click **"Add New"** button
6. Fill in:
   - **Name:** `NEXT_PUBLIC_APP_URL`
   - **Value:** `https://[YOUR-CURRENT-PRODUCTION-URL-FROM-STEP-2]`
     - Example: `https://synpase-egvy6qsq5-sheshanks-projects-5275d9db.vercel.app`
     - Make sure there are NO spaces, NO newlines, NO extra characters
   - **Environment:** Check "Production"
7. Click **"Save"**

### 5. Fix GITHUB_CLIENT_SECRET

1. Find `GITHUB_CLIENT_SECRET`
2. Delete it (three dots → Delete)
3. Add New:
   - **Name:** `GITHUB_CLIENT_SECRET`
   - **Value:** `901d7cfbd6a4282bb398db4591d5ea896ed16331`
   - **Environment:** Production
4. Save

### 6. Fix GITHUB_WEBHOOK_SECRET

1. Find `GITHUB_WEBHOOK_SECRET`
2. Delete it
3. Add New:
   - **Name:** `GITHUB_WEBHOOK_SECRET`
   - **Value:** `020b82d2c4c440ceaf309f56a87cd4075dd5d0dee396ad57bb343aec3c75dd6d`
   - **Environment:** Production
4. Save

### 7. Redeploy

After fixing all 4 variables, redeploy:

```bash
npx vercel --prod
```

### 8. Test

1. Wait for deployment to complete
2. Go to your production URL
3. Login with Clerk
4. Go to Integrations → GitHub → Connect
5. It should now work!

## Important Notes

- **DO NOT** copy-paste from files that might have hidden newlines
- **Type the values directly** in the Vercel dashboard if needed
- Make sure there are **NO spaces before or after** the values
- The values should be on a **single line** with no line breaks

## Verification

After fixing, the GitHub OAuth URL should look like:
```
https://github.com/login/oauth/authorize?client_id=Ov23lioId7oM4IlMVOSW&redirect_uri=https://synpase-XXXXX.vercel.app/api/oauth/callback/github&...
```

Notice there are **NO `%0A`** characters in the URL anymore.

## Alternative: Set Current Deployment as Production

If you want to use your current deployment URL, you can also:

1. Go to: https://vercel.com/sheshanks-projects-5275d9db/synpase
2. Find your latest deployment
3. Click on it
4. Click "Promote to Production"

This will make that deployment the production one and you can use its URL.
