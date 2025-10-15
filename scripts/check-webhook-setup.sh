#!/bin/bash

# GitHub Webhook Setup Verification Script
# This script checks if your local development environment is properly configured for GitHub webhooks

echo "🔍 Checking GitHub Webhook Setup..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check 1: .env file exists
echo "📋 Checking configuration files..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
else
    echo -e "${RED}✗${NC} .env file not found"
    ERRORS=$((ERRORS + 1))
fi

# Check 2: Required environment variables
echo ""
echo "🔑 Checking environment variables..."

if grep -q "NEXT_PUBLIC_APP_URL" .env; then
    APP_URL=$(grep "NEXT_PUBLIC_APP_URL" .env | cut -d '=' -f 2 | tr -d '"')

    if [[ $APP_URL == *"localhost"* ]] || [[ $APP_URL == *"127.0.0.1"* ]]; then
        echo -e "${RED}✗${NC} NEXT_PUBLIC_APP_URL is set to localhost: $APP_URL"
        echo -e "  ${YELLOW}→${NC} GitHub webhooks require a public URL (use ngrok or localtunnel)"
        ERRORS=$((ERRORS + 1))
    elif [[ $APP_URL == *"ngrok"* ]] || [[ $APP_URL == *"loca.lt"* ]]; then
        echo -e "${GREEN}✓${NC} NEXT_PUBLIC_APP_URL is set to public URL: $APP_URL"
    else
        echo -e "${YELLOW}⚠${NC} NEXT_PUBLIC_APP_URL: $APP_URL (verify this is accessible from GitHub)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}✗${NC} NEXT_PUBLIC_APP_URL not set in .env"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "GITHUB_WEBHOOK_SECRET" .env; then
    SECRET=$(grep "GITHUB_WEBHOOK_SECRET" .env | cut -d '=' -f 2 | tr -d '"')
    if [ ${#SECRET} -ge 32 ]; then
        echo -e "${GREEN}✓${NC} GITHUB_WEBHOOK_SECRET is set (${#SECRET} characters)"
    else
        echo -e "${YELLOW}⚠${NC} GITHUB_WEBHOOK_SECRET is short (${#SECRET} characters, recommend 64+)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}✗${NC} GITHUB_WEBHOOK_SECRET not set in .env"
    echo -e "  ${YELLOW}→${NC} Generate one with: openssl rand -hex 32"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "GITHUB_CLIENT_ID" .env; then
    echo -e "${GREEN}✓${NC} GITHUB_CLIENT_ID is set"
else
    echo -e "${RED}✗${NC} GITHUB_CLIENT_ID not set in .env"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "GITHUB_CLIENT_SECRET" .env; then
    echo -e "${GREEN}✓${NC} GITHUB_CLIENT_SECRET is set"
else
    echo -e "${RED}✗${NC} GITHUB_CLIENT_SECRET not set in .env"
    ERRORS=$((ERRORS + 1))
fi

# Check 3: Dev server running
echo ""
echo "🚀 Checking dev server..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Dev server is running on port 3000"
else
    echo -e "${RED}✗${NC} Dev server is not running"
    echo -e "  ${YELLOW}→${NC} Start it with: npm run dev"
    ERRORS=$((ERRORS + 1))
fi

# Check 4: Webhook endpoint exists
echo ""
echo "🔗 Checking webhook endpoint..."
if [ -f "src/pages/api/webhooks/github.ts" ]; then
    echo -e "${GREEN}✓${NC} Webhook endpoint exists at src/pages/api/webhooks/github.ts"
else
    echo -e "${RED}✗${NC} Webhook endpoint not found"
    ERRORS=$((ERRORS + 1))
fi

# Check 5: Public tunnel running
echo ""
echo "🌐 Checking public tunnel..."
if [[ $APP_URL == *"ngrok"* ]]; then
    if curl -s http://127.0.0.1:4040/api/tunnels > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} ngrok is running"
        TUNNEL_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | grep -o 'https://[^"]*ngrok[^"]*' | head -1)
        echo -e "  Current URL: $TUNNEL_URL"
    else
        echo -e "${YELLOW}⚠${NC} Cannot verify ngrok status (may not be running)"
        echo -e "  ${YELLOW}→${NC} Start it with: ngrok http 3000"
        WARNINGS=$((WARNINGS + 1))
    fi
elif [[ $APP_URL == *"loca.lt"* ]]; then
    echo -e "${YELLOW}⚠${NC} Using localtunnel (check that it's still running)"
    echo -e "  ${YELLOW}→${NC} URL changes on restart: $APP_URL"
    echo -e "  ${YELLOW}→${NC} If it changed, update .env and restart dev server"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 6: Database connection
echo ""
echo "💾 Checking database connection..."
if command -v psql &> /dev/null; then
    # Extract database URL from .env
    if grep -q "DATABASE_URL" .env; then
        echo -e "${GREEN}✓${NC} DATABASE_URL is configured"
    else
        echo -e "${RED}✗${NC} DATABASE_URL not found in .env"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${YELLOW}⚠${NC} psql not found (cannot verify database connection)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 7: Node modules installed
echo ""
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules directory exists"
else
    echo -e "${RED}✗${NC} node_modules not found"
    echo -e "  ${YELLOW}→${NC} Run: npm install"
    ERRORS=$((ERRORS + 1))
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Your environment is ready for GitHub webhooks."
    echo ""
    echo "Next steps:"
    echo "1. Go to http://localhost:3000/integrations"
    echo "2. Connect GitHub OAuth"
    echo "3. Select repositories in 'Manage Repositories'"
    echo "4. Create an automation rule"
    echo "5. Create a test GitHub issue"
    echo ""
    echo "See TESTING_WEBHOOKS.md for detailed testing instructions."
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Setup complete with ${WARNINGS} warning(s)${NC}"
    echo ""
    echo "Your environment should work but review the warnings above."
    echo "See TESTING_WEBHOOKS.md for detailed testing instructions."
else
    echo -e "${RED}✗ Found ${ERRORS} error(s) and ${WARNINGS} warning(s)${NC}"
    echo ""
    echo "Please fix the errors above before testing webhooks."
    echo "See WEBHOOK_SETUP.md for setup instructions."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $ERRORS
