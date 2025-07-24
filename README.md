# Prometheus to MS Teams Alerting

A complete solution for sending Prometheus alerts to Microsoft Teams via Power Automate webhooks.

![Flow Diagram](https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white) → ![Alertmanager](https://img.shields.io/badge/Alertmanager-E6522C?style=for-the-badge&logo=prometheus&logoColor=white) → ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) → ![Power Automate](https://img.shields.io/badge/Power%20Automate-0066FF?style=for-the-badge&logo=microsoft&logoColor=white) → ![Microsoft Teams](https://img.shields.io/badge/Microsoft%20Teams-6264A7?style=for-the-badge&logo=microsoft-teams&logoColor=white)

## Overview

This solution bridges the gap between Prometheus alerts and Microsoft Teams by:

1. **Converting** Prometheus alerts to MS Teams MessageCard format
2. **Transforming** MessageCards to Adaptive Cards for Power Automate compatibility
3. **Delivering** formatted alerts to your Teams chat via Power Automate webhooks

## Architecture

```
Prometheus → Alertmanager → prometheus-msteams → teams-webhook-proxy → Power Automate → MS Teams
```

### Component Flow

1. **Prometheus** monitors your infrastructure and fires alerts
2. **Alertmanager** receives alerts and routes them to configured receivers
3. **prometheus-msteams** converts alerts to MS Teams MessageCard format
4. **teams-webhook-proxy** (our custom component) converts MessageCards to Adaptive Cards
5. **Power Automate** receives webhooks and posts to Teams chat

## Features

✅ **Adaptive Card Support** - Properly formatted cards for modern Teams  
✅ **Power Automate Compatible** - Works with Power Automate webhook triggers  
✅ **Systemd Integration** - Production-ready service management  
✅ **Easy Installation** - Automated setup script included  
✅ **Comprehensive Testing** - Multiple test scenarios provided  
✅ **Full Documentation** - Complete troubleshooting guide  

## Quick Start

### Prerequisites

- Ubuntu/Debian system with Prometheus and Alertmanager installed
- Node.js (installed automatically by the setup script)
- MS Teams with Power Automate webhook configured

### Installation

1. **Clone this repository:**
```bash
git clone <your-repo-url>
cd prometheus-msteams
```

2. **Configure your webhook URL:**
```bash
# Edit the webhook URL in the proxy script
nano scripts/teams-webhook-proxy.js
# Replace 'YOUR_POWER_AUTOMATE_WEBHOOK_URL_HERE' with your actual webhook URL
```

3. **Run the installation script:**
```bash
sudo bash scripts/install-teams-alerting.sh
```

4. **Test the setup:**
```bash
bash examples/test-alert.sh
```

## Configuration

### Power Automate Webhook Setup

1. Create a new Power Automate flow
2. Use "When a HTTP request is received" trigger
3. Configure to accept JSON with this schema:
```json
{
  "type": "object",
  "properties": {
    "type": {"type": "string"},
    "attachments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "contentType": {"type": "string"},
          "content": {"type": "object"}
        }
      }
    }
  }
}
```
4. Add "Post adaptive card in a chat or channel" action
5. Use the webhook URL from step 2 in `teams-webhook-proxy.js`

### Alertmanager Configuration

Update your `/etc/prometheus/alertmanager.yml`:
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

### Prometheus Configuration

Ensure your `/etc/prometheus/prometheus.yml` includes:
```yaml
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - 'localhost:9093'

rule_files:
  - '/etc/prometheus/alerts/*.yml'
```

## Service Management

### Start Services
```bash
sudo systemctl start teams-webhook-proxy.service
sudo systemctl start prometheus-msteams.service
```

### Check Status
```bash
sudo systemctl status teams-webhook-proxy.service
sudo systemctl status prometheus-msteams.service
```

### View Logs
```bash
sudo journalctl -u teams-webhook-proxy.service -f
sudo journalctl -u prometheus-msteams.service -f
```

## Testing

### Test Complete Chain
```bash
bash examples/test-alert.sh
```

### Test Proxy Only
```bash
bash examples/test-proxy.sh
```

### Manual Test
```bash
curl -X POST http://localhost:2000/alertmanager -H "Content-Type: application/json" -d @examples/test-payload.json
```

## Troubleshooting

### Common Issues

**Services not starting:**
- Check if ports 2000 and 3001 are available: `ss -tulpn | grep -E ':(2000|3001)'`
- Verify Node.js is installed: `node --version`
- Check service logs: `sudo journalctl -u teams-webhook-proxy.service`

**Alerts not reaching Teams:**
- Test each component in the chain individually
- Verify webhook URL is correct and accessible
- Check Power Automate flow configuration

**Power Automate errors:**
- Ensure the HTTP trigger schema matches the expected format
- Verify the adaptive card action is properly configured
- Check that the webhook URL has proper permissions

### Port Usage
- **2000**: prometheus-msteams bridge
- **3001**: teams-webhook-proxy
- **9090**: Prometheus web interface
- **9093**: Alertmanager web interface

## File Structure

```
├── scripts/
│   ├── teams-webhook-proxy.js          # Main proxy script
│   ├── teams-webhook-proxy.service     # Systemd service file
│   ├── prometheus-msteams.service      # Systemd service file
│   └── install-teams-alerting.sh       # Installation script
├── configs/
│   ├── alertmanager.yml                # Example Alertmanager config
│   ├── prometheus.yml                  # Example Prometheus config
│   └── disk_alerts.yml                 # Example alert rules
├── examples/
│   ├── test-alert.sh                   # Test complete chain
│   └── test-proxy.sh                   # Test proxy only
└── README.md                           # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Security Notes

- Keep your webhook URLs secure and never commit them to public repositories
- Consider running services with dedicated non-root users in production
- Use HTTPS for all external communications
- Regularly update dependencies and review configurations

## License

This project is open source. Feel free to use, modify, and distribute as needed.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review service logs
3. Test individual components
4. Open an issue with detailed information

---

**Made with ❤️ for the monitoring community**

*Solution developed with assistance from Claude (Anthropic AI)*