#!/bin/bash

# Synapse Configuration Checker
echo "🔍 Synapse Configuration Checker"
echo "================================"
echo ""

ERRORS=0
WARNINGS=0

# Check .env file
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    echo "   Run: cp .env.example .env"
    ((ERRORS++))
else
    echo "✅ .env file exists"
fi

# Check DATABASE_URL
if [ -f .env ] && grep -q "DATABASE_URL=\"postgresql://" .env; then
    if grep -q "DATABASE_URL=\"postgresql://user:password" .env; then
        echo "⚠️  DATABASE_URL appears to be placeholder"
        echo "   Update with your actual database connection"
        ((WARNINGS++))
    else
        echo "✅ DATABASE_URL configured"
    fi
else
    echo "❌ DATABASE_URL not configured"
    ((ERRORS++))
fi

# Check Clerk keys
if [ -f .env ]; then
    if grep -q "CLERK_SECRET_KEY=\"sk_" .env; then
        echo "✅ Clerk secret key configured"
    else
        echo "⚠️  Clerk secret key not configured"
        echo "   Get keys from https://clerk.com"
        ((WARNINGS++))
    fi

    if grep -q "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=\"pk_" .env; then
        echo "✅ Clerk publishable key configured"
    else
        echo "⚠️  Clerk publishable key not configured"
        ((WARNINGS++))
    fi
fi

# Check encryption key
if [ -f .env ] && grep -q "ENCRYPTION_MASTER_KEY=\"placeholder" .env; then
    echo "⚠️  Encryption key is placeholder"
    echo "   Generate with: openssl rand -base64 32"
    ((WARNINGS++))
else
    echo "✅ Encryption key configured"
fi

# Check node_modules
if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Dependencies not installed"
    echo "   Run: npm install"
    ((ERRORS++))
fi

# Check Prisma client
if [ -d "node_modules/@prisma/client" ]; then
    echo "✅ Prisma client generated"
else
    echo "⚠️  Prisma client not generated"
    echo "   Run: npx prisma generate"
    ((WARNINGS++))
fi

# Optional checks
echo ""
echo "Optional Configuration:"

if [ -f .env ] && grep -q "REDIS_URL=" .env && ! grep -q "# REDIS_URL=" .env; then
    echo "✅ Redis configured"
else
    echo "ℹ️  Redis not configured (optional)"
fi

if [ -f .env ] && grep -q "OPENAI_API_KEY=" .env && ! grep -q "# OPENAI_API_KEY=" .env; then
    echo "✅ OpenAI configured"
else
    echo "ℹ️  OpenAI not configured (optional for AI features)"
fi

# Summary
echo ""
echo "================================"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ All checks passed!"
    echo ""
    echo "Ready to start development:"
    echo "  npm run dev"
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  $WARNINGS warning(s) found"
    echo "You can proceed but some features may not work"
    echo ""
    echo "To start anyway:"
    echo "  npm run dev"
else
    echo "❌ $ERRORS error(s) and $WARNINGS warning(s) found"
    echo "Please fix errors before proceeding"
    echo ""
    echo "See SETUP.md for help"
fi
echo ""
