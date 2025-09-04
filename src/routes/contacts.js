const express = require('express');
const analyticsService = require('../services/analytics.service');
const { authenticateBasic } = require('../middleware/auth');
const router = express.Router();

// Apply authentication to all contact routes
router.use(authenticateBasic);

// List contacts with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      limit = 100, 
      offset = 0,
      engagement = null,
      days = 30
    } = req.query;
    
    const contacts = await analyticsService.getContacts(
      parseInt(limit), 
      parseInt(days), 
      engagement
    );

    // Add pagination info
    const response = {
      ...contacts,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: contacts.contacts.length === parseInt(limit)
      },
      filters_applied: {
        engagement_level: engagement,
        days_lookback: parseInt(days)
      }
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to fetch contacts',
      timestamp: new Date().toISOString()
    });
  }
});

// Export contacts
router.get('/export', async (req, res) => {
  try {
    const { 
      min_messages = 1, 
      days = 30, 
      format = 'json' 
    } = req.query;
    
    const exported = await analyticsService.exportContacts(
      parseInt(min_messages), 
      parseInt(days), 
      format
    );
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=julinho-contacts.csv');
      res.send(exported);
    } else {
      res.json(exported);
    }
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to export contacts',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;