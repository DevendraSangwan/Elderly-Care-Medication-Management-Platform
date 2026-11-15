const Appointment = require('../models/Appointment');
const CareActivity = require('../models/CareActivity');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendAppointmentReminderEmail } = require('../services/emailService');

/**
 * @desc Get all appointments for an elderly individual
 * @route GET /api/appointments/:elderlyId
 */
const getAppointments = async (req, res) => {
  try {
    const elderlyId = req.targetElderlyId;
    const { status } = req.query;

    const filter = { elderlyId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .sort({ date: 1, time: 1 });

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const upcoming = appointments.filter(a => a.date >= todayStr && a.status === 'scheduled');
    const past = appointments.filter(a => a.date < todayStr || a.status !== 'scheduled');

    res.json({
      success: true,
      count: appointments.length,
      upcoming,
      past,
      all: appointments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Schedule a new doctor appointment
 * @route POST /api/appointments/:elderlyId
 */
const createAppointment = async (req, res) => {
  try {
    const elderlyId = req.targetElderlyId;
    const {
      doctorName,
      specialty,
      clinicLocation,
      date,
      time,
      purpose,
      preparationNotes,
      doctorPhone,
      notes
    } = req.body;

    if (!doctorName || !clinicLocation || !date || !time || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Doctor name, clinic location, date, time, and purpose are required'
      });
    }

    const appointment = await Appointment.create({
      elderlyId,
      doctorName,
      specialty: specialty || 'General Physician',
      clinicLocation,
      date,
      time,
      purpose,
      preparationNotes: preparationNotes || '',
      doctorPhone: doctorPhone || '',
      notes: notes || '',
      status: 'scheduled',
      createdBy: req.user._id
    });

    const elderlyUser = await User.findById(elderlyId);

    // Notify care circle
    const careCircle = await User.find({
      linkedElderly: elderlyId,
      role: { $in: ['family', 'caregiver'] }
    });

    const notifyList = [elderlyUser, ...careCircle].filter(Boolean);

    for (const person of notifyList) {
      await Notification.create({
        recipientId: person._id,
        elderlyId,
        elderlyName: elderlyUser ? elderlyUser.name : '',
        title: `New Doctor Appointment: Dr. ${doctorName}`,
        message: `Scheduled on ${date} at ${time} (${clinicLocation}) for ${purpose}.`,
        type: 'appointment_reminder',
        priority: 'medium',
        metadata: { appointmentId: appointment._id }
      });
    }

    // Record activity
    await CareActivity.create({
      elderlyId,
      authorId: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      activityType: 'appointment_scheduled',
      title: `Appointment with Dr. ${doctorName}`,
      description: `Scheduled for ${date} at ${time} for ${purpose}.`
    });

    res.status(201).json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('createAppointment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update an appointment
 * @route PUT /api/appointments/:id
 */
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      appointment: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Cancel or mark appointment complete
 * @route PATCH /api/appointments/:id/status
 */
const setAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'completed' | 'cancelled' | 'scheduled'
    if (!['completed', 'cancelled', 'scheduled', 'rescheduled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment status' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.status = status;
    await appointment.save();

    await CareActivity.create({
      elderlyId: appointment.elderlyId,
      authorId: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      activityType: status === 'completed' ? 'appointment_completed' : 'care_note',
      title: `Appointment ${status.toUpperCase()}: Dr. ${appointment.doctorName}`,
      description: `${req.user.name} marked appointment on ${appointment.date} as ${status}.`
    });

    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Send test appointment reminder email on-demand
 * @route POST /api/appointments/:id/send-reminder
 */
const sendManualAppointmentReminder = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('elderlyId');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const elderlyUser = appointment.elderlyId;
    const careCircle = await User.find({
      linkedElderly: elderlyUser._id,
      role: { $in: ['family', 'caregiver'] }
    });

    const recipients = [elderlyUser, ...careCircle];
    const emailResults = [];

    for (const recipient of recipients) {
      if (recipient.email) {
        const sent = await sendAppointmentReminderEmail({
          toUser: recipient,
          elderlyName: elderlyUser.name,
          doctorName: appointment.doctorName,
          specialty: appointment.specialty,
          clinicLocation: appointment.clinicLocation,
          date: appointment.date,
          time: appointment.time,
          purpose: appointment.purpose,
          preparation: appointment.preparationNotes
        });
        emailResults.push(sent);
      }
    }

    res.json({
      success: true,
      message: `Reminder email dispatched to ${emailResults.length} recipient(s)`,
      emails: emailResults
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAppointments,
  createAppointment,
  updateAppointment,
  setAppointmentStatus,
  sendManualAppointmentReminder
};
