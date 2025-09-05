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
    const status = whatsAppService.getStatus();
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

module.exports = router;