require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Production startup configuration validation
if (process.env.NODE_ENV === 'production') {
  const token = (process.env.ADMIN_TOKEN || '').trim();
  if (!token || token === 'campusloop-admin-2024' || token.length < 16) {
    console.error('\n❌ FATAL: Production deployment requires a secure, non-default ADMIN_TOKEN of at least 16 characters.');
    console.error('   Current value is either empty, under 16 characters, or using the default dev token.\n');
    process.exit(1);
  }
}

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Initialize database on startup
getDb();

// ── Routes ───────────────────────────────────────────────────
app.use('/api/register', require('./routes/register'));
app.use('/api/admin', require('./routes/admin'));

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Static Frontend Serving (Single-Service Deployment) ───────
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
const fs = require('fs');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// ── Error handler ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 CampusLoop API server running on http://localhost:${PORT}`);
  console.log(`   Admin token: ${process.env.ADMIN_TOKEN ? '****' + process.env.ADMIN_TOKEN.slice(-4) : 'NOT SET'}`);
  console.log(`   Database: ${process.env.DATABASE_PATH || path.join(__dirname, '..', 'campusloop.db')}`);
  console.log(`   Campaign goal: ${process.env.CAMPAIGN_GOAL || 500}\n`);
});
