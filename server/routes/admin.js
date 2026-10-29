const express = require('express');
const { getDb } = require('../db');
const { requireAdmin } = require('../middleware/auth');
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');

const router = express.Router();

// All admin routes require authentication
router.use(requireAdmin);

// ── Auth check ───────────────────────────────────────────────
router.get('/verify', (req, res) => {
  res.json({ authenticated: true });
});

// ── Dashboard Stats ──────────────────────────────────────────
router.get('/stats', (req, res) => {
  const db = getDb();
  const goal = parseInt(process.env.CAMPAIGN_GOAL || '500', 10);
  const includeDemo = req.query.includeDemo === 'true';

  const liveRow = db.prepare('SELECT COUNT(*) as count FROM registrations WHERE is_demo = 0').get();
  const demoRow = db.prepare('SELECT COUNT(*) as count FROM registrations WHERE is_demo = 1').get();
  const allRow = db.prepare('SELECT COUNT(*) as count FROM registrations').get();

  const totalCount = includeDemo ? allRow.count : liveRow.count;

  const todayDemoFilter = includeDemo ? '' : 'AND is_demo = 0';
  const todayRow = db.prepare(`
    SELECT COUNT(*) as count FROM registrations
    WHERE date(created_at) = date('now') ${todayDemoFilter}
  `).get();

  const collegeDemoFilter = includeDemo ? '' : 'WHERE is_demo = 0';
  const uniqueColleges = db.prepare(`
    SELECT COUNT(DISTINCT college) as count FROM registrations ${collegeDemoFilter}
  `).get();

  const ambassadorDemoFilter = includeDemo ? '' : 'AND r.is_demo = 0';
  const activeAmbassadors = db.prepare(`
    SELECT COUNT(DISTINCT a.code) as count
    FROM ambassadors a
    INNER JOIN registrations r ON r.referral_code = a.code ${ambassadorDemoFilter}
  `).get();

  const totalAmbassadors = db.prepare('SELECT COUNT(*) as count FROM ambassadors').get();

  // Campaign day calculation
  const startDate = process.env.CAMPAIGN_START_DATE || '2026-11-01';
  const campaignDays = parseInt(process.env.CAMPAIGN_DAYS || '7', 10);
  const now = new Date();
  const start = new Date(startDate);
  const dayNumber = Math.max(1, Math.min(campaignDays, Math.ceil((now - start) / (1000 * 60 * 60 * 24)) + 1));

  // Planned daily trajectory (strictly summing to 500)
  const dailyTargets = calculateDailyTargets(goal, campaignDays);
  const cumulativeTarget = dailyTargets.slice(0, dayNumber).reduce((a, b) => a + b, 0);

  res.json({
    goal,
    totalRegistrations: totalCount,
    liveRegistrations: liveRow.count,
    demoRegistrations: demoRow.count,
    allRegistrations: allRow.count,
    todayRegistrations: todayRow.count,
    remaining: Math.max(0, goal - totalCount),
    progressPercent: Math.round((totalCount / goal) * 100 * 10) / 10,
    uniqueColleges: uniqueColleges.count,
    activeAmbassadors: activeAmbassadors.count,
    totalAmbassadors: totalAmbassadors.count,
    campaignDay: dayNumber,
    campaignDays,
    plannedCumulative: cumulativeTarget,
    status: totalCount >= cumulativeTarget ? 'ahead' : 'behind',
    dailyTarget: dailyTargets[dayNumber - 1] || 0,
    includeDemo,
  });
});

// ── Daily Trend ──────────────────────────────────────────────
router.get('/daily-trend', (req, res) => {
  const db = getDb();
  const includeDemo = req.query.includeDemo === 'true';
  const demoFilter = includeDemo ? '' : 'WHERE is_demo = 0';

  const rows = db.prepare(`
    SELECT date(created_at) as day, COUNT(*) as count
    FROM registrations
    ${demoFilter}
    GROUP BY date(created_at)
    ORDER BY day ASC
  `).all();

  // Return planned trajectory
  const goal = parseInt(process.env.CAMPAIGN_GOAL || '500', 10);
  const campaignDays = parseInt(process.env.CAMPAIGN_DAYS || '7', 10);
  const startDate = process.env.CAMPAIGN_START_DATE || '2026-11-01';
  const dailyTargets = calculateDailyTargets(goal, campaignDays);

  const trajectory = [];
  for (let i = 0; i < campaignDays; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    trajectory.push({
      day: d.toISOString().split('T')[0],
      planned: dailyTargets[i],
      plannedCumulative: dailyTargets.slice(0, i + 1).reduce((a, b) => a + b, 0),
    });
  }

  // Merge actual data with trajectory
  let cumulativeActual = 0;
  const merged = trajectory.map((t) => {
    const actual = rows.find((r) => r.day === t.day);
    const dailyActual = actual ? actual.count : 0;
    cumulativeActual += dailyActual;
    return {
      ...t,
      actual: dailyActual,
      actualCumulative: cumulativeActual,
    };
  });

  res.json({ trend: merged, raw: rows });
});

