const http = require('http');

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

async function runTests() {
  console.log('🧪 Starting CampusLoop Automated Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${details ? '— ' + details : ''}`);
      failed++;
    }
  }

  const testEmail = `test.student.${Date.now()}@bits-pilani.ac.in`;
  let student1OwnCode = '';

  // ── TEST 1: New Registration ─────────────────────────────
  console.log('▶ Test 1: New Student Registration with Ambassador Attribution');
  const reg1 = await request(
    {
      hostname: 'localhost',
      port: 3001,
      path: '/api/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      name: 'Aditya Varma',
      email: testEmail,
      college: 'BITS Pilani',
      graduationYear: 2026,
      referralCode: 'AMB001',
      source: 'whatsapp_group',
    }
  );
  assert(reg1.status === 201, 'Status code is 201 Created');
  assert(reg1.data.success === true, 'Response indicates success');
  assert(reg1.data.registration.referredBy === 'AMB001', 'Attributed to AMB001', `Got: ${reg1.data.registration?.referredBy}`);
  assert(reg1.data.registration.ownReferralCode && reg1.data.registration.ownReferralCode.startsWith('STU_'), 'Own referral code generated', `Got: ${reg1.data.registration?.ownReferralCode}`);
  student1OwnCode = reg1.data.registration?.ownReferralCode || '';

  // ── TEST 2: Duplicate Registration Prevention ─────────────
  console.log('\n▶ Test 2: Duplicate Email Rejection');
  const reg2 = await request(
    {
      hostname: 'localhost',
      port: 3001,
      path: '/api/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      name: 'Aditya Varma Duplicate',
      email: testEmail,
      college: 'BITS Pilani',
      graduationYear: 2026,
    }
  );
  assert(reg2.status === 409, 'Status code is 409 Conflict', `Got: ${reg2.status}`);
  assert(reg2.data.error === 'Already registered', 'Duplicate error message returned', `Got: ${JSON.stringify(reg2.data)}`);

  // ── TEST 3: Peer-to-Peer Student Referral Attribution ─────
  console.log('\n▶ Test 3: Peer-to-Peer Student Referral Attribution');
  const peerEmail = `peer.${Date.now()}@bits-pilani.ac.in`;
  const regPeer = await request(
    {
      hostname: 'localhost',
      port: 3001,
      path: '/api/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      name: 'Rohan Mitra',
      email: peerEmail,
      college: 'BITS Pilani',
      graduationYear: 2026,
      referralCode: student1OwnCode,
      source: 'share',
    }
  );
  assert(regPeer.status === 201, 'Peer registration succeeded with 201');
  assert(regPeer.data.registration.referredBy === student1OwnCode, 'Referred by first student own code', `Got: ${regPeer.data.registration?.referredBy}`);

  // ── TEST 4: Admin Unauthorised Access & Auth Protection ───
  console.log('\n▶ Test 4: Admin Authentication & Access Control');
  const noAuth = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/admin/stats',
    method: 'GET',
  });
  assert(noAuth.status === 401, 'Missing token returns 401 Unauthorized', `Got: ${noAuth.status}`);

  const badAuth = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/admin/stats',
    method: 'GET',
    headers: { Authorization: 'Bearer invalid-token-xyz' },
  });
  assert(badAuth.status === 403, 'Invalid token returns 403 Forbidden', `Got: ${badAuth.status}`);

  const goodAuth = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/admin/stats?includeDemo=false',
    method: 'GET',
    headers: { Authorization: 'Bearer campusloop-admin-2024' },
  });
  assert(goodAuth.status === 200, 'Valid token returns 200 OK', `Got: ${goodAuth.status}`);

  // ── TEST 5: Synthetic-Data Isolation & Toggle ─────────────
  console.log('\n▶ Test 5: Synthetic vs Live Data Isolation');
  const liveStats = goodAuth.data;
  assert(typeof liveStats.liveRegistrations === 'number' && liveStats.liveRegistrations >= 2, 'Live registrations counted accurately', `Got: ${liveStats.liveRegistrations}`);
  assert(liveStats.demoRegistrations === 250, 'Demo registrations quarantined at 250', `Got: ${liveStats.demoRegistrations}`);

  const demoStats = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/admin/stats?includeDemo=true',
    method: 'GET',
    headers: { Authorization: 'Bearer campusloop-admin-2024' },
  });
  assert(demoStats.data.totalRegistrations === liveStats.liveRegistrations + 250, 'Combined mode adds live + demo registrations', `Got: ${demoStats.data.totalRegistrations}`);

  // ── TEST 6: Dashboard Calculations & 500 Goal Integrity ───
  console.log('\n▶ Test 6: Dashboard Calculations & Goal Integrity');
  assert(liveStats.goal === 500, 'Goal is configured as 500');
  assert(liveStats.remaining === Math.max(0, 500 - liveStats.totalRegistrations), 'Remaining count is exactly 500 - total');
  assert(liveStats.progressPercent === Math.round((liveStats.totalRegistrations / 500) * 100 * 10) / 10, 'Progress percentage matches arithmetic');

  const dailyTrend = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/admin/daily-trend?includeDemo=false',
    method: 'GET',
    headers: { Authorization: 'Bearer campusloop-admin-2024' },
  });
  const trajectory = dailyTrend.data.trend;
  assert(trajectory.length === 7, '7-Day trajectory has exactly 7 days');
  const finalPlannedCumulative = trajectory[trajectory.length - 1].plannedCumulative;
  assert(finalPlannedCumulative === 500, `Day 7 planned cumulative target reaches exactly 500 (Got: ${finalPlannedCumulative})`);

  // ── TEST 7: Ambassador Leaderboard Attribution ───────────
  console.log('\n▶ Test 7: Ambassador Leaderboard Attribution');
  const leaderboard = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/admin/leaderboard?includeDemo=false',
    method: 'GET',
    headers: { Authorization: 'Bearer campusloop-admin-2024' },
  });
  const amb001 = leaderboard.data.leaderboard.find((a) => a.code === 'AMB001');
  assert(amb001 && amb001.referrals >= 1, 'Priya Sharma (AMB001) has at least 1 verified live referral', `Got: ${amb001?.referrals}`);

  // ── TEST 8: QR Code Generation ───────────────────────────
  console.log('\n▶ Test 8: QR Code Generation Endpoint');
  const qrRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/admin/qr/AMB001',
    method: 'GET',
    headers: { Authorization: 'Bearer campusloop-admin-2024' },
  });
  assert(qrRes.status === 200, 'QR endpoint returned 200 OK');
  assert(qrRes.data.qr && qrRes.data.qr.startsWith('data:image/png;base64,'), 'QR data is valid base64 PNG data URI');
  assert(qrRes.data.url.includes('ref=AMB001'), 'QR encodes correct URL with referral parameter');

  // ── TEST 9: CSV Streaming Export ─────────────────────────
  console.log('\n▶ Test 9: CSV Export Integrity');
  const csvRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/admin/registrations/export?includeDemo=false',
    method: 'GET',
    headers: { Authorization: 'Bearer campusloop-admin-2024' },
  });
  assert(csvRes.status === 200, 'CSV export status is 200 OK');
  assert(typeof csvRes.data === 'string', 'CSV data is raw text');
  assert(csvRes.data.includes('ID,Name,Email,College,Graduation Year,Referred By Code,Own Referral Code,Source,Is Demo,Registered At'), 'CSV has valid RFC header row');
  assert(csvRes.data.includes(testEmail), 'CSV contains the registered student email');
  assert(!csvRes.data.includes('demo.'), 'Live CSV contains zero demo records');

  console.log(`\n════════════════════════════════════════`);
  console.log(`📊 Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log(`════════════════════════════════════════\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Test run failed with error:', err);
  process.exit(1);
});
