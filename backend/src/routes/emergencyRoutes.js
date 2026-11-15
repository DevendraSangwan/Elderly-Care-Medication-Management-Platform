const express = require('express');
const router = express.Router();
const {
  triggerEmergencySOS,
  getEmergencyCard
} = require('../controllers/emergencyController');
const { protect } = require('../middleware/authMiddleware');
const { verifyElderlyAccess } = require('../middleware/roleMiddleware');

router.post('/:elderlyId/trigger', protect, verifyElderlyAccess, triggerEmergencySOS);
router.get('/:elderlyId/card', protect, verifyElderlyAccess, getEmergencyCard);

module.exports = router;
