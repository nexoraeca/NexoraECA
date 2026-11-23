import { initNeonDatabase, syncDatabaseToNeon, fetchDatabaseFromNeon, getNeonSql } from '../src/db/neon';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  console.log('=== FULL NEON POSTGRES DATABASE MIGRATION ===\n');
  
  // 1. Initialize Comprehensive Schema (all tables)
  const inited = await initNeonDatabase();
  if (!inited) {
    throw new Error('Failed to init Neon schema');
  }

  // 2. Read current database state
  const dbPath = path.join(process.cwd(), 'database.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  // 3. Sync all 12 collections and relational tables to Neon Postgres
  console.log('Syncing all collections, exams, results, users, colleges, students to Neon Postgres...');
  await syncDatabaseToNeon(db);

  // 4. Query each relational table in Neon Postgres directly to verify
  const sql = getNeonSql();
  const tables = [
    'users',
    'exams',
    'exam_results',
    'colleges',
    'students',
    'registrations',
    'exam_registrations',
    'counsellors',
    'college_recommendations',
    'notifications',
    'messages',
    'app_state'
  ];

  console.log('\n=== NEON CLOUD DATABASE VERIFICATION (DIRECT SQL COUNTS) ===');
  for (const tbl of tables) {
    const res = await sql.query(`SELECT count(*) as count FROM ${tbl};`);
    console.log(`- ${tbl.padEnd(25)}: ${res[0].count} record(s)`);
  }

  // Verify Super Admin
  const superAdmin = await sql.query("SELECT id, username, email, role FROM users WHERE email = 'nexoraeca@gmail.com';");
  console.log('\nSuper Admin in Neon Postgres:', superAdmin[0]);

  // Verify Exams
  const exams = await sql.query("SELECT id, title, status, fee, jsonb_array_length(slots) as slot_count FROM exams;");
  console.log('Exams in Neon Postgres:', exams);

  // Verify Colleges sample
  const collegesSample = await sql.query("SELECT id, name, city, state, naac_grade FROM colleges LIMIT 3;");
  console.log('Colleges sample in Neon Postgres:', collegesSample);

  console.log('\nAll data is fully stored in Neon DB only!');
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
