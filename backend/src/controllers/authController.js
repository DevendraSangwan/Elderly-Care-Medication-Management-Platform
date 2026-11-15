const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const ElderlyProfile = require('../models/ElderlyProfile');
const CareActivity = require('../models/CareActivity');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_carebridge_jwt_token_key_2026_dev',
    { expiresIn: '30d' }
  );
};

// Generate 6-character uppercase link code (e.g. "CB7392")
const generateUniqueLinkCode = async () => {
  let code;
  let exists = true;
  while (exists) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    code = `CB-${randomNum}`;
    const found = await User.findOne({ linkCode: code });
    if (!found) exists = false;
  }
  return code;
};

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role, passcode, phone, relationship } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    let linkCode = undefined;
    if (role === 'elderly' || !role) {
      linkCode = await generateUniqueLinkCode();
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'elderly',
      passcode: passcode || '',
      phone: phone || '',
      relationship: relationship || '',
      linkCode
    });

    // If elderly, create default healthcare profile
    if (user.role === 'elderly') {
      const profile = await ElderlyProfile.create({
        userId: user._id,
        emergencyContacts: [],
        medicalConditions: [],
        allergies: [],
        primaryPhysician: { name: '', phone: '', clinic: '', email: '' },
        address: { street: '', city: '', state: '', zip: '' },
        notes: ''
      });
      user.elderlyProfile = profile._id;
      await user.save();
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        passcode: user.passcode ? true : false,
        linkCode: user.linkCode,
        phone: user.phone,
        relationship: user.relationship,
        preferences: user.preferences,
        linkedElderly: user.linkedElderly
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

/**
 * @desc Login user with email & password
 * @route POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('linkedElderly', 'name email phone avatar linkCode');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasPasscode: Boolean(user.passcode),
        linkCode: user.linkCode,
        phone: user.phone,
        relationship: user.relationship,
        preferences: user.preferences,
        linkedElderly: user.linkedElderly
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

/**
 * @desc Quick login using Passcode (especially senior-friendly)
 * @route POST /api/auth/login-passcode
 */
const loginWithPasscode = async (req, res) => {
  try {
    const { email, passcode } = req.body;

    if (!email || !passcode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and passcode'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .populate('linkedElderly', 'name email phone avatar linkCode');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    if (!user.matchPasscode(passcode)) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect passcode entered'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasPasscode: true,
        linkCode: user.linkCode,
        phone: user.phone,
        relationship: user.relationship,
        preferences: user.preferences,
        linkedElderly: user.linkedElderly
      }
    });
  } catch (error) {
    console.error('Passcode login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during passcode login'
    });
  }
};

/**
 * @desc Get current authenticated user details
 * @route GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('linkedElderly', 'name email phone avatar linkCode')
      .populate('elderlyProfile');

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasPasscode: Boolean(user.passcode),
        linkCode: user.linkCode,
        phone: user.phone,
        relationship: user.relationship,
        preferences: user.preferences,
        linkedElderly: user.linkedElderly,
        elderlyProfile: user.elderlyProfile
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update UI & Notification Preferences
 * @route PUT /api/auth/preferences
 */
const updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.preferences = {
      ...user.preferences,
      ...req.body
    };

    await user.save();

    res.json({
      success: true,
      preferences: user.preferences
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Link family/caregiver to an elderly profile using their 6-digit Link Code
 * @route POST /api/auth/link-profile
 */
const linkProfile = async (req, res) => {
  try {
    const { linkCode } = req.body;

    if (!linkCode) {
      return res.status(400).json({
        success: false,
        message: 'Link code is required (e.g. CB-8492)'
      });
    }

    const cleanCode = linkCode.trim().toUpperCase();
    const elderlyUser = await User.findOne({ linkCode: cleanCode, role: 'elderly' });

    if (!elderlyUser) {
      return res.status(404).json({
        success: false,
        message: 'No elderly profile found with this code. Please check the code and try again.'
      });
    }

    // Check if already linked
    const user = await User.findById(req.user._id);
    const alreadyLinked = user.linkedElderly.some(
      (id) => id.toString() === elderlyUser._id.toString()
    );

    if (alreadyLinked) {
      return res.status(400).json({
        success: false,
        message: `You are already connected to ${elderlyUser.name}'s profile`
      });
    }

    // Add to user's linkedElderly
    user.linkedElderly.push(elderlyUser._id);
    await user.save();

    // Also update elderly person's ElderlyProfile authorizedUsers list
    const elderlyProfile = await ElderlyProfile.findOne({ userId: elderlyUser._id });
    if (elderlyProfile) {
      const alreadyAuth = elderlyProfile.authorizedUsers.some(
        (a) => a.userId.toString() === user._id.toString()
      );
      if (!alreadyAuth) {
        elderlyProfile.authorizedUsers.push({
          userId: user._id,
          role: user.role,
          permissions: ['full']
        });
        await elderlyProfile.save();
      }
    }

    // Record Care Activity
    await CareActivity.create({
      elderlyId: elderlyUser._id,
      authorId: user._id,
      authorName: user.name,
      authorRole: user.role,
      activityType: 'profile_updated',
      title: `${user.name} joined the Care Circle`,
      description: `${user.name} (${user.role}${user.relationship ? ` - ${user.relationship}` : ''}) is now authorized to monitor healthcare routines.`
    });

    const updatedUser = await User.findById(req.user._id).populate(
      'linkedElderly',
      'name email phone avatar linkCode'
    );

    res.json({
      success: true,
      message: `Successfully connected to ${elderlyUser.name}'s care circle!`,
      linkedElderly: updatedUser.linkedElderly
    });
  } catch (error) {
    console.error('Error linking profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Unlink a family/caregiver from an elderly profile
 * @route POST /api/auth/unlink-profile
 */
const unlinkProfile = async (req, res) => {
  try {
    const { elderlyId } = req.body;
    const user = await User.findById(req.user._id);

    user.linkedElderly = user.linkedElderly.filter(
      (id) => id.toString() !== elderlyId.toString()
    );
    await user.save();

    // Also remove from elderly profile
    await ElderlyProfile.updateOne(
      { userId: elderlyId },
      { $pull: { authorizedUsers: { userId: user._id } } }
    );

    res.json({
      success: true,
      message: 'Profile unlinked successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get or regenerate Link Code for elderly user
 * @route POST /api/auth/regenerate-code
 */
const regenerateLinkCode = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.role !== 'elderly') {
      return res.status(403).json({ success: false, message: 'Only elderly users can generate link codes' });
    }

    const newCode = await generateUniqueLinkCode();
    user.linkCode = newCode;
    await user.save();

    res.json({
      success: true,
      linkCode: newCode
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  loginWithPasscode,
  getMe,
  updatePreferences,
  linkProfile,
  unlinkProfile,
  regenerateLinkCode
};
