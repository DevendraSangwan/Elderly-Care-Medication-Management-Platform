const cron = require('node-cron');
const Medication = require('../models/Medication');
const MedicationLog = require('../models/MedicationLog');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ElderlyProfile = require('../models/ElderlyProfile');
const {
  sendMedicationReminderEmail,
  sendMissedMedicationAlertEmail,
  sendConsecutiveMissedAlertEmail,
  sendAppointmentReminderEmail
} = require('./emailService');

// Helper to get local date string YYYY-MM-DD
const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to determine time slot based on HH:mm
const getTimeSlot = (timeStr) => {
  const hour = parseInt(timeStr.split(':')[0], 10);
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'bedtime';
};

// Find linked family and caregivers for an elderly user
const getLinkedCareCircle = async (elderlyId) => {
  try {
    const elderly = await User.findById(elderlyId);
    if (!elderly) return [];

    // Find users who have this elderly in linkedElderly
    const linkedUsers = await User.find({
      linkedElderly: elderlyId,
      role: { $in: ['family', 'caregiver'] }
    });

    return linkedUsers;
  } catch (err) {
    console.error('Error fetching linked care circle:', err);
    return [];
  }
};

/**
 * Generate daily medication logs for today if not already present
 */
const generateTodayMedicationLogs = async () => {
  try {
    const today = getTodayDateString();
    const activeMeds = await Medication.find({ isActive: true });

    let createdCount = 0;

    for (const med of activeMeds) {
      for (const time of med.times) {
        const existing = await MedicationLog.findOne({
          elderlyId: med.elderlyId,
          medicationId: med._id,
          date: today,
          scheduledTime: time
        });

        if (!existing) {
          await MedicationLog.create({
            elderlyId: med.elderlyId,
            medicationId: med._id,
            medicationName: med.name,
            dosage: med.dosage,
            date: today,
            scheduledTime: time,
            timeSlot: getTimeSlot(time),
            status: 'pending'
          });
          createdCount++;
        }
      }
    }

    if (createdCount > 0) {
      console.log(`📋 Generated ${createdCount} medication schedule logs for ${today}.`);
    }
  } catch (err) {
    console.error('Error generating daily medication logs:', err);
  }
};

/**
 * Check for dues, reminders, missed medications, and doctor appointments
 */
