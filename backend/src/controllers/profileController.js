const ElderlyProfile = require('../models/ElderlyProfile');
const User = require('../models/User');
const CareActivity = require('../models/CareActivity');

/**
 * @desc Get healthcare profile of elderly person
 * @route GET /api/profile/:elderlyId
 */
const getProfile = async (req, res) => {
  try {
    const elderlyId = req.targetElderlyId;

    let profile = await ElderlyProfile.findOne({ userId: elderlyId })
      .populate('userId', 'name email phone avatar linkCode role')
      .populate('authorizedUsers.userId', 'name email role phone relationship avatar');

    if (!profile) {
      profile = await ElderlyProfile.create({
        userId: elderlyId,
        emergencyContacts: [],
        medicalConditions: [],
        allergies: [],
        primaryPhysician: { name: '', phone: '', clinic: '', email: '' }
      });
      profile = await ElderlyProfile.findById(profile._id).populate('userId', 'name email phone avatar linkCode role');
    }

    // Also get all users linked to this elderly
    const careCircle = await User.find({
      linkedElderly: elderlyId
    }).select('name email role phone relationship avatar');

    res.json({
      success: true,
      profile,
      careCircle
    });
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update elderly healthcare profile
 * @route PUT /api/profile/:elderlyId
 */
const updateProfile = async (req, res) => {
  try {
    const elderlyId = req.targetElderlyId;
    const {
      dateOfBirth,
      gender,
      bloodGroup,
      allergies,
      medicalConditions,
      emergencyContacts,
      primaryPhysician,
      address,
      notes,
      phone,
      name
    } = req.body;

    let profile = await ElderlyProfile.findOne({ userId: elderlyId });

    if (!profile) {
      profile = new ElderlyProfile({ userId: elderlyId });
    }

    if (dateOfBirth !== undefined) profile.dateOfBirth = dateOfBirth;
    if (gender !== undefined) profile.gender = gender;
    if (bloodGroup !== undefined) profile.bloodGroup = bloodGroup;
    if (allergies !== undefined) profile.allergies = allergies;
    if (medicalConditions !== undefined) profile.medicalConditions = medicalConditions;
    if (emergencyContacts !== undefined) profile.emergencyContacts = emergencyContacts;
    if (primaryPhysician !== undefined) profile.primaryPhysician = primaryPhysician;
    if (address !== undefined) profile.address = address;
    if (notes !== undefined) profile.notes = notes;

    await profile.save();

    // Optionally update user name or phone if provided
    if (name || phone) {
      await User.findByIdAndUpdate(elderlyId, {
        ...(name && { name }),
        ...(phone && { phone })
      });
    }

    // Record activity
    await CareActivity.create({
      elderlyId,
      authorId: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      activityType: 'profile_updated',
      title: 'Healthcare Profile Updated',
      description: `${req.user.name} updated medical info & emergency contacts.`
    });

    const updatedProfile = await ElderlyProfile.findOne({ userId: elderlyId })
      .populate('userId', 'name email phone avatar linkCode role')
      .populate('authorizedUsers.userId', 'name email role phone relationship');

    res.json({
      success: true,
      profile: updatedProfile,
      message: 'Healthcare profile updated successfully'
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Add Caregiver / Clinical Note
 * @route POST /api/profile/:elderlyId/caregiver-notes
 */
const addCaregiverNote = async (req, res) => {
  try {
    const elderlyId = req.targetElderlyId;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ success: false, message: 'Note text is required' });
    }

    const profile = await ElderlyProfile.findOne({ userId: elderlyId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    profile.caregiverNotes.unshift({
      authorId: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      note,
      createdAt: new Date()
    });

    await profile.save();

    // Record in activity feed
    await CareActivity.create({
      elderlyId,
      authorId: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      activityType: 'care_note',
      title: `Care Note from ${req.user.name}`,
      description: note
    });

    res.status(201).json({
      success: true,
      caregiverNotes: profile.caregiverNotes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  addCaregiverNote
};