// ── Channel Breakdown ────────────────────────────────────────
router.get('/channels', (req, res) => {
  const db = getDb();
  const includeDemo = req.query.includeDemo === 'true';
  const demoFilter = includeDemo ? '' : 'WHERE is_demo = 0';

  const rows = db.prepare(`
    SELECT source, COUNT(*) as count
    FROM registrations
    ${demoFilter}
    GROUP BY source
    ORDER BY count DESC
  `).all();

  const total = rows.reduce((sum, r) => sum + r.count, 0);

  res.json({
    channels: rows.map((r) => ({
      source: r.source || 'direct',
      count: r.count,
      percent: total > 0 ? Math.round((r.count / total) * 100 * 10) / 10 : 0,
    })),
    total,
  });
});

// ── Ambassador Leaderboard ───────────────────────────────────
router.get('/leaderboard', (req, res) => {
  const db = getDb();
  const includeDemo = req.query.includeDemo === 'true';
  const demoFilter = includeDemo ? '' : 'AND r.is_demo = 0';

  const rows = db.prepare(`
    SELECT
      a.name,
      a.code,
      a.college,
      COUNT(r.id) as referrals
    FROM ambassadors a
    LEFT JOIN registrations r ON r.referral_code = a.code ${demoFilter}
    GROUP BY a.id
    ORDER BY referrals DESC, a.name ASC
  `).all();

  res.json({ leaderboard: rows });
});

// ── Registrations List (with filters) ────────────────────────
router.get('/registrations', (req, res) => {
  const db = getDb();
  const { source, college, search, includeDemo, page = '1', limit = '50' } = req.query;

  const conditions = [];
  const params = [];

  if (includeDemo !== 'true') {
    conditions.push('is_demo = 0');
  }
  if (source) {
    conditions.push('source = ?');
    params.push(source);
  }
  if (college) {
    conditions.push('college LIKE ?');
    params.push(`%${college}%`);
  }
  if (search) {
    conditions.push('(name LIKE ? OR email LIKE ? OR college LIKE ? OR own_referral_code LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRow = db.prepare(`SELECT COUNT(*) as count FROM registrations ${whereClause}`).get(...params);
  const total = countRow.count;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const offset = (pageNum - 1) * limitNum;

  const registrations = db.prepare(`
    SELECT id, name, email, college, graduation_year, referral_code, own_referral_code, source, is_demo, created_at
    FROM registrations
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limitNum, offset);

  res.json({
    registrations,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
  });
});

// ── CSV Export ────────────────────────────────────────────────
router.get('/registrations/export', (req, res) => {
  const db = getDb();
  const includeDemo = req.query.includeDemo === 'true';
  const demoFilter = includeDemo ? '' : 'WHERE is_demo = 0';

  const rows = db.prepare(`
    SELECT id, name, email, college, graduation_year, referral_code, own_referral_code, source, is_demo, created_at
    FROM registrations
    ${demoFilter}
    ORDER BY created_at DESC
  `).all();

  const headers = ['ID', 'Name', 'Email', 'College', 'Graduation Year', 'Referred By Code', 'Own Referral Code', 'Source', 'Is Demo', 'Registered At'];
  const csvRows = [
    headers.join(','),
    ...rows.map((r) =>
      [
        r.id,
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${(r.email || '').replace(/"/g, '""')}"`,
        `"${(r.college || '').replace(/"/g, '""')}"`,
        r.graduation_year,
        `"${r.referral_code || ''}"`,
        `"${r.own_referral_code || ''}"`,
        `"${r.source || 'direct'}"`,
        r.is_demo ? 'Yes' : 'No',
        r.created_at,
      ].join(',')
    ),
  ];

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=campusloop_registrations.csv');
  res.send(csvRows.join('\n'));
});

