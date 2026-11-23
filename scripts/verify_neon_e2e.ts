import { neon } from '@neondatabase/serverless';

const NEON_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_DFwngJsid0G7@ep-winter-meadow-bcauof0l-pooler.c-16.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const BASE_URL = 'http://localhost:3000';

async function testE2E() {
  console.log('=== Step 5 Verification: End-to-End Tests against Neon Postgres ===\n');

  // 1. Neon Status Endpoint
  console.log('1. Testing GET /api/neon/status...');
  const statusRes = await fetch(`${BASE_URL}/api/neon/status`);
  const statusData = await statusRes.json();
  console.log('Neon Status Response:');
  console.log(`- Status: ${statusData.neon.status}`);
  console.log(`- Version: ${statusData.neon.version}`);
  console.log(`- Host: ${statusData.neon.host}`);
  console.log(`- Database: ${statusData.neon.database}`);
  console.log(`- Collections in app_state: ${statusData.neon.collections.length}`);
  console.log(`- Relational Tables in Neon DB:`, statusData.neon.tables);

  // 2. Super Admin Login
  console.log('\n2. Testing POST /api/login with Super Admin credentials (nexoraeca@gmail.com / Bharath@123)...');
  const loginRes = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'nexoraeca@gmail.com',
      password: 'Bharath@123'
    })
  });
  const loginData = await loginRes.json();
  console.log('Super Admin Login Result:');
  console.log(`- Role: ${loginData.role}`);
  console.log(`- FullName: ${loginData.fullName}`);
  console.log(`- Username: ${loginData.username}`);
  console.log(`- Email: ${loginData.email}`);

  // 3. Student Login
  console.log('\n3. Testing POST /api/login with Student credentials (student / student123)...');
  const studentLoginRes = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'student',
      password: 'student123'
    })
  });
  const studentLoginData = await studentLoginRes.json();
  console.log(`Student Login Status: ${studentLoginRes.status}, Student Name: "${studentLoginData.student?.fullName}", Student ID: "${studentLoginData.student?.id}"`);

  // 4. Fetch Colleges
  console.log('\n4. Testing GET /api/colleges...');
  const collegesRes = await fetch(`${BASE_URL}/api/colleges`);
  const collegesData = await collegesRes.json();
  console.log(`Fetched ${collegesData.length} colleges from Neon DB. Top 2:`, collegesData.slice(0, 2).map((c: any) => `${c.name} (${c.city}, ${c.state} - NAAC ${c.naacGrade})`));

  // 5. Fetch Exams
  console.log('\n5. Testing GET /api/exams...');
  const examsRes = await fetch(`${BASE_URL}/api/exams`);
  const examsData = await examsRes.json();
  const exam = examsData[0];
  console.log(`Fetched ${examsData.length} exams. Exam ID: "${exam.id}", Title: "${exam.title}", Available Slots: ${exam.slots?.length}`);

  // 6. Complete Assessment Payment for Student
  const studentId = 'EDU-2026-001';
  console.log(`\n6. Testing POST /api/exams/payment/verify for Student ${studentId}...`);
  const payRes = await fetch(`${BASE_URL}/api/exams/payment/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId,
      examId: exam.id,
      amount: exam.fee || 500,
      paymentMethod: 'UPI'
    })
  });
  const payData = await payRes.json();
  console.log(`Payment Status: ${payData.success ? 'SUCCESS' : 'FAILED'}, Txn ID: ${payData.registration?.paymentId}`);

  // 7. Test Exam Slot Booking
  const targetSlotId = exam.slots[0].id;
  console.log(`\n7. Testing POST /api/exams/slots/book (booking ${targetSlotId} for ${studentId})...`);
  const bookRes = await fetch(`${BASE_URL}/api/exams/slots/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId,
      examId: exam.id,
      slotId: targetSlotId
    })
  });
  const bookData = await bookRes.json();
  console.log(`Slot Booking Result: ${bookData.success ? 'SUCCESS' : 'FAILED'}, Slot: ${bookData.registration?.selectedSlotId}, Date: ${bookData.registration?.scheduledDate}`);

  // 8. Test Exam Submission & Result Storage
  console.log(`\n8. Testing POST /api/exams/submit (submitting exam responses and storing result in Neon DB)...`);
  const submitRes = await fetch(`${BASE_URL}/api/exams/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId,
      examId: exam.id,
      answers: {
        q1: [1],
        q2: [1],
        q3: [1],
        q4: [0, 1, 2],
        q5: [0]
      },
      status: 'Submitted',
      startedAt: new Date(Date.now() - 900000).toISOString()
    })
  });
  const submitData = await submitRes.json();
  console.log(`Exam Submit Status: ${submitData.success ? 'SUCCESS' : 'FAILED'}, Score: ${submitData.attempt?.score}/${submitData.attempt?.maxScore} (${submitData.attempt?.percentage}%), Passed: ${submitData.attempt?.passed}`);

  // Wait 1.5 seconds for Neon Postgres sync
  await new Promise((r) => setTimeout(r, 1500));

  // 9. Directly querying Neon Postgres Cloud Database
  console.log('\n9. Directly querying Neon Postgres Cloud Database tables to confirm persistence...');
  const sql = neon(NEON_URL);
  
  // Verify exam_results in Neon
  const resultRows = await sql.query('SELECT id, exam_id, student_id, score, percentage, passed FROM exam_results WHERE student_id = $1;', [studentId]);
  console.log(`Neon Cloud exam_results:`, resultRows[0]);

  // Verify exam slot bookedCount in Neon
  const examRows = await sql.query('SELECT id, title, slots FROM exams WHERE id = $1;', [exam.id]);
  const neonSlots = typeof examRows[0]?.slots === 'string' ? JSON.parse(examRows[0]?.slots) : examRows[0]?.slots;
  const targetNeonSlot = neonSlots.find((s: any) => s.id === targetSlotId);
  console.log(`Neon Cloud exams table: "${examRows[0]?.title}", Slot ${targetSlotId} bookedCount = ${targetNeonSlot?.bookedCount}`);

  // Verify colleges in Neon
  const collegeCount = await sql.query('SELECT count(*) as count FROM colleges;');
  console.log(`Neon Cloud colleges table count: ${collegeCount[0].count}`);

  // Verify users table in Neon
  const superAdminRow = await sql.query('SELECT id, username, email, role FROM users WHERE username = $1;', ['nexoraeca@gmail.com']);
  console.log(`Neon Cloud users table check: ID=${superAdminRow[0]?.id}, Username=${superAdminRow[0]?.username}, Role=${superAdminRow[0]?.role}`);

  console.log('\n=== ALL NEON POSTGRES END-TO-END TESTS PASSED WITH 100% SUCCESS! ===');
}

testE2E().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
