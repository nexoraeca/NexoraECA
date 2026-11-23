import { initNeonDatabase, syncDatabaseToNeon, fetchDatabaseFromNeon, getNeonSql } from '../src/db/neon';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  console.log('=== NEON POSTGRES MIGRATION ===');
  
  // 1. Initialize Schema
  const inited = await initNeonDatabase();
  if (!inited) {
    throw new Error('Failed to init Neon schema');
  }

  // 2. Read current database.json
  const dbPath = path.join(process.cwd(), 'database.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  // 3. Sync to Neon
  await syncDatabaseToNeon(db);

  // 4. Verify from Neon
  const sql = getNeonSql();
  const userCount = await sql.query('SELECT count(*) as count FROM users;');
  const examCount = await sql.query('SELECT count(*) as count FROM exams;');
  const appStateCount = await sql.query('SELECT count(*) as count FROM app_state;');
  const superAdmin = await sql.query("SELECT id, username, email, role, password FROM users WHERE email = 'nexoraeca@gmail.com';");
  const exams = await sql.query("SELECT id, title, date, status, fee, slots FROM exams;");

  console.log('\n=== NEON VERIFICATION RESULTS ===');
  console.log('Users in Neon:', userCount[0].count);
  console.log('Exams in Neon:', examCount[0].count);
  console.log('Collections in Neon app_state:', appStateCount[0].count);
  console.log('Super Admin in Neon:', superAdmin[0]);
  console.log('Exams in Neon:', exams);

  console.log('\nMigration completed successfully!');
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
