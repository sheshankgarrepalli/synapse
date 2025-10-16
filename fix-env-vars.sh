#!/bin/bash

# Fix environment variables by removing newlines
# This script will prompt for confirmation for each variable

echo "Fixing GITHUB_CLIENT_ID..."
printf "Ov23lioId7oM4IlMVOSW" | npx vercel env add GITHUB_CLIENT_ID production --force

echo "Fixing GITHUB_CLIENT_SECRET..."
printf "901d7cfbd6a4282bb398db4591d5ea896ed16331" | npx vercel env add GITHUB_CLIENT_SECRET production --force

echo "Fixing GITHUB_WEBHOOK_SECRET..."
printf "020b82d2c4c440ceaf309f56a87cd4075dd5d0dee396ad57bb343aec3c75dd6d" | npx vercel env add GITHUB_WEBHOOK_SECRET production --force

echo "Fixing LINEAR_CLIENT_ID..."
printf "8a857ff13b59e4aa34ee6afab8390a7e" | npx vercel env add LINEAR_CLIENT_ID production --force

echo "Fixing LINEAR_CLIENT_SECRET..."
printf "b4ea9f919be66832a5979f7d972a5ff9" | npx vercel env add LINEAR_CLIENT_SECRET production --force

echo "Fixing CLERK_SECRET_KEY..."
printf "sk_test_Y5wedSeCrXZV68YyC2zk3pSIp6O0Bs3WheLYhfmJTZ" | npx vercel env add CLERK_SECRET_KEY production --force

echo "Fixing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY..."
printf "pk_test_ZG9taW5hbnQtbGlnZXItNDkuY2xlcmsuYWNjb3VudHMuZGV2JA" | npx vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production --force

echo "Fixing NEXT_PUBLIC_SUPABASE_URL..."
printf "https://plqcljzepkliodbmceid.supabase.co" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production --force

echo "Fixing NEXT_PUBLIC_SUPABASE_ANON_KEY..."
printf "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBscWNsanplcGtsaW9kYm1jZWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTgyOTMsImV4cCI6MjA3NjAzNDI5M30.wrzpk9IjYPAjQGwDbKC-OfF49awX3aafqOUrkLHvIuM" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --force

echo "Fixing NEXT_PUBLIC_APP_URL..."
printf "https://synpase-nzke2dlyi-sheshanks-projects-5275d9db.vercel.app" | npx vercel env add NEXT_PUBLIC_APP_URL production --force

echo "Fixing NODE_ENV..."
printf "production" | npx vercel env add NODE_ENV production --force

echo "Fixing ENCRYPTION_MASTER_KEY..."
printf "zU6IZtzF2dYpbPlpd/1Rhh6qGLK08rQC5B9VCtDZAqc=" | npx vercel env add ENCRYPTION_MASTER_KEY production --force

echo "Fixing ENCRYPTION_KEY..."
printf "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" | npx vercel env add ENCRYPTION_KEY production --force

echo "Fixing DATABASE_URL..."
printf "postgresql://postgres.plqcljzepkliodbmceid:Sharkie@99@aws-1-us-east-2.pooler.supabase.com:6543/postgres" | npx vercel env add DATABASE_URL production --force

echo "Fixing DATABASE_DIRECT_URL..."
printf "postgresql://postgres:Sharkie@99@db.plqcljzepkliodbmceid.supabase.co:5432/postgres" | npx vercel env add DATABASE_DIRECT_URL production --force

echo ""
echo "All environment variables fixed!"
echo "Now redeploy with: npx vercel --prod"
