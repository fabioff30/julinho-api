const database = require('../config/database');
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

class AnalyticsService {
  constructor() {
    this.phoneCache = new Map();
  }

  maskPhone(phone) {
    if (!phone || phone.length < 8) return phone;
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 8) return phone;
    return digits.slice(0, -4) + '****';
  }

  // Heavy Users Functions
  async getHeavyUsers(days = 30, limit = 20) {
    try {
      const query = `
        SELECT 
          c.phone,
          c.name as last_message_preview,
          c.email,
          c.total_messages,
          c.messages_sent_by_user,
          c.messages_sent_by_bot,
          c.first_interaction,
          c.last_interaction,
          c.days_active,
          c.avg_messages_per_day,
          c.engagement_level,
          c.is_lead,
          CASE 
            WHEN c.total_messages >= 100 THEN 'super_heavy'
            WHEN c.total_messages >= 50 THEN 'heavy'
            WHEN c.avg_messages_per_day >= 10 THEN 'high_frequency'
            ELSE 'regular'
          END as user_category,
          CASE 
            WHEN c.total_messages >= 100 OR c.avg_messages_per_day >= 15 THEN 'vip_campaign'
            WHEN c.total_messages >= 50 OR c.avg_messages_per_day >= 10 THEN 'retention'
            ELSE 'activation'
          END as recommended_for
        FROM contacts c
        WHERE c.last_interaction >= NOW() - INTERVAL '${days} days'
        ORDER BY c.total_messages DESC, c.avg_messages_per_day DESC
        LIMIT $1
      `;

      const result = await database.query(query, [limit]);
      
      // Calculate statistics
      const stats = {
        total_users: result.rows.length,
        super_heavy_users: result.rows.filter(u => u.user_category === 'super_heavy').length,
        heavy_users: result.rows.filter(u => u.user_category === 'heavy').length,
        high_frequency_users: result.rows.filter(u => u.user_category === 'high_frequency').length,
        avg_messages: result.rows.length > 0 ? 
          Math.round(result.rows.reduce((sum, u) => sum + parseInt(u.total_messages), 0) / result.rows.length) : 0,
        total_messages: result.rows.reduce((sum, u) => sum + parseInt(u.total_messages), 0)
      };

      return {
        users: result.rows.map(user => ({
          ...user,
          phone: this.maskPhone(user.phone)
        })),
        statistics: stats,
        criteria: `Last ${days} days, top ${limit} users`,
        generated_at: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error('Error getting heavy users:', error);
      return { users: [], statistics: {}, error: 'Failed to fetch heavy users' };
    }
  }

  async getContacts(limit = 100, days = 30, engagementLevel = null) {
    try {
      let whereClause = `WHERE c.last_interaction >= NOW() - INTERVAL '${days} days'`;
      
      if (engagementLevel && ['high', 'medium', 'low'].includes(engagementLevel)) {
        whereClause += ` AND c.engagement_level = '${engagementLevel}'`;
      }

      const query = `
        SELECT 
          c.phone,
          c.name as last_message_preview,
          c.email,
          c.first_interaction,
          c.last_interaction,
          c.total_messages,
          c.messages_sent_by_user,
          c.messages_sent_by_bot,
          c.days_active,
          c.avg_messages_per_day,
          c.engagement_level,
          c.is_lead
        FROM contacts c
        ${whereClause}
        ORDER BY c.total_messages DESC, c.last_interaction DESC
        LIMIT $1
      `;

      const result = await database.query(query, [limit]);
      const totalResult = await database.query(`
        SELECT COUNT(*) as total_contacts 
        FROM contacts c 
        ${whereClause}
      `);

      return {
        contacts: result.rows.map(contact => ({
          ...contact,
          phone: this.maskPhone(contact.phone)
        })),
        total_contacts: parseInt(totalResult.rows[0]?.total_contacts) || 0,
        pagination: { limit, offset: 0 }
      };
      
    } catch (error) {
      logger.error('Error getting contacts:', error);
      return { contacts: [], total_contacts: 0 };
    }
  }

  async exportContacts(minMessages = 1, days = 30, format = 'json') {
    try {
      const query = `
        SELECT 
          c.phone,
          c.name as last_message_preview,
          c.email,
          c.total_messages,
          c.engagement_level,
          c.last_interaction,
          c.is_lead,
          CASE 
            WHEN c.total_messages >= 100 OR c.avg_messages_per_day >= 15 THEN 'vip_campaign'
            WHEN c.total_messages >= 50 OR c.avg_messages_per_day >= 10 THEN 'retention'
            ELSE 'activation'
          END as recommended_for
        FROM contacts c
        WHERE c.total_messages >= $1 
          AND c.last_interaction >= NOW() - INTERVAL '${days} days'
        ORDER BY c.total_messages DESC
      `;

      const result = await database.query(query, [minMessages]);
      
      if (format === 'csv') {
        const headers = 'phone,last_message_preview,email,total_messages,engagement_level,last_interaction,is_lead,recommended_for';
        const rows = result.rows.map(row => 
          `${row.phone},"${row.last_message_preview || ''}","${row.email || ''}",${row.total_messages},${row.engagement_level},${row.last_interaction},${row.is_lead},${row.recommended_for}`
        );
        return headers + '\n' + rows.join('\n');
      }

      return {
        exported_at: new Date().toISOString(),
        total_contacts: result.rows.length,
        criteria: `minimum ${minMessages} messages in ${days} days`,
        contacts: result.rows.map(contact => ({
          ...contact,
          phone: this.maskPhone(contact.phone)
        }))
      };
      
    } catch (error) {
      logger.error('Error exporting contacts:', error);
      return format === 'csv' ? '' : { contacts: [] };
    }
  }

  async getDashboardMetrics(days = 30) {
    try {
      const queries = [
        // Total contacts and messages
        database.query(`
          SELECT 
            COUNT(DISTINCT c.phone) as total_contacts,
            SUM(c.total_messages) as total_messages,
            COUNT(CASE WHEN c.is_lead = true THEN 1 END) as total_leads,
            AVG(c.total_messages) as avg_messages_per_contact
          FROM contacts c
          WHERE c.last_interaction >= NOW() - INTERVAL '${days} days'
        `),
        // Engagement distribution
        database.query(`
          SELECT 
            engagement_level,
            COUNT(*) as count
          FROM contacts c
          WHERE c.last_interaction >= NOW() - INTERVAL '${days} days'
          GROUP BY engagement_level
        `),
        // Heavy users count
        database.query(`
          SELECT 
            COUNT(CASE WHEN c.total_messages >= 100 THEN 1 END) as super_heavy,
            COUNT(CASE WHEN c.total_messages >= 50 AND c.total_messages < 100 THEN 1 END) as heavy,
            COUNT(CASE WHEN c.avg_messages_per_day >= 10 AND c.total_messages < 50 THEN 1 END) as high_frequency
          FROM contacts c
          WHERE c.last_interaction >= NOW() - INTERVAL '${days} days'
        `)
      ];

      const [metricsResult, engagementResult, heavyUsersResult] = await Promise.all(queries);
      
      const metrics = metricsResult.rows[0];
      const engagement = engagementResult.rows.reduce((acc, row) => {
        acc[row.engagement_level] = parseInt(row.count);
        return acc;
      }, {});

      const heavyUsers = heavyUsersResult.rows[0];

      return {
        summary: {
          total_contacts: parseInt(metrics.total_contacts) || 0,
          total_messages: parseInt(metrics.total_messages) || 0,
          total_leads: parseInt(metrics.total_leads) || 0,
          avg_messages_per_contact: Math.round(parseFloat(metrics.avg_messages_per_contact) || 0)
        },
        engagement: {
          high: engagement.high || 0,
          medium: engagement.medium || 0,
          low: engagement.low || 0
        },
        heavy_users: {
          super_heavy: parseInt(heavyUsers.super_heavy) || 0,
          heavy: parseInt(heavyUsers.heavy) || 0,
          high_frequency: parseInt(heavyUsers.high_frequency) || 0
        },
        period: `Last ${days} days`,
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting dashboard metrics:', error);
      return { error: 'Failed to fetch dashboard metrics' };
    }
  }

  async getTopUsers(days = 30, limit = 10) {
    try {
      const result = await database.query(`
        SELECT 
          phone,
          COUNT(DISTINCT conv.id) as conversation_count,
          COUNT(msg.id) as message_count,
          MAX(conv.started_at) as last_conversation,
          BOOL_OR(conv.lead_captured) as has_lead
        FROM conversations conv
        LEFT JOIN messages msg ON conv.id = msg.conversation_id
        WHERE conv.started_at >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY phone
        ORDER BY conversation_count DESC, message_count DESC
        LIMIT $1
      `, [limit]);

      return result.rows.map(row => ({
        ...row,
        phone: this.maskPhone(row.phone)
      }));
    } catch (error) {
      logger.error('Error getting top users:', error);
      return [];
    }
  }
}

module.exports = new AnalyticsService();