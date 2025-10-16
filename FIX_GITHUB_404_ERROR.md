# Fix GitHub 404 Error

## Problem

The GitHub OAuth connection is failing with a 404 error because the environment variables have newline characters (`\n`) embedded in them. You can see this in the browser console:

```
GET https://github.com/login/oauth/authorize?client_id=Ov23lioId7oM4IlMVOSW%0A&... 404 (Not Found)
```

The `%0A` is a URL-encoded newline character that shouldn't be there.

## Root Cause

When we added environment variables using `echo | npx vercel env add`, the `echo` command added newline characters to the values, which got stored in Vercel's environment variables.

## Solution

You need to update the environment variables in the Vercel dashboard to remove the newlines. Here's how:

### Step 1: Go to Environment Variables Settings

Visit: https://vercel.com/sheshanks-projects-5275d9db/synpase/settings/environment-variables

### Step 2: Update Each Variable

For **each** of the following variables, click the three dots (⋮) next to it, select "Edit", and update the value to remove any extra spaces or newlines:

#### Critical Variables (Fix these first):

1. **GITHUB_CLIENT_ID**
   - Remove the old value
   - Add new value: `Ov23lioId7oM4IlMVOSW` (no spaces, no newlines)
   - Environment: Production

2. **GITHUB_CLIENT_SECRET**
   - Remove the old value
   - Add new value: `901d7cfbd6a4282bb398db4591d5ea896ed16331` (no spaces, no newlines)
   - Environment: Production

3. **GITHUB_WEBHOOK_SECRET**
   - Remove the old value
   - Add new value: `020b82d2c4c440ceaf309f56a87cd4075dd5d0dee396ad57bb343aec3c75dd6d` (no spaces, no newlines)
   - Environment: Production

4. **NEXT_PUBLIC_APP_URL**
   - Remove the old value
   - Add new value: `https://synpase-nzke2dlyi-sheshanks-projects-5275d9db.vercel.app` (no spaces, no newlines)
   - Environment: Production

#### Other Variables (Fix if you have issues with other integrations):

5. **LINEAR_CLIENT_ID**
   - Value: `8a857ff13b59e4aa34ee6afab8390a7e`

6. **LINEAR_CLIENT_SECRET**
   - Value: `b4ea9f919be66832a5979f7d972a5ff9`

7. **CLERK_SECRET_KEY**
   - Value: `sk_test_Y5wedSeCrXZV68YyC2zk3pSIp6O0Bs3WheLYhfmJTZ`

8. **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**
   - Value: `pk_test_ZG9taW5hbnQtbGlnZXItNDkuY2xlcmsuYWNjb3VudHMuZGV2JA`

9. **NEXT_PUBLIC_SUPABASE_URL**
   - Value: `https://plqcljzepkliodbmceid.supabase.co`

10. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
    - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBscWNsanplcGtsaW9kYm1jZWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTgyOTMsImV4cCI6MjA3NjAzNDI5M30.wrzpk9IjYPAjQGwDbKC-OfF49awX3aafqOUrkLHvIuM`

11. **NODE_ENV**
    - Value: `production`

12. **ENCRYPTION_MASTER_KEY**
    - Value: `zU6IZtzF2dYpbPlpd/1Rhh6qGLK08rQC5B9VCtDZAqc=`

13. **ENCRYPTION_KEY**
    - Value: `0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef`

14. **DATABASE_URL**
    - Value: `postgresql://postgres.plqcljzepkliodbmceid:Sharkie@99@aws-1-us-east-2.pooler.supabase.com:6543/postgres`

15. **DATABASE_DIRECT_URL**
    - Value: `postgresql://postgres:Sharkie@99@db.plqcljzepkliodbmceid.supabase.co:5432/postgres`

### Step 3: Redeploy

After updating all the critical environment variables (at minimum, the 4 GitHub/App URL ones), redeploy your application:

```bash
npx vercel --prod
```

### Step 4: Test

1. Visit your production URL: https://synpase-nzke2dlyi-sheshanks-projects-5275d9db.vercel.app
2. Login with Clerk
3. Go to Integrations → GitHub → Connect
4. You should now be redirected to GitHub's authorization page without a 404 error

## Alternative: Use Vercel Dashboard Directly

Instead of using the CLI, you can also:

1. Go to: https://vercel.com/sheshanks-projects-5275d9db/synpase/settings/environment-variables
2. Delete each problematic variable (click the three dots ⋮ → "Delete")
3. Click "Add New" to add each variable fresh with the correct value
4. Make sure to select "Production" environment for each
5. Redeploy

This ensures no hidden characters or newlines are included.

## Verification

After fixing and redeploying, open your browser console on the production site and try connecting to GitHub again. The URL should now look like:

```
GET https://github.com/login/oauth/authorize?client_id=Ov23lioId7oM4IlMVOSW&redirect_uri=...
```

Notice there's no `%0A` after the client_id.
