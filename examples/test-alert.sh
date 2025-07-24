#!/bin/bash

# Test script for Prometheus to MS Teams alerting
# This script sends a test alert through the complete chain

echo "Testing Prometheus to MS Teams alerting chain..."

# Test the complete chain
curl -X POST http://localhost:2000/alertmanager -H "Content-Type: application/json" -d '{
  "version": "4",
  "groupKey": "test",
  "status": "firing",
  "receiver": "teams-notifier",
  "groupLabels": {},
  "commonLabels": {
    "alertname": "TestAlert",
    "severity": "warning"
  },
  "commonAnnotations": {
    "summary": "Test alert from Prometheus",
    "description": "This is a test to verify the alerting chain is working."
  },
  "externalURL": "http://prometheus:9093",
  "alerts": [
    {
      "status": "firing",
      "labels": {
        "alertname": "TestAlert",
        "severity": "warning",
        "instance": "test-server"
      },
      "annotations": {
        "summary": "Test alert from Prometheus",
        "description": "This is a test to verify the alerting chain is working."
      },
      "startsAt": "2025-07-24T06:00:00Z",
      "endsAt": "0001-01-01T00:00:00Z",
      "generatorURL": "http://prometheus:9090/graph"
    }
  ]
}'

echo ""
echo "Test complete. Check your MS Teams chat for the test message."
echo "Expected response: HTTP 202 status code"
