require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const database = require('./config/database');
const redis = require('./config/redis');

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

class JulinhoAPI {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 4000;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));

    // CORS configuration - Allow all origins for now, adjust as needed
    this.app.use(cors({
      origin: true, // Allow all origins
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
    }));

    // Rate limiting - More generous for API consumption
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per minute
      message: {
        error: 'Too many requests',
        message: 'API rate limit exceeded. Please slow down and try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
      // Skip rate limiting for health check
      skip: (req) => req.path === '/api/health'
    });
    
    this.app.use('/api/', limiter);

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        query: req.query
      });
      next();
    });
  }

  setupRoutes() {
    // Health check endpoints
    this.app.use('/api/health', require('./routes/health'));
    
    // Legacy health endpoint (outside /api for load balancers)
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'julinho-api'
      });
    });

    // Main API routes
    this.app.use('/api/reports', require('./routes/reports'));
    this.app.use('/api/messages', require('./routes/messages'));
    
    // Legacy API routes (for backward compatibility)
    this.app.use('/api', require('./routes/analytics'));

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Julinho WhatsApp IA - Analytics & Reports API',
        version: '1.0.0',
        endpoints: {
          health_basic: '/api/health',
          health_detailed: '/api/health/detailed',
          reports_overview: '/api/reports',
          geographic_overview: '/api/reports/geographic/overview',
          heavy_users: '/api/reports/users/heavy',
          contacts_list: '/api/reports/contacts',
          // WhatsApp Broadcast endpoints
          broadcast_preview: '/api/messages/broadcast/preview',
          broadcast_send: 'POST /api/messages/broadcast',
          whatsapp_status: '/api/messages/status',
          whatsapp_qr_page: '/api/messages/qr',
          whatsapp_connect: 'POST /api/messages/connect',
          whatsapp_disconnect: 'POST /api/messages/disconnect',
          // Legacy endpoints (deprecated)
          legacy_dashboard: '/api/dashboard',
          legacy_heavy_users: '/api/heavy-users',
          legacy_contacts: '/api/contacts'
        },
        authentication: {
          type: 'Basic Auth (for /api/reports and /api/messages endpoints)',
          username: 'admin',
          password: 'DASHBOARD_SECRET env variable'
        },
        documentation: 'See API documentation for complete endpoint list'
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        availableEndpoints: [
          '/api/health',
          '/api/reports',
          '/api/reports/geographic/overview',
          '/api/reports/users/heavy',
          '/api/reports/contacts',
          '/api/messages/broadcast/preview',
          '/api/messages/broadcast',
          '/api/messages/status',
          '/api/messages/qr',
          '/api/messages/connect'
        ],
        documentation: 'Visit / for complete endpoint documentation'
      });
    });
  }

  setupErrorHandling() {
    // Global error handler
    this.app.use((error, req, res, next) => {
      logger.error('API Error:', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
      });

      const statusCode = error.statusCode || 500;
      const message = process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : error.message;

      res.status(statusCode).json({
        error: 'API Error',
        message: message,
        timestamp: new Date().toISOString()
      });
    });

    // Unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    // Uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  }

  async start() {
    try {
      // Test database connection
      const isConnected = await database.testConnection();
      if (!isConnected) {
        throw new Error('Failed to connect to database');
      }

      // Start server
      this.server = this.app.listen(this.port, () => {
        logger.info(`🚀 Julinho Analytics API started on port ${this.port}`);
        logger.info(`📊 Dashboard available at http://localhost:${this.port}/api/dashboard`);
        logger.info(`👥 Heavy Users API at http://localhost:${this.port}/api/heavy-users`);
        logger.info(`🏥 Health check at http://localhost:${this.port}/health`);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => this.stop());
      process.on('SIGINT', () => this.stop());

    } catch (error) {
      logger.error('Failed to start API server:', error);
      process.exit(1);
    }
  }

  async stop() {
    logger.info('🛑 Shutting down API server...');
    
    if (this.server) {
      this.server.close(() => {
        logger.info('✅ HTTP server closed');
      });
    }

    await database.close();
    logger.info('✅ Database connection closed');
    
    await redis.close();
    logger.info('✅ Redis connection closed');
    
    process.exit(0);
  }
}

// Start the API server
if (require.main === module) {
  const api = new JulinhoAPI();
  api.start().catch(console.error);
}

module.exports = JulinhoAPI;