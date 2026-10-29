/**
 * Demo data seeder for CampusLoop.
 * All records are flagged with is_demo = 1 so they never mix with real data.
 *
 * Can be run standalone via `node server/seed.js` or through the admin API.
 */

const COLLEGES = [
  'JNTU Hyderabad',
  'VIT Vellore',
  'SRM Chennai',
  'BITS Pilani',
  'NIT Warangal',
  'IIIT Hyderabad',
  'Amrita Bangalore',
  'Manipal Institute of Technology',
  'PES University',
  'RV College of Engineering',
];

const FIRST_NAMES = [
  'Aarav', 'Aditi', 'Arjun', 'Diya', 'Harsh', 'Ishita', 'Kavya', 'Manish',
  'Neha', 'Priya', 'Rahul', 'Riya', 'Rohan', 'Sanya', 'Sneha', 'Tanvi',
  'Varun', 'Vikram', 'Yash', 'Zara', 'Aditya', 'Ananya', 'Bhavya', 'Chirag',
  'Deepa', 'Esha', 'Gaurav', 'Harini', 'Isha', 'Jay', 'Kriti', 'Lakshmi',
  'Mohit', 'Nisha', 'Om', 'Pooja', 'Ritika', 'Sahil', 'Tara', 'Uma',
];

const LAST_NAMES = [
  'Sharma', 'Reddy', 'Patel', 'Nair', 'Kumar', 'Singh', 'Gupta', 'Rao',
  'Verma', 'Iyer', 'Pillai', 'Chopra', 'Desai', 'Joshi', 'Menon', 'Sinha',
];

const SOURCES = [
  'whatsapp_group', 'whatsapp_group', 'whatsapp_group', // 3× weight
  'ambassador_referral', 'ambassador_referral',          // 2× weight
  'college_club', 'instagram', 'direct',
];

const AMBASSADOR_DATA = [
  { name: 'Priya Sharma', college: 'JNTU Hyderabad' },
  { name: 'Rahul Reddy', college: 'VIT Vellore' },
  { name: 'Sneha Patel', college: 'SRM Chennai' },
  { name: 'Arjun Nair', college: 'BITS Pilani' },
  { name: 'Kavya Kumar', college: 'NIT Warangal' },
  { name: 'Varun Gupta', college: 'IIIT Hyderabad' },
  { name: 'Diya Rao', college: 'Amrita Bangalore' },
  { name: 'Rohan Verma', college: 'Manipal Institute of Technology' },
  { name: 'Tanvi Iyer', college: 'PES University' },
  { name: 'Yash Singh', college: 'RV College of Engineering' },
];

const EXPERIMENT_DATA = [
  {
    day: 1,
    hypothesis: 'WhatsApp group message CTR ≥ 10%',
    change_made: 'Tested 2 message variants: outcome-led vs. curiosity-led',
    metric: 'Click-through rate per message variant',
    observation: 'Outcome-led variant ("Build an AI project for your interview") had 14% CTR vs 8% for curiosity variant',
    next_action: 'Use outcome-led messaging for all remaining groups',
  },
  {
    day: 2,
    hypothesis: 'Landing page converts ≥ 30% of visitors',
    change_made: 'Measured first 80 unique visitors from WhatsApp links',
    metric: 'Visitor → Registration conversion rate',
    observation: 'Conversion rate was 38% — above target. Form simplicity is working.',
    next_action: 'No landing page changes needed. Focus on increasing reach.',
  },
  {
    day: 3,
    hypothesis: 'Each ambassador generates ≥ 10 registrations in 48 hours',
    change_made: 'Tracked per-ambassador referral links',
    metric: 'Registrations per ambassador (48-hour window)',
    observation: 'Average yield: 12.4 registrations. Top ambassador: 23. Lowest: 3.',
    next_action: 'Share top ambassador\'s approach with others. Recruit 5 more ambassadors from underperforming colleges.',
  },
  {
    day: 5,
    hypothesis: 'Social proof ("X students from your college") increases CTR by ≥ 20%',
    change_made: 'Added college-specific registration count to WhatsApp message template',
    metric: 'CTR of messages with vs. without social proof',
    observation: 'Pending — need 24h of data to compare',
    next_action: 'Evaluate tomorrow and decide whether to update all message templates',
  },
];

function seedDemoData(db) {
  const { nanoid } = require('nanoid');

  // ── Seed ambassadors ───────────────────────────────────────
  const ambassadorStmt = db.prepare(`
    INSERT INTO ambassadors (name, code, college, email, is_demo)
    VALUES (?, ?, ?, ?, 1)
  `);

  const ambassadorCodes = [];
  let ambIdx = 1;
  for (const amb of AMBASSADOR_DATA) {
    const code = `AMB${String(ambIdx).padStart(3, '0')}`;
    ambassadorStmt.run(amb.name, code, amb.college, `${amb.name.toLowerCase().replace(/\s/g, '.')}@demo.com`);
    ambassadorCodes.push(code);
    ambIdx++;
  }

  // ── Seed registrations (spread across 7 campaign days) ─────
  const regStmt = db.prepare(`
    INSERT OR IGNORE INTO registrations (name, email, college, graduation_year, referral_code, source, is_demo, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?)
  `);

  const startDate = new Date(process.env.CAMPAIGN_START_DATE || '2026-11-01');
  // Distribution: realistic S-curve across 7 days
  const dailyCounts = [8, 22, 35, 42, 48, 55, 40]; // total = 250 demo registrations
  let regCount = 0;

  for (let day = 0; day < 7; day++) {
    const count = dailyCounts[day];
    for (let i = 0; i < count; i++) {
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const name = `${firstName} ${lastName}`;
      const email = `demo.${firstName.toLowerCase()}.${lastName.toLowerCase()}.${regCount}@demo.campusloop`;
      const college = COLLEGES[Math.floor(Math.random() * COLLEGES.length)];
      const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];
      const year = Math.random() > 0.3 ? 2027 : 2026;

      // Assign referral to ~60% of registrations
      let referral = null;
      if (Math.random() < 0.6 && ambassadorCodes.length > 0) {
        referral = ambassadorCodes[Math.floor(Math.random() * ambassadorCodes.length)];
      }

      // Random time within the day
      const regDate = new Date(startDate);
      regDate.setDate(regDate.getDate() + day);
      regDate.setHours(8 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60));

      regStmt.run(name, email, college, year, referral, source, regDate.toISOString());
      regCount++;
    }
  }

  // ── Seed experiment log ────────────────────────────────────
  const expStmt = db.prepare(`
    INSERT INTO experiment_log (day, hypothesis, change_made, metric, observation, next_action, is_demo)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);

  for (const exp of EXPERIMENT_DATA) {
    expStmt.run(exp.day, exp.hypothesis, exp.change_made, exp.metric, exp.observation, exp.next_action);
  }

  return {
    ambassadors: AMBASSADOR_DATA.length,
    registrations: regCount,
    experiments: EXPERIMENT_DATA.length,
  };
}

// Run standalone if called directly
if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
  const { getDb } = require('./db');
  const db = getDb();

  console.log('🌱 Seeding demo data...');
  const counts = seedDemoData(db);
  console.log(`✅ Seeded: ${counts.ambassadors} ambassadors, ${counts.registrations} registrations, ${counts.experiments} experiments`);
  console.log('   All records are flagged is_demo=1');
}

module.exports = { seedDemoData };
