// Standard Application Constants & Enums

const ROLES = Object.freeze({
  ELDERLY: 'elderly',
  FAMILY: 'family',
  CAREGIVER: 'caregiver'
});

const MEDICATION_FORMS = Object.freeze([
  'tablet',
  'capsule',
  'liquid',
  'injection',
  'inhaler',
  'drops',
  'patch',
  'other'
]);

const MEDICATION_FREQUENCIES = Object.freeze([
  'daily',
  'twice_daily',
  'three_times_daily',
  'four_times_daily',
  'as_needed',
  'weekly',
  'custom'
]);

const TIME_SLOTS = Object.freeze({
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
  BEDTIME: 'bedtime',
  SPECIFIC: 'specific'
});

const DOSE_STATUS = Object.freeze({
  PENDING: 'pending',
  TAKEN: 'taken',
  MISSED: 'missed',
  SKIPPED: 'skipped'
});

const APPOINTMENT_STATUS = Object.freeze({
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'rescheduled'
});

const NOTIFICATION_TYPES = Object.freeze({
  MEDICATION_REMINDER: 'medication_reminder',
  MEDICATION_MISSED: 'medication_missed',
  MEDICATION_TAKEN: 'medication_taken',
  CONSECUTIVE_MISSED: 'consecutive_missed',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  SOS_ALERT: 'sos_alert',
  CARE_ACTIVITY: 'care_activity',
  REFILL_REMINDER: 'refill_reminder',
  SYSTEM: 'system'
});

const NOTIFICATION_PRIORITIES = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
});

const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
});

module.exports = {
  ROLES,
  MEDICATION_FORMS,
  MEDICATION_FREQUENCIES,
  TIME_SLOTS,
  DOSE_STATUS,
  APPOINTMENT_STATUS,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  PAGINATION
};
