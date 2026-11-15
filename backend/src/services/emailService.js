const { sendEmail } = require('../config/mailer');

/**
 * Send Medication Due Reminder Email
 */
const sendMedicationReminderEmail = async ({ toUser, elderlyName, medicationName, dosage, time, instructions }) => {
  const subject = `⏰ Medication Reminder: Time to take ${medicationName} (${dosage})`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold;">CareBridge Health Alert</h1>
        <p style="margin: 6px 0 0; opacity: 0.9; font-size: 16px;">Daily Medication Reminder</p>
      </div>
      <div style="padding: 24px 28px; color: #334155;">
        <p style="font-size: 16px; margin-top: 0;">Hello <strong>${toUser.name}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.5;">This is a friendly reminder for <strong>${elderlyName}</strong> to take their scheduled medication:</p>
        
        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin: 0 0 8px; color: #166534; font-size: 20px;">💊 ${medicationName}</h2>
          <p style="margin: 4px 0; font-size: 15px;"><strong>Dosage:</strong> ${dosage}</p>
          <p style="margin: 4px 0; font-size: 15px;"><strong>Scheduled Time:</strong> ${time}</p>
          ${instructions ? `<p style="margin: 4px 0; font-size: 15px;"><strong>Instructions:</strong> ${instructions}</p>` : ''}
        </div>

        <p style="font-size: 14px; color: #64748b; line-height: 1.5;">
          Please log into your CareBridge dashboard to mark this medication as taken once administered.
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background: #16a34a; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
            Open CareBridge Dashboard
          </a>
        </div>
      </div>
      <div style="background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        CareBridge Healthcare Ecosystem &bull; Empowering elderly independence & connected care
      </div>
    </div>
  `;

  return sendEmail({
    to: toUser.email,
    subject,
    html,
    type: 'medication_reminder',
    metadata: { elderlyName, medicationName, dosage, time }
  });
};

/**
 * Send Missed Medication Alert Email
 */
const sendMissedMedicationAlertEmail = async ({ toUser, elderlyName, medicationName, dosage, scheduledTime, relationship }) => {
  const isSelf = toUser.role === 'elderly';
  const subject = `⚠️ Missed Medication Alert: ${medicationName} was not logged`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #fecaca; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold;">CareBridge Safety Alert</h1>
        <p style="margin: 6px 0 0; opacity: 0.9; font-size: 16px;">Medication Missed Notification</p>
      </div>
      <div style="padding: 24px 28px; color: #334155;">
        <p style="font-size: 16px; margin-top: 0;">Hello <strong>${toUser.name}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.5;">
          ${isSelf 
            ? `You have a dose of <strong>${medicationName}</strong> that was scheduled for <strong>${scheduledTime}</strong> and has not yet been logged as taken.` 
            : `Your care recipient <strong>${elderlyName}</strong> has not logged their scheduled medication:`
          }
        </p>
        
        <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin: 0 0 8px; color: #991b1b; font-size: 20px;">⚠️ Missed Dose: ${medicationName}</h2>
          <p style="margin: 4px 0; font-size: 15px;"><strong>Dosage:</strong> ${dosage}</p>
          <p style="margin: 4px 0; font-size: 15px;"><strong>Scheduled Time:</strong> ${scheduledTime}</p>
          <p style="margin: 4px 0; font-size: 15px;"><strong>Patient:</strong> ${elderlyName}</p>
        </div>

        <p style="font-size: 14px; color: #64748b; line-height: 1.5;">
          ${isSelf 
            ? 'If you have already taken this medication, please tap "Mark as Taken" on your dashboard. If you missed it, please check with your doctor or caregiver.' 
            : 'Please check in with them to ensure they are feeling well and reminded to take their prescribed medication safely.'}
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background: #dc2626; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
            Review Medication Status
          </a>
        </div>
      </div>
      <div style="background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        CareBridge Healthcare Ecosystem &bull; Automatic Safety Monitoring
      </div>
    </div>
  `;

  return sendEmail({
    to: toUser.email,
    subject,
    html,
    type: 'medication_missed',
    metadata: { elderlyName, medicationName, dosage, scheduledTime }
  });
};

/**
 * Send Consecutive Missed Medications Urgent Alert
 */
