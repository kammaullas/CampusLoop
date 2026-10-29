const express = require('express');
const { getDb } = require('../db');
const { nanoid } = require('nanoid');

const router = express.Router();

/**
 * POST /api/register
 * Register a student for the workshop.
 * Body: { name, email, college, graduationYear, referralCode?, source? }
 */
router.post('/', (req, res) => {
  const { name, email, college, graduationYear, referralCode, source } = req.body;

  // ── Validation ──────────────────────────────────────────────
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters.' });
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push({ field: 'email', message: 'Please enter a valid email address.' });
  }
  if (!college || typeof college !== 'string' || college.trim().length < 2) {
    errors.push({ field: 'college', message: 'College name must be at least 2 characters.' });
  }

  const year = parseInt(graduationYear, 10);
  if (!year || year < 2025 || year > 2030) {
    errors.push({ field: 'graduationYear', message: 'Graduation year must be between 2025 and 2030.' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', errors });
  }

  // ── Normalise inputs ───────────────────────────────────────
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  const cleanCollege = college.trim();
  const cleanSource = (source || 'direct').trim().toLowerCase();
  const cleanReferral = referralCode && referralCode.trim() ? referralCode.trim() : null;

  // ── Check duplicate ────────────────────────────────────────
  const db = getDb();
  const existing = db.prepare('SELECT id, name FROM registrations WHERE email = ?').get(cleanEmail);

  if (existing) {
    return res.status(409).json({
      error: 'Already registered',
      message: `This email is already registered under the name "${existing.name}". Check your inbox for confirmation details.`,
      registrationId: existing.id,
    });
  }

  // ── Validate referral attribution ───────────────────────────
  let validatedReferral = cleanReferral;
  if (cleanReferral) {
    // Check if matching ambassador exists
    const ambassador = db.prepare('SELECT code FROM ambassadors WHERE code = ?').get(cleanReferral);
    if (ambassador) {
      validatedReferral = ambassador.code;
    } else {
      // Check if matching student referral exists
      const peer = db.prepare('SELECT own_referral_code FROM registrations WHERE own_referral_code = ?').get(cleanReferral);
      if (peer) {
        validatedReferral = peer.own_referral_code;
      }
      // If custom/untracked referral, preserve the tag in referral_code rather than discarding
    }
  }

  // Generate this student's own unique referral code
  const ownReferralCode = `STU_${nanoid(6).toUpperCase()}`;

  // ── Insert registration ────────────────────────────────────
  try {
    const stmt = db.prepare(`
      INSERT INTO registrations (name, email, college, graduation_year, referral_code, own_referral_code, source, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `);

    const result = stmt.run(cleanName, cleanEmail, cleanCollege, year, validatedReferral, ownReferralCode, cleanSource);

    // Get current real registration count
    const countRow = db.prepare('SELECT COUNT(*) as count FROM registrations WHERE is_demo = 0').get();

    // Determine base URL from environment or request headers
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5173';
    const baseUrl = process.env.BASE_URL || `${protocol}://${host}`;
    const referralUrl = `${baseUrl}/?ref=${ownReferralCode}&src=share`;

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Your spot is confirmed.',
      registration: {
        id: result.lastInsertRowid,
        name: cleanName,
        email: cleanEmail,
        college: cleanCollege,
        graduationYear: year,
        source: cleanSource,
        referredBy: validatedReferral,
        referralCode: ownReferralCode,
        ownReferralCode: ownReferralCode,
        referralUrl,
      },
      totalRegistrations: countRow.count,
    });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.message?.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        error: 'Already registered',
        message: 'This email is already registered. Please check your confirmation.',
      });
    }
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error', message: 'Something went wrong. Please try again.' });
  }
});

/**
 * GET /api/register/count
 * Public endpoint: returns total real (non-demo) registrations.
 */
router.get('/count', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT COUNT(*) as count FROM registrations WHERE is_demo = 0').get();
  res.json({ count: row.count });
});

/**
 * GET /api/register/ambassador/:code
 * Public endpoint: validate ambassador or peer code.
 */
router.get('/ambassador/:code', (req, res) => {
  const db = getDb();
  const code = req.params.code;

  const ambassador = db.prepare('SELECT name, code, college FROM ambassadors WHERE code = ?').get(code);
  if (ambassador) {
    return res.json({ ambassador: { ...ambassador, type: 'ambassador' } });
  }

  const student = db.prepare('SELECT name, own_referral_code as code, college FROM registrations WHERE own_referral_code = ?').get(code);
  if (student) {
    return res.json({ ambassador: { ...student, type: 'peer' } });
  }

  res.status(404).json({ error: 'Referral code not found' });
});

module.exports = router;
