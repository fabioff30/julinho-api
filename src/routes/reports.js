const express = require('express');
const router = express.Router();

// Import all report route modules
const geographicRoutes = require('./geographic');
const usersRoutes = require('./users');
const usageRoutes = require('./usage');
const contactsRoutes = require('./contacts');

// Mount route modules
router.use('/geographic', geographicRoutes);
router.use('/users', usersRoutes);
router.use('/usage', usageRoutes);
router.use('/contacts', contactsRoutes);

// Reports overview endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Julinho WhatsApp IA - Reports API',
    version: '1.0.0',
    available_endpoints: {
      geographic: {
        overview: '/api/reports/geographic/overview',
        states: '/api/reports/geographic/states',
        cities: '/api/reports/geographic/cities',
        regions: '/api/reports/geographic/regions',
        heavy_users_by_location: '/api/reports/geographic/heavy-users-by-location',
        heatmap: '/api/reports/geographic/heatmap',
        enrich: 'POST /api/reports/geographic/enrich',
        cleanup: 'POST /api/reports/geographic/cleanup'
      },
      users: {
        heavy_users: '/api/reports/users/heavy'
      },
      usage: {
        distribution: '/api/reports/usage/distribution'
      },
      contacts: {
        list: '/api/reports/contacts',
        export: '/api/reports/contacts/export'
      }
    },
    authentication: {
      type: 'Basic Auth',
      username: 'admin',
      password: 'Value of DASHBOARD_SECRET environment variable'
    },
    documentation: 'See API documentation for detailed usage instructions'
  });
});

module.exports = router;