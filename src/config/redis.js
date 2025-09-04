const redis = require('redis');
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
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/api.log' })
  ]
});

class RedisClient {
  constructor() {
    this.client = null;
    this.connected = false;
    this.init();
  }

  async init() {
    try {
      this.client = redis.createClient({
        socket: {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
          connectTimeout: 5000,
          reconnectStrategy: (retries) => {
            if (retries > 3) {
              logger.warn('Redis max retries reached, giving up');
              return false;
            }
            return Math.min(retries * 50, 1000);
          }
        },
        password: process.env.REDIS_PASSWORD
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.connected = true;
      });

      this.client.on('error', (err) => {
        logger.warn('Redis client error (continuing without Redis):', err.code || err.message);
        this.connected = false;
      });

      this.client.on('end', () => {
        logger.info('Redis client disconnected');
        this.connected = false;
      });

      await this.client.connect();
      logger.info('Redis client initialized successfully');

    } catch (error) {
      logger.warn('Failed to initialize Redis client (continuing without Redis):', error.code || error.message);
      this.connected = false;
      this.client = null;
    }
  }

  async get(key) {
    try {
      if (!this.connected || !this.client) return null;
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key, value, ttl = null) {
    try {
      if (!this.connected || !this.client) return false;
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      if (!this.connected || !this.client) return false;
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      if (!this.connected || !this.client) return false;
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      return false;
    }
  }

  async ping() {
    try {
      if (!this.connected || !this.client) return false;
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis PING error:', error);
      return false;
    }
  }

  getStatus() {
    return {
      connected: this.connected,
      ready: this.client?.isReady || false,
      status: this.connected ? 'connected' : 'disconnected'
    };
  }

  async close() {
    try {
      if (this.client) {
        await this.client.disconnect();
        logger.info('Redis client closed');
      }
    } catch (error) {
      logger.error('Error closing Redis client:', error);
    }
  }
}

module.exports = new RedisClient();