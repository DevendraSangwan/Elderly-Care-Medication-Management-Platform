const express = require('express');
const router = express.Router();
const {
  getAppointments,
  createAppointment,
  updateAppointment,
  setAppointmentStatus,
  sendManualAppointmentReminder
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { verifyElderlyAccess } = require('../middleware/roleMiddleware');

router.get('/:elderlyId', protect, verifyElderlyAccess, getAppointments);
router.post('/:elderlyId', protect, verifyElderlyAccess, createAppointment);
router.put('/:id', protect, updateAppointment);
router.patch('/:id/status', protect, setAppointmentStatus);
router.post('/:id/send-reminder', protect, sendManualAppointmentReminder);

module.exports = router;
