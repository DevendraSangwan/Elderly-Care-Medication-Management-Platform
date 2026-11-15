const express = require('express');
const router = express.Router();
const {
  getActivities,
  addCheckIn
} = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');
const { verifyElderlyAccess } = require('../middleware/roleMiddleware');

router.get('/:elderlyId', protect, verifyElderlyAccess, getActivities);
router.post('/:elderlyId/check-in', protect, verifyElderlyAccess, addCheckIn);

module.exports = router;
