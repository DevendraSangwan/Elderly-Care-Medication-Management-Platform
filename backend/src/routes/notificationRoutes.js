const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getSentEmails,
  clearEmails,
  triggerSchedulerCheck
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.patch('/:id/read', protect, markAsRead);
router.post('/mark-all-read', protect, markAllAsRead);

// Email viewer and scheduler routes
router.get('/emails', protect, getSentEmails);
router.delete('/emails', protect, clearEmails);
router.post('/run-check', protect, triggerSchedulerCheck);

module.exports = router;
