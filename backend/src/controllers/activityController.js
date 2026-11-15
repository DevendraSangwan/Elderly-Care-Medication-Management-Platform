const CareActivity = require('../models/CareActivity');

/**
 * @desc Get collaborative care activity feed for an elderly individual
 * @route GET /api/activity/:elderlyId
 */
const getActivities = async (req, res) => {
  try {
    const elderlyId = req.targetElderlyId;
    const { limit = 30 } = req.query;

    const activities = await CareActivity.find({ elderlyId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      count: activities.length,
      activities
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Add a family / caregiver check-in note to the activity feed
 * @route POST /api/activity/:elderlyId/check-in
 */
const addCheckIn = async (req, res) => {
  try {
    const elderlyId = req.targetElderlyId;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ success: false, message: 'Check-in note text is required' });
    }

    const activity = await CareActivity.create({
      elderlyId,
      authorId: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      activityType: 'care_note',
      title: `${req.user.name} checked in`,
      description: note
    });

    res.status(201).json({
      success: true,
      activity
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getActivities,
  addCheckIn
};
