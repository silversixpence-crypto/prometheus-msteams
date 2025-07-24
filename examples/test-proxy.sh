#!/bin/bash

# Test script for direct proxy testing
# This tests the teams-webhook-proxy directly

echo "Testing teams-webhook-proxy directly..."

curl -X POST http://localhost:3001/webhook -H "Content-Type: application/json" -d '{
  "@type": "MessageCard",
  "title": "Direct Proxy Test",
  "summary": "Testing proxy directly",
  "themeColor": "FFA500",
  "sections": [
    {
      "activityTitle": "Test Message",
      "facts": [
        {
          "name": "Test Type",
          "value": "Direct Proxy Test"
        },
        {
          "name": "Status",
          "value": "Testing"
        }
      ]
    }
  ]
}'

echo ""
echo "Direct proxy test complete."
