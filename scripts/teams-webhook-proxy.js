#!/usr/bin/env node

const http = require('http');
const https = require('https');
const url = require('url');

const TEAMS_WEBHOOK_URL = 'YOUR_POWER_AUTOMATE_WEBHOOK_URL_HERE';

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/webhook') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            console.log('Received webhook request');
            console.log('Body:', body);
            
            // Parse the incoming data - it should be MS Teams message card JSON
            let messageCard;
            try {
                messageCard = JSON.parse(body);
            } catch (e) {
                console.error('Failed to parse JSON:', e);
                res.statusCode = 400;
                res.end('Invalid JSON');
                return;
            }
            
            // Convert MessageCard to Teams adaptive card format for Power Automate
            const teamsMessage = {
                "type": "message",
                "attachments": [
                    {
                        "contentType": "application/vnd.microsoft.card.adaptive",
                        "content": {
                            "type": "AdaptiveCard",
                            "version": "1.2",
                            "body": [
                                {
                                    "type": "TextBlock",
                                    "text": messageCard.title || "Prometheus Alert",
                                    "weight": "Bolder",
                                    "size": "Medium",
                                    "color": messageCard.themeColor === "8C1A1A" ? "Attention" : 
                                             messageCard.themeColor === "FFA500" ? "Warning" :
                                             messageCard.themeColor === "2DC72D" ? "Good" : "Default"
                                },
                                {
                                    "type": "TextBlock",
                                    "text": messageCard.summary || "Alert Summary",
                                    "wrap": true
                                }
                            ]
                        }
                    }
                ]
            };
            
            // Add sections if they exist
            if (messageCard.sections && messageCard.sections.length > 0) {
                messageCard.sections.forEach(section => {
                    if (section.activityTitle) {
                        teamsMessage.attachments[0].content.body.push({
                            "type": "TextBlock",
                            "text": section.activityTitle.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'), // Remove markdown links
                            "weight": "Bolder",
                            "wrap": true
                        });
                    }
                    
                    if (section.facts && section.facts.length > 0) {
                        const factSet = {
                            "type": "FactSet",
                            "facts": section.facts.filter(fact => fact.name && fact.value).map(fact => ({
                                "title": fact.name,
                                "value": fact.value
                            }))
                        };
                        if (factSet.facts.length > 0) {
                            teamsMessage.attachments[0].content.body.push(factSet);
                        }
                    }
                });
            }
            
            const payloadBody = JSON.stringify(teamsMessage);
            console.log('Sending to Power Automate:', payloadBody);
            
            // Send to Power Automate with correct content-type
            const parsedUrl = url.parse(TEAMS_WEBHOOK_URL);
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || 443,
                path: parsedUrl.path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payloadBody)
                }
            };
            
            const proxyReq = https.request(options, (proxyRes) => {
                let responseBody = '';
                
                proxyRes.on('data', chunk => {
                    responseBody += chunk;
                });
                
                proxyRes.on('end', () => {
                    console.log('Power Automate response status:', proxyRes.statusCode);
                    console.log('Power Automate response:', responseBody);
                    
                    res.statusCode = proxyRes.statusCode;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                        status: proxyRes.statusCode,
                        message: responseBody
                    }));
                });
            });
            
            proxyReq.on('error', (err) => {
                console.error('Error sending to Power Automate:', err);
                res.statusCode = 500;
                res.end(JSON.stringify({
                    error: 'Failed to send to Power Automate',
                    details: err.message
                }));
            });
            
            proxyReq.write(payloadBody);
            proxyReq.end();
        });
    } else {
        res.statusCode = 404;
        res.end('Not found');
    }
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Teams webhook proxy listening on port ${PORT}`);
});
