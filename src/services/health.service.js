const database = require('../config/database');
const redis = require('../config/redis');
const winston = require('winston');

// Logger configuration
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

class HealthService {
  constructor() {
    this.startTime = Date.now();
  }

  getUptime() {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      used: Math.round(usage.rss / 1024 / 1024), // MB
      total: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heap_used: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024) // MB
    };
  }

  async checkDatabase() {
    try {
      const result = await database.query('SELECT NOW() as current_time, version() as version');
      return {
        status: 'connected',
        response_time_ms: null,
        version: result.rows[0]?.version?.split(' ')[0] || 'Unknown'
      };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return {
        status: 'disconnected',
        error: error.message,
        response_time_ms: null
      };
    }
  }

  async checkRedis() {
    try {
      const start = Date.now();
      const pingResult = await redis.ping();
      const responseTime = Date.now() - start;

      if (pingResult) {
        return {
          status: 'connected',
          response_time_ms: responseTime,
          connection_state: redis.getStatus().status
        };
      } else {
        return {
          status: 'disconnected',
          error: 'Ping failed',
          response_time_ms: responseTime
        };
      }
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return {
        status: 'disconnected',
        error: error.message,
        response_time_ms: null
      };
    }
  }

  // Mock checks for services that would exist in the main Julinho application
  checkWhatsApp() {
    // This would check WhatsApp connection status in the main app
    return {
      status: 'ready', // Mock status - could be 'ready', 'connecting', 'disconnected'
      number: '558499401840', // Mock number from documentation
      session_active: true
    };
  }

  checkAI() {
    // This would check AI service status in the main app
    return {
      status: 'operational', // Mock status
      model: 'gemini-2.0-flash-exp', // Mock model from documentation
      last_request: new Date().toISOString()
    };
  }

  checkBrevo() {
    // This would check Brevo (email service) status in the main app
    return {
      status: 'active', // Mock status
      api_key_valid: true
    };
  }

  async getBasicHealth() {
    return {
      status: 'ok',
      service: 'Julinho WhatsApp IA',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    };
  }

  async getDetailedHealth() {
    try {
      const [databaseStatus, redisStatus] = await Promise.all([
        this.checkDatabase(),
        this.checkRedis()
      ]);

      const whatsappStatus = this.checkWhatsApp();
      const aiStatus = this.checkAI();
      const brevoStatus = this.checkBrevo();

      const allServicesUp = 
        databaseStatus.status === 'connected' &&
        redisStatus.status === 'connected' &&
        whatsappStatus.status === 'ready' &&
        aiStatus.status === 'operational' &&
        brevoStatus.status === 'active';

      return {
        status: allServicesUp ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: this.getUptime(),
        memory: this.getMemoryUsage(),
        services: {
          redis: redisStatus,
          database: databaseStatus,
          whatsapp: whatsappStatus,
          ai: aiStatus,
          brevo: brevoStatus
        }
      };

    } catch (error) {
      logger.error('Error getting detailed health:', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        services: {}
      };
    }
  }

  async performHealthCheck() {
    try {
      const start = Date.now();
      const detailed = await this.getDetailedHealth();
      const responseTime = Date.now() - start;

      return {
        ...detailed,
        response_time_ms: responseTime,
        checks_completed_at: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }
}

module.exports = new HealthService();