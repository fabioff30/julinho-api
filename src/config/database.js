const { Pool } = require('pg');
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

class Database {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    // Handle pool errors
    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle client:', err);
    });

    logger.info('Database pool initialized');
  }

  async query(text, params) {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      logger.debug('Query executed', { 
        query: text.substring(0, 100) + '...', 
        duration: duration + 'ms',
        rows: res.rowCount 
      });
      return res;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error('Query error', { 
        query: text.substring(0, 100) + '...', 
        duration: duration + 'ms', 
        error: error.message 
      });
      throw error;
    }
  }

  async getClient() {
    const client = await this.pool.connect();
    return client;
  }

  async close() {
    await this.pool.end();
    logger.info('Database pool closed');
  }

  async testConnection() {
    try {
      const result = await this.query('SELECT NOW() as current_time');
      logger.info('Database connection successful:', result.rows[0]);
      return true;
    } catch (error) {
      logger.error('Database connection failed:', error);
      return false;
    }
  }
}

module.exports = new Database();