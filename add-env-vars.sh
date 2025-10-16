#!/bin/bash

# Script to add all environment variables to Vercel
echo "🔧 Adding environment variables to Vercel..."

# Database
echo "DATABASE_URL" | npx vercel env add DATABASE_URL production
echo "postgresql://postgres.plqcljzepkliodbmceid:Sharkie@99@aws-1-us-east-2.pooler.supabase.com:6543/postgres"

echo "DATABASE_DIRECT_URL" | npx vercel env add DATABASE_DIRECT_URL production
echo "postgresql://postgres:Sharkie@99@db.plqcljzepkliodbmceid.supabase.co:5432/postgres"

# Auth - Clerk
echo "CLERK_SECRET_KEY" | npx vercel env add CLERK_SECRET_KEY production
echo "sk_test_Y5wedSeCrXZV68YyC2zk3pSIp6O0Bs3WheLYhfmJTZ"

echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" | npx vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
echo "pk_test_ZG9taW5hbnQtbGlnZXItNDkuY2xlcmsuYWNjb3VudHMuZGV2JA"

# Supabase
echo "NEXT_PUBLIC_SUPABASE_URL" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "https://plqcljzepkliodbmceid.supabase.co"

echo "NEXT_PUBLIC_SUPABASE_ANON_KEY" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBscWNsanplcGtsaW9kYm1jZWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTgyOTMsImV4cCI6MjA3NjAzNDI5M30.wrzpk9IjYPAjQGwDbKC-OfF49awX3aafqOUrkLHvIuM"

# App Config
echo "NEXT_PUBLIC_APP_URL" | npx vercel env add NEXT_PUBLIC_APP_URL production
echo "https://synpase-pfgh6gx2c-sheshanks-projects-5275d9db.vercel.app"

echo "NODE_ENV" | npx vercel env add NODE_ENV production
echo "production"

# Encryption
echo "ENCRYPTION_MASTER_KEY" | npx vercel env add ENCRYPTION_MASTER_KEY production
echo "zU6IZtzF2dYpbPlpd/1Rhh6qGLK08rQC5B9VCtDZAqc="

echo "ENCRYPTION_KEY" | npx vercel env add ENCRYPTION_KEY production
echo "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# GitHub OAuth
echo "GITHUB_CLIENT_ID" | npx vercel env add GITHUB_CLIENT_ID production
echo "Ov23lioId7oM4IlMVOSW"

echo "GITHUB_CLIENT_SECRET" | npx vercel env add GITHUB_CLIENT_SECRET production
echo "901d7cfbd6a4282bb398db4591d5ea896ed16331"

echo "GITHUB_WEBHOOK_SECRET" | npx vercel env add GITHUB_WEBHOOK_SECRET production
echo "020b82d2c4c440ceaf309f56a87cd4075dd5d0dee396ad57bb343aec3c75dd6d"

# Linear OAuth
echo "LINEAR_CLIENT_ID" | npx vercel env add LINEAR_CLIENT_ID production
echo "8a857ff13b59e4aa34ee6afab8390a7e"

echo "LINEAR_CLIENT_SECRET" | npx vercel env add LINEAR_CLIENT_SECRET production
echo "b4ea9f919be66832a5979f7d972a5ff9"

echo ""
echo "✅ All environment variables added!"
echo ""
echo "Now redeploying to production..."
npx vercel --prod
