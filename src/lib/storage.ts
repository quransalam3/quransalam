import { 
  Teacher, 
  Student, 
  MemorizationRecord, 
  ActivityLog, 
  User, 
  ActionType, 
  UserRole,
  AuthAccount
} from '../types';
import { 
  INITIAL_CLASSES, 
  INITIAL_TEACHERS, 
  INITIAL_STUDENTS,
  INITIAL_RECORDS,
  INITIAL_LOGS
} from '../data/initialData';
import { supabase, isCloudConnected } from './supabaseClient';

const STORAGE_KEYS = {
  CLASSES: 'salam_classes_v1',
  TEACHERS: 'salam_teachers_v1',
  STUDENTS: 'salam_students_v1',
  RECORDS: 'salam_records_v1',
  LOGS: 'salam_logs_v1',
  USERS_AUTH: 'salam_users_auth_v1',
  CURRENT_USER: 'salam_active_user_v1',
  LAST_SYNC: 'salam_last_sync_v1',
};

export const DEFAULT_PASSWORD = 'salsabila3';

// Helper to normalize strings for comparison
export function normalizeStr(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

// Format wali username
export function makeWaliUsername(classId: string, studentName: string): string {
  return `wali.${classId}.${studentName.trim()}`;
}

// Mapping utilities for Supabase Snake_case <-> CamelCase
export function dbToRecord(row: any): MemorizationRecord {
  return {
    id: String(row.id),
    date: String(row.date),
    classId: row.classId || row.class_id || '',
    studentId: row.studentId || row.student_id || '',
    studentName: row.studentName || row.student_name || '',
    teacherId: row.teacherId || row.teacher_id || '',
    teacherName: row.teacherName || row.teacher_name || '',
    type: row.type === 'tahfidz' ? 'tahfidz' : 'tahsin',
    tahsinBook: row.tahsinBook || row.tahsin_book || undefined,
    tahsinPage: row.tahsinPage || row.tahsin_page || undefined,
    tahsinSurahNumber: row.tahsinSurahNumber ?? row.tahsin_surah_number ?? undefined,
    tahsinSurahName: row.tahsinSurahName || row.tahsin_surah_name || undefined,
    tahsinLastAyat: row.tahsinLastAyat || row.tahsin_last_ayat || undefined,
    tahfidzActivity: row.tahfidzActivity || row.tahfidz_activity || undefined,
    tahfidzJuz: row.tahfidzJuz ?? row.tahfidz_juz ?? undefined,
    tahfidzSurahNumber: row.tahfidzSurahNumber ?? row.tahfidz_surah_number ?? undefined,
    tahfidzSurahName: row.tahfidzSurahName || row.tahfidz_surah_name || undefined,
    tahfidzAyatRange: row.tahfidzAyatRange || row.tahfidz_ayat_range || undefined,
    grade: row.grade || 'A (Mumtaz)',
    notes: row.notes || '',
    createdAt: row.createdAt || row.created_at || new Date().toISOString()
  };
}

export function recordToDb(r: MemorizationRecord): Record<string, any> {
  return {
    id: r.id,
    date: r.date,
    class_id: r.classId,
    student_id: r.studentId,
    student_name: r.studentName,
    teacher_id: r.teacherId,
    teacher_name: r.teacherName,
    type: r.type,
    tahsin_book: r.tahsinBook || null,
    tahsin_page: r.tahsinPage || null,
    tahsin_surah_number: r.tahsinSurahNumber ?? null,
    tahsin_surah_name: r.tahsinSurahName || null,
    tahsin_last_ayat: r.tahsinLastAyat || null,
    tahfidz_activity: r.tahfidzActivity || null,
    tahfidz_juz: r.tahfidzJuz ?? null,
    tahfidz_surah_number: r.tahfidzSurahNumber ?? null,
    tahfidz_surah_name: r.tahfidzSurahName || null,
    tahfidz_ayat_range: r.tahfidzAyatRange || null,
    grade: r.grade,
    notes: r.notes || null,
    created_at: r.createdAt || new Date().toISOString()
  };
}

export function dbToStudent(row: any): Student {
  return {
    id: String(row.id),
    name: String(row.name),
    classId: row.classId || row.class_id || ''
  };
}

export function studentToDb(s: Student): Record<string, any> {
  return {
    id: s.id,
    name: s.name,
    class_id: s.classId
  };
}

export function dbToAuthAccount(row: any): AuthAccount {
  const pHash = row.password_hash || row.passwordHash || DEFAULT_PASSWORD;
  const fLogin = row.first_login !== undefined ? row.first_login : (row.firstLogin !== undefined ? row.firstLogin : true);
  return {
    username: String(row.username),
    passwordHash: pHash,
    role: row.role as UserRole,
    name: String(row.name),
    classId: row.class_id || row.classId || undefined,
    studentName: row.student_name || row.studentName || undefined,
    firstLogin: Boolean(fLogin)
  };
}

export function authAccountToDb(acc: AuthAccount): Record<string, any> {
  return {
    username: acc.username,
    password_hash: acc.passwordHash,
    "passwordHash": acc.passwordHash,
    role: acc.role,
    name: acc.name,
    class_id: acc.classId || null,
    "classId": acc.classId || null,
    student_name: acc.studentName || null,
    "studentName": acc.studentName || null,
    first_login: acc.firstLogin,
    "firstLogin": acc.firstLogin
  };
}

export function dbToLog(row: any): ActivityLog {
  return {
    id: String(row.id),
    timestamp: row.timestamp || row.created_at || new Date().toISOString(),
    actionType: (row.actionType || row.action_type || 'EDIT_SISWA') as ActionType,
    performedBy: row.performedBy || row.performed_by || 'Admin',
    target: row.target || '',
    details: row.details || ''
  };
}

export function logToDb(log: ActivityLog): Record<string, any> {
  return {
    id: log.id,
    timestamp: log.timestamp,
    action_type: log.actionType,
    performed_by: log.performedBy,
    target: log.target,
    details: log.details
  };
}

class StorageManager {
  private teachers: Teacher[] = [];
  private students: Student[] = [];
  private classes: string[] = [];
  private records: MemorizationRecord[] = [];
  private logs: ActivityLog[] = [];
  private authAccounts: Record<string, AuthAccount> = {};
  
  private subscribers = new Set<() => void>();
  private isSyncing = false;
  private hasInitializedCloud = false;

  constructor() {
    this.initLocal();
    // Auto sync from Supabase if connected
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.syncFromCloud().catch(err => console.warn('Cloud auto-sync warning:', err));
        this.initRealtime();
      }, 100);
    }
  }

  // --- Pub/Sub for React Reactivity ---
  public subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notify() {
    this.subscribers.forEach(cb => {
      try {
        cb();
      } catch (err) {
        console.error('Subscriber callback error:', err);
      }
    });
  }

  private initLocal() {
    // 1. Classes
    try {
      const savedClasses = localStorage.getItem(STORAGE_KEYS.CLASSES);
      this.classes = savedClasses ? JSON.parse(savedClasses) : [...INITIAL_CLASSES];
    } catch {
      this.classes = [...INITIAL_CLASSES];
    }

    // 2. Teachers
    try {
      const savedTeachers = localStorage.getItem(STORAGE_KEYS.TEACHERS);
      this.teachers = savedTeachers ? JSON.parse(savedTeachers) : [...INITIAL_TEACHERS];
    } catch {
      this.teachers = [...INITIAL_TEACHERS];
    }

    // 3. Students
    try {
      const savedStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      this.students = savedStudents ? JSON.parse(savedStudents) : [...INITIAL_STUDENTS];
    } catch {
      this.students = [...INITIAL_STUDENTS];
    }

    // 4. Records (Bersih tanpa data simulasi)
    try {
      const savedRecords = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (savedRecords) {
        const parsed = JSON.parse(savedRecords);
        this.records = Array.isArray(parsed) 
          ? parsed.filter((r: any) => !String(r.id || '').startsWith('rec-demo-'))
          : [];
      } else {
        this.records = [];
      }
    } catch {
      this.records = [];
    }

    // 5. Activity Logs (Bersih tanpa log simulasi)
    try {
      const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (savedLogs) {
        const parsed = JSON.parse(savedLogs);
        this.logs = Array.isArray(parsed)
          ? parsed.filter((l: any) => !String(l.id || '').startsWith('log-demo-'))
          : [];
      } else {
        this.logs = [];
      }
    } catch {
      this.logs = [];
    }

    // 6. Auth Accounts
    try {
      const savedAuth = localStorage.getItem(STORAGE_KEYS.USERS_AUTH);
      if (savedAuth) {
        this.authAccounts = JSON.parse(savedAuth);
      }
    } catch {
      this.authAccounts = {};
    }

    this.ensureDefaultAccounts();
    this.saveAll();
  }

  private ensureDefaultAccounts() {
    if (!this.authAccounts['admin']) {
      this.authAccounts['admin'] = {
        username: 'admin',
        passwordHash: DEFAULT_PASSWORD,
        role: 'admin',
        name: 'Administrator SALAM Quran',
        firstLogin: false
      };
    }

    // Semua password bawaan awal guru adalah salsabila3
    for (const t of this.teachers) {
      const uKey = t.username.toLowerCase();
      if (!this.authAccounts[uKey]) {
        this.authAccounts[uKey] = {
          username: t.username,
          passwordHash: DEFAULT_PASSWORD,
          role: 'guru',
          name: t.name,
          firstLogin: true
        };
      } else if (this.authAccounts[uKey].firstLogin) {
        // Jika belum pernah login/ganti password mandiri, pastikan tetap salsabila3
        this.authAccounts[uKey].passwordHash = DEFAULT_PASSWORD;
      }
    }
  }

  private saveAll() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(this.classes));
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(this.teachers));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(this.students));
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(this.records));
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(this.logs));
      localStorage.setItem(STORAGE_KEYS.USERS_AUTH, JSON.stringify(this.authAccounts));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }

  // --- Cloud Sync Implementation (Supabase) ---
  public async syncFromCloud(): Promise<boolean> {
    if (!supabase || this.isSyncing) return false;
    this.isSyncing = true;

    try {
      // 1. Fetch Classes
      const { data: cData, error: cErr } = await supabase.from('classes').select('*');
      if (!cErr && cData && cData.length > 0) {
        this.classes = cData.map(c => c.id).filter(Boolean);
      }

      // 2. Fetch Teachers
      const { data: tData, error: tErr } = await supabase.from('teachers').select('*');
      if (!tErr && tData && tData.length > 0) {
        this.teachers = tData.map(t => ({
          id: String(t.id),
          name: String(t.name),
          username: String(t.username)
        }));
      }

      // 3. Fetch Students
      const { data: sData, error: sErr } = await supabase.from('students').select('*').limit(2000);
      if (!sErr && sData && sData.length > 0) {
        this.students = sData.map(dbToStudent);
      }

      // 4. Fetch Auth Accounts
      const { data: aData, error: aErr } = await supabase.from('auth_accounts').select('*').limit(3000);
      if (!aErr && aData && aData.length > 0) {
        const nextAccounts: Record<string, AuthAccount> = {};
        for (const row of aData) {
          const acc = dbToAuthAccount(row);
          nextAccounts[acc.username.toLowerCase()] = acc;
        }
        this.authAccounts = nextAccounts;
        this.ensureDefaultAccounts();
      }

      // 5. Fetch Memorization Records
      const { data: rData, error: rErr } = await supabase
        .from('memorization_records')
        .select('*')
        .order('date', { ascending: false })
        .limit(3000);
      if (!rErr && rData) {
        this.records = rData.map(dbToRecord);
      }

      // 6. Fetch Logs
      const { data: lData, error: lErr } = await supabase
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(500);
      if (!lErr && lData) {
        this.logs = lData.map(dbToLog);
      }

      this.hasInitializedCloud = true;
      this.saveAll();
      this.notify();
      return true;
    } catch (err) {
      console.warn('Sync from cloud encountered issue:', err);
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  // --- Realtime Cloud Listener ---
  private initRealtime() {
    if (!supabase) return;
    try {
      supabase
        .channel('salam_cloud_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'memorization_records' }, (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const newRec = dbToRecord(payload.new);
            if (!this.records.some(r => r.id === newRec.id)) {
              this.records.unshift(newRec);
              this.saveAll();
              this.notify();
            }
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const oldId = String((payload.old as any).id);
            this.records = this.records.filter(r => r.id !== oldId);
            this.saveAll();
            this.notify();
          } else {
            this.syncFromCloud();
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
          this.syncFromCloud();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'teachers' }, () => {
          this.syncFromCloud();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'auth_accounts' }, () => {
          this.syncFromCloud();
        })
        .subscribe();
    } catch (err) {
      console.warn('Supabase Realtime not available:', err);
    }
  }

  // --- Auth Methods ---
  public login(usernameInput: string, passwordInput: string): { user?: User; error?: string } {
    const rawInput = usernameInput.trim();
    const lowerInput = rawInput.toLowerCase();

    // Check if it's Wali format: wali.(Kelas).(Nama siswa)
    if (lowerInput.startsWith('wali.')) {
      const parts = rawInput.split('.');
      if (parts.length >= 3) {
        const classPart = parts[1].trim().toUpperCase();
        const studentNamePart = parts.slice(2).join('.').trim();

        // Match student
        const student = this.students.find(
          s => s.classId.toUpperCase() === classPart && 
               normalizeStr(s.name) === normalizeStr(studentNamePart)
        );

        if (!student) {
          return { error: `Data siswa untuk kelas ${classPart} dengan nama "${studentNamePart}" tidak ditemukan.` };
        }

        const exactUsername = makeWaliUsername(student.classId, student.name);
        const uKey = exactUsername.toLowerCase();
        let acc = this.authAccounts[uKey];

        if (!acc) {
          acc = {
            username: exactUsername,
            passwordHash: DEFAULT_PASSWORD,
            role: 'wali',
            name: `Wali dari ${student.name}`,
            classId: student.classId,
            studentName: student.name,
            firstLogin: true
          };
          this.authAccounts[uKey] = acc;
          this.saveAll();
          if (supabase) {
            Promise.resolve(supabase.from('auth_accounts').upsert([authAccountToDb(acc)])).catch(() => {});
          }
        }

        if (acc.passwordHash !== passwordInput) {
          return { error: 'Password salah. Password default awal adalah "salsabila3".' };
        }

        const user: User = {
          id: `u-${uKey}`,
          username: exactUsername,
          role: 'wali',
          name: acc.name,
          classId: student.classId,
          studentName: student.name,
          firstLogin: acc.firstLogin
        };

        this.setCurrentUser(user);
        return { user };
      } else {
        return { error: 'Format login wali: wali.(Kelas).(Nama siswa). Contoh: wali.1A.ABIMANYU FACHRI CHRISTIANTO' };
      }
    }

    // Direct match for Guru or Admin
    const acc = this.authAccounts[lowerInput];
    if (!acc) {
      // Check if user entered teacher name directly
      const teacherByName = this.teachers.find(
        t => normalizeStr(t.name) === normalizeStr(rawInput) || normalizeStr(t.username) === lowerInput
      );
      if (teacherByName) {
        const tKey = teacherByName.username.toLowerCase();
        const tAcc = this.authAccounts[tKey];
        if (tAcc) {
          if (tAcc.passwordHash !== passwordInput) {
            return { error: 'Password salah. Password default awal adalah "salsabila3".' };
          }
          const user: User = {
            id: `u-${tKey}`,
            username: tAcc.username,
            role: tAcc.role,
            name: tAcc.name,
            firstLogin: tAcc.firstLogin
          };
          this.setCurrentUser(user);
          return { user };
        }
      }
      return { error: 'Username tidak ditemukan dalam sistem.' };
    }

    if (acc.passwordHash !== passwordInput) {
      return { error: 'Password salah. Password default awal adalah "salsabila3".' };
    }

    const user: User = {
      id: `u-${lowerInput}`,
      username: acc.username,
      role: acc.role,
      name: acc.name,
      classId: acc.classId,
      studentName: acc.studentName,
      firstLogin: acc.firstLogin
    };

    this.setCurrentUser(user);
    return { user };
  }

  // Async login with Supabase remote verification
  public async loginAsync(usernameInput: string, passwordInput: string): Promise<{ user?: User; error?: string }> {
    // 1. Try local first for instant response
    const localRes = this.login(usernameInput, passwordInput);
    if (localRes.user) {
      return localRes;
    }

    // 2. If local fails and cloud is connected, check cloud auth_accounts
    if (supabase) {
      try {
        const lower = usernameInput.trim().toLowerCase();
        const { data, error } = await supabase
          .from('auth_accounts')
          .select('*')
          .ilike('username', lower)
          .maybeSingle();

        if (!error && data) {
          const acc = dbToAuthAccount(data);
          this.authAccounts[acc.username.toLowerCase()] = acc;
          this.saveAll();

          if (acc.passwordHash === passwordInput) {
            const user: User = {
              id: `u-${acc.username.toLowerCase()}`,
              username: acc.username,
              role: acc.role,
              name: acc.name,
              classId: acc.classId,
              studentName: acc.studentName,
              firstLogin: acc.firstLogin
            };
            this.setCurrentUser(user);
            this.notify();
            return { user };
          } else {
            return { error: 'Password salah. Password default awal adalah "salsabila3".' };
          }
        }
      } catch (err) {
        console.warn('Remote login check error:', err);
      }
    }

    return localRes;
  }

  public changePassword(username: string, newPassword: string): boolean {
    const raw = username.trim();
    const key = raw.toLowerCase();
    const acc = this.authAccounts[key] || this.authAccounts[raw];
    if (acc) {
      acc.passwordHash = newPassword;
      acc.firstLogin = false;
      this.authAccounts[key] = acc;
      this.authAccounts[acc.username.toLowerCase()] = acc;
      this.authAccounts[acc.username] = acc;
      this.saveAll();

      const current = this.getCurrentUser();
      if (current && (current.username.toLowerCase() === key || current.username === raw)) {
        current.firstLogin = false;
        this.setCurrentUser(current);
      }

      this.notify();

      if (supabase) {
        const payload = authAccountToDb(acc);
        Promise.resolve(
          supabase
            .from('auth_accounts')
            .upsert([payload], { onConflict: 'username' })
        ).catch(err => console.warn('Supabase password change error:', err));
      }
      return true;
    }
    return false;
  }

  public resetPassword(username: string, adminName: string): boolean {
    const raw = username.trim();
    const key = raw.toLowerCase();
    let acc = this.authAccounts[key] || this.authAccounts[raw];

    if (!acc) {
      const teacher = this.teachers.find(
        t => t.username.toLowerCase() === key || normalizeStr(t.name) === normalizeStr(raw)
      );
      if (teacher) {
        acc = {
          username: teacher.username,
          passwordHash: DEFAULT_PASSWORD,
          role: 'guru',
          name: teacher.name,
          firstLogin: true
        };
        this.authAccounts[teacher.username.toLowerCase()] = acc;
      } else if (key.startsWith('wali.')) {
        const parts = raw.split('.');
        const classPart = parts[1]?.trim().toUpperCase();
        const studentNamePart = parts.slice(2).join('.').trim();
        const student = this.students.find(
          s => s.classId.toUpperCase() === classPart && normalizeStr(s.name) === normalizeStr(studentNamePart)
        );
        if (student) {
          const exactUsername = makeWaliUsername(student.classId, student.name);
          acc = {
            username: exactUsername,
            passwordHash: DEFAULT_PASSWORD,
            role: 'wali',
            name: `Wali dari ${student.name}`,
            classId: student.classId,
            studentName: student.name,
            firstLogin: true
          };
          this.authAccounts[exactUsername.toLowerCase()] = acc;
        }
      }
    }

    if (!acc) return false;

    // Kembalikan kata sandi ke standar awal (salsabila3) dan wajib ganti saat login berikutnya
    acc.passwordHash = DEFAULT_PASSWORD;
    acc.firstLogin = true;
    this.authAccounts[key] = acc;
    this.authAccounts[acc.username.toLowerCase()] = acc;
    this.authAccounts[acc.username] = acc;
    this.saveAll();
    this.notify();

    this.addLog(
      'RESET_PASSWORD',
      adminName,
      acc.username,
      `Reset password akun ${acc.username} (${acc.name}) kembali ke default "${DEFAULT_PASSWORD}"`
    );

    if (supabase) {
      const payload = authAccountToDb(acc);
      Promise.resolve(
        supabase
          .from('auth_accounts')
          .upsert([payload], { onConflict: 'username' })
      ).catch(err => console.warn('Supabase reset password error:', err));
    }

    return true;
  }

  public getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  public logout() {
    this.setCurrentUser(null);
  }

  // --- Classes ---
  public getClasses(): string[] {
    return [...this.classes];
  }

  public addClass(classId: string, adminName: string): boolean {
    const trimmed = classId.trim().toUpperCase();
    if (!trimmed || this.classes.includes(trimmed)) return false;
    this.classes.push(trimmed);
    this.saveAll();
    this.notify();
    this.addLog('EDIT_SISWA', adminName, trimmed, `Menambahkan kelas baru ${trimmed}`);

    if (supabase) {
      Promise.resolve(supabase.from('classes').insert([{ id: trimmed }]))
        .catch(err => console.warn('Supabase add class error:', err));
    }
    return true;
  }

  // --- Teachers ---
  public getTeachers(): Teacher[] {
    return [...this.teachers];
  }

  public addTeacher(name: string, username: string, adminName: string): Teacher {
    const id = `t-${Date.now()}`;
    const cleanUsername = username.trim().toLowerCase() || name.split(' ')[0].toLowerCase() + Math.floor(Math.random() * 900 + 100);
    const newTeacher: Teacher = {
      id,
      name: name.trim(),
      username: cleanUsername
    };
    this.teachers.push(newTeacher);

    const authAcc: AuthAccount = {
      username: cleanUsername,
      passwordHash: DEFAULT_PASSWORD,
      role: 'guru',
      name: newTeacher.name,
      firstLogin: true
    };
    this.authAccounts[cleanUsername] = authAcc;

    this.saveAll();
    this.notify();
    this.addLog('TAMBAH_GURU', adminName, newTeacher.name, `Menambahkan guru baru: ${newTeacher.name} (username: ${cleanUsername})`);

    if (supabase) {
      Promise.resolve(supabase.from('teachers').insert([newTeacher])).catch(() => {});
      Promise.resolve(supabase.from('auth_accounts').insert([authAccountToDb(authAcc)])).catch(() => {});
    }

    return newTeacher;
  }

  public updateTeacher(id: string, name: string, username: string, adminName: string): boolean {
    const index = this.teachers.findIndex(t => t.id === id);
    if (index === -1) return false;
    const oldTeacher = this.teachers[index];
    const oldKey = oldTeacher.username.toLowerCase();
    const newKey = username.trim().toLowerCase();

    const existingAuth = this.authAccounts[oldKey];
    if (oldKey !== newKey && existingAuth) {
      delete this.authAccounts[oldKey];
      this.authAccounts[newKey] = {
        ...existingAuth,
        username: newKey,
        name: name.trim()
      };
    } else if (existingAuth) {
      existingAuth.name = name.trim();
    }

    this.teachers[index] = {
      id,
      name: name.trim(),
      username: newKey
    };

    this.saveAll();
    this.notify();
    this.addLog('EDIT_GURU', adminName, name, `Memperbarui data guru ${oldTeacher.name} -> ${name.trim()}`);

    if (supabase) {
      Promise.resolve(supabase.from('teachers').update({ name: name.trim(), username: newKey }).eq('id', id)).catch(() => {});
      if (oldKey !== newKey) {
        Promise.resolve(supabase.from('auth_accounts').update({ username: newKey, name: name.trim() }).eq('username', oldKey)).catch(() => {});
      } else {
        Promise.resolve(supabase.from('auth_accounts').update({ name: name.trim() }).eq('username', newKey)).catch(() => {});
      }
    }

    return true;
  }

  public deleteTeacher(id: string, adminName: string): boolean {
    const teacher = this.teachers.find(t => t.id === id);
    if (!teacher) return false;
    this.teachers = this.teachers.filter(t => t.id !== id);
    delete this.authAccounts[teacher.username.toLowerCase()];
    this.saveAll();
    this.notify();
    this.addLog('HAPUS_GURU', adminName, teacher.name, `Menghapus data guru ${teacher.name}`);

    if (supabase) {
      Promise.resolve(supabase.from('teachers').delete().eq('id', id)).catch(() => {});
      Promise.resolve(supabase.from('auth_accounts').delete().ilike('username', teacher.username)).catch(() => {});
    }

    return true;
  }

  // --- Students ---
  public getStudents(classFilter?: string): Student[] {
    if (classFilter) {
      return this.students.filter(s => s.classId.toUpperCase() === classFilter.toUpperCase());
    }
    return [...this.students];
  }

  public addStudent(name: string, classId: string, adminName: string): Student {
    const newStudent: Student = {
      id: `s-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name.trim().toUpperCase(),
      classId: classId.trim().toUpperCase()
    };
    this.students.push(newStudent);

    // Auto create auth account for wali
    const waliUname = makeWaliUsername(newStudent.classId, newStudent.name);
    const waliAcc: AuthAccount = {
      username: waliUname,
      passwordHash: DEFAULT_PASSWORD,
      role: 'wali',
      name: `Wali dari ${newStudent.name}`,
      classId: newStudent.classId,
      studentName: newStudent.name,
      firstLogin: true
    };
    this.authAccounts[waliUname.toLowerCase()] = waliAcc;

    this.saveAll();
    this.notify();
    this.addLog('TAMBAH_SISWA', adminName, newStudent.name, `Menambahkan siswa baru kelas ${newStudent.classId}: ${newStudent.name}`);

    if (supabase) {
      Promise.resolve(supabase.from('students').insert([studentToDb(newStudent)]))
        .catch(err => console.warn('Supabase add student error:', err));
      Promise.resolve(supabase.from('auth_accounts').insert([authAccountToDb(waliAcc)]))
        .catch(err => console.warn('Supabase add wali account error:', err));
    }

    return newStudent;
  }

  public updateStudent(id: string, name: string, classId: string, adminName: string): boolean {
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) return false;
    const old = this.students[index];
    const updatedStudent: Student = {
      id,
      name: name.trim().toUpperCase(),
      classId: classId.trim().toUpperCase()
    };
    this.students[index] = updatedStudent;
    this.saveAll();
    this.notify();
    this.addLog('EDIT_SISWA', adminName, name, `Memperbarui siswa ${old.name} (${old.classId}) -> ${name.trim()} (${classId})`);

    if (supabase) {
      Promise.resolve(supabase.from('students').update(studentToDb(updatedStudent)).eq('id', id))
        .catch(err => console.warn('Supabase update student error:', err));
    }

    return true;
  }

  public deleteStudent(id: string, adminName: string): boolean {
    const student = this.students.find(s => s.id === id);
    if (!student) return false;
    this.students = this.students.filter(s => s.id !== id);
    const waliKey = makeWaliUsername(student.classId, student.name).toLowerCase();
    delete this.authAccounts[waliKey];

    this.saveAll();
    this.notify();
    this.addLog('HAPUS_SISWA', adminName, student.name, `Menghapus siswa ${student.name} dari kelas ${student.classId}`);

    if (supabase) {
      Promise.resolve(supabase.from('students').delete().eq('id', id))
        .catch(err => console.warn('Supabase delete student error:', err));
      Promise.resolve(supabase.from('auth_accounts').delete().ilike('username', waliKey))
        .catch(() => {});
    }

    return true;
  }

  // --- Memorization Records ---
  public getRecords(filter?: {
    classId?: string;
    studentId?: string;
    studentName?: string;
    teacherId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): MemorizationRecord[] {
    let result = [...this.records];

    if (filter?.classId && filter.classId !== 'ALL') {
      result = result.filter(r => r.classId.toUpperCase() === filter.classId!.toUpperCase());
    }
    if (filter?.studentId) {
      result = result.filter(r => r.studentId === filter.studentId);
    }
    if (filter?.studentName) {
      const query = normalizeStr(filter.studentName);
      result = result.filter(r => normalizeStr(r.studentName).includes(query));
    }
    if (filter?.teacherId) {
      result = result.filter(r => r.teacherId === filter.teacherId);
    }
    if (filter?.type) {
      result = result.filter(r => r.type === filter.type);
    }
    if (filter?.startDate) {
      result = result.filter(r => r.date >= filter.startDate!);
    }
    if (filter?.endDate) {
      result = result.filter(r => r.date <= filter.endDate!);
    }

    // Sort newest first
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || (b.createdAt > a.createdAt ? 1 : -1));
  }

  public addRecord(record: Omit<MemorizationRecord, 'id' | 'createdAt'>): MemorizationRecord {
    const newRecord: MemorizationRecord = {
      ...record,
      id: `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };
    this.records.unshift(newRecord);
    this.saveAll();
    this.notify();

    // Async sync to Supabase online database
    if (supabase) {
      Promise.resolve(
        supabase.from('memorization_records').insert([recordToDb(newRecord)])
      ).catch((err: unknown) => {
        console.warn('Cloud sync error for record:', err);
      });
    }

    return newRecord;
  }

  public deleteRecord(id: string, userName: string): boolean {
    const target = this.records.find(r => r.id === id);
    if (!target) return false;
    this.records = this.records.filter(r => r.id !== id);
    this.saveAll();
    this.notify();
    this.addLog('HAPUS_SETORAN', userName, target.studentName, `Menghapus setoran ${target.type} tanggal ${target.date} untuk ${target.studentName}`);

    if (supabase) {
      Promise.resolve(supabase.from('memorization_records').delete().eq('id', id))
        .catch((err: unknown) => console.warn('Supabase delete record error:', err));
    }
    return true;
  }

  // --- getRekapGuru(kelas, bulan, tahun, jenis) ---
  public getRekapGuru(
    kelas: string,
    bulan: number | string,
    tahun: number | string,
    jenis?: 'all' | 'tahsin' | 'tahfidz'
  ): MemorizationRecord[] {
    return this.records.filter(r => {
      if (kelas && kelas !== 'ALL' && r.classId.toUpperCase() !== kelas.toUpperCase()) {
        return false;
      }
      if (jenis && jenis !== 'all' && r.type !== jenis) {
        return false;
      }
      const recordDate = new Date(r.date);
      const rMonth = recordDate.getMonth() + 1;
      const rYear = recordDate.getFullYear();

      if (bulan && bulan !== 'ALL' && rMonth !== Number(bulan)) {
        return false;
      }
      if (tahun && tahun !== 'ALL' && rYear !== Number(tahun)) {
        return false;
      }

      return true;
    }).sort((a, b) => a.studentName.localeCompare(b.studentName) || new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // --- Activity Logs ---
  public getLogs(): ActivityLog[] {
    return [...this.logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addLog(actionType: ActionType, performedBy: string, target: string, details: string) {
    const log: ActivityLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actionType,
      performedBy,
      target,
      details
    };
    this.logs.unshift(log);
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(0, 1000);
    }
    this.saveAll();
    this.notify();

    if (supabase) {
      Promise.resolve(supabase.from('activity_logs').insert([logToDb(log)])).catch((err: unknown) => console.warn(err));
    }
  }

  // All Accounts list for Admin
  public getAllAuthAccounts(): AuthAccount[] {
    const list: AuthAccount[] = [];
    const seen = new Set<string>();

    // 1. Admin
    if (this.authAccounts['admin']) {
      list.push(this.authAccounts['admin']);
      seen.add('admin');
    }

    // 2. Teachers
    for (const t of this.teachers) {
      const key = t.username.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        const existing = this.authAccounts[key];
        if (existing) {
          list.push(existing);
        } else {
          list.push({
            username: t.username,
            passwordHash: DEFAULT_PASSWORD,
            role: 'guru',
            name: t.name,
            firstLogin: true
          });
        }
      }
    }

    // 3. Students / Wali
    for (const s of this.students) {
      const waliUname = makeWaliUsername(s.classId, s.name);
      const key = waliUname.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        const existing = this.authAccounts[key];
        if (existing) {
          list.push(existing);
        } else {
          list.push({
            username: waliUname,
            passwordHash: DEFAULT_PASSWORD,
            role: 'wali',
            name: `Wali dari ${s.name}`,
            classId: s.classId,
            studentName: s.name,
            firstLogin: true
          });
        }
      }
    }

    return list;
  }
}

export const storage = new StorageManager();
export { useStorageSubscription } from '../hooks/useStorage';

