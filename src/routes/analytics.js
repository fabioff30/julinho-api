const express = require('express');
const analyticsService = require('../services/analytics.service');
const router = express.Router();

// Dashboard metrics endpoint
router.get('/dashboard', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const metrics = await analyticsService.getDashboardMetrics(parseInt(days));
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to fetch dashboard metrics' 
    });
  }
});

// Heavy users endpoint
router.get('/heavy-users', async (req, res) => {
  try {
    const { days = 30, limit = 20 } = req.query;
    const heavyUsers = await analyticsService.getHeavyUsers(
      parseInt(days), 
      parseInt(limit)
    );
    res.json(heavyUsers);
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to fetch heavy users' 
    });
  }
});

// Contacts endpoint
router.get('/contacts', async (req, res) => {
  try {
    const { 
      limit = 100, 
      days = 30, 
      engagement_level = null 
    } = req.query;
    
    const contacts = await analyticsService.getContacts(
      parseInt(limit), 
      parseInt(days), 
      engagement_level
    );
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to fetch contacts' 
    });
  }
});

// Export contacts endpoint
router.get('/export/contacts', async (req, res) => {
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
      res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
      res.send(exported);
    } else {
      res.json(exported);
    }
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to export contacts' 
    });
  }
});

// Top users endpoint
router.get('/top-users', async (req, res) => {
  try {
    const { days = 30, limit = 10 } = req.query;
    const topUsers = await analyticsService.getTopUsers(
      parseInt(days), 
      parseInt(limit)
    );
    res.json({ users: topUsers, generated_at: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to fetch top users' 
    });
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const database = require('../config/database');
    const isHealthy = await database.testConnection();
    
    res.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      database: isHealthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      api_version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;