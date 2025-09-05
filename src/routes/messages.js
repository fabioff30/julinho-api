const express = require('express');
const whatsAppService = require('../services/whatsapp.service');
const { authenticateBasic } = require('../middleware/auth');
const winston = require('winston');
const router = express.Router();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// Apply authentication to all message routes
router.use(authenticateBasic);

// GET /api/messages/broadcast/preview - Preview how many contacts will receive the message
router.get('/broadcast/preview', async (req, res) => {
  try {
    logger.info('Getting broadcast preview...');
    
    const preview = await whatsAppService.getEligibleContactsCount();
    
    res.json({
      success: true,
      data: preview,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting broadcast preview:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to get broadcast preview',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/messages/broadcast - Send broadcast message to all eligible contacts
router.post('/broadcast', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Message is required and cannot be empty',
        timestamp: new Date().toISOString()
      });
    }

    if (message.trim().length > 4096) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Message is too long (max 4096 characters)',
        timestamp: new Date().toISOString()
      });
    }

    logger.info('Starting broadcast message send...');
    
    const results = await whatsAppService.sendBroadcastMessage(message.trim());
    
    res.json({
      success: true,
      message: 'Broadcast completed',
      data: {
        ...results,
        message_preview: message.substring(0, 100) + (message.length > 100 ? '...' : '')
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error sending broadcast message:', error);
    
    const statusCode = error.message.includes('not ready') ? 503 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: statusCode === 503 ? 'Service unavailable' : 'Internal server error',
      message: error.message || 'Failed to send broadcast message',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/messages/status - Get WhatsApp connection status
router.get('/status', async (req, res) => {
  try {
    const status = await whatsAppService.getStatus();
    const qrCode = whatsAppService.getQRCode();
    
    res.json({
      success: true,
      data: {
        ...status,
        qr_code: qrCode,
        status_text: status.is_ready ? 'Connected' : 
                    status.is_connecting ? 'Connecting...' : 'Disconnected'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting WhatsApp status:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to get WhatsApp status',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/messages/connect - Initialize WhatsApp connection
router.post('/connect', async (req, res) => {
  try {
    logger.info('Initializing WhatsApp connection...');
    
    await whatsAppService.initialize();
    
    res.json({
      success: true,
      message: 'WhatsApp connection initialized. Check status endpoint for QR code if needed.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error initializing WhatsApp connection:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Failed to initialize WhatsApp connection',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/messages/disconnect - Disconnect WhatsApp
router.post('/disconnect', async (req, res) => {
  try {
    logger.info('Disconnecting WhatsApp...');
    
    await whatsAppService.disconnect();
    
    res.json({
      success: true,
      message: 'WhatsApp disconnected successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error disconnecting WhatsApp:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to disconnect WhatsApp',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/messages/qr - Display QR Code in browser-friendly format
router.get('/qr', async (req, res) => {
  // Disable CSP for this specific endpoint
  res.removeHeader('Content-Security-Policy');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self';");
  try {
    const status = await whatsAppService.getStatus();
    
    if (status.qr_code) {
      // Generate QR Code as HTML page for easy scanning
      const qrCodeHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>WhatsApp QR Code</title>
            <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
            <script>
                // Fallback: if main library fails, try alternative
                window.addEventListener('error', function(e) {
                    if (e.filename && e.filename.includes('qrcode')) {
                        console.log('Loading fallback QR library...');
                        const fallback = document.createElement('script');
                        fallback.src = 'https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js';
                        document.head.appendChild(fallback);
                    }
                });
            </script>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    text-align: center; 
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .container { 
                    max-width: 400px; 
                    margin: 0 auto; 
                    background: white; 
                    padding: 30px; 
                    border-radius: 10px; 
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                h1 { color: #25D366; margin-bottom: 20px; }
                #qrcode { margin: 20px 0; }
                .instructions { 
                    color: #666; 
                    margin-top: 20px; 
                    line-height: 1.5;
                }
                .status { 
                    background-color: #e8f5e8; 
                    padding: 10px; 
                    border-radius: 5px; 
                    margin-bottom: 20px;
                    color: #2d5a2d;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📱 WhatsApp Connection</h1>
                <div class="status">
                    Status: Waiting for QR Code scan...
                </div>
                <div id="qrcode"></div>
                <div class="instructions">
                    <h3>Como conectar:</h3>
                    <ol style="text-align: left;">
                        <li>Abra o WhatsApp no seu celular</li>
                        <li>Vá em Menu > Dispositivos conectados</li>
                        <li>Toque em "Conectar um dispositivo"</li>
                        <li>Escaneie o QR Code acima</li>
                    </ol>
                    <p><strong>Aguarde alguns segundos após escanear!</strong></p>
                    <button id="checkStatusBtn" style="background: #25D366; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                        Verificar Status
                    </button>
                </div>
            </div>
            
            <script>
                // Generate QR Code
                console.log('QR Code data:', '${status.qr_code}');
                
                // Wait for QRCode library to load
                function generateQRCode() {
                    if (typeof QRCode === 'undefined') {
                        console.log('QRCode library not loaded yet, retrying...');
                        setTimeout(generateQRCode, 1000);
                        return;
                    }
                    
                    try {
                        console.log('Generating QR Code...');
                        QRCode.toCanvas(document.getElementById('qrcode'), '${status.qr_code}', {
                            width: 256,
                            margin: 2,
                            color: {
                                dark: '#000000',
                                light: '#FFFFFF'
                            }
                        }, function(error) {
                            if (error) {
                                console.error('QR Code generation error:', error);
                                // Fallback: show text version
                                document.getElementById('qrcode').innerHTML = \`
                                    <div style="border: 2px solid #25D366; padding: 20px; margin: 10px 0; border-radius: 10px;">
                                        <h3>❌ Erro ao gerar QR visual</h3>
                                        <p><strong>Use este código no WhatsApp:</strong></p>
                                        <textarea readonly style="width: 100%; height: 100px; font-family: monospace; font-size: 12px; word-break: break-all;">${status.qr_code}</textarea>
                                        <p><small>Copie o código acima e use a opção "Pareamento por código" no WhatsApp</small></p>
                                    </div>
                                \`;
                            } else {
                                console.log('QR Code generated successfully');
                            }
                        });
                    } catch (error) {
                        console.error('QR Code library error:', error);
                        // Ultimate fallback: use online QR service
                        const qrData = encodeURIComponent('${status.qr_code}');
                        document.getElementById('qrcode').innerHTML = \`
                            <div style="border: 2px solid #25D366; padding: 20px; margin: 10px 0; border-radius: 10px;">
                                <h3>🔄 QR Code (Fallback)</h3>
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=\${qrData}" 
                                     alt="WhatsApp QR Code" 
                                     style="max-width: 256px; border: 1px solid #ccc;"
                                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                                <div style="display: none;">
                                    <p><strong>Código manual:</strong></p>
                                    <textarea readonly style="width: 100%; height: 80px; font-family: monospace; font-size: 10px;">${status.qr_code}</textarea>
                                </div>
                            </div>
                        \`;
                    }
                }
                
                // Start QR generation when page loads
                generateQRCode();
                
                // Check connection status
                async function checkStatus() {
                    try {
                        const response = await fetch('/api/messages/status', {
                            method: 'GET',
                            credentials: 'same-origin',
                            headers: { 
                                'Authorization': 'Basic ' + btoa('admin:a1b2c3'),
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        if (!response.ok) {
                            throw new Error('Network response was not ok: ' + response.status);
                        }
                        
                        const data = await response.json();
                        
                        if (data.data.is_ready) {
                            document.querySelector('.status').innerHTML = '✅ WhatsApp conectado com sucesso!';
                            document.querySelector('.status').style.backgroundColor = '#d4edda';
                            document.querySelector('.status').style.color = '#155724';
                            document.getElementById('qrcode').innerHTML = '<h2>✅ Conectado!</h2>';
                        } else if (!data.data.has_qr_code) {
                            location.reload(); // Reload to get new QR code
                        }
                    } catch (error) {
                        console.error('Error checking status:', error);
                        document.querySelector('.status').innerHTML = '❌ Erro ao verificar status: ' + error.message;
                        document.querySelector('.status').style.backgroundColor = '#f8d7da';
                        document.querySelector('.status').style.color = '#721c24';
                    }
                }
                
                // Add event listener to button
                document.getElementById('checkStatusBtn').addEventListener('click', checkStatus);
                
                // Auto-check status every 5 seconds
                setInterval(checkStatus, 5000);
            </script>
        </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      res.send(qrCodeHtml);
    } else {
      const status = await whatsAppService.getStatus();
      const statusHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>WhatsApp Status</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    text-align: center; 
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .container { 
                    max-width: 400px; 
                    margin: 0 auto; 
                    background: white; 
                    padding: 30px; 
                    border-radius: 10px; 
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                h1 { color: #25D366; }
                .status { padding: 20px; border-radius: 5px; margin: 20px 0; }
                .connected { background-color: #d4edda; color: #155724; }
                .disconnected { background-color: #f8d7da; color: #721c24; }
                button { 
                    background: #25D366; 
                    color: white; 
                    border: none; 
                    padding: 10px 20px; 
                    border-radius: 5px; 
                    cursor: pointer; 
                    margin: 5px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📱 WhatsApp Status</h1>
                <div class="status ${status.is_ready ? 'connected' : 'disconnected'}">
                    ${status.is_ready ? '✅ WhatsApp Conectado' : '❌ WhatsApp Desconectado'}
                </div>
                <div style="text-align: left;">
                    <p><strong>Status:</strong> ${status.status_text}</p>
                    <p><strong>Cliente existe:</strong> ${status.client_exists ? 'Sim' : 'Não'}</p>
                    <p><strong>Conectando:</strong> ${status.is_connecting ? 'Sim' : 'Não'}</p>
                    <p><strong>Tem QR Code:</strong> ${status.has_qr_code ? 'Sim' : 'Não'}</p>
                </div>
                <button id="connectBtn">Conectar WhatsApp</button>
                <button id="refreshBtn">Atualizar</button>
            </div>
            
            <script>
                async function connect() {
                    try {
                        const response = await fetch('/api/messages/connect', {
                            method: 'POST',
                            credentials: 'same-origin',
                            headers: { 
                                'Authorization': 'Basic ' + btoa('admin:a1b2c3'),
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        if (!response.ok) {
                            throw new Error('Network response was not ok: ' + response.status);
                        }
                        
                        const data = await response.json();
                        
                        if (data.success) {
                            setTimeout(() => location.reload(), 2000);
                        } else {
                            alert('Erro ao conectar: ' + data.message);
                        }
                    } catch (error) {
                        alert('Erro na requisição: ' + error.message);
                    }
                }
                
                // Add event listeners
                document.getElementById('connectBtn').addEventListener('click', connect);
                document.getElementById('refreshBtn').addEventListener('click', () => location.reload());
            </script>
        </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      res.send(statusHtml);
    }
  } catch (error) {
    logger.error('Error getting QR code:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to get QR code',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;