const checkMedicationScheduleAndAlerts = async () => {
  try {
    const today = getTodayDateString();
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentMinutesTotal = currentHour * 60 + currentMinute;

    // 1. Process Pending Logs for Today
    const pendingLogs = await MedicationLog.find({
      date: today,
      status: 'pending'
    }).populate('elderlyId');

    for (const log of pendingLogs) {
      if (!log.elderlyId) continue;

      const [schedHour, schedMin] = log.scheduledTime.split(':').map(Number);
      const schedMinutesTotal = schedHour * 60 + schedMin;
      const diffMinutes = currentMinutesTotal - schedMinutesTotal;

      // Upcoming reminder: scheduled in next 15 mins or up to 15 mins past due
      if (diffMinutes >= -15 && diffMinutes <= 20 && !log.reminderSent) {
        log.reminderSent = true;
        await log.save();

        // In-app notification for elderly
        await Notification.create({
          recipientId: log.elderlyId._id,
          elderlyId: log.elderlyId._id,
          elderlyName: log.elderlyId.name,
          title: `Time to take ${log.medicationName}`,
          message: `Scheduled for ${log.scheduledTime}. Dosage: ${log.dosage}`,
          type: 'medication_reminder',
          priority: 'medium',
          metadata: {
            medicationId: log.medicationId,
            scheduledTime: log.scheduledTime
          }
        });

        // Email reminder to elderly
        if (log.elderlyId.email) {
          await sendMedicationReminderEmail({
            toUser: log.elderlyId,
            elderlyName: log.elderlyId.name,
            medicationName: log.medicationName,
            dosage: log.dosage,
            time: log.scheduledTime,
            instructions: ''
          });
        }
      }

      // Missed medication detection: > 45 minutes past due without confirmation
      if (diffMinutes > 45 && !log.missedAlertSent) {
        log.status = 'missed';
        log.missedAlertSent = true;
        await log.save();

        const careCircle = await getLinkedCareCircle(log.elderlyId._id);

        // Notify elderly user
        await Notification.create({
          recipientId: log.elderlyId._id,
          elderlyId: log.elderlyId._id,
          elderlyName: log.elderlyId.name,
          title: `Missed Dose: ${log.medicationName}`,
          message: `The dose scheduled for ${log.scheduledTime} (${log.dosage}) was not confirmed.`,
          type: 'medication_missed',
          priority: 'high',
          metadata: {
            medicationId: log.medicationId,
            scheduledTime: log.scheduledTime
          }
        });

        // Email to elderly
        if (log.elderlyId.email) {
          await sendMissedMedicationAlertEmail({
            toUser: log.elderlyId,
            elderlyName: log.elderlyId.name,
            medicationName: log.medicationName,
            dosage: log.dosage,
            scheduledTime: log.scheduledTime
          });
        }

        // Notify all linked family & caregivers
        for (const member of careCircle) {
          await Notification.create({
            recipientId: member._id,
            elderlyId: log.elderlyId._id,
            elderlyName: log.elderlyId.name,
            title: `Missed Dose: ${log.elderlyId.name} - ${log.medicationName}`,
            message: `${log.elderlyId.name} has not confirmed their ${log.scheduledTime} dose of ${log.medicationName} (${log.dosage}).`,
            type: 'medication_missed',
            priority: 'high',
            metadata: {
              medicationId: log.medicationId,
              scheduledTime: log.scheduledTime
            }
          });

          if (member.email) {
            await sendMissedMedicationAlertEmail({
              toUser: member,
              elderlyName: log.elderlyId.name,
              medicationName: log.medicationName,
              dosage: log.dosage,
              scheduledTime: log.scheduledTime,
              relationship: member.relationship
            });
          }
        }

        // Check for consecutive missed medications
        const recentMissed = await MedicationLog.find({
          elderlyId: log.elderlyId._id,
          status: 'missed'
        })
          .sort({ createdAt: -1 })
          .limit(3);

        if (recentMissed.length >= 2) {
          const missedList = recentMissed.map((m) => ({
            name: m.medicationName,
            dosage: m.dosage,
            time: `${m.date} ${m.scheduledTime}`
          }));

          for (const member of careCircle) {
            await Notification.create({
              recipientId: member._id,
              elderlyId: log.elderlyId._id,
              elderlyName: log.elderlyId.name,
              title: `URGENT: ${recentMissed.length} Consecutive Missed Doses for ${log.elderlyId.name}`,
              message: `Multiple doses have been missed. Please verify the safety of ${log.elderlyId.name}.`,
              type: 'consecutive_missed',
              priority: 'urgent',
              metadata: { count: recentMissed.length }
            });

            if (member.email) {
              await sendConsecutiveMissedAlertEmail({
                toUser: member,
                elderlyName: log.elderlyId.name,
                missedCount: recentMissed.length,
                medicationsList: missedList
              });
            }
          }
        }
      }
    }

    // 2. Process Upcoming Doctor Appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    const upcomingAppointments = await Appointment.find({
      status: 'scheduled',
      reminderEmailSent: false,
      date: { $in: [today, tomorrowStr] }
    }).populate('elderlyId');

    for (const appt of upcomingAppointments) {
      if (!appt.elderlyId) continue;

      appt.reminderEmailSent = true;
      await appt.save();

      const careCircle = await getLinkedCareCircle(appt.elderlyId._id);
      const allRecipients = [appt.elderlyId, ...careCircle];

      for (const recipient of allRecipients) {
        await Notification.create({
          recipientId: recipient._id,
          elderlyId: appt.elderlyId._id,
          elderlyName: appt.elderlyId.name,
          title: `Appointment Reminder: Dr. ${appt.doctorName}`,
          message: `Scheduled for ${appt.date} at ${appt.time} at ${appt.clinicLocation}. Purpose: ${appt.purpose}`,
          type: 'appointment_reminder',
          priority: 'medium',
          metadata: { appointmentId: appt._id }
        });

        if (recipient.email) {
          await sendAppointmentReminderEmail({
            toUser: recipient,
            elderlyName: appt.elderlyId.name,
            doctorName: appt.doctorName,
            specialty: appt.specialty,
            clinicLocation: appt.clinicLocation,
            date: appt.date,
            time: appt.time,
            purpose: appt.purpose,
            preparation: appt.preparationNotes
          });
        }
      }
    }
  } catch (err) {
    console.error('Error in checkMedicationScheduleAndAlerts:', err);
  }
};

/**
 * Full scheduler cycle (callable on demand)
 */
const runSchedulerCycle = async () => {
  console.log('🔄 Running automated CareBridge scheduler cycle...');
  await generateTodayMedicationLogs();
  await checkMedicationScheduleAndAlerts();
  return { success: true, timestamp: new Date() };
};

/**
 * Initialize background cron jobs
 */
const initReminderScheduler = () => {
  // Run once immediately on start
  runSchedulerCycle();

  // Run every minute: checks dues and missed doses
  cron.schedule('* * * * *', async () => {
    await checkMedicationScheduleAndAlerts();
  });

  // Run at midnight every day to generate today's log entries
  cron.schedule('0 0 * * *', async () => {
    await generateTodayMedicationLogs();
  });

  console.log('⏰ Automated Medication & Appointment Reminder Scheduler initialized.');
};

module.exports = {
  initReminderScheduler,
  runSchedulerCycle,
  generateTodayMedicationLogs,
  checkMedicationScheduleAndAlerts
};
