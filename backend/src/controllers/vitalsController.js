const VitalSign = require('../models/VitalSign');
const CareActivity = require('../models/CareActivity');
const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * @desc Log vital signs for elderly individual
 * @route POST /api/vitals/:elderlyId
 */
const logVitals = async (req, res) => {
  try {
    const elderlyId = req.targetElderlyId;
    const {
      bloodPressureSystolic,
      bloodPressureDiastolic,
      bloodSugar,
      bloodSugarTiming,
      pulseRate,
      oxygenSaturation,
      temperature,
      notes
    } = req.body;

    const vital = await VitalSign.create({
      elderlyId,
      recordedBy: req.user._id,
      recordedByName: req.user.name,
      recordedByRole: req.user.role,
      bloodPressureSystolic: bloodPressureSystolic ? Number(bloodPressureSystolic) : undefined,
      bloodPressureDiastolic: bloodPressureDiastolic ? Number(bloodPressureDiastolic) : undefined,
      bloodSugar: bloodSugar ? Number(bloodSugar) : undefined,
      bloodSugarTiming: bloodSugarTiming || 'fasting',
      pulseRate: pulseRate ? Number(pulseRate) : undefined,
      oxygenSaturation: oxygenSaturation ? Number(oxygenSaturation) : undefined,
      temperature: temperature ? Number(temperature) : undefined,
      notes: notes || ''
    });

    // Check for abnormal readings
    const alerts = [];
    if (bloodPressureSystolic && (bloodPressureSystolic > 140 || bloodPressureSystolic < 90)) {
      alerts.push(`Abnormal Systolic BP: ${bloodPressureSystolic} mmHg`);
    }
    if (bloodSugar && (bloodSugar > 180 || bloodSugar < 70)) {
      alerts.push(`Abnormal Blood Sugar: ${bloodSugar} mg/dL (${bloodSugarTiming})`);
    }
    if (oxygenSaturation && oxygenSaturation < 94) {
      alerts.push(`Low SpO2: ${oxygenSaturation}%`);
    }

    // Record Care Activity
    const details = [
      bloodPressureSystolic && bloodPressureDiastolic ? `BP: ${bloodPressureSystolic}/${bloodPressureDiastolic} mmHg` : null,
      bloodSugar ? `Sugar: ${bloodSugar} mg/dL` : null,
      pulseRate ? `Pulse: ${pulseRate} bpm` : null,
      oxygenSaturation ? `SpO2: ${oxygenSaturation}%` : null
    ].filter(Boolean).join(' | ');

    await CareActivity.create({
      elderlyId,
      authorId: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      activityType: 'vitals_recorded',
      title: `Vitals Logged by ${req.user.name}`,
      description: details || 'Routine vital signs recorded.'
    });

    // If abnormal readings, notify care circle
    if (alerts.length > 0) {
      const elderlyUser = await User.findById(elderlyId);
      const careCircle = await User.find({
        linkedElderly: elderlyId,
        role: { $in: ['family', 'caregiver'] }
      });

      for (const member of careCircle) {
        await Notification.create({
          recipientId: member._id,
          elderlyId,
          elderlyName: elderlyUser ? elderlyUser.name : '',
          title: `Health Alert: ${elderlyUser ? elderlyUser.name : 'Patient'} Vitals Notice`,
          message: `${alerts.join('. ')}. Logged by ${req.user.name}.`,
          type: 'care_activity',
          priority: 'high'
        });
      }
    }

    res.status(201).json({
      success: true,
      vital,
      abnormalAlerts: alerts
    });
  } catch (error) {
    console.error('logVitals error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get vital signs history for elderly individual
 * @route GET /api/vitals/:elderlyId
 */
const getVitalsHistory = async (req, res) => {
  try {
    const elderlyId = req.targetElderlyId;
    const { limit = 20 } = req.query;

    const vitals = await VitalSign.find({ elderlyId })
      .sort({ date: -1 })
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      count: vitals.length,
      vitals
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  logVitals,
  getVitalsHistory
};
