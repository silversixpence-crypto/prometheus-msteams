#!/bin/bash

# Prometheus to MS Teams Alerting - Installation Script
# This script installs the necessary services and configurations

set -e

echo "Installing Prometheus to MS Teams Alerting Services..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    apt update && apt install -y nodejs
fi

# Create scripts directory if it doesn't exist
mkdir -p /etc/prometheus/scripts

# Copy scripts from this repo to the target location
echo "Copying scripts to /etc/prometheus/scripts/..."
cp scripts/teams-webhook-proxy.js /etc/prometheus/scripts/
cp scripts/teams-webhook-proxy.service /etc/prometheus/scripts/
cp scripts/prometheus-msteams.service /etc/prometheus/scripts/

# Copy service files to systemd
echo "Installing systemd service files..."
cp scripts/teams-webhook-proxy.service /etc/systemd/system/
cp scripts/prometheus-msteams.service /etc/systemd/system/

# Reload systemd
systemctl daemon-reload

# Enable and start services
echo "Enabling and starting services..."
systemctl enable teams-webhook-proxy.service
systemctl enable prometheus-msteams.service
systemctl start teams-webhook-proxy.service
systemctl start prometheus-msteams.service

# Check service status
echo "Checking service status..."
systemctl status teams-webhook-proxy.service --no-pager
systemctl status prometheus-msteams.service --no-pager

echo ""
echo "Installation complete!"
echo ""
echo "Services installed:"
echo "  - teams-webhook-proxy.service (port 3001)"
echo "  - prometheus-msteams.service (port 2000)"
echo ""
echo "Test the setup with:"
echo "  curl -X POST http://localhost:2000/alertmanager -H 'Content-Type: application/json' -d '{...}'"
echo ""
echo "Check logs with:"
echo "  sudo journalctl -u teams-webhook-proxy.service -f"
echo "  sudo journalctl -u prometheus-msteams.service -f"
