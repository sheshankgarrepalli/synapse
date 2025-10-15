#!/bin/bash

# Manual Webhook Test Script
# This script sends a fake GitHub webhook to test the automation

echo "🧪 Testing GitHub webhook automation manually..."
echo ""

# Get webhook secret from .env
WEBHOOK_SECRET=$(grep "GITHUB_WEBHOOK_SECRET" .env | cut -d '=' -f 2 | tr -d '"')

# Create test payload
PAYLOAD='{
  "action": "opened",
  "issue": {
    "number": 999,
    "title": "Test Issue from Manual Webhook",
    "body": "This is a test issue created by the manual webhook test script",
    "html_url": "https://github.com/test/test/issues/999",
    "state": "open",
    "labels": []
  },
  "repository": {
    "full_name": "test/test-repo",
    "name": "test-repo"
  }
}'

# Generate HMAC signature
SIGNATURE="sha256=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | sed 's/.* //')"

echo "📤 Sending test webhook..."
echo "Event: issues"
echo "Action: opened"
echo "Repository: test/test-repo"
echo ""

# Send webhook
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/webhooks/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: issues" \
  -H "X-Hub-Signature-256: $SIGNATURE" \
  -H "X-GitHub-Delivery: $(uuidgen)" \
  -d "$PAYLOAD")

# Extract status code and body
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "📥 Response:"
echo "Status: $HTTP_CODE"
echo "Body: $BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Webhook received successfully!"
    echo ""
    echo "Check your dev server logs for:"
    echo "  - 🔔 GitHub webhook received"
    echo "  - 📋 Found X active automations"
    echo "  - 🧵 Creating thread"
    echo "  - ✅ Thread created successfully"
    echo ""
    echo "Then check http://localhost:3000/threads to see if thread was created"
else
    echo "❌ Webhook failed with status $HTTP_CODE"
    echo ""
    echo "Common issues:"
    echo "  - 401: Invalid webhook signature"
    echo "  - 500: Server error (check logs)"
    echo "  - 405: Method not allowed"
fi
