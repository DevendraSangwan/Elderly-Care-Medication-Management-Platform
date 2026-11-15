const Medication = require('../models/Medication');
const ElderlyProfile = require('../models/ElderlyProfile');

// Medical knowledge base & drug interaction rules for accurate offline healthcare guidance
const DRUG_INTERACTIONS = [
  {
    drugs: ['aspirin', 'warfarin'],
    level: 'High Risk',
    advice: 'Concurrent use increases bleeding risk. Closely monitor INR and look for unusual bruising or bleeding. Consult your doctor.'
  },
  {
    drugs: ['lisinopril', 'spironolactone'],
    level: 'Moderate Risk',
    advice: 'Both medications can increase potassium levels (hyperkalemia). Routine blood tests for serum potassium are recommended.'
  },
  {
    drugs: ['metformin', 'contrast'],
    level: 'High Risk',
    advice: 'Metformin should generally be withheld prior to and 48 hours after iodinated contrast radiologic procedures due to lactic acidosis risk.'
  },
  {
    drugs: ['atorvastatin', 'grapefruit'],
    level: 'Moderate Risk',
    advice: 'Grapefruit or grapefruit juice inhibits CYP3A4 enzymes and significantly raises statin blood concentration, increasing muscle toxicity risk.'
  },
  {
    drugs: ['calcium', 'iron'],
    level: 'Interaction Notice',
    advice: 'Calcium significantly impairs the intestinal absorption of iron supplements. Separate intake by at least 2 to 3 hours.'
  },
  {
    drugs: ['levothyroxine', 'calcium'],
    level: 'Interaction Notice',
    advice: 'Calcium carbonate reduces thyroid hormone absorption. Take Levothyroxine on an empty stomach at least 4 hours apart from calcium.'
  }
];

const COMMON_DRUG_TIPS = {
  metformin: 'Best taken with meals to reduce gastrointestinal upset. Avoid excessive alcohol consumption.',
  lisinopril: 'Can be taken with or without food. Take at approximately the same time daily. Watch for persistent dry cough.',
  atorvastatin: 'Commonly taken in the evening or bedtime as cholesterol synthesis peaks overnight. Avoid large quantities of grapefruit juice.',
  amlodipine: 'Take once daily with or without food. Watch for ankle swelling (peripheral edema). Report sudden dizziness.',
  omeprazole: 'Best taken in the morning 30 to 60 minutes before breakfast for optimal acid suppression.',
  levothyroxine: 'Take first thing in the morning with a full glass of water, at least 30-60 minutes before breakfast or coffee.',
  furosemide: 'Best taken in the morning to prevent waking up repeatedly at night to urinate.'
};

/**
 * @desc AI Healthcare Assistant Query
 * @route POST /api/ai/ask
 */
