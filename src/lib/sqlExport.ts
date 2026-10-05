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
-- SKRIP STRUKTUR TABEL & DATA AWAL LENGKAP: SALAM QURAN
-- SD ISLAM TERPADU SALSABILA 3 BANGUNTAPAN
-- Siap dieksekusi di Supabase SQL Editor
-- Proyek Supabase: https://ubyrtmcrdeltgcfurouy.supabase.co
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
  password_hash TEXT NOT NULL,
  "passwordHash" TEXT,
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
  date DATE NOT NULL,
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
-- 2. TRIGGER SINKRONISASI KOLOM (SNAKE_CASE & CAMELCASE)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sync_record_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.class_id IS NULL AND NEW."classId" IS NOT NULL THEN
    NEW.class_id := NEW."classId";
  ELSIF NEW."classId" IS NULL AND NEW.class_id IS NOT NULL THEN
    NEW."classId" := NEW.class_id;
  END IF;

  IF NEW.student_id IS NULL AND NEW."studentId" IS NOT NULL THEN
    NEW.student_id := NEW."studentId";
  ELSIF NEW."studentId" IS NULL AND NEW.student_id IS NOT NULL THEN
    NEW."studentId" := NEW.student_id;
  END IF;

  IF NEW.student_name IS NULL AND NEW."studentName" IS NOT NULL THEN
    NEW.student_name := NEW."studentName";
  ELSIF NEW."studentName" IS NULL AND NEW.student_name IS NOT NULL THEN
    NEW."studentName" := NEW.student_name;
  END IF;

  IF NEW.teacher_id IS NULL AND NEW."teacherId" IS NOT NULL THEN
    NEW.teacher_id := NEW."teacherId";
  ELSIF NEW."teacherId" IS NULL AND NEW.teacher_id IS NOT NULL THEN
    NEW."teacherId" := NEW.teacher_id;
  END IF;

  IF NEW.teacher_name IS NULL AND NEW."teacherName" IS NOT NULL THEN
    NEW.teacher_name := NEW."teacherName";
  ELSIF NEW."teacherName" IS NULL AND NEW.teacher_name IS NOT NULL THEN
    NEW."teacherName" := NEW.teacher_name;
  END IF;

  IF NEW.tahsin_book IS NULL AND NEW."tahsinBook" IS NOT NULL THEN
    NEW.tahsin_book := NEW."tahsinBook";
  ELSIF NEW."tahsinBook" IS NULL AND NEW.tahsin_book IS NOT NULL THEN
    NEW."tahsinBook" := NEW.tahsin_book;
  END IF;

  IF NEW.tahsin_page IS NULL AND NEW."tahsinPage" IS NOT NULL THEN
    NEW.tahsin_page := NEW."tahsinPage";
  ELSIF NEW."tahsinPage" IS NULL AND NEW.tahsin_page IS NOT NULL THEN
    NEW."tahsinPage" := NEW.tahsin_page;
  END IF;

  IF NEW.tahsin_surah_number IS NULL AND NEW."tahsinSurahNumber" IS NOT NULL THEN
    NEW.tahsin_surah_number := NEW."tahsinSurahNumber";
  ELSIF NEW."tahsinSurahNumber" IS NULL AND NEW.tahsin_surah_number IS NOT NULL THEN
    NEW."tahsinSurahNumber" := NEW.tahsin_surah_number;
  END IF;

  IF NEW.tahsin_surah_name IS NULL AND NEW."tahsinSurahName" IS NOT NULL THEN
    NEW.tahsin_surah_name := NEW."tahsinSurahName";
  ELSIF NEW."tahsinSurahName" IS NULL AND NEW.tahsin_surah_name IS NOT NULL THEN
    NEW."tahsinSurahName" := NEW.tahsin_surah_name;
  END IF;

  IF NEW.tahsin_last_ayat IS NULL AND NEW."tahsinLastAyat" IS NOT NULL THEN
    NEW.tahsin_last_ayat := NEW."tahsinLastAyat";
  ELSIF NEW."tahsinLastAyat" IS NULL AND NEW.tahsin_last_ayat IS NOT NULL THEN
    NEW."tahsinLastAyat" := NEW.tahsin_last_ayat;
  END IF;

  IF NEW.tahfidz_juz IS NULL AND NEW."tahfidzJuz" IS NOT NULL THEN
    NEW.tahfidz_juz := NEW."tahfidzJuz";
  ELSIF NEW."tahfidzJuz" IS NULL AND NEW.tahfidz_juz IS NOT NULL THEN
    NEW."tahfidzJuz" := NEW.tahfidz_juz;
  END IF;

  IF NEW.tahfidz_surah_number IS NULL AND NEW."tahfidzSurahNumber" IS NOT NULL THEN
    NEW.tahfidz_surah_number := NEW."tahfidzSurahNumber";
  ELSIF NEW."tahfidzSurahNumber" IS NULL AND NEW.tahfidz_surah_number IS NOT NULL THEN
    NEW."tahfidzSurahNumber" := NEW.tahfidz_surah_number;
  END IF;

  IF NEW.tahfidz_surah_name IS NULL AND NEW."tahfidzSurahName" IS NOT NULL THEN
    NEW.tahfidz_surah_name := NEW."tahfidzSurahName";
  ELSIF NEW."tahfidzSurahName" IS NULL AND NEW.tahfidz_surah_name IS NOT NULL THEN
    NEW."tahfidzSurahName" := NEW.tahfidz_surah_name;
  END IF;

  IF NEW.tahfidz_ayat_range IS NULL AND NEW."tahfidzAyatRange" IS NOT NULL THEN
    NEW.tahfidz_ayat_range := NEW."tahfidzAyatRange";
  ELSIF NEW."tahfidzAyatRange" IS NULL AND NEW.tahfidz_ayat_range IS NOT NULL THEN
    NEW."tahfidzAyatRange" := NEW.tahfidz_ayat_range;
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
  IF NEW.class_id IS NULL AND NEW."classId" IS NOT NULL THEN
    NEW.class_id := NEW."classId";
  ELSIF NEW."classId" IS NULL AND NEW.class_id IS NOT NULL THEN
    NEW."classId" := NEW.class_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_student_columns ON students;
