const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  addCaregiverNote
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { verifyElderlyAccess } = require('../middleware/roleMiddleware');

router.get('/:elderlyId', protect, verifyElderlyAccess, getProfile);
router.put('/:elderlyId', protect, verifyElderlyAccess, updateProfile);
router.post('/:elderlyId/caregiver-notes', protect, verifyElderlyAccess, addCaregiverNote);

module.exports = router;
