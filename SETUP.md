# Setup Guide

This guide walks you through setting up Prometheus to MS Teams alerting from this repository.

## Prerequisites

1. **Prometheus Server** running on Ubuntu/Debian
2. **Alertmanager** configured and running
3. **MS Teams** with admin access to create Power Automate flows
4. **Root/sudo access** on the Prometheus server

## Step-by-Step Setup

### 1. Clone and Configure

```bash
# Clone this repository
git clone <your-repo-url>
cd prometheus-msteams

# Configure your webhook URL
nano scripts/teams-webhook-proxy.js
# Replace 'YOUR_POWER_AUTOMATE_WEBHOOK_URL_HERE' with your actual URL
```

### 2. Set Up Power Automate Flow

1. Go to Power Automate (flow.microsoft.com)
2. Create a new "Instant flow"
3. Choose "When a HTTP request is received" trigger
4. Set the request body JSON schema:

```json
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string"
    },
    "attachments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "contentType": {
            "type": "string"
          },
          "content": {
            "type": "object"
          }
        },
        "required": [
          "contentType",
          "content"
        ]
      }
    }
  },
  "required": [
    "type",
    "attachments"
  ]
}
```

5. Add a new step: "Post adaptive card in a chat or channel"
6. Configure:
   - **Post as**: Flow bot
   - **Post in**: Chat with Flow bot
   - **Recipient**: Your Teams chat/channel
   - **Adaptive Card**: `attachments[0]['content']`
7. Save the flow and copy the webhook URL

### 3. Install Services

```bash
# Make sure you're in the repository directory
cd prometheus-msteams

# Run the installation script
sudo bash scripts/install-teams-alerting.sh
```

### 4. Configure Alertmanager

Update your Alertmanager configuration (`/etc/prometheus/alertmanager.yml`):

```yaml
global:
  resolve_timeout: 5m

route:
  receiver: 'teams-notifier'

receivers:
  - name: 'teams-notifier'
    webhook_configs:
      - url: 'http://localhost:2000/alertmanager'
        send_resolved: true
```

Restart Alertmanager:
```bash
sudo systemctl restart prometheus-alertmanager
```

### 5. Test the Setup

```bash
# Test the complete alerting chain
bash examples/test-alert.sh

# You should see:
# - HTTP 202 response
# - Message appears in your Teams chat
```

## Verification Checklist

- [ ] Services are running: `sudo systemctl status teams-webhook-proxy prometheus-msteams`
- [ ] Ports are listening: `ss -tulpn | grep -E ':(2000|3001)'`
- [ ] Test alert succeeds: `bash examples/test-alert.sh`
- [ ] Message appears in Teams chat
- [ ] Alertmanager can reach the webhook: Check Alertmanager logs

## Configuration Files

The repository includes example configuration files in `configs/`:

- `alertmanager.yml` - Basic Alertmanager configuration
- `prometheus.yml` - Example Prometheus configuration with alerting
- `disk_alerts.yml` - Sample disk usage alert rules

## Troubleshooting

### Services Not Starting

```bash
# Check service status
sudo systemctl status teams-webhook-proxy
sudo systemctl status prometheus-msteams

# View detailed logs
sudo journalctl -u teams-webhook-proxy -f
sudo journalctl -u prometheus-msteams -f
```

### Port Conflicts

```bash
# Check what's using the ports
ss -tulpn | grep -E ':(2000|3001)'

# If ports are in use, modify the scripts to use different ports
```

### Webhook Issues

```bash
# Test the proxy directly
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "message"}'

# Test prometheus-msteams
curl http://localhost:2000/
```

### Power Automate Troubleshooting

1. Check flow run history for errors
2. Verify JSON schema matches exactly
3. Test with a simple HTTP request first
4. Ensure adaptive card action is configured correctly

## Security Notes

- Never commit webhook URLs to public repositories
- Keep your `.gitignore` file updated
- Consider using environment variables for sensitive data
- Review permissions on configuration files

## Next Steps

1. **Add more alert rules** - Customize `configs/disk_alerts.yml`
2. **Monitor the services** - Set up monitoring for the alerting components
3. **Scale up** - Add more Prometheus instances if needed
4. **Customize formatting** - Modify the adaptive card format in `teams-webhook-proxy.js`

---

For more detailed information, see the main [README.md](README.md).
