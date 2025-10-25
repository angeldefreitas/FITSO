const express = require('express');
const router = express.Router();
const { getSimpleAffiliateDashboard } = require('../controllers/simpleAffiliateDashboardController');
const { authenticateToken } = require('../../middleware/auth');

// Dashboard simple de afiliado
router.get('/new-simple-dashboard', authenticateToken, getSimpleAffiliateDashboard);

module.exports = router;
