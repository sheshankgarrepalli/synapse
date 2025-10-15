#!/bin/bash

# Script to help update GitHub webhook URLs when localtunnel URL changes

echo "🔧 GitHub Webhook URL Update Helper"
echo ""

# Get current localtunnel URL
CURRENT_URL=$(grep "NEXT_PUBLIC_APP_URL" .env | cut -d '=' -f 2 | tr -d '"')

echo "Current configured URL: $CURRENT_URL"
echo ""
echo "Steps to update your GitHub webhooks:"
echo ""
echo "1. Go to your GitHub repository on GitHub.com"
echo "2. Click 'Settings' → 'Webhooks'"
echo "3. Click on the Synapse webhook"
echo "4. Update the 'Payload URL' to:"
echo ""
echo "   $CURRENT_URL/api/webhooks/github"
echo ""
echo "5. Click 'Update webhook'"
echo "6. Scroll down to 'Recent Deliveries' and click 'Redeliver' on a past delivery to test"
echo ""
echo "OR you can:"
echo ""
echo "1. Go to: http://localhost:3000/integrations/github/repositories"
echo "2. Click 'Disable' on your repository"
echo "3. Click 'Select' and then 'Enable Automation' again"
echo "   (This will create a new webhook with the correct URL)"
echo ""
echo "Then create a test issue to verify it works!"
