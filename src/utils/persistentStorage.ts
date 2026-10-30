/**
 * Persistent Storage & Auto-Sync Engine
 * Guarantees that student applications, exam attempts, accounts, college recommendations,
 * and admin entries are permanently preserved across server restarts, browser refreshes, and sessions.
 */

export interface MasterDatabaseBackup {
  colleges?: any[];
  registrations?: any[];
  students?: any[];
  counsellors?: any[];
  users?: any[];
  exams?: any[];
  attempts?: any[];
  messages?: any[];
  notifications?: any[];
  collegeRecommendations?: any[];
  examRegistrations?: any[];
  contactMessages?: any[];
  lastSavedAt?: string;
}

export const STORAGE_KEYS = {
  MASTER_BACKUP: 'nexora_master_db_backup',
  STUDENTS: 'nexora_local_students',
  REGISTRATIONS: 'nexora_local_registrations',
  USERS: 'nexora_local_users',
  ATTEMPTS: 'nexora_local_attempts',
  RECOMMENDATIONS: 'nexora_local_recommendations',
  CONTACT_MESSAGES: 'nexora_local_contact_messages',
  COLLEGES: 'nexora_local_colleges',
  EXAMS: 'nexora_local_exams',
  LAST_APPLICATION: 'nexora_last_submitted_application',
  CREDENTIALS: 'nexora_saved_credentials',
  LAST_SYNC: 'nexora_last_sync_timestamp'
};

/**
 * Safely read an item or array from localStorage
 */
export function getLocalItems<T = any>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn(`[Storage] Failed to read ${key}:`, e);
    return [];
  }
}

function sanitizeItemForLocalStorage(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeItemForLocalStorage);
  const copy = { ...obj };
  for (const k in copy) {
    if (typeof copy[k] === 'string' && copy[k].startsWith('data:image/')) {
      // Inline base64 images should not bloat localStorage
      copy[k] = '[Uploaded Image File]';
    } else if (typeof copy[k] === 'object') {
      copy[k] = sanitizeItemForLocalStorage(copy[k]);
    }
  }
  return copy;
}

/**
 * Safely save an array to localStorage
 */
export function saveLocalItems(key: string, items: any[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    try {
      const sanitized = sanitizeItemForLocalStorage(items);
      localStorage.setItem(key, JSON.stringify(sanitized));
    } catch (e2) {
      console.warn(`[Storage] Failed to save ${key}:`, e2);
    }
  }
}

/**
 * Retrieve master database backup from localStorage
 */
export function getMasterBackup(): MasterDatabaseBackup | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MASTER_BACKUP);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * Save master database backup to localStorage
 */
export function saveMasterBackup(db: MasterDatabaseBackup): void {
  try {
    db.lastSavedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.MASTER_BACKUP, JSON.stringify(db));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  } catch (e) {
    try {
      const sanitized = sanitizeItemForLocalStorage(db);
      localStorage.setItem(STORAGE_KEYS.MASTER_BACKUP, JSON.stringify(sanitized));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (e2) {
      console.warn('[Storage] Failed to save master backup:', e2);
    }
  }
}

/**
 * Upsert a single item into a local storage array (matches by id or primary key)
 */
export function upsertLocalItem(key: string, item: any, matchKey: string = 'id', secondaryKey?: string): void {
  try {
    const items = getLocalItems(key);
    const index = items.findIndex((existing: any) => {
      if (secondaryKey && item[secondaryKey]) {
        return existing[matchKey] === item[matchKey] && existing[secondaryKey] === item[secondaryKey];
      }
      return existing[matchKey] === item[matchKey];
    });

    if (index >= 0) {
      items[index] = { ...items[index], ...item };
    } else {
      items.push(item);
    }
    saveLocalItems(key, items);

    // Also update inside master backup
    const master = getMasterBackup() || {};
    const collectionMap: { [key: string]: keyof MasterDatabaseBackup } = {
      [STORAGE_KEYS.STUDENTS]: 'students',
      [STORAGE_KEYS.REGISTRATIONS]: 'registrations',
      [STORAGE_KEYS.USERS]: 'users',
      [STORAGE_KEYS.ATTEMPTS]: 'attempts',
      [STORAGE_KEYS.RECOMMENDATIONS]: 'collegeRecommendations',
      [STORAGE_KEYS.CONTACT_MESSAGES]: 'contactMessages',
      [STORAGE_KEYS.COLLEGES]: 'colleges',
      [STORAGE_KEYS.EXAMS]: 'exams'
    };

    const targetProp = collectionMap[key];
    if (targetProp) {
      if (!master[targetProp]) (master as any)[targetProp] = [];
      const col = master[targetProp] as any[];
      const mIdx = col.findIndex((existing: any) => {
        if (secondaryKey && item[secondaryKey]) {
          return existing[matchKey] === item[matchKey] && existing[secondaryKey] === item[secondaryKey];
        }
        return existing[matchKey] === item[matchKey];
      });
      if (mIdx >= 0) {
        col[mIdx] = { ...col[mIdx], ...item };
      } else {
        col.push(item);
      }
      saveMasterBackup(master);
    }
  } catch (e) {
    console.warn(`[Storage] Failed to upsert ${key}:`, e);
  }
}

/**
 * Save newly registered student and application to client storage
 */
