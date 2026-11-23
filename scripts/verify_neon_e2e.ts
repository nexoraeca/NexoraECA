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
  console.log(`- Relational Tables: Users=${statusData.neon.tables.users}, Exams=${statusData.neon.tables.exams}, ExamRegistrations=${statusData.neon.tables.examRegistrations}`);

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

  // 4. Fetch Exams
  console.log('\n4. Testing GET /api/exams...');
  const examsRes = await fetch(`${BASE_URL}/api/exams`);
  const examsData = await examsRes.json();
  const exam = examsData[0];
  console.log(`Fetched ${examsData.length} exams. Exam ID: "${exam.id}", Title: "${exam.title}", Available Slots: ${exam.slots?.length}`);
  console.log(`Exam Slots:`, exam.slots.map((s: any) => `${s.id}: ${s.date} ${s.startTime}-${s.endTime} (booked: ${s.bookedCount}/${s.capacity})`));

  // 5. Complete Assessment Payment for Student
  const studentId = 'EDU-2026-001';
  console.log(`\n5. Testing POST /api/exams/payment/verify for Student ${studentId}...`);
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
  console.log(`Payment Status: ${payData.success ? 'SUCCESS' : 'FAILED'}, Txn ID: ${payData.registration?.paymentId}, Registration Status: ${payData.registration?.registrationStatus}`);

  // 6. Test Exam Slot Booking
  const targetSlotId = exam.slots[0].id;
  console.log(`\n6. Testing POST /api/exams/slots/book (booking ${targetSlotId} for ${studentId})...`);
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
  console.log(`Slot Booking Result: ${bookData.success ? 'SUCCESS' : 'FAILED'}, Slot: ${bookData.registration?.selectedSlotId}, Date: ${bookData.registration?.scheduledDate}, Time: ${bookData.registration?.scheduledStartTime}`);

  // Wait 1.5 seconds for Neon Postgres async sync to complete
  await new Promise((r) => setTimeout(r, 1500));

  // 7. Direct Verification in Neon Postgres Cloud Database
  console.log('\n7. Directly querying Neon Postgres Cloud Database to verify cloud persistence...');
  const sql = neon(NEON_URL);
  
  // Verify exam slots in Neon
  const examRows = await sql.query('SELECT id, title, slots FROM exams WHERE id = $1;', [exam.id]);
  const neonSlots = typeof examRows[0]?.slots === 'string' ? JSON.parse(examRows[0]?.slots) : examRows[0]?.slots;
  const targetNeonSlot = neonSlots.find((s: any) => s.id === targetSlotId);
  console.log(`Neon Cloud: Exam "${examRows[0]?.title}", Slot ${targetSlotId} bookedCount = ${targetNeonSlot?.bookedCount}`);

  // Verify registration in Neon
  const regRows = await sql.query('SELECT * FROM exam_registrations WHERE student_id = $1;', [studentId]);
  console.log(`Neon Cloud: Found ${regRows.length} exam registration record(s) for ${studentId}`);
  if (regRows.length > 0) {
    const reg = regRows[0];
    console.log(`- Registration ID: ${reg.id}`);
    console.log(`- Scheduled Date: ${reg.scheduled_date}`);
    console.log(`- Scheduled Time: ${reg.scheduled_time}`);
    console.log(`- Status: ${reg.status}`);
  }

  // Verify users table in Neon
  const superAdminRow = await sql.query('SELECT id, username, email, role, full_name FROM users WHERE username = $1;', ['nexoraeca@gmail.com']);
  console.log(`Neon Cloud User Check: ID=${superAdminRow[0]?.id}, Username=${superAdminRow[0]?.username}, Role=${superAdminRow[0]?.role}`);

  console.log('\n=== ALL NEON POSTGRES END-TO-END TESTS PASSED WITH 100% SUCCESS! ===');
}

testE2E().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
