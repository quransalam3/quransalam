import { 
  Teacher, 
  Student, 
  MemorizationRecord, 
  ActivityLog, 
  User, 
  ActionType, 
  UserRole 
} from '../types';
import { 
  INITIAL_CLASSES, 
  INITIAL_TEACHERS, 
  INITIAL_STUDENTS 
} from '../data/initialData';
import { supabase } from './supabaseClient';

const STORAGE_KEYS = {
  CLASSES: 'salam_classes_v1',
  TEACHERS: 'salam_teachers_v1',
  STUDENTS: 'salam_students_v1',
  RECORDS: 'salam_records_v1',
  LOGS: 'salam_logs_v1',
  USERS_AUTH: 'salam_users_auth_v1',
  CURRENT_USER: 'salam_active_user_v1',
};

export const DEFAULT_PASSWORD = 'salsabila3';

interface AuthAccount {
  username: string;
  passwordHash: string; // plain or hashed
  role: UserRole;
  name: string;
  classId?: string;
  studentName?: string;
  firstLogin: boolean;
}

// Helper to normalize strings for comparison
export function normalizeStr(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

// Format wali username
export function makeWaliUsername(classId: string, studentName: string): string {
  return `wali.${classId}.${studentName.trim()}`;
}

class StorageManager {
  private teachers: Teacher[] = [];
  private students: Student[] = [];
  private classes: string[] = [];
  private records: MemorizationRecord[] = [];
  private logs: ActivityLog[] = [];
  private authAccounts: Record<string, AuthAccount> = {};

  constructor() {
    this.init();
  }

  private init() {
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

    // 4. Records: Bersih tanpa ada data simulasi (Empty on fresh start)
    try {
      const savedRecords = localStorage.getItem(STORAGE_KEYS.RECORDS);
      this.records = savedRecords ? JSON.parse(savedRecords) : [];
    } catch {
      this.records = [];
    }

    // 5. Activity Logs
    try {
      const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      this.logs = savedLogs ? JSON.parse(savedLogs) : [];
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
    // Admin default
    if (!this.authAccounts['admin']) {
      this.authAccounts['admin'] = {
        username: 'admin',
        passwordHash: DEFAULT_PASSWORD,
        role: 'admin',
        name: 'Administrator SALAM Quran',
        firstLogin: false
      };
    }

    // Teachers accounts
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
      }
    }
  }

  private saveAll() {
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
            role: 'guru',
            name: tAcc.name,
            firstLogin: tAcc.firstLogin
          };
          this.setCurrentUser(user);
          return { user };
        }
      }
      return { error: 'Username tidak ditemukan. Periksa kembali username atau format login.' };
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

  public changePassword(username: string, newPassword: string):boolean {
    const key = username.toLowerCase();
    const acc = this.authAccounts[key];
    if (acc) {
      acc.passwordHash = newPassword;
      acc.firstLogin = false;
      this.saveAll();

      // update current user if matches
      const current = this.getCurrentUser();
      if (current && current.username.toLowerCase() === key) {
        current.firstLogin = false;
        this.setCurrentUser(current);
      }
      if (supabase) {
        Promise.resolve(supabase.from('auth_accounts').upsert([{
          username: acc.username,
          password_hash: acc.passwordHash,
          passwordHash: acc.passwordHash,
          role: acc.role,
          name: acc.name,
          class_id: acc.classId || null,
          classId: acc.classId || null,
          student_name: acc.studentName || null,
          studentName: acc.studentName || null,
          first_login: acc.firstLogin,
          firstLogin: acc.firstLogin
        }])).catch(() => {});
      }
      return true;
    }
    return false;
  }

  public resetPassword(username: string, adminName: string): boolean {
    const raw = username.trim();
    const key = raw.toLowerCase();
    let acc = this.authAccounts[key];

    if (!acc) {
      // Check if it's a teacher
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
        // Check if it's wali format: wali.(Kelas).(Nama)
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
      } else {
        // Check if it's a student by name directly
        const student = this.students.find(s => normalizeStr(s.name) === normalizeStr(raw));
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

    acc.passwordHash = DEFAULT_PASSWORD;
    acc.firstLogin = true;
    this.saveAll();

    this.addLog(
      'RESET_PASSWORD',
      adminName,
      acc.username,
      `Reset password akun ${acc.username} (${acc.name}) kembali ke default "${DEFAULT_PASSWORD}"`
    );

    if (supabase) {
      Promise.resolve(supabase.from('auth_accounts').upsert([{
        username: acc.username,
        password_hash: acc.passwordHash,
        passwordHash: acc.passwordHash,
        role: acc.role,
        name: acc.name,
        class_id: acc.classId || null,
        classId: acc.classId || null,
        student_name: acc.studentName || null,
        studentName: acc.studentName || null,
        first_login: acc.firstLogin,
        firstLogin: acc.firstLogin
      }])).catch(() => {});
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
    this.addLog('EDIT_SISWA', adminName, trimmed, `Menambahkan kelas baru ${trimmed}`);
    if (supabase) {
      Promise.resolve(supabase.from('classes').insert([{ id: trimmed }])).catch(() => {});
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

    // Auth account
    this.authAccounts[cleanUsername] = {
      username: cleanUsername,
      passwordHash: DEFAULT_PASSWORD,
      role: 'guru',
      name: newTeacher.name,
      firstLogin: true
    };

    this.saveAll();
    this.addLog('TAMBAH_GURU', adminName, newTeacher.name, `Menambahkan guru baru: ${newTeacher.name} (username: ${cleanUsername})`);

    if (supabase) {
      Promise.resolve(supabase.from('teachers').insert([newTeacher])).catch(() => {});
      Promise.resolve(supabase.from('auth_accounts').insert([{
        username: cleanUsername,
        password_hash: DEFAULT_PASSWORD,
        passwordHash: DEFAULT_PASSWORD,
        role: 'guru',
        name: newTeacher.name,
        first_login: true,
        firstLogin: true
      }])).catch(() => {});
    }

    return newTeacher;
  }

  public updateTeacher(id: string, name: string, username: string, adminName: string): boolean {
    const index = this.teachers.findIndex(t => t.id === id);
    if (index === -1) return false;
    const oldTeacher = this.teachers[index];
    const oldKey = oldTeacher.username.toLowerCase();
    const newKey = username.trim().toLowerCase();

    // Preserve existing password if any
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
    this.addLog('EDIT_GURU', adminName, name, `Memperbarui data guru ${oldTeacher.name} -> ${name.trim()}`);

    if (supabase) {
      Promise.resolve(supabase.from('teachers').update({ name: name.trim(), username: newKey }).eq('id', id)).catch(() => {});
    }

    return true;
  }

  public deleteTeacher(id: string, adminName: string): boolean {
    const teacher = this.teachers.find(t => t.id === id);
    if (!teacher) return false;
    this.teachers = this.teachers.filter(t => t.id !== id);
    delete this.authAccounts[teacher.username.toLowerCase()];
    this.saveAll();
    this.addLog('HAPUS_GURU', adminName, teacher.name, `Menghapus data guru ${teacher.name}`);

    if (supabase) {
      Promise.resolve(supabase.from('teachers').delete().eq('id', id)).catch(() => {});
      Promise.resolve(supabase.from('auth_accounts').delete().eq('username', teacher.username.toLowerCase())).catch(() => {});
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
    this.saveAll();
    this.addLog('TAMBAH_SISWA', adminName, newStudent.name, `Menambahkan siswa baru kelas ${newStudent.classId}: ${newStudent.name}`);

    if (supabase) {
      Promise.resolve(supabase.from('students').insert([{
        id: newStudent.id,
        name: newStudent.name,
        class_id: newStudent.classId,
        classId: newStudent.classId
      }])).catch(() => {});
    }

    return newStudent;
  }

  public updateStudent(id: string, name: string, classId: string, adminName: string): boolean {
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) return false;
    const old = this.students[index];
    this.students[index] = {
      id,
      name: name.trim().toUpperCase(),
      classId: classId.trim().toUpperCase()
    };
    this.saveAll();
    this.addLog('EDIT_SISWA', adminName, name, `Memperbarui siswa ${old.name} (${old.classId}) -> ${name.trim()} (${classId})`);

    if (supabase) {
      Promise.resolve(supabase.from('students').update({
        name: name.trim().toUpperCase(),
        class_id: classId.trim().toUpperCase(),
        classId: classId.trim().toUpperCase()
      }).eq('id', id)).catch(() => {});
    }

    return true;
  }

  public deleteStudent(id: string, adminName: string): boolean {
    const student = this.students.find(s => s.id === id);
    if (!student) return false;
    this.students = this.students.filter(s => s.id !== id);
    this.saveAll();
    this.addLog('HAPUS_SISWA', adminName, student.name, `Menghapus siswa ${student.name} dari kelas ${student.classId}`);

    if (supabase) {
      Promise.resolve(supabase.from('students').delete().eq('id', id)).catch(() => {});
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

    if (filter?.classId) {
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

    // Async sync to cloud if connected
    if (supabase) {
      Promise.resolve(supabase.from('memorization_records').insert([newRecord])).catch((err: unknown) => {
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
    this.addLog('HAPUS_SETORAN', userName, target.studentName, `Menghapus setoran ${target.type} tanggal ${target.date} untuk ${target.studentName}`);

    if (supabase) {
      Promise.resolve(supabase.from('memorization_records').delete().eq('id', id)).catch((err: unknown) => console.warn(err));
    }
    return true;
  }

  // --- getRekapGuru(kelas, bulan, tahun) ---
  // Fungsi server-compatible / backend helper untuk filter rekap capaian
  public getRekapGuru(kelas: string, bulan: number | string, tahun: number | string): MemorizationRecord[] {
    return this.records.filter(r => {
      // 1. Filter kelas
      if (kelas && kelas !== 'ALL' && r.classId.toUpperCase() !== kelas.toUpperCase()) {
        return false;
      }
      // 2. Filter tanggal (format YYYY-MM-DD)
      const recordDate = new Date(r.date);
      const rMonth = recordDate.getMonth() + 1; // 1-12
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
    // Keep max 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(0, 1000);
    }
    this.saveAll();

    if (supabase) {
      Promise.resolve(supabase.from('activity_logs').insert([log])).catch((err: unknown) => console.warn(err));
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
