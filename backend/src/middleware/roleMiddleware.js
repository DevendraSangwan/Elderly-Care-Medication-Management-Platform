const ElderlyProfile = require('../models/ElderlyProfile');
const User = require('../models/User');

// Restrict to specified roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user ? req.user.role : 'anonymous'}' is not allowed to access this resource`
      });
    }
    next();
  };
};

// Verify user has permission to access an elderly person's data
const verifyElderlyAccess = async (req, res, next) => {
  try {
    const elderlyId = req.params.elderlyId || req.query.elderlyId || req.body.elderlyId;

    if (!elderlyId) {
      // If elderly user themselves, default to self
      if (req.user.role === 'elderly') {
        req.targetElderlyId = req.user._id;
        return next();
      }
      return res.status(400).json({
        success: false,
        message: 'Elderly individual ID is required'
      });
    }

    // 1. If user is the elderly individual themselves
    if (req.user._id.toString() === elderlyId.toString()) {
      req.targetElderlyId = req.user._id;
      return next();
    }

    // 2. If user is a linked family member or caregiver
    const isLinked = req.user.linkedElderly && req.user.linkedElderly.some(
      (id) => id.toString() === elderlyId.toString()
    );

    if (isLinked) {
      req.targetElderlyId = elderlyId;
      return next();
    }

    // 3. Check ElderlyProfile authorizedUsers list
    const profile = await ElderlyProfile.findOne({ userId: elderlyId });
    if (profile && profile.authorizedUsers) {
      const isAuthorized = profile.authorizedUsers.some(
        (auth) => auth.userId.toString() === req.user._id.toString()
      );
      if (isAuthorized) {
        req.targetElderlyId = elderlyId;
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied: You are not authorized to access this healthcare profile'
    });
  } catch (error) {
    console.error('verifyElderlyAccess error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal authorization error'
    });
  }
};

module.exports = { restrictTo, verifyElderlyAccess };
