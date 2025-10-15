#!/bin/bash

# Synapse Setup Script
echo "🚀 Synapse Setup Script"
echo "======================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and configure it first."
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=\"postgresql://" .env; then
    echo "❌ Error: DATABASE_URL not configured in .env"
    echo "Please update your database connection string."
    exit 1
fi

# Check if Clerk keys are set
if ! grep -q "CLERK_SECRET_KEY=\"sk_" .env; then
    echo "⚠️  Warning: Clerk authentication keys not found."
    echo "You need to set up Clerk for authentication:"
    echo "1. Go to https://clerk.com"
    echo "2. Create a new application"
    echo "3. Copy your API keys to .env"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📦 Step 1: Installing dependencies..."
npm install

echo ""
echo "🔧 Step 2: Generating Prisma client..."
npx prisma generate

echo ""
echo "🗄️  Step 3: Setting up database..."
npx prisma db push --skip-generate

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. If you haven't already, set up Clerk authentication"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "📚 See SETUP.md for detailed instructions"