// ── Create Ambassador ────────────────────────────────────────
router.post('/ambassadors', (req, res) => {
  const { name, college, email, code } = req.body;

  if (!name || !college) {
    return res.status(400).json({ error: 'Name and college are required.' });
  }

  const db = getDb();
  const finalCode = (code && code.trim()) ? code.trim().toUpperCase() : `AMB_${nanoid(6).toUpperCase()}`;

  try {
    const stmt = db.prepare(`
      INSERT INTO ambassadors (name, code, college, email, is_demo)
      VALUES (?, ?, ?, ?, 0)
    `);
    stmt.run(name.trim(), finalCode, college.trim(), email ? email.trim() : null);

    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5173';
    const baseUrl = process.env.BASE_URL || `${protocol}://${host}`;

    res.status(201).json({
      success: true,
      ambassador: {
        name: name.trim(),
        code: finalCode,
        college: college.trim(),
        referralLink: `${baseUrl}/?ref=${finalCode}&src=ambassador_referral`,
      },
    });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: `Ambassador code '${finalCode}' already exists.` });
    }
    console.error('Create ambassador error:', err);
    res.status(500).json({ error: 'Failed to create ambassador.' });
  }
});

// ── Generate QR Code ─────────────────────────────────────────
router.get('/qr/:code', async (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5173';
  const baseUrl = process.env.BASE_URL || `${protocol}://${host}`;
  const url = `${baseUrl}/?ref=${req.params.code}&src=ambassador_referral`;

  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: { dark: '#070913', light: '#ffffff' },
    });
    res.json({ qr: qrDataUrl, url });
  } catch (err) {
    console.error('QR generation error:', err);
    res.status(500).json({ error: 'Failed to generate QR code.' });
  }
});

// ── Experiment Log ───────────────────────────────────────────
router.get('/experiments', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM experiment_log ORDER BY day ASC, id ASC').all();
  res.json({ experiments: rows });
});

router.post('/experiments', (req, res) => {
  const { day, hypothesis, changeMade, metric, observation, nextAction } = req.body;

  if (!hypothesis || !changeMade || !metric) {
    return res.status(400).json({ error: 'Hypothesis, changeMade, and metric are required.' });
  }

  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO experiment_log (day, hypothesis, change_made, metric, observation, next_action, is_demo)
    VALUES (?, ?, ?, ?, ?, ?, 0)
  `);
  stmt.run(
    parseInt(day, 10) || 1,
    hypothesis.trim(),
    changeMade.trim(),
    metric.trim(),
    (observation || '').trim(),
    (nextAction || '').trim()
  );

  res.status(201).json({ success: true });
});

// ── Seed Demo Data ───────────────────────────────────────────
router.post('/seed-demo', (req, res) => {
  const db = getDb();

  const existingDemo = db.prepare('SELECT COUNT(*) as count FROM registrations WHERE is_demo = 1').get();
  if (existingDemo.count > 0) {
    return res.status(400).json({
      error: 'Demo data already loaded',
      message: `There are already ${existingDemo.count} demo registrations. Reset first to re-seed.`,
    });
  }

  const { seedDemoData } = require('../seed');
  const counts = seedDemoData(db);

  res.json({
    success: true,
    message: 'Demo data seeded successfully.',
    counts,
  });
});

// ── Reset ────────────────────────────────────────────────────
router.post('/reset', (req, res) => {
  const db = getDb();
  const { demoOnly } = req.body;

  if (demoOnly) {
    db.prepare('DELETE FROM registrations WHERE is_demo = 1').run();
    db.prepare('DELETE FROM ambassadors WHERE is_demo = 1').run();
    db.prepare('DELETE FROM experiment_log WHERE is_demo = 1').run();
    res.json({ success: true, message: 'Demo records cleared.' });
  } else {
    db.prepare('DELETE FROM registrations').run();
    db.prepare('DELETE FROM ambassadors').run();
    db.prepare('DELETE FROM experiment_log').run();
    res.json({ success: true, message: 'All registrations and ambassadors wiped.' });
  }
});

// ── Helper: daily targets summing strictly to goal ────────────
function calculateDailyTargets(goal, days) {
  const weights = [0.04, 0.10, 0.14, 0.16, 0.18, 0.20, 0.18];
  const totalWeight = weights.slice(0, days).reduce((a, b) => a + b, 0);
  const targets = weights.slice(0, days).map((w) => Math.round((w / totalWeight) * goal));
  const currentSum = targets.reduce((a, b) => a + b, 0);
  if (targets.length > 0 && currentSum !== goal) {
    targets[targets.length - 1] += (goal - currentSum);
  }
  return targets;
}

module.exports = router;
