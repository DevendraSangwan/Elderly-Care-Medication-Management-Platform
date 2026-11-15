const nodemailer = require('nodemailer');

// In-memory store of recent sent emails for real-time in-app inspection
const emailHistory = [];
const MAX_EMAIL_HISTORY = 50;

let transporter = null;

const initMailer = async () => {
  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      console.log('📧 Nodemailer configured with custom SMTP transport.');
    } else {
      // Create a test account on Ethereal or mock transport
      const testAccount = await nodemailer.createTestAccount().catch(() => null);
      if (testAccount) {
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
        console.log(`📧 Nodemailer initialized Ethereal test account: ${testAccount.user}`);
      } else {
        // Fallback json transport
        transporter = nodemailer.createTransport({
          jsonTransport: true
        });
        console.log('📧 Nodemailer running in mock JSON mode.');
      }
    }
  } catch (err) {
    console.warn('⚠️ Nodemailer setup warning (falling back to in-memory logger):', err.message);
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }
};

const sendEmail = async ({ to, subject, html, text, type = 'general', metadata = {} }) => {
  const from = process.env.EMAIL_FROM || '"CareBridge Healthcare" <alerts@carebridge.health>';
  const emailRecord = {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    from,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>?/gm, ''),
    type,
    metadata,
    status: 'sent',
    sentAt: new Date()
  };

  try {
    if (!transporter) {
      await initMailer();
    }

    if (transporter) {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text: emailRecord.text,
        html: emailRecord.html
      });
      emailRecord.messageId = info.messageId;
      if (nodemailer.getTestMessageUrl && info) {
        emailRecord.previewUrl = nodemailer.getTestMessageUrl(info);
      }
    }

    console.log(`📨 [EMAIL SENT] To: ${to} | Subject: "${subject}" | Type: ${type}`);
  } catch (err) {
    console.error(`❌ [EMAIL ERROR] Failed to send to ${to}:`, err.message);
    emailRecord.status = 'failed';
    emailRecord.error = err.message;
  }

  // Prepend to email history
  emailHistory.unshift(emailRecord);
  if (emailHistory.length > MAX_EMAIL_HISTORY) {
    emailHistory.pop();
  }

  return emailRecord;
};

const getEmailHistory = () => emailHistory;
const clearEmailHistory = () => { emailHistory.length = 0; };

module.exports = {
  initMailer,
  sendEmail,
  getEmailHistory,
  clearEmailHistory
};
