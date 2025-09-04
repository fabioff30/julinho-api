const express = require('express');
const analyticsService = require('../services/analytics.service');
const { authenticateBasic } = require('../middleware/auth');
const router = express.Router();

// Apply authentication to all user routes
router.use(authenticateBasic);

// Heavy Users endpoint
router.get('/heavy', async (req, res) => {
  try {
    const { days = 30, limit = 50 } = req.query;
    const heavyUsers = await analyticsService.getHeavyUsers(
      parseInt(days), 
      parseInt(limit)
    );
    res.json(heavyUsers);
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to fetch heavy users',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;