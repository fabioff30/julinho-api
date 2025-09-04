const express = require('express');
const geographicService = require('../services/geographic.service');
const { authenticateBasic } = require('../middleware/auth');
const router = express.Router();

// Apply authentication to all geographic routes
router.use(authenticateBasic);

// Geographic Overview
router.get('/overview', async (req, res) => {
  try {
    const overview = await geographicService.getGeographicOverview();
    res.json(overview);
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch geographic overview',
      timestamp: new Date().toISOString()
    });
  }
});

// States Ranking
router.get('/states', async (req, res) => {
  try {
    const states = await geographicService.getStateRanking();
    res.json(states);
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch states ranking',
      timestamp: new Date().toISOString()
    });
  }
});

// Cities/DDDs Ranking
router.get('/cities', async (req, res) => {
  try {
    const cities = await geographicService.getCityRanking();
    res.json(cities);
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch cities ranking',
      timestamp: new Date().toISOString()
    });
  }
});

// Regions Statistics
router.get('/regions', async (req, res) => {
  try {
    const regions = await geographicService.getRegionStats();
    res.json(regions);
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch regions statistics',
      timestamp: new Date().toISOString()
    });
  }
});

// Heavy Users by Location
router.get('/heavy-users-by-location', async (req, res) => {
  try {
    const heavyUsers = await geographicService.getHeavyUsersByLocation();
    res.json(heavyUsers);
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch heavy users by location',
      timestamp: new Date().toISOString()
    });
  }
});

// Heatmap Data
router.get('/heatmap', async (req, res) => {
  try {
    const heatmapData = await geographicService.getHeatmapData();
    res.json(heatmapData);
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch heatmap data',
      timestamp: new Date().toISOString()
    });
  }
});

// Enrich Geographic Data (Administrative endpoint)
router.post('/enrich', async (req, res) => {
  try {
    const result = await geographicService.enrichGeographicData();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to enrich geographic data',
      timestamp: new Date().toISOString()
    });
  }
});

// Cleanup Inconsistent Data (Administrative endpoint)
router.post('/cleanup', async (req, res) => {
  try {
    const result = await geographicService.cleanupInconsistentData();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to cleanup inconsistent data',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;