CREATE TRIGGER trg_sync_student_columns
BEFORE INSERT OR UPDATE ON students
FOR EACH ROW EXECUTE FUNCTION sync_student_columns();

-- Trigger untuk sync auth_accounts
CREATE OR REPLACE FUNCTION sync_auth_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.password_hash IS NULL AND NEW."passwordHash" IS NOT NULL THEN
    NEW.password_hash := NEW."passwordHash";
  ELSIF NEW."passwordHash" IS NULL AND NEW.password_hash IS NOT NULL THEN
    NEW."passwordHash" := NEW.password_hash;
  END IF;

  IF NEW.class_id IS NULL AND NEW."classId" IS NOT NULL THEN
    NEW.class_id := NEW."classId";
  ELSIF NEW."classId" IS NULL AND NEW.class_id IS NOT NULL THEN
    NEW."classId" := NEW.class_id;
  END IF;

  IF NEW.student_name IS NULL AND NEW."studentName" IS NOT NULL THEN
    NEW.student_name := NEW."studentName";
  ELSIF NEW."studentName" IS NULL AND NEW.student_name IS NOT NULL THEN
    NEW."studentName" := NEW.student_name;
  END IF;

  IF NEW.first_login IS NULL AND NEW."firstLogin" IS NOT NULL THEN
    NEW.first_login := NEW."firstLogin";
  ELSIF NEW."firstLogin" IS NULL AND NEW.first_login IS NOT NULL THEN
    NEW."firstLogin" := NEW.first_login;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_auth_columns ON auth_accounts;
CREATE TRIGGER trg_sync_auth_columns
BEFORE INSERT OR UPDATE ON auth_accounts
FOR EACH ROW EXECUTE FUNCTION sync_auth_columns();

-- -------------------------------------------------------------------------
-- 3. INDEX OPTIMASI PENCARIAN
-- -------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_records_class_student ON memorization_records(class_id, student_name);
CREATE INDEX IF NOT EXISTS idx_records_date ON memorization_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_records_teacher ON memorization_records(teacher_id);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON activity_logs(timestamp DESC);

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
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
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

  // 8. DATA AWAL AKUN PENGGUNA (ADMIN, GURU, DAN WALI SISWA)
  parts.push(`-- -------------------------------------------------------------------------
-- 8. INSERT DATA AKUN PENGGUNA (DEFAULT PASSWORD: salsabila3)
-- -------------------------------------------------------------------------`);
  
  const allAccountsToInsert: AuthAccount[] = accounts.length > 0 ? accounts : [
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

  // 9. DATA CATATAN CAPAIAN HAFALAN TERSIMPAN
  if (records.length > 0) {
    parts.push(`-- -------------------------------------------------------------------------
-- 9. INSERT DATA CATATAN CAPAIAN HAFALAN TERSIMPAN (${records.length} DATA)
-- -------------------------------------------------------------------------`);
    const chunkSize = 100;
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
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

  // 10. LOG AKTIVITAS JIKA ADA
  if (logs.length > 0) {
    parts.push(`-- -------------------------------------------------------------------------
-- 10. INSERT LOG AKTIVITAS AWAL (${logs.length} DATA)
-- -------------------------------------------------------------------------`);
    const logRows = logs.slice(0, 100).map(l =>
      `('${escapeSql(l.id)}', '${l.timestamp}', '${escapeSql(l.actionType)}', '${escapeSql(l.actionType)}', '${escapeSql(l.performedBy)}', '${escapeSql(l.performedBy)}', '${escapeSql(l.target)}', '${escapeSql(l.details)}')`
    ).join(',\n');
    parts.push(`INSERT INTO activity_logs (id, timestamp, action_type, "actionType", performed_by, "performedBy", target, details) VALUES\n${logRows}\nON CONFLICT (id) DO NOTHING;\n`);
  }

  parts.push(`-- =========================================================================
-- SELESAI: Skema dan seluruh data awal (${students.length} santri, ${teachers.length} guru, ${classes.length} kelas) siap digunakan di Supabase.
-- =========================================================================`);

  return parts.join('\n\n');
}
