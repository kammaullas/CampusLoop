const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'campusloop.db');

let db;

function getDb() {
  if (!db) {
    // Ensure parent directory exists for volume mounts (e.g. /data)
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ambassadors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      college TEXT NOT NULL,
      email TEXT,
      is_demo INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      college TEXT NOT NULL,
      graduation_year INTEGER NOT NULL,
      referral_code TEXT,
      own_referral_code TEXT,
      source TEXT DEFAULT 'direct',
      is_demo INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS experiment_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day INTEGER NOT NULL,
      hypothesis TEXT NOT NULL,
      change_made TEXT NOT NULL,
      metric TEXT NOT NULL,
      observation TEXT DEFAULT '',
      next_action TEXT DEFAULT '',
      is_demo INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
    CREATE INDEX IF NOT EXISTS idx_registrations_referral ON registrations(referral_code);
    CREATE INDEX IF NOT EXISTS idx_registrations_source ON registrations(source);
    CREATE INDEX IF NOT EXISTS idx_registrations_college ON registrations(college);
    CREATE INDEX IF NOT EXISTS idx_registrations_created ON registrations(created_at);
    CREATE INDEX IF NOT EXISTS idx_ambassadors_code ON ambassadors(code);
  `);

  // Migration: add own_referral_code column if table existed previously without it
  const columns = db.prepare("PRAGMA table_info(registrations)").all();
  const hasOwnReferral = columns.some((col) => col.name === 'own_referral_code');
  if (!hasOwnReferral) {
    try {
      db.prepare('ALTER TABLE registrations ADD COLUMN own_referral_code TEXT').run();
    } catch {
      // ignore
    }
  }

  // Safe index creation after column existence is verified
  try {
    db.prepare('CREATE INDEX IF NOT EXISTS idx_registrations_own_ref ON registrations(own_referral_code)').run();
  } catch {
    // ignore
  }
}

module.exports = { getDb };
