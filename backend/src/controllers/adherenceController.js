const MedicationLog = require('../models/MedicationLog');
const Medication = require('../models/Medication');

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * @desc Get adherence statistics and analytics for an elderly person
 * @route GET /api/adherence/:elderlyId/stats
 */
const getAdherenceStats = async (req, res) => {
  try {
    const elderlyId = req.targetElderlyId;
    const now = new Date();

    // 7 days window
    const past7Date = new Date();
    past7Date.setDate(now.getDate() - 6);
    const startDate7 = formatDate(past7Date);
    const todayStr = formatDate(now);

    // 30 days window
    const past30Date = new Date();
    past30Date.setDate(now.getDate() - 29);
    const startDate30 = formatDate(past30Date);

    // Query 30 days logs
    const logs30 = await MedicationLog.find({
      elderlyId,
      date: { $gte: startDate30, $lte: todayStr }
    });

    const logs7 = logs30.filter(l => l.date >= startDate7);

    // Overall 7-day stats
    const total7 = logs7.length;
    const taken7 = logs7.filter(l => l.status === 'taken').length;
    const missed7 = logs7.filter(l => l.status === 'missed').length;
    const pending7 = logs7.filter(l => l.status === 'pending').length;
    const adherenceRate7 = (taken7 + missed7) > 0 ? Math.round((taken7 / (taken7 + missed7)) * 100) : 100;

    // Overall 30-day stats
    const total30 = logs30.length;
    const taken30 = logs30.filter(l => l.status === 'taken').length;
    const missed30 = logs30.filter(l => l.status === 'missed').length;
    const adherenceRate30 = (taken30 + missed30) > 0 ? Math.round((taken30 / (taken30 + missed30)) * 100) : 100;

    // Daily 7-day trend breakdown
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = formatDate(d);
      const dayLogs = logs7.filter(l => l.date === dateStr);
      const dayTaken = dayLogs.filter(l => l.status === 'taken').length;
      const dayMissed = dayLogs.filter(l => l.status === 'missed').length;
      const dayPending = dayLogs.filter(l => l.status === 'pending').length;
      const dayTotal = dayLogs.length;
      const dayAdherence = (dayTaken + dayMissed) > 0 ? Math.round((dayTaken / (dayTaken + dayMissed)) * 100) : (dayTaken > 0 ? 100 : 0);

      dailyTrend.push({
        date: dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        taken: dayTaken,
        missed: dayMissed,
        pending: dayPending,
        total: dayTotal,
        adherenceRate: dayAdherence
      });
    }

    // Adherence by Time Slot
    const slots = { morning: { taken: 0, total: 0 }, afternoon: { taken: 0, total: 0 }, evening: { taken: 0, total: 0 }, bedtime: { taken: 0, total: 0 } };
    logs30.forEach((l) => {
      const slot = l.timeSlot || 'morning';
      if (slots[slot]) {
        slots[slot].total += 1;
        if (l.status === 'taken') slots[slot].taken += 1;
      }
    });

    const slotBreakdown = Object.keys(slots).map((key) => ({
      slot: key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      taken: slots[key].taken,
      total: slots[key].total,
      rate: slots[key].total > 0 ? Math.round((slots[key].taken / slots[key].total) * 100) : 100
    }));

    // Current Adherence Streak (consecutive days with 100% adherence or all taken)
    let streakDays = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = formatDate(d);
      const dayLogs = logs30.filter(l => l.date === dateStr);
      if (dayLogs.length === 0) continue;
      const hasMissed = dayLogs.some(l => l.status === 'missed');
      if (!hasMissed && dayLogs.some(l => l.status === 'taken')) {
        streakDays++;
      } else if (hasMissed) {
        break;
      }
    }

    res.json({
      success: true,
      stats: {
        last7Days: {
          adherenceRate: adherenceRate7,
          taken: taken7,
          missed: missed7,
          pending: pending7,
          total: total7
        },
        last30Days: {
          adherenceRate: adherenceRate30,
          taken: taken30,
          missed: missed30,
          total: total30
        },
        streakDays,
        dailyTrend,
        slotBreakdown
      }
    });
  } catch (error) {
    console.error('getAdherenceStats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdherenceStats
};
