#!/bin/bash

# Vercel Environment Variables Setup Script
# Run this script to add all environment variables to Vercel

echo "🚀 Setting up Vercel Environment Variables..."
echo ""
echo "Your Production URL: https://synpase-egvy6qsq5-sheshanks-projects-5275d9db.vercel.app"
echo ""

# Function to add environment variable
add_env() {
  local name=$1
  local value=$2
  echo "Adding $name..."
  echo "$value" | npx vercel env add "$name" production
}

# Database
add_env "DATABASE_URL" "postgresql://postgres.plqcljzepkliodbmceid:Sharkie@99@aws-1-us-east-2.pooler.supabase.com:6543/postgres"
add_env "DATABASE_DIRECT_URL" "postgresql://postgres:Sharkie@99@db.plqcljzepkliodbmceid.supabase.co:5432/postgres"

# Auth
add_env "CLERK_SECRET_KEY" "sk_test_Y5wedSeCrXZV68YyC2zk3pSIp6O0Bs3WheLYhfmJTZ"
add_env "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "pk_test_ZG9taW5hbnQtbGlnZXItNDkuY2xlcmsuYWNjb3VudHMuZGV2JA"

# Supabase
add_env "NEXT_PUBLIC_SUPABASE_URL" "https://plqcljzepkliodbmceid.supabase.co"
add_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBscWNsanplcGtsaW9kYm1jZWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTgyOTMsImV4cCI6MjA3NjAzNDI5M30.wrzpk9IjYPAjQGwDbKC-OfF49awX3aafqOUrkLHvIuM"

# App Configuration
add_env "NEXT_PUBLIC_APP_URL" "https://synpase-egvy6qsq5-sheshanks-projects-5275d9db.vercel.app"
add_env "NODE_ENV" "production"

# Encryption
add_env "ENCRYPTION_MASTER_KEY" "zU6IZtzF2dYpbPlpd/1Rhh6qGLK08rQC5B9VCtDZAqc="
add_env "ENCRYPTION_KEY" "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# OAuth - GitHub
add_env "GITHUB_CLIENT_ID" "Ov23lioId7oM4IlMVOSW"
add_env "GITHUB_CLIENT_SECRET" "901d7cfbd6a4282bb398db4591d5ea896ed16331"
add_env "GITHUB_WEBHOOK_SECRET" "020b82d2c4c440ceaf309f56a87cd4075dd5d0dee396ad57bb343aec3c75dd6d"

# OAuth - Linear
add_env "LINEAR_CLIENT_ID" "8a857ff13b59e4aa34ee6afab8390a7e"
add_env "LINEAR_CLIENT_SECRET" "b4ea9f919be66832a5979f7d972a5ff9"

echo ""
echo "✅ Environment variables setup complete!"
echo ""
echo "Now redeploy with: npx vercel --prod"
