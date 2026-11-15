const Notification = require('../models/Notification');
const CareActivity = require('../models/CareActivity');
const ElderlyProfile = require('../models/ElderlyProfile');
const User = require('../models/User');
const { sendEmergencySOSEmail } = require('../services/emailService');

/**
 * @desc Trigger Emergency SOS Beacon
 * @route POST /api/emergency/:elderlyId/trigger
 */
const triggerEmergencySOS = async (req, res) => {
  try {
    const elderlyId = req.targetElderlyId;
    const { reason, location } = req.body;

    const elderlyUser = await User.findById(elderlyId);
    if (!elderlyUser) {
      return res.status(404).json({ success: false, message: 'Elderly profile not found' });
    }

    const profile = await ElderlyProfile.findOne({ userId: elderlyId });
    const formattedAddress = profile && profile.address
      ? `${profile.address.street}, ${profile.address.city}, ${profile.address.state} ${profile.address.zip}`.trim()
      : 'Address on file';

    // Find all linked care circle members
    const careCircle = await User.find({
      linkedElderly: elderlyId,
      role: { $in: ['family', 'caregiver'] }
    });

    // Create URGENT in-app notification for all care circle members
    const notificationsSent = [];
    for (const member of careCircle) {
      const notif = await Notification.create({
        recipientId: member._id,
        elderlyId,
        elderlyName: elderlyUser.name,
        title: `🚨 EMERGENCY SOS: ${elderlyUser.name} Needs Help!`,
        message: `${elderlyUser.name} triggered an SOS emergency beacon at ${new Date().toLocaleTimeString()}. ${reason ? `Reason: ${reason}` : ''}`,
        type: 'sos_alert',
        priority: 'urgent',
        metadata: {
          emergencyContacts: profile ? profile.emergencyContacts : [],
          phone: elderlyUser.phone,
          address: formattedAddress,
          timestamp: new Date()
        }
      });
      notificationsSent.push(notif);

      // Send emergency SOS email
      if (member.email) {
        await sendEmergencySOSEmail({
          toUser: member,
          elderlyName: elderlyUser.name,
          elderlyPhone: elderlyUser.phone,
          address: formattedAddress,
          timestamp: new Date(),
          emergencyContacts: profile ? profile.emergencyContacts : []
        });
      }
    }

    // Record activity
    await CareActivity.create({
      elderlyId,
      authorId: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      activityType: 'sos_alert',
      title: `🚨 SOS BEACON ACTIVATED`,
      description: `${req.user.name} activated the emergency SOS distress alert. Family & caregivers notified.`
    });

    res.json({
      success: true,
      message: 'Emergency SOS broadcasted to all linked family members and caregivers!',
      contactsNotifiedCount: careCircle.length,
      emergencyInfo: {
        elderlyName: elderlyUser.name,
        phone: elderlyUser.phone,
        address: formattedAddress,
        bloodGroup: profile ? profile.bloodGroup : 'Unknown',
        allergies: profile ? profile.allergies : [],
        medicalConditions: profile ? profile.medicalConditions : [],
        emergencyContacts: profile ? profile.emergencyContacts : []
      }
    });
  } catch (error) {
    console.error('triggerEmergencySOS error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get emergency card info for first responders / quick view
 * @route GET /api/emergency/:elderlyId/card
 */
const getEmergencyCard = async (req, res) => {
  try {
    const elderlyId = req.targetElderlyId;
    const elderlyUser = await User.findById(elderlyId).select('name phone email avatar');
    const profile = await ElderlyProfile.findOne({ userId: elderlyId });

    res.json({
      success: true,
      card: {
        name: elderlyUser ? elderlyUser.name : 'Unknown',
        phone: elderlyUser ? elderlyUser.phone : '',
        bloodGroup: profile ? profile.bloodGroup : 'Unknown',
        allergies: profile ? profile.allergies : [],
        medicalConditions: profile ? profile.medicalConditions : [],
        emergencyContacts: profile ? profile.emergencyContacts : [],
        primaryPhysician: profile ? profile.primaryPhysician : null,
        address: profile ? profile.address : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  triggerEmergencySOS,
  getEmergencyCard
};
