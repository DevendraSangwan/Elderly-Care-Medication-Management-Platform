const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB } = require('./config/db');
const { initMailer } = require('./config/mailer');
const { initReminderScheduler } = require('./services/reminderScheduler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const medicationRoutes = require('./routes/medicationRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adherenceRoutes = require('./routes/adherenceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const vitalsRoutes = require('./routes/vitalsRoutes');
const activityRoutes = require('./routes/activityRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'CareBridge Healthcare Ecosystem',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/adherence', adherenceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/ai', aiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled application error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    await initMailer();

    if (process.env.ENABLE_AUTOMATED_SCHEDULER !== 'false') {
      initReminderScheduler();
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 CareBridge API Server running on http://localhost:${PORT}`);
    });

    return server;
  } catch (error) {
    console.error('Fatal startup error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
