const express = require('express');
const database = require('../config/database');
const { authenticateBasic } = require('../middleware/auth');
const winston = require('winston');
const router = express.Router();

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

// Apply authentication to all usage routes
router.use(authenticateBasic);

// Usage Distribution endpoint
router.get('/distribution', async (req, res) => {
  try {
    const query = `
      SELECT 
        engagement_level,
        COUNT(*) as user_count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM contacts)), 2) as percentage,
        ROUND(AVG(total_messages), 2) as avg_messages,
        ROUND(AVG(avg_messages_per_day), 2) as avg_daily_messages
      FROM contacts
      WHERE last_interaction >= NOW() - INTERVAL '365 days'
      GROUP BY engagement_level
      ORDER BY 
        CASE engagement_level 
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3
          ELSE 4 
        END
    `;

    const result = await database.query(query);

    const distribution = result.rows.map(row => ({
      engagement_level: row.engagement_level,
      user_count: parseInt(row.user_count),
      percentage: parseFloat(row.percentage) || 0,
      avg_messages: parseFloat(row.avg_messages) || 0,
      avg_daily_messages: parseFloat(row.avg_daily_messages) || 0
    }));

    // Calculate totals
    const totals = {
      total_users: distribution.reduce((sum, level) => sum + level.user_count, 0),
      total_messages: await database.query('SELECT SUM(total_messages) as total FROM contacts')
        .then(result => parseInt(result.rows[0]?.total) || 0)
    };

    res.json({
      distribution,
      totals,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error getting usage distribution:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to fetch usage distribution',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;