const askAIAssistant = async (req, res) => {
  try {
    const { question, elderlyId } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a health or medication question' });
    }

    const query = question.toLowerCase();
    let patientMeds = [];
    let patientProfile = null;

    if (elderlyId) {
      patientMeds = await Medication.find({ elderlyId, isActive: true });
      patientProfile = await ElderlyProfile.findOne({ userId: elderlyId });
    }

    let response = '';
    let category = 'general';
    let detectedInteractions = [];

    // 1. Check for drug interaction queries
    for (const rule of DRUG_INTERACTIONS) {
      const matchAll = rule.drugs.every(d => query.includes(d));
      if (matchAll) {
        detectedInteractions.push(rule);
      }
    }

    // Also cross-reference against patient's current medications
    if (patientMeds.length > 0) {
      const medNames = patientMeds.map(m => m.name.toLowerCase());
      for (const rule of DRUG_INTERACTIONS) {
        const matchingCurrent = rule.drugs.filter(d => medNames.some(m => m.includes(d)));
        const matchingQuery = rule.drugs.filter(d => query.includes(d));
        if (matchingCurrent.length > 0 && matchingQuery.length > 0 && !detectedInteractions.includes(rule)) {
          detectedInteractions.push(rule);
        }
      }
    }

    if (detectedInteractions.length > 0) {
      category = 'interaction';
      response = `### 🔍 Medication Interaction Analysis\n\n`;
      detectedInteractions.forEach(item => {
        response += `**${item.drugs.join(' + ').toUpperCase()}** (${item.level})\n`;
        response += `${item.advice}\n\n`;
      });
      response += `*Recommendation:* Always notify your physician and pharmacist before starting any new prescription, over-the-counter supplement, or herbal remedy.`;
    } 
    // 2. Check for "missed dose" guidance
    else if (query.includes('missed') || query.includes('forgot') || query.includes('skip')) {
      category = 'missed_dose';
      response = `### ⏰ What To Do If You Missed a Medication Dose\n\n` +
        `1. **Check the Time Window:** In general, if you remember within a couple of hours of your scheduled time, take it as soon as you remember.\n` +
        `2. **Do Not Double Up:** If it is almost time for your next scheduled dose, skip the missed dose and resume your normal schedule. Never take two doses at once to make up for a missed pill unless explicitly instructed by your physician.\n` +
        `3. **Log the Status:** Use the CareBridge dashboard to mark the dose as "Missed" or "Skipped" so your family and caregivers know what happened.\n` +
        `4. **Specific Medications:** Certain medications (like insulin, blood thinners, or heart medications) have strict protocols. Contact your pharmacist or on-call clinic for personalized instructions.`;
    }
    // 3. Check for specific medication timing/instructions
    else if (Object.keys(COMMON_DRUG_TIPS).some(drug => query.includes(drug))) {
      category = 'medication_guidance';
      const foundDrug = Object.keys(COMMON_DRUG_TIPS).find(drug => query.includes(drug));
      response = `### 💊 Clinical Guidance for ${foundDrug.toUpperCase()}\n\n` +
        `${COMMON_DRUG_TIPS[foundDrug]}\n\n` +
        `**Senior Safety Tips:**\n` +
        `• Keep medication in original labeled containers or your designated pill organizer.\n` +
        `• Swallow tablets whole with plenty of water unless labeled chewable or dispersible.\n` +
        `• Report any new dizziness, rashes, stomach pain, or swelling promptly to your healthcare provider.`;
    }
    // 4. Health Routine / Senior Wellness
    else if (query.includes('water') || query.includes('diet') || query.includes('exercise') || query.includes('routine') || query.includes('sleep') || query.includes('blood pressure')) {
      category = 'routine_wellness';
      response = `### 🌿 Senior Healthcare Routine Recommendations\n\n` +
        `• **Consistent Schedule:** Taking your medications at the same time each day (e.g. right after breakfast or at bedtime) helps build an effortless daily habit.\n` +
        `• **Hydration:** Seniors often experience a reduced sensation of thirst. Aim for 6–8 glasses of water daily, unless your doctor has placed you on a fluid restriction.\n` +
        `• **Gentle Movement:** 20–30 minutes of low-impact walking, light stretching, or chair yoga promotes joint flexibility, mood, and cardiovascular health.\n` +
        `• **Blood Pressure Monitoring:** Rest quietly for 5 minutes before taking readings. Keep your arm supported at heart level.`;
    }
    // 5. General intelligent assistant response
    else {
      category = 'general_assistance';
      response = `### 🩺 CareBridge Healthcare Assistant\n\n` +
        `Thank you for reaching out with your question. Here is helpful healthcare guidance:\n\n` +
        `• **Caregiver Alignment:** Whenever managing multiple prescription medications, keep an up-to-date medication list on your CareBridge profile and share it during every doctor appointment.\n` +
        `• **Adherence Support:** You can ask your family or caregiver to set reminders in CareBridge, or enable Senior Audio Mode to have your daily pill schedule read aloud.\n` +
        `• **For questions about specific pills:** Try asking about a medication name (such as *Metformin*, *Lisinopril*, *Amlodipine*, *Aspirin*) or ask *"Can I take Aspirin with Warfarin?"* or *"What if I missed a dose?"*`;
    }

    res.json({
      success: true,
      category,
      answer: response,
      disclaimer: '⚠️ Informational Guidance Only: This information is generated by the CareBridge Health Assistant for educational reference and does not substitute for professional clinical judgment, diagnosis, or treatment. Always consult your qualified doctor or pharmacist.'
    });
  } catch (error) {
    console.error('askAIAssistant error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  askAIAssistant
};
