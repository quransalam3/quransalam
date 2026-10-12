import { Teacher, Student, MemorizationRecord, ActivityLog, AuthAccount } from '../types';
import { DEFAULT_PASSWORD, makeWaliUsername } from './storage';

function escapeSql(str: string): string {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

export function generateSupabaseSqlScript(
  classes: string[],
  teachers: Teacher[],
  students: Student[],
  records: MemorizationRecord[] = [],
  logs: ActivityLog[] = [],
  accounts: AuthAccount[] = []
): string {
  const parts: string[] = [];

  parts.push(`-- =========================================================================
-- SKRIP STRUKTUR TABEL & DATA AWAL RESMI: SALAM QURAN
-- SD ISLAM TERPADU SALSABILA 3 BANGUNTAPAN
-- Siap dieksekusi di Supabase SQL Editor
-- Proyek Supabase: https://ubyrtmcrdeltgcfurouy.supabase.co
--
-- DUKUNGAN PENUH UNTUK:
-- 1. Supabase Table Editor: Trigger otomatis sinkronisasi kolom snake_case & camelCase
-- 2. Penyimpanan Realtime: REPLICA IDENTITY FULL dan publikasi supabase_realtime
-- 3. Domain Vercel: Kebijakan RLS Public Access untuk koneksi web dari domain Vercel
-- 4. Kata sandi default awal guru & wali: salsabila3 (bersih tanpa data simulasi)
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. STRUKTUR TABEL (DDL)
-- -------------------------------------------------------------------------

-- A. Tabel Kelas
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY
);

-- B. Tabel Dewan Guru Qur'an
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL
);

-- C. Tabel Peserta Didik (Tanpa NIS)
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  class_id TEXT NOT NULL REFERENCES classes(id) ON UPDATE CASCADE ON DELETE CASCADE,
  "classId" TEXT
);

-- D. Tabel Akun Pengguna (Autentikasi Aplikasi)
CREATE TABLE IF NOT EXISTS auth_accounts (
  username TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL DEFAULT 'salsabila3',
  "passwordHash" TEXT DEFAULT 'salsabila3',
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  class_id TEXT,
  "classId" TEXT,
  student_name TEXT,
  "studentName" TEXT,
  first_login BOOLEAN DEFAULT TRUE,
  "firstLogin" BOOLEAN DEFAULT TRUE
);

-- E. Tabel Catatan Pembelajaran & Hafalan (Tahsin & Tahfidz)
CREATE TABLE IF NOT EXISTS memorization_records (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  class_id TEXT,
  "classId" TEXT,
  student_id TEXT,
  "studentId" TEXT,
  student_name TEXT,
  "studentName" TEXT,
  teacher_id TEXT,
  "teacherId" TEXT,
  teacher_name TEXT,
  "teacherName" TEXT,
  type TEXT NOT NULL CHECK (type IN ('tahsin', 'tahfidz')),
  tahsin_book TEXT,
  "tahsinBook" TEXT,
  tahsin_page TEXT,
  "tahsinPage" TEXT,
  tahsin_surah_number INTEGER,
  "tahsinSurahNumber" INTEGER,
  tahsin_surah_name TEXT,
  "tahsinSurahName" TEXT,
  tahsin_last_ayat TEXT,
  "tahsinLastAyat" TEXT,
  tahfidz_juz INTEGER,
  "tahfidzJuz" INTEGER,
  tahfidz_surah_number INTEGER,
  "tahfidzSurahNumber" INTEGER,
  tahfidz_surah_name TEXT,
  "tahfidzSurahName" TEXT,
  tahfidz_ayat_range TEXT,
  "tahfidzAyatRange" TEXT,
  grade TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- F. Tabel Log Audit Aktivitas Admin
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  action_type TEXT NOT NULL,
  "actionType" TEXT,
  performed_by TEXT NOT NULL,
  "performedBy" TEXT,
  target TEXT NOT NULL,
  details TEXT
);

-- -------------------------------------------------------------------------
-- 2. TRIGGER SINKRONISASI KOLOM (SNAKE_CASE & CAMELCASE UNTUK TABLE EDITOR)
-- -------------------------------------------------------------------------

-- Trigger untuk sync memorization_records
CREATE OR REPLACE FUNCTION sync_record_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.class_id IS DISTINCT FROM OLD.class_id THEN NEW."classId" := NEW.class_id;
    ELSIF NEW."classId" IS DISTINCT FROM OLD."classId" THEN NEW.class_id := NEW."classId"; END IF;

    IF NEW.student_id IS DISTINCT FROM OLD.student_id THEN NEW."studentId" := NEW.student_id;
    ELSIF NEW."studentId" IS DISTINCT FROM OLD."studentId" THEN NEW.student_id := NEW."studentId"; END IF;

    IF NEW.student_name IS DISTINCT FROM OLD.student_name THEN NEW."studentName" := NEW.student_name;
    ELSIF NEW."studentName" IS DISTINCT FROM OLD."studentName" THEN NEW.student_name := NEW."studentName"; END IF;

    IF NEW.teacher_id IS DISTINCT FROM OLD.teacher_id THEN NEW."teacherId" := NEW.teacher_id;
    ELSIF NEW."teacherId" IS DISTINCT FROM OLD."teacherId" THEN NEW.teacher_id := NEW."teacherId"; END IF;

    IF NEW.teacher_name IS DISTINCT FROM OLD.teacher_name THEN NEW."teacherName" := NEW.teacher_name;
    ELSIF NEW."teacherName" IS DISTINCT FROM OLD."teacherName" THEN NEW.teacher_name := NEW."teacherName"; END IF;

    IF NEW.tahsin_book IS DISTINCT FROM OLD.tahsin_book THEN NEW."tahsinBook" := NEW.tahsin_book;
    ELSIF NEW."tahsinBook" IS DISTINCT FROM OLD."tahsinBook" THEN NEW.tahsin_book := NEW."tahsinBook"; END IF;

    IF NEW.tahsin_page IS DISTINCT FROM OLD.tahsin_page THEN NEW."tahsinPage" := NEW.tahsin_page;
    ELSIF NEW."tahsinPage" IS DISTINCT FROM OLD."tahsinPage" THEN NEW.tahsin_page := NEW."tahsinPage"; END IF;

    IF NEW.tahsin_surah_number IS DISTINCT FROM OLD.tahsin_surah_number THEN NEW."tahsinSurahNumber" := NEW.tahsin_surah_number;
    ELSIF NEW."tahsinSurahNumber" IS DISTINCT FROM OLD."tahsinSurahNumber" THEN NEW.tahsin_surah_number := NEW."tahsinSurahNumber"; END IF;

    IF NEW.tahsin_surah_name IS DISTINCT FROM OLD.tahsin_surah_name THEN NEW."tahsinSurahName" := NEW.tahsin_surah_name;
    ELSIF NEW."tahsinSurahName" IS DISTINCT FROM OLD."tahsinSurahName" THEN NEW.tahsin_surah_name := NEW."tahsinSurahName"; END IF;

    IF NEW.tahsin_last_ayat IS DISTINCT FROM OLD.tahsin_last_ayat THEN NEW."tahsinLastAyat" := NEW.tahsin_last_ayat;
    ELSIF NEW."tahsinLastAyat" IS DISTINCT FROM OLD."tahsinLastAyat" THEN NEW.tahsin_last_ayat := NEW."tahsinLastAyat"; END IF;

    IF NEW.tahfidz_juz IS DISTINCT FROM OLD.tahfidz_juz THEN NEW."tahfidzJuz" := NEW.tahfidz_juz;
    ELSIF NEW."tahfidzJuz" IS DISTINCT FROM OLD."tahfidzJuz" THEN NEW.tahfidz_juz := NEW."tahfidzJuz"; END IF;

    IF NEW.tahfidz_surah_number IS DISTINCT FROM OLD.tahfidz_surah_number THEN NEW."tahfidzSurahNumber" := NEW.tahfidz_surah_number;
    ELSIF NEW."tahfidzSurahNumber" IS DISTINCT FROM OLD."tahfidzSurahNumber" THEN NEW.tahfidz_surah_number := NEW."tahfidzSurahNumber"; END IF;

    IF NEW.tahfidz_surah_name IS DISTINCT FROM OLD.tahfidz_surah_name THEN NEW."tahfidzSurahName" := NEW.tahfidz_surah_name;
    ELSIF NEW."tahfidzSurahName" IS DISTINCT FROM OLD."tahfidzSurahName" THEN NEW.tahfidz_surah_name := NEW."tahfidzSurahName"; END IF;

    IF NEW.tahfidz_ayat_range IS DISTINCT FROM OLD.tahfidz_ayat_range THEN NEW."tahfidzAyatRange" := NEW.tahfidz_ayat_range;
    ELSIF NEW."tahfidzAyatRange" IS DISTINCT FROM OLD."tahfidzAyatRange" THEN NEW.tahfidz_ayat_range := NEW."tahfidzAyatRange"; END IF;

    IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN NEW."createdAt" := NEW.created_at;
    ELSIF NEW."createdAt" IS DISTINCT FROM OLD."createdAt" THEN NEW.created_at := NEW."createdAt"; END IF;
  ELSE
    IF NEW.class_id IS NOT NULL AND NEW."classId" IS NULL THEN NEW."classId" := NEW.class_id;
    ELSIF NEW."classId" IS NOT NULL AND NEW.class_id IS NULL THEN NEW.class_id := NEW."classId"; END IF;

    IF NEW.student_id IS NOT NULL AND NEW."studentId" IS NULL THEN NEW."studentId" := NEW.student_id;
    ELSIF NEW."studentId" IS NOT NULL AND NEW.student_id IS NULL THEN NEW.student_id := NEW."studentId"; END IF;

    IF NEW.student_name IS NOT NULL AND NEW."studentName" IS NULL THEN NEW."studentName" := NEW.student_name;
    ELSIF NEW."studentName" IS NOT NULL AND NEW.student_name IS NULL THEN NEW.student_name := NEW."studentName"; END IF;

    IF NEW.teacher_id IS NOT NULL AND NEW."teacherId" IS NULL THEN NEW."teacherId" := NEW.teacher_id;
    ELSIF NEW."teacherId" IS NOT NULL AND NEW.teacher_id IS NULL THEN NEW.teacher_id := NEW."teacherId"; END IF;

    IF NEW.teacher_name IS NOT NULL AND NEW."teacherName" IS NULL THEN NEW."teacherName" := NEW.teacher_name;
    ELSIF NEW."teacherName" IS NOT NULL AND NEW.teacher_name IS NULL THEN NEW.teacher_name := NEW."teacherName"; END IF;

    IF NEW.tahsin_book IS NOT NULL AND NEW."tahsinBook" IS NULL THEN NEW."tahsinBook" := NEW.tahsin_book;
    ELSIF NEW."tahsinBook" IS NOT NULL AND NEW.tahsin_book IS NULL THEN NEW.tahsin_book := NEW."tahsinBook"; END IF;

    IF NEW.tahsin_page IS NOT NULL AND NEW."tahsinPage" IS NULL THEN NEW."tahsinPage" := NEW.tahsin_page;
    ELSIF NEW."tahsinPage" IS NOT NULL AND NEW.tahsin_page IS NULL THEN NEW.tahsin_page := NEW."tahsinPage"; END IF;

    IF NEW.tahsin_surah_number IS NOT NULL AND NEW."tahsinSurahNumber" IS NULL THEN NEW."tahsinSurahNumber" := NEW.tahsin_surah_number;
    ELSIF NEW."tahsinSurahNumber" IS NOT NULL AND NEW.tahsin_surah_number IS NULL THEN NEW.tahsin_surah_number := NEW."tahsinSurahNumber"; END IF;

    IF NEW.tahsin_surah_name IS NOT NULL AND NEW."tahsinSurahName" IS NULL THEN NEW."tahsinSurahName" := NEW.tahsin_surah_name;
    ELSIF NEW."tahsinSurahName" IS NOT NULL AND NEW.tahsin_surah_name IS NULL THEN NEW.tahsin_surah_name := NEW."tahsinSurahName"; END IF;

    IF NEW.tahsin_last_ayat IS NOT NULL AND NEW."tahsinLastAyat" IS NULL THEN NEW."tahsinLastAyat" := NEW.tahsin_last_ayat;
    ELSIF NEW."tahsinLastAyat" IS NOT NULL AND NEW.tahsin_last_ayat IS NULL THEN NEW.tahsin_last_ayat := NEW."tahsinLastAyat"; END IF;

    IF NEW.tahfidz_juz IS NOT NULL AND NEW."tahfidzJuz" IS NULL THEN NEW."tahfidzJuz" := NEW.tahfidz_juz;
    ELSIF NEW."tahfidzJuz" IS NOT NULL AND NEW.tahfidz_juz IS NULL THEN NEW.tahfidz_juz := NEW."tahfidzJuz"; END IF;

    IF NEW.tahfidz_surah_number IS NOT NULL AND NEW."tahfidzSurahNumber" IS NULL THEN NEW."tahfidzSurahNumber" := NEW.tahfidz_surah_number;
    ELSIF NEW."tahfidzSurahNumber" IS NOT NULL AND NEW.tahfidz_surah_number IS NULL THEN NEW.tahfidz_surah_number := NEW."tahfidzSurahNumber"; END IF;

    IF NEW.tahfidz_surah_name IS NOT NULL AND NEW."tahfidzSurahName" IS NULL THEN NEW."tahfidzSurahName" := NEW.tahfidz_surah_name;
    ELSIF NEW."tahfidzSurahName" IS NOT NULL AND NEW.tahfidz_surah_name IS NULL THEN NEW.tahfidz_surah_name := NEW."tahfidzSurahName"; END IF;

    IF NEW.tahfidz_ayat_range IS NOT NULL AND NEW."tahfidzAyatRange" IS NULL THEN NEW."tahfidzAyatRange" := NEW.tahfidz_ayat_range;
    ELSIF NEW."tahfidzAyatRange" IS NOT NULL AND NEW.tahfidz_ayat_range IS NULL THEN NEW.tahfidz_ayat_range := NEW."tahfidzAyatRange"; END IF;

    IF NEW.created_at IS NOT NULL AND NEW."createdAt" IS NULL THEN NEW."createdAt" := NEW.created_at;
    ELSIF NEW."createdAt" IS NOT NULL AND NEW.created_at IS NULL THEN NEW.created_at := NEW."createdAt"; END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_record_columns ON memorization_records;
CREATE TRIGGER trg_sync_record_columns
BEFORE INSERT OR UPDATE ON memorization_records
FOR EACH ROW EXECUTE FUNCTION sync_record_columns();

-- Trigger untuk sync students
CREATE OR REPLACE FUNCTION sync_student_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.class_id IS DISTINCT FROM OLD.class_id THEN NEW."classId" := NEW.class_id;
    ELSIF NEW."classId" IS DISTINCT FROM OLD."classId" THEN NEW.class_id := NEW."classId"; END IF;
  ELSE
    IF NEW.class_id IS NOT NULL AND NEW."classId" IS NULL THEN NEW."classId" := NEW.class_id;
    ELSIF NEW."classId" IS NOT NULL AND NEW.class_id IS NULL THEN NEW.class_id := NEW."classId"; END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_student_columns ON students;
CREATE TRIGGER trg_sync_student_columns
BEFORE INSERT OR UPDATE ON students
FOR EACH ROW EXECUTE FUNCTION sync_student_columns();

-- Trigger untuk sync auth_accounts (Reset password & Table Editor)
CREATE OR REPLACE FUNCTION sync_auth_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.password_hash IS DISTINCT FROM OLD.password_hash THEN
      NEW."passwordHash" := NEW.password_hash;
    ELSIF NEW."passwordHash" IS DISTINCT FROM OLD."passwordHash" THEN
      NEW.password_hash := NEW."passwordHash";
    END IF;

    IF NEW.first_login IS DISTINCT FROM OLD.first_login THEN
      NEW."firstLogin" := NEW.first_login;
    ELSIF NEW."firstLogin" IS DISTINCT FROM OLD."firstLogin" THEN
      NEW.first_login := NEW."firstLogin";
    END IF;

    IF NEW.class_id IS DISTINCT FROM OLD.class_id THEN
      NEW."classId" := NEW.class_id;
    ELSIF NEW."classId" IS DISTINCT FROM OLD."classId" THEN
      NEW.class_id := NEW."classId";
    END IF;

    IF NEW.student_name IS DISTINCT FROM OLD.student_name THEN
      NEW."studentName" := NEW.student_name;
    ELSIF NEW."studentName" IS DISTINCT FROM OLD."studentName" THEN
      NEW.student_name := NEW."studentName";
    END IF;
  ELSE
    IF NEW.password_hash IS NOT NULL AND NEW."passwordHash" IS NULL THEN
      NEW."passwordHash" := NEW.password_hash;
    ELSIF NEW."passwordHash" IS NOT NULL AND NEW.password_hash IS NULL THEN
      NEW.password_hash := NEW."passwordHash";
    END IF;

    IF NEW.first_login IS NOT NULL AND NEW."firstLogin" IS NULL THEN
      NEW."firstLogin" := NEW.first_login;
    ELSIF NEW."firstLogin" IS NOT NULL AND NEW.first_login IS NULL THEN
      NEW.first_login := NEW."firstLogin";
    END IF;

    IF NEW.class_id IS NOT NULL AND NEW."classId" IS NULL THEN
      NEW."classId" := NEW.class_id;
    ELSIF NEW."classId" IS NOT NULL AND NEW.class_id IS NULL THEN
      NEW.class_id := NEW."classId";
    END IF;

    IF NEW.student_name IS NOT NULL AND NEW."studentName" IS NULL THEN
      NEW."studentName" := NEW.student_name;
    ELSIF NEW."studentName" IS NOT NULL AND NEW.student_name IS NULL THEN
      NEW.student_name := NEW."studentName";
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_auth_columns ON auth_accounts;
CREATE TRIGGER trg_sync_auth_columns
BEFORE INSERT OR UPDATE ON auth_accounts
FOR EACH ROW EXECUTE FUNCTION sync_auth_columns();

-- Trigger untuk sync activity_logs
CREATE OR REPLACE FUNCTION sync_log_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.action_type IS DISTINCT FROM OLD.action_type THEN NEW."actionType" := NEW.action_type;
    ELSIF NEW."actionType" IS DISTINCT FROM OLD."actionType" THEN NEW.action_type := NEW."actionType"; END IF;

    IF NEW.performed_by IS DISTINCT FROM OLD.performed_by THEN NEW."performedBy" := NEW.performed_by;
    ELSIF NEW."performedBy" IS DISTINCT FROM OLD."performedBy" THEN NEW.performed_by := NEW."performedBy"; END IF;
  ELSE
    IF NEW.action_type IS NOT NULL AND NEW."actionType" IS NULL THEN NEW."actionType" := NEW.action_type;
    ELSIF NEW."actionType" IS NOT NULL AND NEW.action_type IS NULL THEN NEW.action_type := NEW."actionType"; END IF;

    IF NEW.performed_by IS NOT NULL AND NEW."performedBy" IS NULL THEN NEW."performedBy" := NEW.performed_by;
    ELSIF NEW."performedBy" IS NOT NULL AND NEW.performed_by IS NULL THEN NEW.performed_by := NEW."performedBy"; END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_log_columns ON activity_logs;
CREATE TRIGGER trg_sync_log_columns
BEFORE INSERT OR UPDATE ON activity_logs
FOR EACH ROW EXECUTE FUNCTION sync_log_columns();

-- -------------------------------------------------------------------------
-- 3. INDEX OPTIMASI PENCARIAN
-- -------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_records_class_student ON memorization_records(class_id, student_name);
CREATE INDEX IF NOT EXISTS idx_records_date ON memorization_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_records_teacher ON memorization_records(teacher_id);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_auth_role ON auth_accounts(role);

-- -------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) & AKSES PENUH CLIENT ANON VITE
-- -------------------------------------------------------------------------
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE memorization_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Penuh untuk Kunci Anon Aplikasi
DO $$
BEGIN
  -- classes
  DROP POLICY IF EXISTS "Public Access Classes" ON classes;
  CREATE POLICY "Public Access Classes" ON classes FOR ALL USING (true) WITH CHECK (true);

  -- teachers
  DROP POLICY IF EXISTS "Public Access Teachers" ON teachers;
  CREATE POLICY "Public Access Teachers" ON teachers FOR ALL USING (true) WITH CHECK (true);

  -- students
  DROP POLICY IF EXISTS "Public Access Students" ON students;
  CREATE POLICY "Public Access Students" ON students FOR ALL USING (true) WITH CHECK (true);

  -- auth_accounts
  DROP POLICY IF EXISTS "Public Access Auth" ON auth_accounts;
  CREATE POLICY "Public Access Auth" ON auth_accounts FOR ALL USING (true) WITH CHECK (true);

  -- memorization_records
  DROP POLICY IF EXISTS "Public Access Records" ON memorization_records;
  CREATE POLICY "Public Access Records" ON memorization_records FOR ALL USING (true) WITH CHECK (true);

  -- activity_logs
  DROP POLICY IF EXISTS "Public Access Logs" ON activity_logs;
  CREATE POLICY "Public Access Logs" ON activity_logs FOR ALL USING (true) WITH CHECK (true);
END $$;

-- Izin schema public untuk role anon, authenticated, dan service_role
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- -------------------------------------------------------------------------
-- 5. DUKUNGAN SUPABASE REALTIME (POSTGRES CHANGES)
-- -------------------------------------------------------------------------
ALTER TABLE memorization_records REPLICA IDENTITY FULL;
ALTER TABLE students REPLICA IDENTITY FULL;
ALTER TABLE teachers REPLICA IDENTITY FULL;
ALTER TABLE auth_accounts REPLICA IDENTITY FULL;
ALTER TABLE activity_logs REPLICA IDENTITY FULL;
ALTER TABLE classes REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE memorization_records;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE students;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE teachers;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE auth_accounts;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE classes;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

`);

  // 5. DATA AWAL KELAS
  parts.push(`-- -------------------------------------------------------------------------
-- 5. INSERT DATA KELAS (${classes.length} KELAS LENGKAP)
-- -------------------------------------------------------------------------`);
  if (classes.length > 0) {
    const classRows = classes.map(c => `('${escapeSql(c)}')`).join(',\n');
    parts.push(`INSERT INTO classes (id) VALUES\n${classRows}\nON CONFLICT (id) DO NOTHING;\n`);
  }

  // 6. DATA AWAL DEWAN GURU
  parts.push(`-- -------------------------------------------------------------------------
-- 6. INSERT DATA DEWAN GURU QUR'AN (${teachers.length} GURU)
-- -------------------------------------------------------------------------`);
  if (teachers.length > 0) {
    const teacherRows = teachers.map(t =>
      `('${escapeSql(t.id)}', '${escapeSql(t.name)}', '${escapeSql(t.username)}')`
    ).join(',\n');
    parts.push(`INSERT INTO teachers (id, name, username) VALUES\n${teacherRows}\nON CONFLICT (id) DO NOTHING;\n`);
  }

  // 7. DATA AWAL PESERTA DIDIK
  parts.push(`-- -------------------------------------------------------------------------
-- 7. INSERT DATA PESERTA DIDIK (${students.length} SISWA SD IT SALSABILA 3)
-- -------------------------------------------------------------------------`);
  if (students.length > 0) {
    const chunkSize = 100;
    for (let i = 0; i < students.length; i += chunkSize) {
      const chunk = students.slice(i, i + chunkSize);
      const studentRows = chunk.map(s =>
        `('${escapeSql(s.id)}', '${escapeSql(s.name)}', '${escapeSql(s.classId)}', '${escapeSql(s.classId)}')`
      ).join(',\n');
      parts.push(`INSERT INTO students (id, name, class_id, "classId") VALUES\n${studentRows}\nON CONFLICT (id) DO NOTHING;\n`);
    }
  }

  // 8. DATA AWAL AKUN PENGGUNA (DEFAULT PASSWORD: salsabila3)
  parts.push(`-- -------------------------------------------------------------------------
-- 8. INSERT DATA AKUN PENGGUNA (DEFAULT PASSWORD: salsabila3)
-- -------------------------------------------------------------------------`);
  
  const allAccountsToInsert: AuthAccount[] = accounts.length > 0 ? accounts.map(a => {
    if (a.role === 'guru' && a.firstLogin) {
      return { ...a, passwordHash: DEFAULT_PASSWORD };
    }
    return a;
  }) : [
    {
      username: 'admin',
      passwordHash: DEFAULT_PASSWORD,
      role: 'admin',
      name: 'Administrator SALAM Quran',
      firstLogin: false
    },
    ...teachers.map(t => ({
      username: t.username,
      passwordHash: DEFAULT_PASSWORD,
      role: 'guru' as const,
      name: t.name,
      firstLogin: true
    })),
    ...students.map(s => ({
      username: makeWaliUsername(s.classId, s.name),
      passwordHash: DEFAULT_PASSWORD,
      role: 'wali' as const,
      name: `Wali dari ${s.name}`,
      classId: s.classId,
      studentName: s.name,
      firstLogin: true
    }))
  ];

  if (allAccountsToInsert.length > 0) {
    const chunkSize = 100;
    for (let i = 0; i < allAccountsToInsert.length; i += chunkSize) {
      const chunk = allAccountsToInsert.slice(i, i + chunkSize);
      const accountRows = chunk.map(a => {
        const cVal = a.classId ? `'${escapeSql(a.classId)}'` : 'NULL';
        const sVal = a.studentName ? `'${escapeSql(a.studentName)}'` : 'NULL';
        const fVal = a.firstLogin ? 'TRUE' : 'FALSE';
        return `('${escapeSql(a.username)}', '${escapeSql(a.passwordHash)}', '${escapeSql(a.passwordHash)}', '${escapeSql(a.role)}', '${escapeSql(a.name)}', ${cVal}, ${cVal}, ${sVal}, ${sVal}, ${fVal}, ${fVal})`;
      }).join(',\n');
      parts.push(`INSERT INTO auth_accounts (username, password_hash, "passwordHash", role, name, class_id, "classId", student_name, "studentName", first_login, "firstLogin") VALUES\n${accountRows}\nON CONFLICT (username) DO NOTHING;\n`);
    }
  }

  // 9. DATA CATATAN CAPAIAN HAFALAN TERSIMPAN (BERSIH DARI SIMULASI)
  const realRecords = (records || []).filter(r => !String(r.id || '').startsWith('rec-demo-'));
  if (realRecords.length > 0) {
    parts.push(`-- -------------------------------------------------------------------------
-- 9. INSERT DATA CATATAN CAPAIAN HAFALAN TERSIMPAN (${realRecords.length} DATA)
-- -------------------------------------------------------------------------`);
    const chunkSize = 100;
    for (let i = 0; i < realRecords.length; i += chunkSize) {
      const chunk = realRecords.slice(i, i + chunkSize);
      const recordRows = chunk.map(r => {
        const tBook = r.tahsinBook ? `'${escapeSql(r.tahsinBook)}'` : 'NULL';
        const tPage = r.tahsinPage ? `'${escapeSql(r.tahsinPage)}'` : 'NULL';
        const tSurahNum = r.tahsinSurahNumber ? r.tahsinSurahNumber : 'NULL';
        const tSurahName = r.tahsinSurahName ? `'${escapeSql(r.tahsinSurahName)}'` : 'NULL';
        const tLastAyat = r.tahsinLastAyat ? `'${escapeSql(r.tahsinLastAyat)}'` : 'NULL';
        const hJuz = r.tahfidzJuz ? r.tahfidzJuz : 'NULL';
        const hSurahNum = r.tahfidzSurahNumber ? r.tahfidzSurahNumber : 'NULL';
        const hSurahName = r.tahfidzSurahName ? `'${escapeSql(r.tahfidzSurahName)}'` : 'NULL';
        const hAyatRange = r.tahfidzAyatRange ? `'${escapeSql(r.tahfidzAyatRange)}'` : 'NULL';
        const notes = r.notes ? `'${escapeSql(r.notes)}'` : 'NULL';

        return `('${escapeSql(r.id)}', '${r.date}', '${escapeSql(r.classId)}', '${escapeSql(r.classId)}', '${escapeSql(r.studentId)}', '${escapeSql(r.studentId)}', '${escapeSql(r.studentName)}', '${escapeSql(r.studentName)}', '${escapeSql(r.teacherId)}', '${escapeSql(r.teacherId)}', '${escapeSql(r.teacherName)}', '${escapeSql(r.teacherName)}', '${r.type}', ${tBook}, ${tBook}, ${tPage}, ${tPage}, ${tSurahNum}, ${tSurahNum}, ${tSurahName}, ${tSurahName}, ${tLastAyat}, ${tLastAyat}, ${hJuz}, ${hJuz}, ${hSurahNum}, ${hSurahNum}, ${hSurahName}, ${hSurahName}, ${hAyatRange}, ${hAyatRange}, '${escapeSql(r.grade)}', ${notes}, '${r.createdAt}', '${r.createdAt}')`;
      }).join(',\n');
      parts.push(`INSERT INTO memorization_records (id, date, class_id, "classId", student_id, "studentId", student_name, "studentName", teacher_id, "teacherId", teacher_name, "teacherName", type, tahsin_book, "tahsinBook", tahsin_page, "tahsinPage", tahsin_surah_number, "tahsinSurahNumber", tahsin_surah_name, "tahsinSurahName", tahsin_last_ayat, "tahsinLastAyat", tahfidz_juz, "tahfidzJuz", tahfidz_surah_number, "tahfidzSurahNumber", tahfidz_surah_name, "tahfidzSurahName", tahfidz_ayat_range, "tahfidzAyatRange", grade, notes, created_at, "createdAt") VALUES\n${recordRows}\nON CONFLICT (id) DO NOTHING;\n`);
    }
  }

  // 10. LOG AKTIVITAS (BERSIH DARI SIMULASI)
  const realLogs = (logs || []).filter(l => !String(l.id || '').startsWith('log-demo-'));
  if (realLogs.length > 0) {
    parts.push(`-- -------------------------------------------------------------------------
-- 10. INSERT LOG AKTIVITAS AWAL (${realLogs.length} DATA)
-- -------------------------------------------------------------------------`);
    const logRows = realLogs.slice(0, 100).map(l =>
      `('${escapeSql(l.id)}', '${l.timestamp}', '${escapeSql(l.actionType)}', '${escapeSql(l.actionType)}', '${escapeSql(l.performedBy)}', '${escapeSql(l.performedBy)}', '${escapeSql(l.target)}', '${escapeSql(l.details)}')`
    ).join(',\n');
    parts.push(`INSERT INTO activity_logs (id, timestamp, action_type, "actionType", performed_by, "performedBy", target, details) VALUES\n${logRows}\nON CONFLICT (id) DO NOTHING;\n`);
  }

  parts.push(`-- =========================================================================
-- SELESAI: Skema dan seluruh data awal (${students.length} santri, ${teachers.length} guru, ${classes.length} kelas) siap digunakan di Supabase.
-- =========================================================================`);

  return parts.join('\n\n');
}
