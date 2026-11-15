const Notification = require('../models/Notification');
const { getEmailHistory, clearEmailHistory } = require('../config/mailer');
const { runSchedulerCycle } = require('../services/reminderScheduler');

/**
 * @desc Get notifications for logged-in user
 * @route GET /api/notifications
 */
const getNotifications = async (req, res) => {
  try {
    const { unreadOnly, limit = 40 } = req.query;
    const filter = { recipientId: req.user._id };

    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    const unreadCount = await Notification.countDocuments({
      recipientId: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      unreadCount,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Mark single notification as read
 * @route PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Mark all notifications as read
 * @route POST /api/notifications/mark-all-read
 */
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Inspect all emails sent by system (interactive email preview inbox)
 * @route GET /api/notifications/emails
 */
const getSentEmails = async (req, res) => {
  try {
    const emails = getEmailHistory();
    res.json({
      success: true,
      count: emails.length,
      emails
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Clear email history
 * @route DELETE /api/notifications/emails
 */
const clearEmails = async (req, res) => {
  try {
    clearEmailHistory();
    res.json({
      success: true,
      message: 'Email history cleared'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Trigger reminder scheduler on demand
 * @route POST /api/notifications/run-check
 */
const triggerSchedulerCheck = async (req, res) => {
  try {
    const result = await runSchedulerCycle();
    res.json({
      success: true,
      message: 'Scheduler cycle executed successfully',
      result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAll: markAllAsRead,
  markAllAsRead,
  getSentEmails,
  clearEmails,
  triggerSchedulerCheck
};
