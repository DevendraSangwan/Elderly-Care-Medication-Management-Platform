const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a full name'],
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['elderly', 'family', 'caregiver'],
      default: 'elderly'
    },
    passcode: {
      type: String,
      trim: true,
      maxlength: 8,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    relationship: {
      type: String,
      trim: true,
      default: '' // e.g., Daughter, Son, Professional Nurse
    },
    linkCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    linkedElderly: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    elderlyProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ElderlyProfile'
    },
    preferences: {
      highContrast: { type: Boolean, default: false },
      seniorMode: { type: Boolean, default: false },
      voiceAssistantEnabled: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false }
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Compare passcode
userSchema.methods.matchPasscode = function (enteredPasscode) {
  if (!this.passcode) return false;
  return this.passcode === enteredPasscode.trim();
};

module.exports = mongoose.model('User', userSchema);
