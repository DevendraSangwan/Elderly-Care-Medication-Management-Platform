const express = require('express');
const router = express.Router();
const {
  logVitals,
  getVitalsHistory
} = require('../controllers/vitalsController');
const { protect } = require('../middleware/authMiddleware');
const { verifyElderlyAccess } = require('../middleware/roleMiddleware');

router.post('/:elderlyId', protect, verifyElderlyAccess, logVitals);
router.get('/:elderlyId', protect, verifyElderlyAccess, getVitalsHistory);

module.exports = router;
