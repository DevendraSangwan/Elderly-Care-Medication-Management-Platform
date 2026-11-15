const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      console.log('⚡ No external MONGODB_URI provided. Initializing local embedded MongoDB engine...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'carebridge_db'
        }
      });
      mongoUri = mongoMemoryServer.getUri();
      console.log(`✅ Embedded MongoDB initialized at: ${mongoUri}`);
    }

    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    // Check if auto-seed is needed
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Database is empty. Auto-seeding initial healthcare data...');
      await seedWithoutExit();
    }

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const seedWithoutExit = async () => {
  try {
    const User = require('../models/User');
    const ElderlyProfile = require('../models/ElderlyProfile');
    const Medication = require('../models/Medication');
    const MedicationLog = require('../models/MedicationLog');
    const Appointment = require('../models/Appointment');
    const Notification = require('../models/Notification');
    const CareActivity = require('../models/CareActivity');
    const VitalSign = require('../models/VitalSign');
    const { sendEmail } = require('../config/mailer');

    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    // 1. Elderly: Martha Johnson
    const elderlyUser = await User.create({
      name: 'Martha Johnson',
      email: 'martha@carebridge.health',
      password: 'password123',
      role: 'elderly',
      passcode: '1234',
      phone: '+1 (555) 234-5678',
      linkCode: 'CB-1001',
      preferences: {
        seniorMode: true,
        highContrast: false,
        voiceAssistantEnabled: true,
        emailNotifications: true
      }
    });

    // 2. Family: David Johnson
    const familyUser = await User.create({
      name: 'David Johnson',
      email: 'david@carebridge.health',
      password: 'password123',
      role: 'family',
      passcode: '2345',
      phone: '+1 (555) 876-5432',
      relationship: 'Son',
      linkedElderly: [elderlyUser._id]
    });

    // 3. Caregiver: Nurse Sarah Jenkins
    const caregiverUser = await User.create({
      name: 'Sarah Jenkins, RN',
      email: 'sarah@carebridge.health',
      password: 'password123',
      role: 'caregiver',
      passcode: '3456',
      phone: '+1 (555) 432-9876',
      relationship: 'Visiting Home Nurse',
      linkedElderly: [elderlyUser._id]
    });

    const profile = await ElderlyProfile.create({
      userId: elderlyUser._id,
      dateOfBirth: new Date('1949-04-18'),
      gender: 'female',
      bloodGroup: 'O+',
      allergies: ['Penicillin', 'Sulfa Antibiotics'],
      medicalConditions: ['Hypertension (Stage 1)', 'Type 2 Diabetes Mellitus', 'Mild Osteoarthritis'],
      emergencyContacts: [
        { name: 'David Johnson', relationship: 'Son', phone: '+1 (555) 876-5432', isPrimary: true },
        { name: 'Sarah Jenkins, RN', relationship: 'Home Care Nurse', phone: '+1 (555) 432-9876', isPrimary: false },
        { name: 'Emergency Dispatch (EMS)', relationship: 'Emergency Medical Services', phone: '911', isPrimary: false }
      ],
      primaryPhysician: {
        name: 'Dr. Robert Henderson',
        phone: '+1 (555) 789-0123',
        clinic: 'Mercy Heart & Vascular Clinic, Suite 400',
        email: 'dr.henderson@mercyhealth.org'
      },
      address: {
        street: '742 Evergreen Terrace, Apt 3B',
        city: 'Springfield',
        state: 'IL',
        zip: '62704'
      },
      notes: 'Prefers large print labels on pill bottles. Walk with cane. Regular blood sugar checks before breakfast.',
      caregiverNotes: [
        {
          authorId: caregiverUser._id,
          authorName: caregiverUser.name,
          authorRole: 'caregiver',
          note: 'Checked vitals this morning. Blood pressure steady at 122/78 mmHg. Blood glucose 110 mg/dL fasting.',
          createdAt: new Date(Date.now() - 24 * 3600 * 1000)
        }
      ],
      authorizedUsers: [
        { userId: familyUser._id, role: 'family', permissions: ['full'], addedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000) },
        { userId: caregiverUser._id, role: 'caregiver', permissions: ['full'], addedAt: new Date(Date.now() - 20 * 24 * 3600 * 1000) }
      ]
    });

    elderlyUser.elderlyProfile = profile._id;
    await elderlyUser.save();

    const medications = await Medication.create([
      {
        elderlyId: elderlyUser._id,
        name: 'Metformin',
        dosage: '500 mg',
        form: 'tablet',
        frequency: 'twice_daily',
        times: ['08:00', '20:00'],
        timeSlots: ['morning', 'bedtime'],
        instructions: 'Take 1 tablet with morning and evening meals with water.',
        pillColor: 'white',
        pillShape: 'oval',
        prescribingDoctor: 'Dr. Emily Vance (Endocrinology)',
        purpose: 'Type 2 Diabetes Blood Sugar Control',
        stockCount: 42,
        lowStockThreshold: 10,
        createdBy: caregiverUser._id
      },
      {
        elderlyId: elderlyUser._id,
        name: 'Lisinopril',
        dosage: '10 mg',
        form: 'tablet',
        frequency: 'daily',
        times: ['08:00'],
        timeSlots: ['morning'],
        instructions: 'Take 1 tablet every morning with or without food.',
        pillColor: 'yellow',
        pillShape: 'round',
        prescribingDoctor: 'Dr. Robert Henderson (Cardiology)',
        purpose: 'Blood Pressure Regulation',
        stockCount: 18,
        lowStockThreshold: 7,
        createdBy: caregiverUser._id
      },
      {
        elderlyId: elderlyUser._id,
        name: 'Atorvastatin',
        dosage: '20 mg',
        form: 'tablet',
        frequency: 'daily',
        times: ['21:00'],
        timeSlots: ['bedtime'],
        instructions: 'Take 1 tablet at bedtime. Avoid grapefruit.',
        pillColor: 'blue',
        pillShape: 'oval',
        prescribingDoctor: 'Dr. Robert Henderson (Cardiology)',
        purpose: 'Cholesterol Management',
        stockCount: 24,
        lowStockThreshold: 7,
        createdBy: caregiverUser._id
      },
      {
        elderlyId: elderlyUser._id,
        name: 'Calcium + Vitamin D3',
        dosage: '600 mg / 400 IU',
        form: 'capsule',
        frequency: 'daily',
        times: ['13:00'],
        timeSlots: ['afternoon'],
        instructions: 'Take with midday lunch.',
        pillColor: 'orange',
        pillShape: 'capsule',
        prescribingDoctor: 'Dr. Robert Henderson',
        purpose: 'Bone Density & Joint Support',
        stockCount: 60,
        lowStockThreshold: 14,
        createdBy: familyUser._id
      },
      {
        elderlyId: elderlyUser._id,
        name: 'Baby Aspirin (EC)',
        dosage: '81 mg',
        form: 'tablet',
        frequency: 'daily',
        times: ['08:00'],
        timeSlots: ['morning'],
        instructions: 'Take 1 enteric-coated tablet with breakfast.',
        pillColor: 'red',
        pillShape: 'round',
        prescribingDoctor: 'Dr. Robert Henderson',
        purpose: 'Cardiovascular Protection',
        stockCount: 50,
        lowStockThreshold: 10,
        createdBy: caregiverUser._id
      }
    ]);

    const now = new Date();
    const logs = [];

    for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
      const d = new Date();
      d.setDate(now.getDate() - dayOffset);
      const dateStr = formatDate(d);
      const isToday = dayOffset === 0;

      for (const med of medications) {
        for (const time of med.times) {
          let status = 'taken';
          let takenAt = new Date(d);
          const [h, m] = time.split(':').map(Number);
          takenAt.setHours(h, m + 5, 0, 0);

          if (isToday) {
            const currentHour = now.getHours();
            if (h < currentHour) {
              status = 'taken';
            } else {
              status = 'pending';
              takenAt = undefined;
            }
          } else {
            if (dayOffset === 3 && time === '20:00' && med.name === 'Metformin') {
              status = 'missed';
              takenAt = undefined;
            } else if (dayOffset === 6 && time === '13:00') {
              status = 'missed';
              takenAt = undefined;
            }
          }

          logs.push({
            elderlyId: elderlyUser._id,
            medicationId: med._id,
            medicationName: med.name,
            dosage: med.dosage,
            date: dateStr,
            scheduledTime: time,
            timeSlot: med.timeSlots[0] || 'morning',
            status,
            takenAt,
            markedBy: status === 'taken' ? elderlyUser._id : undefined,
            markedByName: status === 'taken' ? elderlyUser.name : '',
            markedByRole: 'elderly',
            reminderSent: true,
            missedAlertSent: status === 'missed'
          });
        }
      }
    }

    await MedicationLog.insertMany(logs);

    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 2);
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 8);
    const pastMonth = new Date();
    pastMonth.setDate(now.getDate() - 15);

    await Appointment.create([
      {
        elderlyId: elderlyUser._id,
        doctorName: 'Dr. Robert Henderson',
        specialty: 'Cardiology Specialist',
        clinicLocation: 'Mercy Heart Center, Room 410',
        date: formatDate(tomorrow),
        time: '10:30',
        purpose: 'Bi-annual Hypertension Checkup & ECG Review',
        preparationNotes: 'Bring morning blood pressure log and medication list. Fasting NOT required.',
        doctorPhone: '+1 (555) 789-0123',
        status: 'scheduled',
        createdBy: caregiverUser._id
      },
      {
        elderlyId: elderlyUser._id,
        doctorName: 'Dr. Emily Vance',
        specialty: 'Endocrinology & Diabetes Clinic',
        clinicLocation: 'St. Jude Health Pavilion, Suite 202',
        date: formatDate(nextWeek),
        time: '09:00',
        purpose: 'HbA1c Bloodwork & Diabetic Foot Inspection',
        preparationNotes: 'Fasting 10 hours required for fasting blood draw. Drink water normally.',
        doctorPhone: '+1 (555) 654-3210',
        status: 'scheduled',
        createdBy: familyUser._id
      },
      {
        elderlyId: elderlyUser._id,
        doctorName: 'Dr. Alan Mitchell',
        specialty: 'Ophthalmology (Eye Clinic)',
        clinicLocation: 'ClearVision Eye Center',
        date: formatDate(pastMonth),
        time: '14:00',
        purpose: 'Annual Diabetic Retinopathy Eye Exam',
        preparationNotes: 'Dilating eye drops used. Sunglasses recommended for ride home.',
        status: 'completed',
        createdBy: familyUser._id
      }
    ]);

    for (let i = 6; i >= 0; i--) {
      const vDate = new Date();
      vDate.setDate(now.getDate() - i);
      vDate.setHours(9, 15, 0, 0);

      await VitalSign.create({
        elderlyId: elderlyUser._id,
        recordedBy: caregiverUser._id,
        recordedByName: caregiverUser.name,
        recordedByRole: 'caregiver',
        date: vDate,
        bloodPressureSystolic: 120 + Math.floor(Math.random() * 8),
        bloodPressureDiastolic: 78 + Math.floor(Math.random() * 6),
        bloodSugar: 105 + Math.floor(Math.random() * 18),
        bloodSugarTiming: 'fasting',
        pulseRate: 72 + Math.floor(Math.random() * 6),
        oxygenSaturation: 98,
        temperature: 98.4,
        notes: i === 0 ? 'Martha is in high spirits, enjoyed her morning tea.' : 'Vitals stable.'
      });
    }

    await CareActivity.create([
      {
        elderlyId: elderlyUser._id,
        authorId: elderlyUser._id,
        authorName: elderlyUser.name,
        authorRole: 'elderly',
        activityType: 'medication_taken',
        title: 'Morning Medications Taken',
        description: 'Martha confirmed taking Lisinopril 10mg, Metformin 500mg, and Baby Aspirin 81mg.',
        createdAt: new Date(now.getTime() - 2 * 3600 * 1000)
      },
      {
        elderlyId: elderlyUser._id,
        authorId: caregiverUser._id,
        authorName: caregiverUser.name,
        authorRole: 'caregiver',
        activityType: 'vitals_recorded',
        title: 'Morning Vitals Recorded',
        description: 'BP: 124/80 mmHg | Blood Sugar: 112 mg/dL fasting | Pulse: 74 bpm. All within healthy targets.',
        createdAt: new Date(now.getTime() - 3 * 3600 * 1000)
      },
      {
        elderlyId: elderlyUser._id,
        authorId: familyUser._id,
        authorName: familyUser.name,
        authorRole: 'family',
        activityType: 'care_note',
        title: 'David checked in',
        description: 'Called Mom on video call. She had oatmeal for breakfast and is looking forward to her walk.',
        createdAt: new Date(now.getTime() - 4 * 3600 * 1000)
      }
    ]);

    await Notification.create([
      {
        recipientId: elderlyUser._id,
        elderlyId: elderlyUser._id,
        elderlyName: elderlyUser.name,
        title: 'Time to take Metformin (500 mg)',
        message: 'Morning dose scheduled for 08:00 AM with breakfast.',
        type: 'medication_reminder',
        priority: 'medium',
        isRead: true,
        emailSent: true
      },
      {
        recipientId: familyUser._id,
        elderlyId: elderlyUser._id,
        elderlyName: elderlyUser.name,
        title: 'Morning Doses Confirmed: Martha Johnson',
        message: 'Martha has completed all 3 scheduled morning medications.',
        type: 'medication_taken',
        priority: 'low',
        isRead: false
      }
    ]);

    console.log('✅ Auto-seed completed successfully!');
  } catch (err) {
    console.error('Auto-seed error:', err);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('MongoDB connection closed.');
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error);
  }
};

module.exports = { connectDB, disconnectDB };
