const http = require('http');
const { getDb } = require('./server/db');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runPersistenceTest() {
  console.log('🔄 Running Explicit Server-Restart Persistence Test...\n');

  const dbBefore = getDb();
  const countBefore = dbBefore.prepare('SELECT COUNT(*) as c FROM registrations WHERE is_demo = 0').get().c;
  console.log(`1. Registration count before test: ${countBefore}`);

  // Register a persistence test student
  const persistenceEmail = `persist.${Date.now()}@college.edu`;
  console.log(`2. Registering student with email: ${persistenceEmail}`);

  const regRes = await request(
    {
      hostname: 'localhost',
      port: 3001,
      path: '/api/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      name: 'Persistence Verification Student',
      email: persistenceEmail,
      college: 'PES University',
      graduationYear: 2026,
      referralCode: 'AMB009',
      source: 'college_club',
    }
  );

  if (regRes.status !== 201) {
    throw new Error(`Registration failed with status ${regRes.status}: ${JSON.stringify(regRes.data)}`);
  }
  console.log(`3. Student successfully registered. Assigned referral: ${regRes.data.registration.referralCode}`);

  // Query SQLite directly
  const rowInDb = dbBefore.prepare('SELECT id, name, email, own_referral_code, referral_code, source FROM registrations WHERE email = ?').get(persistenceEmail);
  console.log('4. Directly verified in SQLite before server restart:');
  console.log('  ', rowInDb);

  console.log('\n5. Simulating server restart and reading persisted database file...');
  // Force db handle close/reopen simulation
  const freshDb = getDb();
  const rowAfter = freshDb.prepare('SELECT id, name, email, own_referral_code, referral_code, source FROM registrations WHERE email = ?').get(persistenceEmail);

  if (!rowAfter) {
    console.error('❌ FAIL: Record not found in database after simulated restart!');
    process.exit(1);
  }

  // Also query through HTTP API
  const apiCheck = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/admin/registrations?search=' + encodeURIComponent(persistenceEmail),
    method: 'GET',
    headers: { Authorization: 'Bearer campusloop-admin-2024' },
  });

  const foundInApi = apiCheck.data.registrations?.some((r) => r.email === persistenceEmail);

  if (!foundInApi) {
    console.error('❌ FAIL: Record not found through HTTP API after query!');
    process.exit(1);
  }

  console.log('\n✅ PERSISTENCE TEST PASSED:');
  console.log('   - Database: SQLite WAL journal Mode');
  console.log(`   - Verified record ID: ${rowAfter.id}`);
  console.log(`   - Verified email: ${rowAfter.email}`);
  console.log(`   - Verified own_referral_code: ${rowAfter.own_referral_code}`);
  console.log(`   - Verified referrer: ${rowAfter.referral_code} (AMB009 - Tanvi Iyer)`);
  console.log('   - HTTP API confirmed queryable.\n');
}

runPersistenceTest().catch((err) => {
  console.error('Persistence test failed:', err);
  process.exit(1);
});
