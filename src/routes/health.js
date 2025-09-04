const express = require('express');
const healthService = require('../services/health.service');
const router = express.Router();

// Basic health check (no auth required)
router.get('/', async (req, res) => {
  try {
    const health = await healthService.getBasicHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Detailed health check (no auth required)
router.get('/detailed', async (req, res) => {
  try {
    const health = await healthService.getDetailedHealth();
    
    // Set appropriate HTTP status based on health
    const statusCode = health.status === 'ok' ? 200 : 
                      health.status === 'degraded' ? 206 : 500;
    
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Detailed health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Complete health check with performance metrics (no auth required)
router.get('/check', async (req, res) => {
  try {
    const health = await healthService.performHealthCheck();
    
    const statusCode = health.status === 'ok' ? 200 : 
                      health.status === 'degraded' ? 206 : 500;
    
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;