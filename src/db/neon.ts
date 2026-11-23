import { neon } from '@neondatabase/serverless';

// Connection string from environment or user-provided credential
const NEON_CONNECTION_STRING =
  process.env.DATABASE_URL ||
  process.env.NEON_DATABASE_URL ||
  'postgresql://neondb_owner:npg_DFwngJsid0G7@ep-winter-meadow-bcauof0l-pooler.c-16.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

let sqlClient: any = null;

export function getNeonSql() {
  if (!sqlClient) {
    sqlClient = neon(NEON_CONNECTION_STRING);
  }
  return sqlClient;
}

/**
 * Initialize Complete Schema in Neon Postgres
 * Tables for: app_state, users, exams, exam_results, colleges, students,
 * registrations, exam_registrations, counsellors, college_recommendations,
 * notifications, messages.
 */
export async function initNeonDatabase() {
  try {
    const sql = getNeonSql();
    console.log('[Neon] Initializing comprehensive schema in Neon Postgres...');

    // 1. Master state table for full collection persistence (12 collections)
    await sql.query(`
      CREATE TABLE IF NOT EXISTS app_state (
        collection_name VARCHAR(100) PRIMARY KEY,
        records JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Dedicated Relational Tables
    // Users
    await sql.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        role VARCHAR(50) NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        data JSONB,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Exams
    await sql.query(`
      CREATE TABLE IF NOT EXISTS exams (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        date VARCHAR(100),
        status VARCHAR(50),
        fee NUMERIC DEFAULT 0,
        slots JSONB,
        data JSONB,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Exam Results & Student Evaluation Attempts
    await sql.query(`
      CREATE TABLE IF NOT EXISTS exam_results (
        id VARCHAR(100) PRIMARY KEY,
        exam_id VARCHAR(100) NOT NULL,
        student_id VARCHAR(100) NOT NULL,
        student_name VARCHAR(255),
        student_email VARCHAR(255),
        score NUMERIC DEFAULT 0,
        max_score NUMERIC DEFAULT 0,
        percentage NUMERIC DEFAULT 0,
        passed BOOLEAN DEFAULT FALSE,
        status VARCHAR(50),
        answers JSONB,
        data JSONB,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Colleges
    await sql.query(`
      CREATE TABLE IF NOT EXISTS colleges (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(100),
        state VARCHAR(100),
        naac_grade VARCHAR(50),
        nirf_rank INT,
        data JSONB,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Students
    await sql.query(`
      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(100) PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        mobile VARCHAR(50),
        gender VARCHAR(50),
        marks_12th NUMERIC,
        interested_course VARCHAR(100),
        preferred_state VARCHAR(100),
        admission_status VARCHAR(50),
        data JSONB,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Registrations (Online Admission Applications)
    await sql.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id VARCHAR(100) PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        mobile VARCHAR(50),
        interested_course VARCHAR(100),
        status VARCHAR(50),
        data JSONB,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Exam Slot Registrations
    await sql.query(`
      CREATE TABLE IF NOT EXISTS exam_registrations (
        id VARCHAR(100) PRIMARY KEY,
        student_id VARCHAR(100),
        exam_id VARCHAR(100),
        slot_id VARCHAR(100),
        scheduled_date VARCHAR(100),
        scheduled_time VARCHAR(100),
        status VARCHAR(50),
        data JSONB,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Counsellors
    await sql.query(`
      CREATE TABLE IF NOT EXISTS counsellors (
        id VARCHAR(100) PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        specialization VARCHAR(255),
        data JSONB,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // College Recommendations
    await sql.query(`
      CREATE TABLE IF NOT EXISTS college_recommendations (
        id VARCHAR(100) PRIMARY KEY,
        student_id VARCHAR(100) NOT NULL,
        college_id VARCHAR(100) NOT NULL,
        recommended_by VARCHAR(255),
        note TEXT,
        data JSONB,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Notifications
    await sql.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(100) PRIMARY KEY,
        target_student_id VARCHAR(100),
        title VARCHAR(255),
        type VARCHAR(50),
        data JSONB,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Messages
    await sql.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(100) PRIMARY KEY,
        student_id VARCHAR(100),
        sender_id VARCHAR(100),
        sender_name VARCHAR(255),
        message TEXT,
        data JSONB,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('[Neon] Comprehensive schema initialized successfully.');
    return true;
  } catch (err) {
    console.error('[Neon] Failed to initialize schema:', err);
    return false;
  }
}

/**
 * Synchronize all entities and collections into Neon Postgres Cloud Database
 */
export async function syncDatabaseToNeon(db: any) {
  if (!db) return;
  try {
    const sql = getNeonSql();
    const collections = [
      'users',
      'exams',
      'students',
      'colleges',
      'examRegistrations',
      'registrations',
      'counsellors',
      'attempts',
      'notifications',
      'collegeRecommendations',
      'messages',
      'passwordResetLogs'
    ];

    // 1. Sync full collections to app_state master document table
    for (const col of collections) {
      if (Array.isArray(db[col])) {
        const jsonVal = JSON.stringify(db[col]);
        await sql.query(
          `INSERT INTO app_state (collection_name, records, updated_at)
           VALUES ($1, $2::jsonb, NOW())
           ON CONFLICT (collection_name)
           DO UPDATE SET records = EXCLUDED.records, updated_at = NOW();`,
          [col, jsonVal]
        );
      }
    }

    // 2. Sync Users table
    if (Array.isArray(db.users)) {
      for (const u of db.users) {
        await sql.query(
          `INSERT INTO users (id, username, email, role, password, full_name, data, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW())
           ON CONFLICT (id)
           DO UPDATE SET username = EXCLUDED.username,
                         email = EXCLUDED.email,
                         role = EXCLUDED.role,
                         password = EXCLUDED.password,
                         full_name = EXCLUDED.full_name,
                         data = EXCLUDED.data,
                         updated_at = NOW();`,
          [
            u.id || `user-${Date.now()}-${Math.random()}`,
            u.username || u.email || 'user',
            u.email || null,
            u.role || 'student',
            u.password || '',
            u.fullName || '',
            JSON.stringify(u)
          ]
        );
      }
    }

    // 3. Sync Exams table
    if (Array.isArray(db.exams)) {
      for (const ex of db.exams) {
        await sql.query(
          `INSERT INTO exams (id, title, date, status, fee, slots, data, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, NOW())
           ON CONFLICT (id)
           DO UPDATE SET title = EXCLUDED.title,
                         date = EXCLUDED.date,
                         status = EXCLUDED.status,
                         fee = EXCLUDED.fee,
                         slots = EXCLUDED.slots,
                         data = EXCLUDED.data,
                         updated_at = NOW();`,
          [
            ex.id,
            ex.title || 'Examination',
            ex.date || '',
            ex.status || 'Draft',
            Number(ex.fee) || 0,
            JSON.stringify(ex.slots || []),
            JSON.stringify(ex)
          ]
        );
      }
    }

    // 4. Sync Exam Results & Attempts table
    if (Array.isArray(db.attempts)) {
      for (const att of db.attempts) {
        const attemptId = att.id || `att-${att.studentId}-${att.examId}`;
        await sql.query(
          `INSERT INTO exam_results (id, exam_id, student_id, student_name, student_email, score, max_score, percentage, passed, status, answers, data, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12::jsonb, NOW())
           ON CONFLICT (id)
           DO UPDATE SET exam_id = EXCLUDED.exam_id,
                         student_id = EXCLUDED.student_id,
                         student_name = EXCLUDED.student_name,
                         student_email = EXCLUDED.student_email,
                         score = EXCLUDED.score,
                         max_score = EXCLUDED.max_score,
                         percentage = EXCLUDED.percentage,
                         passed = EXCLUDED.passed,
                         status = EXCLUDED.status,
                         answers = EXCLUDED.answers,
                         data = EXCLUDED.data,
                         updated_at = NOW();`,
          [
            attemptId,
            att.examId || '',
            att.studentId || '',
            att.studentName || '',
            att.studentEmail || '',
            Number(att.score) || 0,
            Number(att.maxScore) || 10,
            Number(att.percentage) || 0,
            !!att.passed,
            att.status || 'Submitted',
            JSON.stringify(att.answers || {}),
            JSON.stringify(att)
          ]
        );
      }
    }

    // 5. Sync Colleges table
    if (Array.isArray(db.colleges)) {
      for (const col of db.colleges) {
        await sql.query(
          `INSERT INTO colleges (id, name, city, state, naac_grade, nirf_rank, data, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW())
           ON CONFLICT (id)
           DO UPDATE SET name = EXCLUDED.name,
                         city = EXCLUDED.city,
                         state = EXCLUDED.state,
                         naac_grade = EXCLUDED.naac_grade,
                         nirf_rank = EXCLUDED.nirf_rank,
                         data = EXCLUDED.data,
                         updated_at = NOW();`,
          [
            col.id,
            col.name || 'College',
            col.city || '',
            col.state || '',
            col.naacGrade || '',
            Number(col.nirfRank) || null,
            JSON.stringify(col)
          ]
        );
      }
    }

    // 6. Sync Students table
    if (Array.isArray(db.students)) {
      for (const s of db.students) {
        await sql.query(
          `INSERT INTO students (id, full_name, email, mobile, gender, marks_12th, interested_course, preferred_state, admission_status, data, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, NOW())
           ON CONFLICT (id)
           DO UPDATE SET full_name = EXCLUDED.full_name,
                         email = EXCLUDED.email,
                         mobile = EXCLUDED.mobile,
                         gender = EXCLUDED.gender,
                         marks_12th = EXCLUDED.marks_12th,
                         interested_course = EXCLUDED.interested_course,
                         preferred_state = EXCLUDED.preferred_state,
                         admission_status = EXCLUDED.admission_status,
                         data = EXCLUDED.data,
                         updated_at = NOW();`,
          [
            s.id,
            s.fullName || '',
            s.email || null,
            s.mobile || null,
            s.gender || null,
            Number(s.marks12th) || null,
            s.interestedCourse || null,
            s.preferredState || null,
            s.admissionStatus || 'Registered',
            JSON.stringify(s)
          ]
        );
      }
    }

    // 7. Sync Registrations table
    if (Array.isArray(db.registrations)) {
      for (const r of db.registrations) {
        await sql.query(
          `INSERT INTO registrations (id, full_name, email, mobile, interested_course, status, data, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW())
           ON CONFLICT (id)
           DO UPDATE SET full_name = EXCLUDED.full_name,
                         email = EXCLUDED.email,
                         mobile = EXCLUDED.mobile,
                         interested_course = EXCLUDED.interested_course,
                         status = EXCLUDED.status,
                         data = EXCLUDED.data,
                         updated_at = NOW();`,
          [
            r.id,
            r.fullName || '',
            r.email || null,
            r.mobile || null,
            r.interestedCourse || null,
            r.status || 'pending',
            JSON.stringify(r)
          ]
        );
      }
    }

    // 8. Sync Exam Registrations & Slots table
    if (Array.isArray(db.examRegistrations)) {
      for (const r of db.examRegistrations) {
        await sql.query(
          `INSERT INTO exam_registrations (id, student_id, exam_id, slot_id, scheduled_date, scheduled_time, status, data, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, NOW())
           ON CONFLICT (id)
           DO UPDATE SET student_id = EXCLUDED.student_id,
                         exam_id = EXCLUDED.exam_id,
                         slot_id = EXCLUDED.slot_id,
                         scheduled_date = EXCLUDED.scheduled_date,
                         scheduled_time = EXCLUDED.scheduled_time,
                         status = EXCLUDED.status,
                         data = EXCLUDED.data,
                         updated_at = NOW();`,
          [
            r.id,
            r.studentId,
            r.examId,
            r.selectedSlotId || r.slotId || null,
            r.scheduledDate || null,
            `${r.scheduledStartTime || ''} - ${r.scheduledEndTime || ''}`.trim(),
            r.registrationStatus || r.status || 'slot_booked',
            JSON.stringify(r)
          ]
        );
      }
    }

    // 9. Sync Counsellors table
    if (Array.isArray(db.counsellors)) {
      for (const c of db.counsellors) {
        await sql.query(
          `INSERT INTO counsellors (id, full_name, email, specialization, data, updated_at)
           VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
           ON CONFLICT (id)
           DO UPDATE SET full_name = EXCLUDED.full_name,
                         email = EXCLUDED.email,
                         specialization = EXCLUDED.specialization,
                         data = EXCLUDED.data,
                         updated_at = NOW();`,
          [
            c.id,
            c.fullName || '',
            c.email || null,
            c.specialization || null,
            JSON.stringify(c)
          ]
        );
      }
    }

    // 10. Sync College Recommendations table
    if (Array.isArray(db.collegeRecommendations)) {
      for (const rec of db.collegeRecommendations) {
        await sql.query(
          `INSERT INTO college_recommendations (id, student_id, college_id, recommended_by, note, data, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW())
           ON CONFLICT (id)
           DO UPDATE SET student_id = EXCLUDED.student_id,
                         college_id = EXCLUDED.college_id,
                         recommended_by = EXCLUDED.recommended_by,
                         note = EXCLUDED.note,
                         data = EXCLUDED.data,
                         updated_at = NOW();`,
          [
            rec.id,
            rec.studentId || '',
            rec.collegeId || '',
            rec.recommendedBy || '',
            rec.note || '',
            JSON.stringify(rec)
          ]
        );
      }
    }

    // 11. Sync Notifications table
    if (Array.isArray(db.notifications)) {
      for (const n of db.notifications) {
        await sql.query(
          `INSERT INTO notifications (id, target_student_id, title, type, data, updated_at)
           VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
           ON CONFLICT (id)
           DO UPDATE SET target_student_id = EXCLUDED.target_student_id,
                         title = EXCLUDED.title,
                         type = EXCLUDED.type,
                         data = EXCLUDED.data,
                         updated_at = NOW();`,
          [
            n.id,
            n.targetStudentId || null,
            n.title || '',
            n.type || 'info',
            JSON.stringify(n)
          ]
        );
      }
    }

    // 12. Sync Messages table
    if (Array.isArray(db.messages)) {
      for (const m of db.messages) {
        await sql.query(
          `INSERT INTO messages (id, student_id, sender_id, sender_name, message, data, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW())
           ON CONFLICT (id)
           DO UPDATE SET student_id = EXCLUDED.student_id,
                         sender_id = EXCLUDED.sender_id,
                         sender_name = EXCLUDED.sender_name,
                         message = EXCLUDED.message,
                         data = EXCLUDED.data,
                         updated_at = NOW();`,
          [
            m.id,
            m.studentId || '',
            m.senderId || '',
            m.senderName || '',
            m.message || '',
            JSON.stringify(m)
          ]
        );
      }
    }

    console.log('[Neon] Synced all entities and collections to Neon Postgres successfully.');
  } catch (err) {
    console.error('[Neon] Error syncing to Neon Postgres:', err);
  }
}

/**
 * Fetch complete database state from Neon Postgres
 */
export async function fetchDatabaseFromNeon(): Promise<any | null> {
  try {
    const sql = getNeonSql();
    const rows = await sql.query(`SELECT collection_name, records FROM app_state;`);
    if (!rows || rows.length === 0) {
      return null;
    }

    const db: Record<string, any> = {};
    for (const r of rows) {
      db[r.collection_name] = r.records;
    }
    console.log(`[Neon] Loaded ${rows.length} collections directly from Neon Postgres.`);
    return db;
  } catch (err) {
    console.warn('[Neon] Could not load from Neon Postgres, falling back to local files:', err);
    return null;
  }
}