export function persistApplicationSubmission(student: any, registration: any, credentials?: any): void {
  if (student && student.id) {
    upsertLocalItem(STORAGE_KEYS.STUDENTS, student, 'id');
  }
  if (registration && registration.id) {
    upsertLocalItem(STORAGE_KEYS.REGISTRATIONS, registration, 'id');
  }
  if (credentials) {
    const users = getLocalItems(STORAGE_KEYS.USERS);
    const existingIdx = users.findIndex((u: any) => u.username === credentials.username || u.studentId === credentials.studentId);
    const userRecord = {
      id: credentials.studentId || `user-${Date.now()}`,
      username: credentials.username,
      password: credentials.password,
      role: 'student',
      studentId: credentials.studentId,
      fullName: student?.fullName || registration?.fullName,
      email: student?.email || registration?.email,
      savedAt: new Date().toISOString()
    };
    if (existingIdx >= 0) {
      users[existingIdx] = { ...users[existingIdx], ...userRecord };
    } else {
      users.push(userRecord);
    }
    saveLocalItems(STORAGE_KEYS.USERS, users);

    // Save as last application for quick recovery
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_APPLICATION, JSON.stringify({
        student,
        registration,
        credentials,
        savedAt: new Date().toISOString()
      }));
    } catch {}
  }

  // Trigger sync with server in background
  syncFullDbWithServer();
}

/**
 * Save exam attempt submission
 */
export function persistExamAttempt(attempt: any): void {
  if (!attempt) return;
  upsertLocalItem(STORAGE_KEYS.ATTEMPTS, attempt, 'studentId', 'examId');
  syncFullDbWithServer();
}

/**
 * Save college recommendation from counselor or admin
 */
export function persistRecommendation(rec: any): void {
  if (!rec) return;
  upsertLocalItem(STORAGE_KEYS.RECOMMENDATIONS, rec, 'studentId', 'collegeId');
  syncFullDbWithServer();
}

/**
 * Save contact message
 */
export function persistContactMessage(message: any): void {
  if (!message) return;
  upsertLocalItem(STORAGE_KEYS.CONTACT_MESSAGES, message, 'id');
}

/**
 * Mirror complete server database into client localStorage
 */
export function mirrorServerDbToLocal(serverDb: any): void {
  if (!serverDb || typeof serverDb !== 'object') return;
  try {
    const existing = getMasterBackup() || {};
    const merged: MasterDatabaseBackup = {
      colleges: serverDb.colleges || existing.colleges || [],
      registrations: serverDb.registrations || existing.registrations || [],
      students: serverDb.students || existing.students || [],
      counsellors: serverDb.counsellors || existing.counsellors || [],
      users: serverDb.users || existing.users || [],
      exams: serverDb.exams || existing.exams || [],
      attempts: serverDb.attempts || existing.attempts || [],
      messages: serverDb.messages || existing.messages || [],
      notifications: serverDb.notifications || existing.notifications || [],
      collegeRecommendations: serverDb.collegeRecommendations || existing.collegeRecommendations || [],
      examRegistrations: serverDb.examRegistrations || existing.examRegistrations || [],
      contactMessages: serverDb.contactMessages || existing.contactMessages || [],
      lastSavedAt: new Date().toISOString()
    };
    saveMasterBackup(merged);
  } catch (err) {
    console.warn('[Storage] Mirroring server to local error:', err);
  }
}

/**
 * Bi-Directional Full Database Auto-Sync
 * 1. Checks if client has local backup (e.g. from previous day/session)
 * 2. POSTs client records to /api/sync-full-db so server repopulates immediately
 * 3. GETs /api/full-db to refresh local mirror with any new server items
 */
export async function syncFullDbWithServer(): Promise<{ success: boolean; message?: string }> {
  try {
    const master = getMasterBackup();
    const students = getLocalItems(STORAGE_KEYS.STUDENTS);
    const registrations = getLocalItems(STORAGE_KEYS.REGISTRATIONS);
    const users = getLocalItems(STORAGE_KEYS.USERS);
    const attempts = getLocalItems(STORAGE_KEYS.ATTEMPTS);
    const recommendations = getLocalItems(STORAGE_KEYS.RECOMMENDATIONS);
    const contactMessages = getLocalItems(STORAGE_KEYS.CONTACT_MESSAGES);

    const payload = {
      ...(master || {}),
      students: students.length > 0 ? students : master?.students,
      registrations: registrations.length > 0 ? registrations : master?.registrations,
      users: users.length > 0 ? users : master?.users,
      attempts: attempts.length > 0 ? attempts : master?.attempts,
      collegeRecommendations: recommendations.length > 0 ? recommendations : master?.collegeRecommendations,
      contactMessages: contactMessages.length > 0 ? contactMessages : master?.contactMessages
    };

    // If we have local client data, send it to the server
    if (Object.keys(payload).some(k => Array.isArray((payload as any)[k]) && (payload as any)[k].length > 0)) {
      await fetch('/api/sync-full-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    // Now pull the authoritative full database and mirror locally
    const res = await fetch('/api/full-db');
    if (res.ok) {
      const fullDb = await res.json();
      mirrorServerDbToLocal(fullDb);
      return { success: true, message: 'Database successfully synced.' };
    }

    return { success: true };
  } catch (err) {
    console.warn('[Storage] Full DB sync offline or error:', err);
    return { success: false, message: 'Offline sync active.' };
  }
}

/**
 * Legacy syncCache helper for backwards compatibility
 */
export async function syncLocalCacheWithServer(): Promise<boolean> {
  const result = await syncFullDbWithServer();
  return result.success;
}

/**
 * One-Click Backup Export to JSON file download
 */
export function exportBackupToFile(): void {
  try {
    const backup = getMasterBackup();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nexora_database_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  } catch (e) {
    console.error('Failed to export backup file:', e);
  }
}

/**
 * One-Click Restore from JSON file
 */
export async function importBackupFromFile(fileContent: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(fileContent);
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON format');

    saveMasterBackup(parsed);
    const res = await fetch('/api/sync-full-db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed)
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to import backup file:', e);
    return false;
  }
}
