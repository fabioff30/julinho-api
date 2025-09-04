const basicAuth = require('basic-auth');
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

const authenticateBasic = (req, res, next) => {
  const credentials = basicAuth(req);
  
  if (!credentials) {
    logger.warn('Authentication failed: No credentials provided', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent')
    });
    
    res.set('WWW-Authenticate', 'Basic realm="Julinho Dashboard API"');
    return res.status(401).json({
      error: 'Authentication required',
      message: 'This endpoint requires Basic Authentication with admin credentials'
    });
  }

  const expectedUsername = 'admin';
  const expectedPassword = process.env.DASHBOARD_SECRET;

  if (!expectedPassword) {
    logger.error('DASHBOARD_SECRET not configured in environment variables');
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'Authentication not properly configured'
    });
  }

  if (credentials.name !== expectedUsername || credentials.pass !== expectedPassword) {
    logger.warn('Authentication failed: Invalid credentials', {
      providedUsername: credentials.name,
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent')
    });
    
    res.set('WWW-Authenticate', 'Basic realm="Julinho Dashboard API"');
    return res.status(401).json({
      error: 'Invalid credentials',
      message: 'Username must be "admin" and password must match DASHBOARD_SECRET'
    });
  }

  logger.info('Authentication successful', {
    username: credentials.name,
    ip: req.ip,
    path: req.path
  });

  next();
};

module.exports = {
  authenticateBasic
};