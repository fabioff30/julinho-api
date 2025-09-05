const { Client, LocalAuth } = require('whatsapp-web.js');
const winston = require('winston');
const database = require('../config/database');

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

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.isConnecting = false;
    this.qrCode = null;
    this.sessionPath = process.env.WHATSAPP_SESSION_PATH || './whatsapp-session';
  }

  async initialize() {
    if (this.client || this.isConnecting) {
      logger.warn('WhatsApp client already initialized or connecting');
      return;
    }

    this.isConnecting = true;
    logger.info('Initializing WhatsApp client...');

    try {
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: 'julinho-broadcast',
          dataPath: this.sessionPath
        }),
        puppeteer: {
          headless: true,
          executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
          ]
        }
      });

      this.client.on('qr', (qr) => {
        this.qrCode = qr;
        logger.info('QR Code received. Scan with WhatsApp to authenticate.');
      });

      this.client.on('ready', () => {
        this.isReady = true;
        this.isConnecting = false;
        this.qrCode = null;
        logger.info('WhatsApp client is ready!');
      });

      this.client.on('authenticated', () => {
        logger.info('WhatsApp client authenticated');
      });

      this.client.on('auth_failure', (message) => {
        logger.error('Authentication failed:', message);
        this.isConnecting = false;
        this.isReady = false;
      });

      this.client.on('disconnected', (reason) => {
        logger.warn('WhatsApp client disconnected:', reason);
        this.isReady = false;
        this.isConnecting = false;
      });

      await this.client.initialize();
    } catch (error) {
      logger.error('Failed to initialize WhatsApp client:', error);
      this.isConnecting = false;
      throw error;
    }
  }

  async getEligibleContacts() {
    try {
      const query = `
        SELECT DISTINCT 
          c.phone,
          c.name as last_message_preview,
          c.total_messages,
          c.engagement_level
        FROM contacts c
        WHERE c.total_messages > 0 
          AND c.phone IS NOT NULL 
          AND c.phone != ''
        ORDER BY c.total_messages DESC
      `;

      const result = await database.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error getting eligible contacts:', error);
      throw error;
    }
  }

  async getEligibleContactsCount() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_contacts,
          COUNT(CASE WHEN c.engagement_level = 'high' THEN 1 END) as high_engagement,
          COUNT(CASE WHEN c.engagement_level = 'medium' THEN 1 END) as medium_engagement,
          COUNT(CASE WHEN c.engagement_level = 'low' THEN 1 END) as low_engagement
        FROM contacts c
        WHERE c.total_messages > 0 
          AND c.phone IS NOT NULL 
          AND c.phone != ''
      `;

      const result = await database.query(query);
      const stats = result.rows[0];

      return {
        total_eligible_contacts: parseInt(stats.total_contacts) || 0,
        criteria: "Contatos que enviaram pelo menos 1 mensagem",
        breakdown: {
          high_engagement: parseInt(stats.high_engagement) || 0,
          medium_engagement: parseInt(stats.medium_engagement) || 0,
          low_engagement: parseInt(stats.low_engagement) || 0
        },
        estimated_delivery_time: this.calculateEstimatedTime(parseInt(stats.total_contacts) || 0),
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting eligible contacts count:', error);
      throw error;
    }
  }

  calculateEstimatedTime(contactCount) {
    if (contactCount === 0) return '0 minutos';
    
    // Assuming 1 message per 2 seconds to avoid being flagged as spam
    const secondsPerMessage = 2;
    const totalSeconds = contactCount * secondsPerMessage;
    const minutes = Math.ceil(totalSeconds / 60);
    
    if (minutes < 1) return 'Menos de 1 minuto';
    if (minutes < 60) return `${minutes} minutos`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  }

  async sendBroadcastMessage(message) {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready. Please connect first.');
    }

    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    logger.info('Starting broadcast message sending...');

    const contacts = await this.getEligibleContacts();
    const results = {
      total_contacts: contacts.length,
      successful_sends: 0,
      failed_sends: 0,
      errors: [],
      started_at: new Date().toISOString(),
      completed_at: null
    };

    for (const contact of contacts) {
      try {
        // Format phone number for WhatsApp (remove non-digits, add @c.us)
        const phoneNumber = contact.phone.replace(/\D/g, '');
        const chatId = phoneNumber + '@c.us';

        await this.client.sendMessage(chatId, message);
        results.successful_sends++;
        
        logger.info(`Message sent successfully to ${this.maskPhone(contact.phone)}`);

        // Add delay between messages to avoid spam detection
        await this.delay(2000); // 2 seconds between messages
      } catch (error) {
        results.failed_sends++;
        results.errors.push({
          phone: this.maskPhone(contact.phone),
          error: error.message
        });
        
        logger.error(`Failed to send message to ${this.maskPhone(contact.phone)}:`, error.message);
      }
    }

    results.completed_at = new Date().toISOString();
    logger.info('Broadcast completed:', results);

    // Log broadcast to database
    await this.logBroadcast(message, results);

    return results;
  }

  async logBroadcast(message, results) {
    try {
      const query = `
        INSERT INTO broadcast_logs (
          message_content, 
          total_contacts, 
          successful_sends, 
          failed_sends, 
          started_at, 
          completed_at,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `;

      await database.query(query, [
        message,
        results.total_contacts,
        results.successful_sends,
        results.failed_sends,
        results.started_at,
        results.completed_at
      ]);
    } catch (error) {
      logger.error('Failed to log broadcast to database:', error);
    }
  }

  maskPhone(phone) {
    if (!phone || phone.length < 8) return phone;
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 8) return phone;
    return digits.slice(0, -4) + '****';
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    return {
      is_ready: this.isReady,
      is_connecting: this.isConnecting,
      has_qr_code: !!this.qrCode,
      client_exists: !!this.client
    };
  }

  getQRCode() {
    return this.qrCode;
  }

  async disconnect() {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
      this.isReady = false;
      this.isConnecting = false;
      this.qrCode = null;
      logger.info('WhatsApp client disconnected');
    }
  }
}

module.exports = new WhatsAppService();