const sendConsecutiveMissedAlertEmail = async ({ toUser, elderlyName, missedCount, medicationsList }) => {
  const subject = `🚨 URGENT: Multiple Consecutive Missed Medications for ${elderlyName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 2px solid #b91c1c; overflow: hidden;">
      <div style="background: #991b1b; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold;">🚨 URGENT HEALTHCARE NOTICE</h1>
        <p style="margin: 6px 0 0; opacity: 0.9; font-size: 16px;">Multiple Missed Doses Detected</p>
      </div>
      <div style="padding: 24px 28px; color: #334155;">
        <p style="font-size: 16px; margin-top: 0;">Attention <strong>${toUser.name}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.5; color: #991b1b; font-weight: bold;">
          CareBridge has detected ${missedCount} consecutive unlogged or missed medication doses for ${elderlyName}.
        </p>
        
        <div style="background: #fff1f2; border: 1px solid #fecdd3; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px; color: #9f1239;">Unconfirmed Medications:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #4c0519;">
            ${medicationsList.map(m => `<li style="margin-bottom: 6px;"><strong>${m.name}</strong> (${m.dosage}) - Scheduled: ${m.time}</li>`).join('')}
          </ul>
        </div>

        <p style="font-size: 15px; line-height: 1.5;">
          We recommend contacting ${elderlyName} or their primary caregiver immediately to verify their safety and adherence to medication therapy.
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background: #991b1b; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
            Check Patient Profile Now
          </a>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: toUser.email,
    subject,
    html,
    type: 'consecutive_missed',
    metadata: { elderlyName, missedCount }
  });
};

/**
 * Send Doctor Appointment Reminder Email
 */
const sendAppointmentReminderEmail = async ({ toUser, elderlyName, doctorName, specialty, clinicLocation, date, time, purpose, preparation }) => {
  const subject = `🩺 Doctor Appointment Reminder: ${doctorName} on ${date} at ${time}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #cbd5e1; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0284c7, #0369a1); padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Upcoming Medical Appointment</h1>
        <p style="margin: 6px 0 0; opacity: 0.9; font-size: 16px;">CareBridge Healthcare Schedule</p>
      </div>
      <div style="padding: 24px 28px; color: #334155;">
        <p style="font-size: 16px; margin-top: 0;">Hello <strong>${toUser.name}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.5;">
          This is an upcoming appointment reminder for <strong>${elderlyName}</strong>:
        </p>
        
        <div style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin: 0 0 8px; color: #075985; font-size: 20px;">Dr. ${doctorName} (${specialty})</h2>
          <p style="margin: 4px 0; font-size: 15px;"><strong>📅 Date & Time:</strong> ${date} at ${time}</p>
          <p style="margin: 4px 0; font-size: 15px;"><strong>📍 Location:</strong> ${clinicLocation}</p>
          <p style="margin: 4px 0; font-size: 15px;"><strong>📋 Purpose:</strong> ${purpose}</p>
          ${preparation ? `<p style="margin: 4px 0; font-size: 15px; color: #b45309;"><strong>⚠️ Preparation:</strong> ${preparation}</p>` : ''}
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background: #0284c7; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
            View Appointment Details
          </a>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: toUser.email,
    subject,
    html,
    type: 'appointment_reminder',
    metadata: { elderlyName, doctorName, date, time }
  });
};

/**
 * Send Emergency SOS Broadcast Email
 */
const sendEmergencySOSEmail = async ({ toUser, elderlyName, elderlyPhone, address, timestamp, emergencyContacts }) => {
  const subject = `🆘 EMERGENCY ALERT: ${elderlyName} has triggered an SOS Beacon!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 3px solid #dc2626; overflow: hidden;">
      <div style="background: #b91c1c; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🆘 EMERGENCY SOS BEACON</h1>
        <p style="margin: 8px 0 0; opacity: 0.95; font-size: 18px;">Immediate Assistance Requested</p>
      </div>
      <div style="padding: 24px 28px; color: #1e293b;">
        <p style="font-size: 17px; margin-top: 0; font-weight: bold; color: #b91c1c;">
          ${elderlyName} activated the Emergency SOS button at ${new Date(timestamp).toLocaleTimeString()} on ${new Date(timestamp).toLocaleDateString()}.
        </p>
        
        <div style="background: #fef2f2; border: 2px solid #ef4444; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px; color: #991b1b; font-size: 18px;">Emergency Contact & Location Info:</h3>
          <p style="margin: 4px 0; font-size: 16px;"><strong>Phone:</strong> ${elderlyPhone || 'Not specified'}</p>
          <p style="margin: 4px 0; font-size: 16px;"><strong>Home Address:</strong> ${address || 'On file in CareBridge'}</p>
        </div>

        <p style="font-size: 15px; line-height: 1.5; color: #334155;">
          Please attempt to contact them directly or contact emergency services (e.g. 911 / 112 / local emergency) if they do not answer.
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background: #dc2626; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block;">
            View Emergency Dashboard
          </a>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: toUser.email,
    subject,
    html,
    type: 'sos_alert',
    metadata: { elderlyName, timestamp }
  });
};

module.exports = {
  sendMedicationReminderEmail,
  sendMissedMedicationAlertEmail,
  sendConsecutiveMissedAlertEmail,
  sendAppointmentReminderEmail,
  sendEmergencySOSEmail
};
