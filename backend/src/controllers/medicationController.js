const Medication = require('../models/Medication');
const MedicationLog = require('../models/MedicationLog');
const CareActivity = require('../models/CareActivity');
const Notification = require('../models/Notification');
const User = require('../models/User');

const getTodayDateString = (dateObj = new Date()) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTimeSlot = (timeStr) => {
  const hour = parseInt(timeStr.split(':')[0], 10);
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'bedtime';
};

/**
 * @desc Get all medications for an elderly individual
 * @route GET /api/medications/:elderlyId
 */
const getMedications = async (req, res) => {
  try {
    const elderlyId = req.targetElderlyId;
    const medications = await Medication.find({ elderlyId, isActive: true })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: medications.length,
      medications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Add a new medication
 * @route POST /api/medications/:elderlyId
 */
const addMedication = async (req, res) => {
  try {
    const elderlyId = req.targetElderlyId;
    const {
      name,
      dosage,
      form,
      frequency,
      times,
      instructions,
      pillColor,
      pillShape,
      prescribingDoctor,
      purpose,
      stockCount,
      lowStockThreshold
    } = req.body;

    if (!name || !dosage || !times || !Array.isArray(times) || times.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Name, dosage, and at least one scheduled time are required'
      });
    }

    const timeSlots = times.map(t => getTimeSlot(t));

    const medication = await Medication.create({
      elderlyId,
      name,
      dosage,
      form: form || 'tablet',
      frequency: frequency || 'daily',
      times,
      timeSlots,
      instructions: instructions || 'Take with water after food',
      pillColor: pillColor || 'blue',
      pillShape: pillShape || 'round',
      prescribingDoctor: prescribingDoctor || '',
      purpose: purpose || '',
      stockCount: stockCount !== undefined ? Number(stockCount) : 30,
      lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : 7,
      createdBy: req.user._id
    });

    // Create today's log entries for this new medication
    const today = getTodayDateString();
    for (const time of times) {
      await MedicationLog.create({
        elderlyId,
        medicationId: medication._id,
        medicationName: medication.name,
        dosage: medication.dosage,
        date: today,
        scheduledTime: time,
        timeSlot: getTimeSlot(time),
        status: 'pending'
      });
    }

    // Record activity
    await CareActivity.create({
      elderlyId,
      authorId: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      activityType: 'medication_added',
      title: `New Medication: ${name}`,
      description: `${req.user.name} added ${name} (${dosage}) scheduled at ${times.join(', ')}.`
    });

    res.status(201).json({
      success: true,
      medication
    });
  } catch (error) {
    console.error('addMedication error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update a medication
 * @route PUT /api/medications/:id
 */
const updateMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }

    // Verify access
    req.targetElderlyId = medication.elderlyId;

    if (req.body.times && Array.isArray(req.body.times)) {
      req.body.timeSlots = req.body.times.map(t => getTimeSlot(t));
    }

    const updatedMedication = await Medication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Record activity
    await CareActivity.create({
      elderlyId: medication.elderlyId,
      authorId: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      activityType: 'medication_updated',
      title: `Medication Updated: ${updatedMedication.name}`,
      description: `${req.user.name} modified dosage/schedule details.`
    });

    res.json({
      success: true,
      medication: updatedMedication
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Delete / Deactivate a medication
 * @route DELETE /api/medications/:id
 */
const deleteMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }

    medication.isActive = false;
    await medication.save();

    // Also remove pending logs for today/future
    const today = getTodayDateString();
    await MedicationLog.deleteMany({
      medicationId: medication._id,
      date: { $gte: today },
      status: 'pending'
    });

    // Record activity
    await CareActivity.create({
      elderlyId: medication.elderlyId,
      authorId: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      activityType: 'medication_updated',
      title: `Medication Discontinued: ${medication.name}`,
      description: `${req.user.name} discontinued ${medication.name}.`
    });

    res.json({
      success: true,
      message: 'Medication discontinued and removed from active schedule'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get daily medication schedule for an elderly person
 * @route GET /api/medications/:elderlyId/schedule
 */
const getDailySchedule = async (req, res) => {
  try {
    const elderlyId = req.targetElderlyId;
    const dateStr = req.query.date || getTodayDateString();

    // Ensure logs exist for today
    const activeMeds = await Medication.find({ elderlyId, isActive: true });
    for (const med of activeMeds) {
      for (const time of med.times) {
        const existing = await MedicationLog.findOne({
          elderlyId,
          medicationId: med._id,
          date: dateStr,
          scheduledTime: time
        });

        if (!existing) {
          await MedicationLog.create({
            elderlyId,
            medicationId: med._id,
            medicationName: med.name,
            dosage: med.dosage,
            date: dateStr,
            scheduledTime: time,
            timeSlot: getTimeSlot(time),
            status: 'pending'
          });
        }
      }
    }

    // Fetch logs populated with medication details (pillColor, pillShape, instructions)
    const logs = await MedicationLog.find({ elderlyId, date: dateStr })
      .populate('medicationId', 'form pillColor pillShape instructions purpose prescribingDoctor stockCount')
      .sort({ scheduledTime: 1 });

    // Group by timeSlot
    const slots = {
      morning: [],
      afternoon: [],
      evening: [],
      bedtime: []
    };

    logs.forEach((log) => {
      const slotKey = log.timeSlot || getTimeSlot(log.scheduledTime);
      if (slots[slotKey]) {
        slots[slotKey].push(log);
      } else {
        slots.morning.push(log);
      }
    });

    // Compute adherence for this day
    const total = logs.length;
    const taken = logs.filter(l => l.status === 'taken').length;
    const missed = logs.filter(l => l.status === 'missed').length;
    const pending = logs.filter(l => l.status === 'pending').length;
    const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 100;

    res.json({
      success: true,
      date: dateStr,
      stats: { total, taken, missed, pending, adherenceRate },
      slots,
      allLogs: logs
    });
  } catch (error) {
    console.error('getDailySchedule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Log or update medication dose status (mark taken, missed, skipped)
 * @route POST /api/medications/log/:logId
 */
const updateDoseStatus = async (req, res) => {
  try {
    const { status, notes } = req.body; // status: 'taken' | 'missed' | 'skipped' | 'pending'
    if (!['taken', 'missed', 'skipped', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const log = await MedicationLog.findById(req.params.logId).populate('medicationId');
    if (!log) {
      return res.status(404).json({ success: false, message: 'Medication dose log not found' });
    }

    const prevStatus = log.status;
    log.status = status;
    log.markedBy = req.user._id;
    log.markedByName = req.user.name;
    log.markedByRole = req.user.role;
    log.notes = notes || log.notes || '';

    if (status === 'taken') {
      log.takenAt = new Date();

      // Decrement stock count if medication exists
      if (log.medicationId && prevStatus !== 'taken') {
        const med = await Medication.findById(log.medicationId._id);
        if (med && med.stockCount > 0) {
          med.stockCount -= 1;
          await med.save();

          // Low stock alert check
          if (med.stockCount <= (med.lowStockThreshold || 7)) {
            await Notification.create({
              recipientId: log.elderlyId,
              elderlyId: log.elderlyId,
              title: `Low Stock: ${med.name}`,
              message: `Only ${med.stockCount} doses remaining for ${med.name}. Please request a prescription refill.`,
              type: 'refill_reminder',
              priority: 'medium',
              metadata: { medicationId: med._id, stockCount: med.stockCount }
            });
          }
        }
      }
    } else if (status === 'pending') {
      log.takenAt = undefined;
    }

    await log.save();

    // Record care activity
    await CareActivity.create({
      elderlyId: log.elderlyId,
      authorId: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      activityType: status === 'taken' ? 'medication_taken' : 'medication_missed',
      title: `${log.medicationName} marked as ${status.toUpperCase()}`,
      description: `${req.user.name} (${req.user.role}) recorded the dose for ${log.scheduledTime}.`
    });

    res.json({
      success: true,
      log,
      message: `Dose marked as ${status} successfully!`
    });
  } catch (error) {
    console.error('updateDoseStatus error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get full medication adherence history logs
 * @route GET /api/medications/:elderlyId/history
 */
const getMedicationHistory = async (req, res) => {
  try {
    const elderlyId = req.targetElderlyId;
    const { startDate, endDate, status, medicationId, limit = 50 } = req.query;

    const filter = { elderlyId };
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter.date = { $gte: startDate };
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (medicationId) {
      filter.medicationId = medicationId;
    }

    const history = await MedicationLog.find(filter)
      .populate('medicationId', 'form pillColor pillShape purpose')
      .sort({ date: -1, scheduledTime: -1 })
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMedications,
  addMedication,
  updateMedication,
  deleteMedication,
  getDailySchedule,
  updateDoseStatus,
  getMedicationHistory
};
