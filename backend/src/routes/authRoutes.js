const express = require('express');
const router = express.Router();
const {
  register,
  login,
  loginWithPasscode,
  getMe,
  updatePreferences,
  linkProfile,
  unlinkProfile,
  regenerateLinkCode
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/login-passcode', loginWithPasscode);
router.get('/me', protect, getMe);
router.put('/preferences', protect, updatePreferences);
router.post('/link-profile', protect, linkProfile);
router.post('/unlink-profile', protect, unlinkProfile);
router.post('/regenerate-code', protect, regenerateLinkCode);

module.exports = router;
