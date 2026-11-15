const express = require('express');
const router = express.Router();
const {
  getMedications,
  addMedication,
  updateMedication,
  deleteMedication,
  getDailySchedule,
  updateDoseStatus,
  getMedicationHistory
} = require('../controllers/medicationController');
const { protect } = require('../middleware/authMiddleware');
const { verifyElderlyAccess } = require('../middleware/roleMiddleware');

router.get('/:elderlyId', protect, verifyElderlyAccess, getMedications);
router.post('/:elderlyId', protect, verifyElderlyAccess, addMedication);
router.put('/:id', protect, updateMedication);
router.delete('/:id', protect, deleteMedication);

router.get('/:elderlyId/schedule', protect, verifyElderlyAccess, getDailySchedule);
router.post('/log/:logId', protect, updateDoseStatus);
router.get('/:elderlyId/history', protect, verifyElderlyAccess, getMedicationHistory);

module.exports = router;
