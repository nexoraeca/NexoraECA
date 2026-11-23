import { neon, neonConfig } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

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
 * Initialize Schema in Neon Postgres
 */
export async function initNeonDatabase() {
  try {
    const sql = getNeonSql();
    console.log('[Neon] Initializing schema in Neon Postgres...');

    // 1. Master state table for full collection persistence
    await sql.query(`
      CREATE TABLE IF NOT EXISTS app_state (
        collection_name VARCHAR(100) PRIMARY KEY,
        records JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Structured relational tables
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

    console.log('[Neon] Schema initialized successfully.');
    return true;
  } catch (err) {
    console.error('[Neon] Failed to initialize schema:', err);
    return false;
  }
}

/**
 * Sync entire local database state to Neon Postgres
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

    // Also populate dedicated relational tables
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
            u.id,
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

    console.log('[Neon] Synced database state to Neon Postgres successfully.');
  } catch (err) {
    console.error('[Neon] Error syncing to Neon Postgres:', err);
  }
}

/**
 * Fetch database state from Neon Postgres
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
    console.log(`[Neon] Loaded ${rows.length} collections from Neon Postgres.`);
    return db;
  } catch (err) {
    console.warn('[Neon] Could not load from Neon Postgres, falling back to local files:', err);
    return null;
  }
}
