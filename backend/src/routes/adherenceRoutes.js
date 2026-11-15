const express = require('express');
const router = express.Router();
const { getAdherenceStats } = require('../controllers/adherenceController');
const { protect } = require('../middleware/authMiddleware');
const { verifyElderlyAccess } = require('../middleware/roleMiddleware');

router.get('/:elderlyId/stats', protect, verifyElderlyAccess, getAdherenceStats);

module.exports = router;
