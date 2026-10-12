-- =========================================================================
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



-- -------------------------------------------------------------------------
-- 5. INSERT DATA KELAS (19 KELAS LENGKAP)
-- -------------------------------------------------------------------------

INSERT INTO classes (id) VALUES
('1A'),
('1B'),
('1C'),
('2A'),
('2B'),
('2C'),
('3A'),
('3B'),
('3C'),
('4A'),
('4B'),
('4C'),
('5A'),
('5B'),
('5C'),
('5D'),
('6A'),
('6B'),
('6C')
ON CONFLICT (id) DO NOTHING;


-- -------------------------------------------------------------------------
-- 6. INSERT DATA DEWAN GURU QUR'AN (18 GURU)
-- -------------------------------------------------------------------------

INSERT INTO teachers (id, name, username) VALUES
('t-1', 'Annisa Galuh Kinanti, S.Hum.', 'annisa'),
('t-2', 'Arinda Silmi Larasati', 'arinda'),
('t-3', 'Azza Lailatul Maulidiyah, S.Ag', 'azza'),
('t-4', 'Bahrun Najja, M.Hum.', 'bahrun'),
('t-5', 'Hilda Fentiningrum, S.H. M.Ag.', 'hilda'),
('t-6', 'Indra Irmawan', 'indra'),
('t-7', 'Innayatun Mustafida, S.Pd.', 'innayatun'),
('t-8', 'Kalih Widyaningsih, S.Sos.', 'kalih'),
('t-9', 'Nikmatul Khoiriah, S.Pd.', 'nikmatul'),
('t-10', 'Nur Wahyuni, S.Pd.', 'nurwahyuni'),
('t-11', 'Priyo Wibowo, S.Hum.', 'priyo'),
('t-12', 'Rafliyanto, M.Hum.', 'rafliyanto'),
('t-13', 'Sabyla Mafaticha Rizki, M.Hum.', 'sabyla'),
('t-14', 'Umi Fatimah, S.Pd.', 'umifatimah'),
('t-15', 'Uswatun Aeniah, S.H.', 'uswatun'),
('t-16', 'Zura Mauliza', 'zura'),
('t-17', 'Ahmad Busyairi, S.H.', 'ahmadbusyairi'),
('t-18', 'Amannasrullah Amin, S.Pd. M.Pd.', 'amannasrullah')
ON CONFLICT (id) DO NOTHING;


-- -------------------------------------------------------------------------
-- 7. INSERT DATA PESERTA DIDIK (485 SISWA SD IT SALSABILA 3)
-- -------------------------------------------------------------------------

INSERT INTO students (id, name, class_id, "classId") VALUES
('s-1', 'ABIMANYU FACHRI CHRISTIANTO', '1A', '1A'),
('s-2', 'ABINAYA OTTY ENGGI KISHWARI', '1A', '1A'),
('s-3', 'ABIYYU KENZO WIRATAMA', '1A', '1A'),
('s-4', 'ADHITAMA DIPA PUTRA BANIANTORO', '1A', '1A'),
('s-5', 'AHMAD NADHIF SHAHARYAR', '1A', '1A'),
('s-6', 'AHMAD ZIYADULLAH IHSAANA', '1A', '1A'),
('s-7', 'ALICIA SHAQUILA RAKSANDRINA', '1A', '1A'),
('s-8', 'ARFANO RAFKA RAFFAZA', '1A', '1A'),
('s-9', 'AR SHAKA MARDIKA HASAN', '1A', '1A'),
('s-10', 'AZKIA AZ ZAHRA WIJAYA', '1A', '1A'),
('s-11', 'CHIARA GHUMAISHA', '1A', '1A'),
('s-12', 'FATIMAH ANINDITA AZALEA PADMASARI', '1A', '1A'),
('s-13', 'FAUZI MUHAMMAD ARIEF', '1A', '1A'),
('s-14', 'GHINA OLIVIA PUTRI', '1A', '1A'),
('s-15', 'HAFEEDZ ABDULLAH AL ARSY', '1A', '1A'),
('s-16', 'HAIDAR RAZKA', '1A', '1A'),
('s-17', 'HIFZA SYIFA AZZAHRA', '1A', '1A'),
('s-18', 'IBRAHIM AL AZZAMY', '1A', '1A'),
('s-19', 'KENZIE ZULFIKAR EL FATIH', '1A', '1A'),
('s-20', 'MUHAMMAD ABIEL ARKATAMA', '1A', '1A'),
('s-21', 'MUHAMMAD MAS ATHARRAZKA AL GHAFFAR', '1A', '1A'),
('s-22', 'MUHAMMAD RESTU AL KHALIFI', '1A', '1A'),
('s-23', 'NAUFAL AZZAM MAHESWARA', '1A', '1A'),
('s-24', 'NAUSHA KIRANIA MAHIRA', '1A', '1A'),
('s-25', 'RAFIF HAMIZAN ALFARIZKI', '1A', '1A'),
('s-26', 'RUMAISHA AMAMI SULTHONY', '1A', '1A'),
('s-27', 'SASHENKA KEN ARUNIKA', '1A', '1A'),
('s-28', 'VALERI YUMNA AZAHRA', '1A', '1A'),
('s-29', 'ZAHIRA YULIZA', '1A', '1A'),
('s-30', 'ABIMANYU RIZKY SAPUTRO', '1B', '1B'),
('s-31', 'AHMAD NABIL ARKATAMA', '1B', '1B'),
('s-32', 'AISYAH HASNA FITRIYANI', '1B', '1B'),
('s-33', 'AKTHAR RAFIF ALKAREEM', '1B', '1B'),
('s-34', 'ALEXEI ALVARO AKIRA ALFIANTO', '1B', '1B'),
('s-35', 'AMEERA SOFIA ASSYIFA', '1B', '1B'),
('s-36', 'ARSYILA SHAKAYLA QUINZA JASMINE', '1B', '1B'),
('s-37', 'AVIO HAFIZ SWARANTORO', '1B', '1B'),
('s-38', 'BHUMI NUFAIL ANSHAR ADYATMA', '1B', '1B'),
('s-39', 'DUBA ALI ZAKYR', '1B', '1B'),
('s-40', 'ENZY KINANDITA PAYANA', '1B', '1B'),
('s-41', 'FATHAN DANIYAL DANINDRA', '1B', '1B'),
('s-42', 'FATHIA NUR RAMADHANI ALMAHYRA', '1B', '1B'),
('s-43', 'FUZNA FAIQ AL KARIM', '1B', '1B'),
('s-44', 'GHANIYAH KARIMAH', '1B', '1B'),
('s-45', 'GIBRAN HADI WANTORO', '1B', '1B'),
('s-46', 'HAFIDZ AL FATIH WIBOWO', '1B', '1B'),
('s-47', 'HERO XAVIER ATHALLAH AHMAD', '1B', '1B'),
('s-48', 'IBRAHIM ADHYASTHA KUMARA', '1B', '1B'),
('s-49', 'KHAIRA ARSHAYNA FARELLEA', '1B', '1B'),
('s-50', 'MUHAMMAD QAAMA NABIGH UZAIR', '1B', '1B'),
('s-51', 'NATHAN AQMAR GIANDA', '1B', '1B'),
('s-52', 'RAFARENDRA AZKA NUGRAHA', '1B', '1B'),
('s-53', 'RAINA SENJA PARADISA NUGROHO', '1B', '1B'),
('s-54', 'RAYYA SHALIHAH', '1B', '1B'),
('s-55', 'SHAKILA HANIN ELMIRA', '1B', '1B'),
('s-56', 'SYAWALUNA KHAWLA SASTRA', '1B', '1B'),
('s-57', 'ZHAFIRA CERLIA TANIA', '1B', '1B'),
('s-58', 'ADZKIYA MARITZA FIRDAUS', '1C', '1C'),
('s-59', 'AHMAD KEEFE SHAHBAZ SWADITRA', '1C', '1C'),
('s-60', 'ALDIANSYAH CAHYA PRATAMA', '1C', '1C'),
('s-61', 'ALMA UNY HAJAR', '1C', '1C'),
('s-62', 'ALVARO KENZO MAHESWARA ASADI', '1C', '1C'),
('s-63', 'ARISHA ABIDAH WICAKSONO', '1C', '1C'),
('s-64', 'ARSHAKA FATRUKI ALBAN', '1C', '1C'),
('s-65', 'ARSHY ADIBA HAFIZHA PUTRI', '1C', '1C'),
('s-66', 'ARSYILA SYAQUILA NAYYARA', '1C', '1C'),
('s-67', 'DANESWARA YAQDHAN PERWIRA', '1C', '1C'),
('s-68', 'ELVANNO ZHAFRAN ARYANDICTA', '1C', '1C'),
('s-69', 'FADIL ASYAM HIDAYAT', '1C', '1C'),
('s-70', 'FALISHA RUMAISA', '1C', '1C'),
('s-71', 'HASYEEM KEMAL ABQORY', '1C', '1C'),
('s-72', 'KALANDRA ABHIRU FIRMANSYAH', '1C', '1C'),
('s-73', 'KALIMBA KANG PUNGKASAN', '1C', '1C'),
('s-74', 'KEN ABIMANYU ZAYYAN MUHAMMAD', '1C', '1C'),
('s-75', 'MAULANA MIRZA DANENDRA', '1C', '1C'),
('s-76', 'MEYLIKA AIZA PUTRI', '1C', '1C'),
('s-77', 'MUHAMMAD AL-FATIH HARTANTO', '1C', '1C'),
('s-78', 'MUHAMMAD ZHAFRAN FIKRI AL-ARSYAD', '1C', '1C'),
('s-79', 'NAMEIRA AJWA KIANDRA', '1C', '1C'),
('s-80', 'NIESYEICHA ANNAILA AQEENARA', '1C', '1C'),
('s-81', 'RAFFAN HAFIDZ ALFARIZI', '1C', '1C'),
('s-82', 'RAFID HAZAIN AHMAD AL HAJARY', '1C', '1C'),
('s-83', 'RAFKA DANIYAL YAHYA', '1C', '1C'),
('s-84', 'RATU YAZMINE', '1C', '1C'),
('s-85', 'SYAHILA MAULIDA MAHESWARI', '1C', '1C'),
('s-86', 'ABYAN SANSKARA DARMAWAN', '2A', '2A'),
('s-87', 'ACHMAD FARZAN ULUL AZMI', '2A', '2A'),
('s-88', 'ADEEVA ZAHIRA MECCA', '2A', '2A'),
('s-89', 'ADELIA NUR RAHIMAH', '2A', '2A'),
('s-90', 'ADNAN ZAYAN RAFFASYA', '2A', '2A'),
('s-91', 'AISHWARYA JANYAGITA', '2A', '2A'),
('s-92', 'AL FATH HARITS ZAHIAN', '2A', '2A'),
('s-93', 'ALFIN RAHMAT ISKANDAR', '2A', '2A'),
('s-94', 'AQILA KAMELIA AZZAHRA', '2A', '2A'),
('s-95', 'ARABELLA KEISHA KHAIRINA', '2A', '2A'),
('s-96', 'AUDIYA FUKAYANA', '2A', '2A'),
('s-97', 'AXEL AYDIN KHALFANI', '2A', '2A'),
('s-98', 'BANYU ANGGER ADIGUNA', '2A', '2A'),
('s-99', 'DANISH ZAIN ALFARIZI', '2A', '2A'),
('s-100', 'EMBUN LAVINA MAHESWARI', '2A', '2A')
ON CONFLICT (id) DO NOTHING;


INSERT INTO students (id, name, class_id, "classId") VALUES
('s-101', 'FAIZ SHADIQ RAHARDIAN PRABOWO', '2A', '2A'),
('s-102', 'HAFID RIZQY RAMADHAN', '2A', '2A'),
('s-103', 'KIRANIA ALEEYA DAFEENA', '2A', '2A'),
('s-104', 'LATIFAH NADA', '2A', '2A'),
('s-105', 'MUHAMMAD ABDILLAH', '2A', '2A'),
('s-106', 'MUHAMMAD ALTHAF SALIM', '2A', '2A'),
('s-107', 'MUQADDAM NUR MAFAHIM', '2A', '2A'),
('s-108', 'NIAR ALMAHYRA KIRANI', '2A', '2A'),
('s-109', 'QALESYA SHANUM ALTHAFUNNISA', '2A', '2A'),
('s-110', 'RAFIF RAFASYA', '2A', '2A'),
('s-111', 'RAHMAT FAWZI GHANIY HERMAWAN', '2A', '2A'),
('s-112', 'RALINE ALMEERA IRAWAN', '2A', '2A'),
('s-113', 'SASIKIRANA WILUGARBA', '2A', '2A'),
('s-114', 'SATRIA FARRIS AL ZHAFRAN', '2A', '2A'),
('s-115', 'ALENA ZELVANA SETYAWAN', '2B', '2B'),
('s-116', 'ALI ZAINAL ABIDIN EL HAQ', '2B', '2B'),
('s-117', 'ALHAFIDZ PRADANA', '2B', '2B'),
('s-118', 'ALMAHYRA SHEZA ASHAKI', '2B', '2B'),
('s-119', 'ALMAIRA ROMEESA NALADHIPA', '2B', '2B'),
('s-120', 'AMANINA ZEIYIN KARIMA', '2B', '2B'),
('s-121', 'ARBANI PAUNDRA IBRAMDEWARI', '2B', '2B'),
('s-122', 'ARFAN BAGAS PRASETIYO', '2B', '2B'),
('s-123', 'ARFAN MIYAZ PUTRA HAMID', '2B', '2B'),
('s-124', 'BANYU BIRU AL FATIH', '2B', '2B'),
('s-125', 'FARZANA ALEA NAURA ELKAFI', '2B', '2B'),
('s-126', 'FATIHA MARYAM WASKITA AZZAHRA', '2B', '2B'),
('s-127', 'GHANIA DENOVE RAYADINATA', '2B', '2B'),
('s-128', 'GHUMAISHA FIRNAS ELSHAGUFTA', '2B', '2B'),
('s-129', 'HIZAN ALFATIH PRIMAWAN', '2B', '2B'),
('s-130', 'KALANDRA MUHAMMAD ALBAR ANWILY', '2B', '2B'),
('s-131', 'KHAYRA RAVA RUMAISYA', '2B', '2B'),
('s-132', 'KIRANIA AISYAH ADIYATI', '2B', '2B'),
('s-133', 'KIRANIA DWI OKTAVIA', '2B', '2B'),
('s-134', 'MAISAN KANAKA', '2B', '2B'),
('s-135', 'MUHAMMAD FAWWAZ MUKAFI', '2B', '2B'),
('s-136', 'MUHAMMAD LUQMAN LANGIT ABQARY', '2B', '2B'),
('s-137', 'NAFISA ALMAHYRA', '2B', '2B'),
('s-138', 'QIANA TAZKIA AZAHRA', '2B', '2B'),
('s-139', 'QONITA ALIFA HILMI', '2B', '2B'),
('s-140', 'RAFLI ANDRIANAS HAMIZAN', '2B', '2B'),
('s-141', 'SALMA MIKHAYLA HUMAIRA', '2B', '2B'),
('s-142', 'SYAHDAN ARGATSANI ADHYASTA', '2B', '2B'),
('s-143', 'YOLA ALEXANDRIA HANANI PUTRI', '2B', '2B'),
('s-144', 'AQILA FADHILA AL HUSNA', '2C', '2C'),
('s-145', 'ARJUNA NABIL FATIH', '2C', '2C'),
('s-146', 'ARKAN ABDULLAH HAFIDZ', '2C', '2C'),
('s-147', 'ARKAN WIRATAMA FATURAKHMAN', '2C', '2C'),
('s-148', 'ARSYIL HIKAM DANISWARA', '2C', '2C'),
('s-149', 'ARSY ZAIM FAISAL', '2C', '2C'),
('s-150', 'AURELIA BIANCA QIANDRA', '2C', '2C'),
('s-151', 'BINTANG KENZIE PERDANA', '2C', '2C'),
('s-152', 'BRIYAN ARRAZY', '2C', '2C'),
('s-153', 'EARLENE AZKADINA AZIZA', '2C', '2C'),
('s-154', 'FAYRA KHAIRINA ALFATHUNISSA', '2C', '2C'),
('s-155', 'GHAIDA IZZATI KHANSA NUR AZWIYNA', '2C', '2C'),
('s-156', 'GIANNIS BANYU RAYA NUGRAHA', '2C', '2C'),
('s-157', 'ISWARA AISYAH HABSARA', '2C', '2C'),
('s-158', 'KALINGGA AHDA ART NATYA', '2C', '2C'),
('s-159', 'KAYYESA ZHUFAIRA GHAISANI', '2C', '2C'),
('s-160', 'KHAWLA MEDINA RAHMI', '2C', '2C'),
('s-161', 'MIKHAILA NAYYARA ARSYA', '2C', '2C'),
('s-162', 'MISHA SHABIRA PUTRITAMA', '2C', '2C'),
('s-163', 'MUHAMMAD GAZA AULIA', '2C', '2C'),
('s-164', 'MUHAMMAD RAFFASYA AL-FATHAN', '2C', '2C'),
('s-165', 'QIANU MUMTAZ MIRZA', '2C', '2C'),
('s-166', 'RASYA LANANG PRADIPTA', '2C', '2C'),
('s-167', 'RIHGA ABIMANYU HADIYANTO', '2C', '2C'),
('s-168', 'SYABILA ADISTI NUGROHO', '2C', '2C'),
('s-169', 'SYAHBANI KAMAL HUSSEIN', '2C', '2C'),
('s-170', 'SYAZWAN SHAUM WIDOYO', '2C', '2C'),
('s-171', 'TANZEELA ALMAHYRA WIJAYA', '2C', '2C'),
('s-172', 'ZAINA HILYA AZKAYRA', '2C', '2C'),
('s-173', 'ABIZAR NOVANDRA ALFARIZI', '3A', '3A'),
('s-174', 'AMIRUL WILDAN AL MAROM', '3A', '3A'),
('s-175', 'AQMAR NADHIF ALKAREEM', '3A', '3A'),
('s-176', 'ARUNA MAULIDYA SYAFA', '3A', '3A'),
('s-177', 'ATARA HAFIZH LUTH FASIHURAHMAN', '3A', '3A'),
('s-178', 'DANZEA SAFANIYA', '3A', '3A'),
('s-179', 'FAEZIA NAOMI IZARRA', '3A', '3A'),
('s-180', 'FATHAN RYOTA ATALLAH', '3A', '3A'),
('s-181', 'FAWWAZ QUTBIE AL QORNY', '3A', '3A'),
('s-182', 'GIANDRA WENING AYUNINDYA', '3A', '3A'),
('s-183', 'JENNAMIRA KHAIRANI ANINDITA', '3A', '3A'),
('s-184', 'KHALIF ZAKY ARRAFIF', '3A', '3A'),
('s-185', 'KHAYLA ALESHA NISMARA', '3A', '3A'),
('s-186', 'MARWA KHAIRUNNISA AZAHRA', '3A', '3A'),
('s-187', 'MASHEL SAFA ARGANI', '3A', '3A'),
('s-188', 'MUHAMMAD ALFANDY JAVIER RASHDAN', '3A', '3A'),
('s-189', 'MUHAMMAD FAHREZA SYAUQI YOGASARA', '3A', '3A'),
('s-190', 'MUHAMMAD FIRDAUSI WIRDAS', '3A', '3A'),
('s-191', 'MUHAMMAD HISYAM ABDURRAHMAN', '3A', '3A'),
('s-192', 'MUHAMMAD NARENDRA AKHTAR ELFARIS', '3A', '3A'),
('s-193', 'NADYA ALYSSA AZZAHRA', '3A', '3A'),
('s-194', 'NASHMIA SAVA ARDIYAN', '3A', '3A'),
('s-195', 'PAMETRIBUANA IKLILA', '3A', '3A'),
('s-196', 'RISANG JALU ARJUNA', '3A', '3A'),
('s-197', 'SHAREEN MIKAYALA BRAVEI CALISTA WIBOWO', '3A', '3A'),
('s-198', 'SHAZFA SHAFANA HUMAIRA', '3A', '3A'),
('s-199', 'SYAUQI RAMADHAN ALFARIZI', '3A', '3A'),
('s-200', 'ZAFRAN RAFFA VENOVIAN', '3A', '3A')
ON CONFLICT (id) DO NOTHING;


INSERT INTO students (id, name, class_id, "classId") VALUES
('s-201', 'ZAKIA NUR RACHMADHANI', '3A', '3A'),
('s-202', 'AHMADA ZABARJAD MAULA', '3B', '3B'),
('s-203', 'ALKHALIFI SYAUQI ARDANY', '3B', '3B'),
('s-204', 'ALZAM IBRAHIM AKBAR', '3B', '3B'),
('s-205', 'ARSHAKA AQLAN VIRENDRA', '3B', '3B'),
('s-206', 'AZAHRA ARSYILA LIOFANY', '3B', '3B'),
('s-207', 'DHAFA VERDIANSYAH', '3B', '3B'),
('s-208', 'DINDA AYUDYA REANI SANJAYA', '3B', '3B'),
('s-209', 'ELZAFI SHAKEILA FELLANI', '3B', '3B'),
('s-210', 'FADHILAH MUMTAZA PUTRI RAHMANTO', '3B', '3B'),
('s-211', 'GIBRAN ZEIN EL-HAKIM', '3B', '3B'),
('s-212', 'MARYAM ARSYILA WIJAYA', '3B', '3B'),
('s-213', 'MUHAMMAD AFNAN KHABIR', '3B', '3B'),
('s-214', 'MUHAMMAD ARZANKA ALKHALIFI', '3B', '3B'),
('s-215', 'MUHAMMAD GHAISAN ABQARY IBRAHIM', '3B', '3B'),
('s-216', 'NAIRA AMY DIYANTO', '3B', '3B'),
('s-217', 'NAJLA SAQUEENA RIYANTO', '3B', '3B'),
('s-218', 'NAUFAL SAKHI BUONO', '3B', '3B'),
('s-219', 'OMAR ABDILLAH ADNAN', '3B', '3B'),
('s-220', 'QUEENSHA KIRANA SALSABILA', '3B', '3B'),
('s-221', 'RAFFA ZHAFRAN PUTRA ARDIYANTO', '3B', '3B'),
('s-222', 'REFAN ARINDRA WIRATAMA', '3B', '3B'),
('s-223', 'SALMAN AL GHOZALI', '3B', '3B'),
('s-224', 'SHAFIYYAH HASNA HAMIDAH', '3B', '3B'),
('s-225', 'TAVISHA DELVINAMORA ALFIYYAH', '3B', '3B'),
('s-226', 'UWAIS SAKHI ATHARYA RAMADHI', '3B', '3B'),
('s-227', 'ZAHWA HUMAIRA AL HANIF', '3B', '3B'),
('s-228', 'ZEA MALAIKA HASNA', '3B', '3B'),
('s-229', 'AIRA IHDA HUSNAYAIN', '3C', '3C'),
('s-230', 'ALMEERA JEHAN AZKADINA', '3C', '3C'),
('s-231', 'ALVARENDRA ACHMAD PUTRA ATMAJA', '3C', '3C'),
('s-232', 'ANISA ARSI NUR RAMADHANI', '3C', '3C'),
('s-233', 'ARFADHIA ALIF HERDIAWAN', '3C', '3C'),
('s-234', 'ARSYFA RIZKY RAMADANI', '3C', '3C'),
('s-235', 'ASYIFA HASNA KHAIRUNNISA', '3C', '3C'),
('s-236', 'AZKADINA KIRANA SWADITRA', '3C', '3C'),
('s-237', 'FAHREZA AHNAF FATONI', '3C', '3C'),
('s-238', 'FATIHA KHUMAIRA', '3C', '3C'),
('s-239', 'HUMAIRA PRAMESTI SULAKSONO', '3C', '3C'),
('s-240', 'KENZO SHIFAN ADRIYANTO', '3C', '3C'),
('s-241', 'KINANTI ATHALLAH MAHYA', '3C', '3C'),
('s-242', 'MALIQ ZHAFRAN ALFAREZEL', '3C', '3C'),
('s-243', 'MUHAMMAD ABRAR ABQORY QADDAFA', '3C', '3C'),
('s-244', 'MUHAMMAD ALARIC AZZAHIDA AHZA', '3C', '3C'),
('s-245', 'MUHAMMAD REHAN EVANDRA', '3C', '3C'),
('s-246', 'NABHAN AKBAR DEMETRIO AL HAMIDI', '3C', '3C'),
('s-247', 'NADIA QIYYAMA AZKADINA', '3C', '3C'),
('s-248', 'RASYID AL KHALIQ ANWAR', '3C', '3C'),
('s-249', 'RYOSUKE DIPA SEMESTA AL-ROSYID', '3C', '3C'),
('s-250', 'SHASMIRA NADIA ALFATHUNISSA', '3C', '3C'),
('s-251', 'SOFIA AZRA ANINDITA', '3C', '3C'),
('s-252', 'SUNNYDEPATHA GIE', '3C', '3C'),
('s-253', 'TANGELY IZZATU ILAHY', '3C', '3C'),
('s-254', 'VIRENDRA ARYA PRATAMA', '3C', '3C'),
('s-255', 'ZAIDAN RAFFASYA AL ATHAYA', '3C', '3C'),
('s-256', 'ZZAHRA', '3C', '3C'),
('s-257', 'ABISTA RETHA DARMAWAN', '4A', '4A'),
('s-258', 'ABYZAM HARYO WANGSAPUTRA', '4A', '4A'),
('s-259', 'ADINDA DWI NURAINI', '4A', '4A'),
('s-260', 'AHMAD AIMAN GHOZI SULTHONY', '4A', '4A'),
('s-261', 'AHMAD FARIS MAULANA', '4A', '4A'),
('s-262', 'AISHAINA MAISARA PRIMAWAN', '4A', '4A'),
('s-263', 'ATHALLA RAKHA DWITAMA', '4A', '4A'),
('s-264', 'AZIZAH NUR LATHIFAH', '4A', '4A'),
('s-265', 'BIMA ARIZONA PRAMONO', '4A', '4A'),
('s-266', 'DHANENDRA DAYA ARKHANA', '4A', '4A'),
('s-267', 'FATIH ZULFADLI SYABANI', '4A', '4A'),
('s-268', 'FATIMAH HANNAN AZ-ZAHRA', '4A', '4A'),
('s-269', 'HANUM SHALIHA KHOIRUNNISA', '4A', '4A'),
('s-270', 'KAISA FAYYOLA HERGUNA', '4A', '4A'),
('s-271', 'KENZIE ATHALLA ZIGGY PUTRA', '4A', '4A'),
('s-272', 'KYARA ARSYAQILA SHEZA', '4A', '4A'),
('s-273', 'MARYAM TAZKIYATUNNISA', '4A', '4A'),
('s-274', 'MEHRUNISA ARSYFA PUTRI RENDRYANA', '4A', '4A'),
('s-275', 'MEYNANDA PUTRI RAMADHINA', '4A', '4A'),
('s-276', 'MUHAMMAD DANISH ALARIC', '4A', '4A'),
('s-277', 'MUHAMMAD KHALIFA AULIA', '4A', '4A'),
('s-278', 'NAJMA LUTHFIYA AL ALIYA', '4A', '4A'),
('s-279', 'QIANA PUTRI ANINDITA', '4A', '4A'),
('s-280', 'RAFFAZA RAJENDRA EL HASIQ', '4A', '4A'),
('s-281', 'SARA NUH SHANNON', '4A', '4A'),
('s-282', 'VIOLETA PERMATA AOZORA PRASETYO', '4A', '4A'),
('s-283', 'ABHIMANYU RAMDHAN PUTRA BANIANTORO', '4B', '4B'),
('s-284', 'ABINAYA RAKA ARFADHIA', '4B', '4B'),
('s-285', 'ACHMAD HAMZAH AL ROBANI', '4B', '4B'),
('s-286', 'AHMAD HAMIZAN AHZA', '4B', '4B'),
('s-287', 'AISHA ZAADA IMAANA', '4B', '4B'),
('s-288', 'ALESHA AVIOLA SHIDQIA', '4B', '4B'),
('s-289', 'ARETA ZEA KHAIRINA', '4B', '4B'),
('s-290', 'ATHAYA KIRANA KANEISHIA', '4B', '4B'),
('s-291', 'AZRINA NAHLA YUMNA', '4B', '4B'),
('s-292', 'BRIGAS RAGIL PARADUTA', '4B', '4B'),
('s-293', 'CHIKA AMELIA SHEZA', '4B', '4B'),
('s-294', 'DAYYAN ALFAREZEL', '4B', '4B'),
('s-295', 'FARZANA SYAFAQ NISMARA PRABOWO', '4B', '4B'),
('s-296', 'HAMDAN AHMAD RAZIQIN', '4B', '4B'),
('s-297', 'JAVIER RAUF AL-FUKHOHA PUTRA SAFA''AT', '4B', '4B'),
('s-298', 'KHADIJAH HUSNA HANANIA', '4B', '4B'),
('s-299', 'MAHESTRI ARETA PRABASWARA', '4B', '4B'),
('s-300', 'MIKHAILA AGASTIA RIZQIA HAPSARI', '4B', '4B')
ON CONFLICT (id) DO NOTHING;


INSERT INTO students (id, name, class_id, "classId") VALUES
('s-301', 'MUHAMMAD ARSYAD SYAHPUTRA', '4B', '4B'),
('s-302', 'MUHAMMAD SAKHA NUR FATIH', '4B', '4B'),
('s-303', 'NATHANIA ALTHEZZA HARSANA PUTRI', '4B', '4B'),
('s-304', 'NIEDIAZCHA ARSENIO ASYRAAF', '4B', '4B'),
('s-305', 'RAFIF HAIDAR NADHIFA', '4B', '4B'),
('s-306', 'ROBI ERIZALLY RAFFASYA', '4B', '4B'),
('s-307', 'TRIMATRA ZAIN ADAM', '4B', '4B'),
('s-308', 'ZHAFIRA QIRANIA PUTRI', '4B', '4B'),
('s-309', 'ABDURRAHMAN ILYAS ALGHIFARI', '4C', '4C'),
('s-310', 'ADEEVA QUEENARA FASHA', '4C', '4C'),
('s-311', 'ADIBA UFAIRAH ATHARI', '4C', '4C'),
('s-312', 'AHMAD ZAKIR FAWAID', '4C', '4C'),
('s-313', 'AKBAR FARENDRA ATMAJA', '4C', '4C'),
('s-314', 'AKBAR ZIGGY SAVERIO', '4C', '4C'),
('s-315', 'ALEXI PUTRA RAHMAN', '4C', '4C'),
('s-316', 'ALIKA ZAFIRA AKEYLA', '4C', '4C'),
('s-317', 'ALISHA FARADIBA WINDARTO', '4C', '4C'),
('s-318', 'ARSYILA RANIA FARZANI', '4C', '4C'),
('s-319', 'BRISHA NAILA VALERIE', '4C', '4C'),
('s-320', 'DIMAS SAMIL FALAH', '4C', '4C'),
('s-321', 'DZIKRIFFA HUSNA PERMANA', '4C', '4C'),
('s-322', 'FAIRUZ ATHARIZZ AL FAHRI', '4C', '4C'),
('s-323', 'GENTA TYAGA ARYASATYA', '4C', '4C'),
('s-324', 'HAZLAM ABDULLAH ALDRIC', '4C', '4C'),
('s-325', 'JENNAHARA AMEERA ARSYA', '4C', '4C'),
('s-326', 'LITUHAYU CANTYA ANJANI', '4C', '4C'),
('s-327', 'MAHESWARI NAJWA GEMILANG', '4C', '4C'),
('s-328', 'MUHAMMAD ABYAZ BRYATTA', '4C', '4C'),
('s-329', 'MUHAMMAD TSAAQIB ANANDYFA', '4C', '4C'),
('s-330', 'NATHANIA NAVI PRAMESTI', '4C', '4C'),
('s-331', 'NAUFAL AZKA MAULANA', '4C', '4C'),
('s-332', 'RAFIQ HAIKAL ATHARIZ ALFARIZKI', '4C', '4C'),
('s-333', 'REYNAND ARKANA BOREALIS', '4C', '4C'),
('s-334', 'SAFIYA AZZAHRA MAHARANI', '4C', '4C'),
('s-335', 'SYBILLA SHANUM MIKHAYLA HAKIM', '4C', '4C'),
('s-336', 'ADIBAH ADINE GELIS', '5A', '5A'),
('s-337', 'ALMAHYRA TSAQIFA RIGENILA', '5A', '5A'),
('s-338', 'ALTHAFAIREL CHALIF VELKYO', '5A', '5A'),
('s-339', 'ANNISA FADILATU ROHMAH', '5A', '5A'),
('s-340', 'AZKA ALMIRA SALSABILA', '5A', '5A'),
('s-341', 'BRAMASTA SURYA PRADANA', '5A', '5A'),
('s-342', 'CHYNTA ZHAFIRAH YUWILOV', '5A', '5A'),
('s-343', 'DANREINVA ZINDA', '5A', '5A'),
('s-344', 'DZIKRA SYUKRIYA BAIQUNI', '5A', '5A'),
('s-345', 'FATAH FILLIO RIKZA WIBOWO', '5A', '5A'),
('s-346', 'HIKARI AGRA AKSA ABIMANYU', '5A', '5A'),
('s-347', 'ILMIRA SABRIA HUMAIRA', '5A', '5A'),
('s-348', 'KEENAR SARALEE ALIYAMURTI', '5A', '5A'),
('s-349', 'LUBNA SILMI KAFFAH', '5A', '5A'),
('s-350', 'MILVA ALMAHYRA SHANUM', '5A', '5A'),
('s-351', 'MUHAMMAD ARSYAD HAFIZH SAPUTRA', '5A', '5A'),
('s-352', 'MUHAMMAD KAFA BILLAH', '5A', '5A'),
('s-353', 'NAQIYYAH FUDHLA AULIA', '5A', '5A'),
('s-354', 'PRADIPTA ABID AMZARI', '5A', '5A'),
('s-355', 'PRINGGA ANJAYA SETIYAWAN', '5A', '5A'),
('s-356', 'RIDZKY BINTANG RAMADHAN', '5A', '5A'),
('s-357', 'SULTAN MUHAMMAD AL FATIH', '5A', '5A'),
('s-358', 'YAFIQ ABQORY ILMAN JUNIOR', '5A', '5A'),
('s-359', 'AHMAD SYAUQILLAH AHZA', '5B', '5B'),
('s-360', 'ALESHA ISKANDAR', '5B', '5B'),
('s-361', 'ALISHA KEINARRA PUTRI HERAWAN', '5B', '5B'),
('s-362', 'ALJARAS AKTAM KILAN IBRAHIM', '5B', '5B'),
('s-363', 'AZALEA NASYAUQI ANDYNY', '5B', '5B'),
('s-364', 'AZQIARA NAJLA SAKHI UTOMO', '5B', '5B'),
('s-365', 'AZZAM ASKARI HANSHEL', '5B', '5B'),
('s-366', 'DHAFFA JIHAD FISABILILLAH', '5B', '5B'),
('s-367', 'DIRGANTARA ARIENDRA WIDODO', '5B', '5B'),
('s-368', 'FARREL ANDRA WIJAYANTO', '5B', '5B'),
('s-369', 'GALIH ADIPATI GANENDRA', '5B', '5B'),
('s-370', 'GHAITSA RHAZES ELSHANUM', '5B', '5B'),
('s-371', 'GIFTAN AZFAR WIFQULKHAIR EL FAEYZA', '5B', '5B'),
('s-372', 'HANNA NOVIANA NURITA SARI', '5B', '5B'),
('s-373', 'KHAIRA LUBNA ZULFA ADELINE', '5B', '5B'),
('s-374', 'MUHAMMAD AZKI AL FATHI WIJAYA', '5B', '5B'),
('s-375', 'MUHAMMAD AZZAM ARROYYAN', '5B', '5B'),
('s-376', 'MUHAMMAD DZABIR TAUHID', '5B', '5B'),
('s-377', 'MUHAMMAD REYNAND ABRISAM AVANOSKA', '5B', '5B'),
('s-378', 'NESYA ANINDYA', '5B', '5B'),
('s-379', 'NOVANICA HASNA', '5B', '5B'),
('s-380', 'QUEENA AZZAHRA BATARI', '5B', '5B'),
('s-381', 'SYABIL MIRZA ASQALANI', '5B', '5B'),
('s-382', 'AISYA SAFA NURAINI', '5C', '5C'),
('s-383', 'ALISHA SABRINA PRAMESWARI', '5C', '5C'),
('s-384', 'ALTHAF FAUSTIN NABIL', '5C', '5C'),
('s-385', 'ANINDITO HANAN RAMADHAN', '5C', '5C'),
('s-386', 'ANNAJMA ANRA ASSYIFA', '5C', '5C'),
('s-387', 'ARALYN HAFIZATUL HUSNA', '5C', '5C'),
('s-388', 'ARARYA WISANGGENI PURBAWASESA', '5C', '5C'),
('s-389', 'ERWIN ATIQAH ZAHRA FITRIYA', '5C', '5C'),
('s-390', 'FARESTIAN AZKA ABVINATTA', '5C', '5C'),
('s-391', 'FARREL HAMADA EL HAQ', '5C', '5C'),
('s-392', 'IBNATU AQILA ARDHANI', '5C', '5C'),
('s-393', 'KALYSTA LINTANG KIRANA ANWILY', '5C', '5C'),
('s-394', 'KEUMALAHAYATI AZZAHRA IMAN', '5C', '5C'),
('s-395', 'KHILDA AULIA ALFAYZA', '5C', '5C'),
('s-396', 'MOZA ZHALFA MEDINA AKHTAR', '5C', '5C'),
('s-397', 'MUHAMMAD TSAQIB RASYDAN', '5C', '5C'),
('s-398', 'NAWWAL KAISA ALFAWWAZ', '5C', '5C'),
('s-399', 'RAHARDIAN AZRIEL AL FIRDAUS', '5C', '5C'),
('s-400', 'SAQILLA ASMA QURRATA''AINI', '5C', '5C')
ON CONFLICT (id) DO NOTHING;


INSERT INTO students (id, name, class_id, "classId") VALUES
('s-401', 'SHOFIYAH UZMA PUTRI RAHMANTO', '5C', '5C'),
('s-402', 'ULUNG AZIZAN ABIDIN', '5C', '5C'),
('s-403', 'ADIVA MEISIE NATHANIA PUTRI', '5D', '5D'),
('s-404', 'AHZA AZIZI KAMAL ABQORI', '5D', '5D'),
('s-405', 'AISHA FELLA ATTAQI', '5D', '5D'),
('s-406', 'ARJUNA DANISH JAYA HARTONO PUTRA', '5D', '5D'),
('s-407', 'BRAMUNDITO ATHAYA PRAMUDYA', '5D', '5D'),
('s-408', 'ERVINA ZULFA CAHYANINGRUM', '5D', '5D'),
('s-409', 'FAHREZA RAFIF ARFAN SETYAWAN', '5D', '5D'),
('s-410', 'FAIRELL ATHARIZZ ADYATMA', '5D', '5D'),
('s-411', 'FIONA KINANTI IRAWAN', '5D', '5D'),
('s-412', 'GHIFARI YARDAN ALMUQOFFI', '5D', '5D'),
('s-413', 'HAFIZ BAGUS NUR WICAKSONO', '5D', '5D'),
('s-414', 'HASNA AYYARA PANGESTU', '5D', '5D'),
('s-415', 'HILMI RAFIF MANSHUR', '5D', '5D'),
('s-416', 'JIHAN LAKSITA HAYUNINGTYAS SUDIRAYUDA', '5D', '5D'),
('s-417', 'KAMILA AYUDIA INARA', '5D', '5D'),
('s-418', 'KEVIN AHNAF NURDAFA', '5D', '5D'),
('s-419', 'MUHAMMAD ARSYAD FIRDAUS AR RAFA', '5D', '5D'),
('s-420', 'RAFANDA SHAKILA HANY', '5D', '5D'),
('s-421', 'RAHMA NUR WIDYASTUTI', '5D', '5D'),
('s-422', 'RANIA APRILIANA HANIF', '5D', '5D'),
('s-423', 'ADZKIA HAFSAH FARAHI', '6A', '6A'),
('s-424', 'ADZKIA NADHIRA PUTRI KURNIAWAN', '6A', '6A'),
('s-425', 'AIDAN SYAHM AL''ABBAD', '6A', '6A'),
('s-426', 'ALISHA SOPHIA WARDANI', '6A', '6A'),
('s-427', 'ARKAAN GHAISAN OMAR', '6A', '6A'),
('s-428', 'ARKANA FAUZAN TEGAR', '6A', '6A'),
('s-429', 'ARLINGGA SANTANU ABRARDEWARI', '6A', '6A'),
('s-430', 'ASKANA SAKHI PRASETYO', '6A', '6A'),
('s-431', 'AZKIYA RAIHAN FATONI', '6A', '6A'),
('s-432', 'BRAGA ACUZIO JOVANICK', '6A', '6A'),
('s-433', 'EIFELYN SHERLY AZZAHRA', '6A', '6A'),
('s-434', 'FATHAN ATTAYA AZHAR', '6A', '6A'),
('s-435', 'FULANDA KANIA AISYA SHABIRA', '6A', '6A'),
('s-436', 'HELGA AFIFAH JANITRA', '6A', '6A'),
('s-437', 'KALILA TANEESHA MUJAYADI', '6A', '6A'),
('s-438', 'MAHIRA AZKA MAULANA', '6A', '6A'),
('s-439', 'MUHAMMAD ARFA AL AZKIYYA ROHMAN', '6A', '6A'),
('s-440', 'MUHAMMAD RAYHAN AL FIKRY', '6A', '6A'),
('s-441', 'NADYA PUTRI NARESWARI', '6A', '6A'),
('s-442', 'NAFISA SAFIYA ANINDITA', '6A', '6A'),
('s-443', 'NAJWA HUMAIRA SETYAWAN', '6A', '6A'),
('s-444', 'NATHANIA DERRYS NAYOTTAMA', '6A', '6A'),
('s-445', 'NISRINA ADELIA YUWANA', '6A', '6A'),
('s-446', 'AHMAD HAFNI NAFIS', '6B', '6B'),
('s-447', 'ALMAHIRA GHANIYYA LUBNA MAULIDA', '6B', '6B'),
('s-448', 'ARJUNA ZIO AL FAEYZA', '6B', '6B'),
('s-449', 'ATHARIZ FAISAL ZAKI', '6B', '6B'),
('s-450', 'CELENA ADIERA PADMA LESTARI', '6B', '6B'),
('s-451', 'DANINZA AMEERA', '6B', '6B'),
('s-452', 'FACHRY RAMADHAN', '6B', '6B'),
('s-453', 'FATHIR AZZAMY AMSYAR', '6B', '6B'),
('s-454', 'KEVIN ADHYASTA PRANOTO', '6B', '6B'),
('s-455', 'KIRANA ANNISA WULANDARI', '6B', '6B'),
('s-456', 'LAKSMI SINAR KRISTAL', '6B', '6B'),
('s-457', 'MAULIDYA NUR AZIZAH FITRIA KHOIRUNNISA', '6B', '6B'),
('s-458', 'MOHAMMAD FAQIH AZZAM KARNAWAN', '6B', '6B'),
('s-459', 'MUHAMAD YAZID ASY SYAKUR', '6B', '6B'),
('s-460', 'MUHAMMAD ADRIAN SIDIK', '6B', '6B'),
('s-461', 'RADITYA AHMAD', '6B', '6B'),
('s-462', 'SAYYIDA SAKHI HAKAMA', '6B', '6B'),
('s-463', 'ZALFA TALINA BAIDA', '6B', '6B'),
('s-464', 'ZHAFRAN ARSYAVANO ARRAFIF', '6B', '6B'),
('s-465', 'ABDAN KHAIRY RAHMAN', '6C', '6C'),
('s-466', 'AGHARR KHAFIDZ WIRYAWAN', '6C', '6C'),
('s-467', 'AHMAD FADHIL', '6C', '6C'),
('s-468', 'AINI MALIKA ALTHAFUNNISA', '6C', '6C'),
('s-469', 'AISYAH ALESHA SHAKILA', '6C', '6C'),
('s-470', 'ALMAIRA MAHARDIKA ZAHRA', '6C', '6C'),
('s-471', 'ANANDA SITI FATIMAH', '6C', '6C'),
('s-472', 'GIVANNA ANINDYA BESTARIE', '6C', '6C'),
('s-473', 'KAFKA ABIAN YAHYA', '6C', '6C'),
('s-474', 'MUHAMMAD ALTHAF RAFISQY', '6C', '6C'),
('s-475', 'MUHAMMAD ANINDRA TECTONA GRANDIS', '6C', '6C'),
('s-476', 'MUHAMMAD BILAL MAULANA IBRAHIM', '6C', '6C'),
('s-477', 'MUHAMMAD HANIF AL FATIH', '6C', '6C'),
('s-478', 'MUHAMMAD NAUFAL ZAFRAN ARGANI', '6C', '6C'),
('s-479', 'NABIHAN AUFA QUTHBIE ANDRIAN', '6C', '6C'),
('s-480', 'RAFI NAUFAL ALFARIZKY', '6C', '6C'),
('s-481', 'RAISYA AQILA PUTRI', '6C', '6C'),
('s-482', 'TALITA AIDA ZAHRA', '6C', '6C'),
('s-483', 'VEDA DISKA AULIA MARSHA', '6C', '6C'),
('s-484', 'ZALFA RASYIDATU MUAZARA', '6C', '6C'),
('s-485', 'ZASYARRETA ZAAFIRAH PUTRI ADITYA', '6C', '6C')
ON CONFLICT (id) DO NOTHING;


-- -------------------------------------------------------------------------
-- 8. INSERT DATA AKUN PENGGUNA (DEFAULT PASSWORD: salsabila3)
-- -------------------------------------------------------------------------

INSERT INTO auth_accounts (username, password_hash, "passwordHash", role, name, class_id, "classId", student_name, "studentName", first_login, "firstLogin") VALUES
('admin', 'salsabila3', 'salsabila3', 'admin', 'Administrator SALAM Quran', NULL, NULL, NULL, NULL, FALSE, FALSE),
('annisa', 'salsabila3', 'salsabila3', 'guru', 'Annisa Galuh Kinanti, S.Hum.', NULL, NULL, NULL, NULL, TRUE, TRUE),
('arinda', 'salsabila3', 'salsabila3', 'guru', 'Arinda Silmi Larasati', NULL, NULL, NULL, NULL, TRUE, TRUE),
('azza', 'salsabila3', 'salsabila3', 'guru', 'Azza Lailatul Maulidiyah, S.Ag', NULL, NULL, NULL, NULL, TRUE, TRUE),
('bahrun', 'salsabila3', 'salsabila3', 'guru', 'Bahrun Najja, M.Hum.', NULL, NULL, NULL, NULL, TRUE, TRUE),
('hilda', 'salsabila3', 'salsabila3', 'guru', 'Hilda Fentiningrum, S.H. M.Ag.', NULL, NULL, NULL, NULL, TRUE, TRUE),
('indra', 'salsabila3', 'salsabila3', 'guru', 'Indra Irmawan', NULL, NULL, NULL, NULL, TRUE, TRUE),
('innayatun', 'salsabila3', 'salsabila3', 'guru', 'Innayatun Mustafida, S.Pd.', NULL, NULL, NULL, NULL, TRUE, TRUE),
('kalih', 'salsabila3', 'salsabila3', 'guru', 'Kalih Widyaningsih, S.Sos.', NULL, NULL, NULL, NULL, TRUE, TRUE),
('nikmatul', 'salsabila3', 'salsabila3', 'guru', 'Nikmatul Khoiriah, S.Pd.', NULL, NULL, NULL, NULL, TRUE, TRUE),
('nurwahyuni', 'salsabila3', 'salsabila3', 'guru', 'Nur Wahyuni, S.Pd.', NULL, NULL, NULL, NULL, TRUE, TRUE),
('priyo', 'salsabila3', 'salsabila3', 'guru', 'Priyo Wibowo, S.Hum.', NULL, NULL, NULL, NULL, TRUE, TRUE),
('rafliyanto', 'salsabila3', 'salsabila3', 'guru', 'Rafliyanto, M.Hum.', NULL, NULL, NULL, NULL, TRUE, TRUE),
('sabyla', 'salsabila3', 'salsabila3', 'guru', 'Sabyla Mafaticha Rizki, M.Hum.', NULL, NULL, NULL, NULL, TRUE, TRUE),
('umifatimah', 'salsabila3', 'salsabila3', 'guru', 'Umi Fatimah, S.Pd.', NULL, NULL, NULL, NULL, TRUE, TRUE),
('uswatun', 'salsabila3', 'salsabila3', 'guru', 'Uswatun Aeniah, S.H.', NULL, NULL, NULL, NULL, TRUE, TRUE),
('zura', 'salsabila3', 'salsabila3', 'guru', 'Zura Mauliza', NULL, NULL, NULL, NULL, TRUE, TRUE),
('ahmadbusyairi', 'salsabila3', 'salsabila3', 'guru', 'Ahmad Busyairi, S.H.', NULL, NULL, NULL, NULL, TRUE, TRUE),
('amannasrullah', 'salsabila3', 'salsabila3', 'guru', 'Amannasrullah Amin, S.Pd. M.Pd.', NULL, NULL, NULL, NULL, TRUE, TRUE),
('wali.1A.ABIMANYU FACHRI CHRISTIANTO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ABIMANYU FACHRI CHRISTIANTO', '1A', '1A', 'ABIMANYU FACHRI CHRISTIANTO', 'ABIMANYU FACHRI CHRISTIANTO', TRUE, TRUE),
('wali.1A.ABINAYA OTTY ENGGI KISHWARI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ABINAYA OTTY ENGGI KISHWARI', '1A', '1A', 'ABINAYA OTTY ENGGI KISHWARI', 'ABINAYA OTTY ENGGI KISHWARI', TRUE, TRUE),
('wali.1A.ABIYYU KENZO WIRATAMA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ABIYYU KENZO WIRATAMA', '1A', '1A', 'ABIYYU KENZO WIRATAMA', 'ABIYYU KENZO WIRATAMA', TRUE, TRUE),
('wali.1A.ADHITAMA DIPA PUTRA BANIANTORO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ADHITAMA DIPA PUTRA BANIANTORO', '1A', '1A', 'ADHITAMA DIPA PUTRA BANIANTORO', 'ADHITAMA DIPA PUTRA BANIANTORO', TRUE, TRUE),
('wali.1A.AHMAD NADHIF SHAHARYAR', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AHMAD NADHIF SHAHARYAR', '1A', '1A', 'AHMAD NADHIF SHAHARYAR', 'AHMAD NADHIF SHAHARYAR', TRUE, TRUE),
('wali.1A.AHMAD ZIYADULLAH IHSAANA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AHMAD ZIYADULLAH IHSAANA', '1A', '1A', 'AHMAD ZIYADULLAH IHSAANA', 'AHMAD ZIYADULLAH IHSAANA', TRUE, TRUE),
('wali.1A.ALICIA SHAQUILA RAKSANDRINA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALICIA SHAQUILA RAKSANDRINA', '1A', '1A', 'ALICIA SHAQUILA RAKSANDRINA', 'ALICIA SHAQUILA RAKSANDRINA', TRUE, TRUE),
('wali.1A.ARFANO RAFKA RAFFAZA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARFANO RAFKA RAFFAZA', '1A', '1A', 'ARFANO RAFKA RAFFAZA', 'ARFANO RAFKA RAFFAZA', TRUE, TRUE),
('wali.1A.AR SHAKA MARDIKA HASAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AR SHAKA MARDIKA HASAN', '1A', '1A', 'AR SHAKA MARDIKA HASAN', 'AR SHAKA MARDIKA HASAN', TRUE, TRUE),
('wali.1A.AZKIA AZ ZAHRA WIJAYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AZKIA AZ ZAHRA WIJAYA', '1A', '1A', 'AZKIA AZ ZAHRA WIJAYA', 'AZKIA AZ ZAHRA WIJAYA', TRUE, TRUE),
('wali.1A.CHIARA GHUMAISHA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari CHIARA GHUMAISHA', '1A', '1A', 'CHIARA GHUMAISHA', 'CHIARA GHUMAISHA', TRUE, TRUE),
('wali.1A.FATIMAH ANINDITA AZALEA PADMASARI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FATIMAH ANINDITA AZALEA PADMASARI', '1A', '1A', 'FATIMAH ANINDITA AZALEA PADMASARI', 'FATIMAH ANINDITA AZALEA PADMASARI', TRUE, TRUE),
('wali.1A.FAUZI MUHAMMAD ARIEF', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FAUZI MUHAMMAD ARIEF', '1A', '1A', 'FAUZI MUHAMMAD ARIEF', 'FAUZI MUHAMMAD ARIEF', TRUE, TRUE),
('wali.1A.GHINA OLIVIA PUTRI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari GHINA OLIVIA PUTRI', '1A', '1A', 'GHINA OLIVIA PUTRI', 'GHINA OLIVIA PUTRI', TRUE, TRUE),
('wali.1A.HAFEEDZ ABDULLAH AL ARSY', 'salsabila3', 'salsabila3', 'wali', 'Wali dari HAFEEDZ ABDULLAH AL ARSY', '1A', '1A', 'HAFEEDZ ABDULLAH AL ARSY', 'HAFEEDZ ABDULLAH AL ARSY', TRUE, TRUE),
('wali.1A.HAIDAR RAZKA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari HAIDAR RAZKA', '1A', '1A', 'HAIDAR RAZKA', 'HAIDAR RAZKA', TRUE, TRUE),
('wali.1A.HIFZA SYIFA AZZAHRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari HIFZA SYIFA AZZAHRA', '1A', '1A', 'HIFZA SYIFA AZZAHRA', 'HIFZA SYIFA AZZAHRA', TRUE, TRUE),
('wali.1A.IBRAHIM AL AZZAMY', 'salsabila3', 'salsabila3', 'wali', 'Wali dari IBRAHIM AL AZZAMY', '1A', '1A', 'IBRAHIM AL AZZAMY', 'IBRAHIM AL AZZAMY', TRUE, TRUE),
('wali.1A.KENZIE ZULFIKAR EL FATIH', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KENZIE ZULFIKAR EL FATIH', '1A', '1A', 'KENZIE ZULFIKAR EL FATIH', 'KENZIE ZULFIKAR EL FATIH', TRUE, TRUE),
('wali.1A.MUHAMMAD ABIEL ARKATAMA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD ABIEL ARKATAMA', '1A', '1A', 'MUHAMMAD ABIEL ARKATAMA', 'MUHAMMAD ABIEL ARKATAMA', TRUE, TRUE),
('wali.1A.MUHAMMAD MAS ATHARRAZKA AL GHAFFAR', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD MAS ATHARRAZKA AL GHAFFAR', '1A', '1A', 'MUHAMMAD MAS ATHARRAZKA AL GHAFFAR', 'MUHAMMAD MAS ATHARRAZKA AL GHAFFAR', TRUE, TRUE),
('wali.1A.MUHAMMAD RESTU AL KHALIFI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD RESTU AL KHALIFI', '1A', '1A', 'MUHAMMAD RESTU AL KHALIFI', 'MUHAMMAD RESTU AL KHALIFI', TRUE, TRUE),
('wali.1A.NAUFAL AZZAM MAHESWARA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NAUFAL AZZAM MAHESWARA', '1A', '1A', 'NAUFAL AZZAM MAHESWARA', 'NAUFAL AZZAM MAHESWARA', TRUE, TRUE),
('wali.1A.NAUSHA KIRANIA MAHIRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NAUSHA KIRANIA MAHIRA', '1A', '1A', 'NAUSHA KIRANIA MAHIRA', 'NAUSHA KIRANIA MAHIRA', TRUE, TRUE),
('wali.1A.RAFIF HAMIZAN ALFARIZKI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RAFIF HAMIZAN ALFARIZKI', '1A', '1A', 'RAFIF HAMIZAN ALFARIZKI', 'RAFIF HAMIZAN ALFARIZKI', TRUE, TRUE),
('wali.1A.RUMAISHA AMAMI SULTHONY', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RUMAISHA AMAMI SULTHONY', '1A', '1A', 'RUMAISHA AMAMI SULTHONY', 'RUMAISHA AMAMI SULTHONY', TRUE, TRUE),
('wali.1A.SASHENKA KEN ARUNIKA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SASHENKA KEN ARUNIKA', '1A', '1A', 'SASHENKA KEN ARUNIKA', 'SASHENKA KEN ARUNIKA', TRUE, TRUE),
('wali.1A.VALERI YUMNA AZAHRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari VALERI YUMNA AZAHRA', '1A', '1A', 'VALERI YUMNA AZAHRA', 'VALERI YUMNA AZAHRA', TRUE, TRUE),
('wali.1A.ZAHIRA YULIZA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ZAHIRA YULIZA', '1A', '1A', 'ZAHIRA YULIZA', 'ZAHIRA YULIZA', TRUE, TRUE),
('wali.1B.ABIMANYU RIZKY SAPUTRO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ABIMANYU RIZKY SAPUTRO', '1B', '1B', 'ABIMANYU RIZKY SAPUTRO', 'ABIMANYU RIZKY SAPUTRO', TRUE, TRUE),
('wali.1B.AHMAD NABIL ARKATAMA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AHMAD NABIL ARKATAMA', '1B', '1B', 'AHMAD NABIL ARKATAMA', 'AHMAD NABIL ARKATAMA', TRUE, TRUE),
('wali.1B.AISYAH HASNA FITRIYANI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AISYAH HASNA FITRIYANI', '1B', '1B', 'AISYAH HASNA FITRIYANI', 'AISYAH HASNA FITRIYANI', TRUE, TRUE),
('wali.1B.AKTHAR RAFIF ALKAREEM', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AKTHAR RAFIF ALKAREEM', '1B', '1B', 'AKTHAR RAFIF ALKAREEM', 'AKTHAR RAFIF ALKAREEM', TRUE, TRUE),
('wali.1B.ALEXEI ALVARO AKIRA ALFIANTO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALEXEI ALVARO AKIRA ALFIANTO', '1B', '1B', 'ALEXEI ALVARO AKIRA ALFIANTO', 'ALEXEI ALVARO AKIRA ALFIANTO', TRUE, TRUE),
('wali.1B.AMEERA SOFIA ASSYIFA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AMEERA SOFIA ASSYIFA', '1B', '1B', 'AMEERA SOFIA ASSYIFA', 'AMEERA SOFIA ASSYIFA', TRUE, TRUE),
('wali.1B.ARSYILA SHAKAYLA QUINZA JASMINE', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARSYILA SHAKAYLA QUINZA JASMINE', '1B', '1B', 'ARSYILA SHAKAYLA QUINZA JASMINE', 'ARSYILA SHAKAYLA QUINZA JASMINE', TRUE, TRUE),
('wali.1B.AVIO HAFIZ SWARANTORO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AVIO HAFIZ SWARANTORO', '1B', '1B', 'AVIO HAFIZ SWARANTORO', 'AVIO HAFIZ SWARANTORO', TRUE, TRUE),
('wali.1B.BHUMI NUFAIL ANSHAR ADYATMA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari BHUMI NUFAIL ANSHAR ADYATMA', '1B', '1B', 'BHUMI NUFAIL ANSHAR ADYATMA', 'BHUMI NUFAIL ANSHAR ADYATMA', TRUE, TRUE),
('wali.1B.DUBA ALI ZAKYR', 'salsabila3', 'salsabila3', 'wali', 'Wali dari DUBA ALI ZAKYR', '1B', '1B', 'DUBA ALI ZAKYR', 'DUBA ALI ZAKYR', TRUE, TRUE),
('wali.1B.ENZY KINANDITA PAYANA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ENZY KINANDITA PAYANA', '1B', '1B', 'ENZY KINANDITA PAYANA', 'ENZY KINANDITA PAYANA', TRUE, TRUE),
('wali.1B.FATHAN DANIYAL DANINDRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FATHAN DANIYAL DANINDRA', '1B', '1B', 'FATHAN DANIYAL DANINDRA', 'FATHAN DANIYAL DANINDRA', TRUE, TRUE),
('wali.1B.FATHIA NUR RAMADHANI ALMAHYRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FATHIA NUR RAMADHANI ALMAHYRA', '1B', '1B', 'FATHIA NUR RAMADHANI ALMAHYRA', 'FATHIA NUR RAMADHANI ALMAHYRA', TRUE, TRUE),
('wali.1B.FUZNA FAIQ AL KARIM', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FUZNA FAIQ AL KARIM', '1B', '1B', 'FUZNA FAIQ AL KARIM', 'FUZNA FAIQ AL KARIM', TRUE, TRUE),
('wali.1B.GHANIYAH KARIMAH', 'salsabila3', 'salsabila3', 'wali', 'Wali dari GHANIYAH KARIMAH', '1B', '1B', 'GHANIYAH KARIMAH', 'GHANIYAH KARIMAH', TRUE, TRUE),
('wali.1B.GIBRAN HADI WANTORO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari GIBRAN HADI WANTORO', '1B', '1B', 'GIBRAN HADI WANTORO', 'GIBRAN HADI WANTORO', TRUE, TRUE),
('wali.1B.HAFIDZ AL FATIH WIBOWO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari HAFIDZ AL FATIH WIBOWO', '1B', '1B', 'HAFIDZ AL FATIH WIBOWO', 'HAFIDZ AL FATIH WIBOWO', TRUE, TRUE),
('wali.1B.HERO XAVIER ATHALLAH AHMAD', 'salsabila3', 'salsabila3', 'wali', 'Wali dari HERO XAVIER ATHALLAH AHMAD', '1B', '1B', 'HERO XAVIER ATHALLAH AHMAD', 'HERO XAVIER ATHALLAH AHMAD', TRUE, TRUE),
('wali.1B.IBRAHIM ADHYASTHA KUMARA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari IBRAHIM ADHYASTHA KUMARA', '1B', '1B', 'IBRAHIM ADHYASTHA KUMARA', 'IBRAHIM ADHYASTHA KUMARA', TRUE, TRUE),
('wali.1B.KHAIRA ARSHAYNA FARELLEA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KHAIRA ARSHAYNA FARELLEA', '1B', '1B', 'KHAIRA ARSHAYNA FARELLEA', 'KHAIRA ARSHAYNA FARELLEA', TRUE, TRUE),
('wali.1B.MUHAMMAD QAAMA NABIGH UZAIR', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD QAAMA NABIGH UZAIR', '1B', '1B', 'MUHAMMAD QAAMA NABIGH UZAIR', 'MUHAMMAD QAAMA NABIGH UZAIR', TRUE, TRUE),
('wali.1B.NATHAN AQMAR GIANDA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NATHAN AQMAR GIANDA', '1B', '1B', 'NATHAN AQMAR GIANDA', 'NATHAN AQMAR GIANDA', TRUE, TRUE),
('wali.1B.RAFARENDRA AZKA NUGRAHA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RAFARENDRA AZKA NUGRAHA', '1B', '1B', 'RAFARENDRA AZKA NUGRAHA', 'RAFARENDRA AZKA NUGRAHA', TRUE, TRUE),
('wali.1B.RAINA SENJA PARADISA NUGROHO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RAINA SENJA PARADISA NUGROHO', '1B', '1B', 'RAINA SENJA PARADISA NUGROHO', 'RAINA SENJA PARADISA NUGROHO', TRUE, TRUE),
('wali.1B.RAYYA SHALIHAH', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RAYYA SHALIHAH', '1B', '1B', 'RAYYA SHALIHAH', 'RAYYA SHALIHAH', TRUE, TRUE),
('wali.1B.SHAKILA HANIN ELMIRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SHAKILA HANIN ELMIRA', '1B', '1B', 'SHAKILA HANIN ELMIRA', 'SHAKILA HANIN ELMIRA', TRUE, TRUE),
('wali.1B.SYAWALUNA KHAWLA SASTRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SYAWALUNA KHAWLA SASTRA', '1B', '1B', 'SYAWALUNA KHAWLA SASTRA', 'SYAWALUNA KHAWLA SASTRA', TRUE, TRUE),
('wali.1B.ZHAFIRA CERLIA TANIA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ZHAFIRA CERLIA TANIA', '1B', '1B', 'ZHAFIRA CERLIA TANIA', 'ZHAFIRA CERLIA TANIA', TRUE, TRUE),
('wali.1C.ADZKIYA MARITZA FIRDAUS', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ADZKIYA MARITZA FIRDAUS', '1C', '1C', 'ADZKIYA MARITZA FIRDAUS', 'ADZKIYA MARITZA FIRDAUS', TRUE, TRUE),
('wali.1C.AHMAD KEEFE SHAHBAZ SWADITRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AHMAD KEEFE SHAHBAZ SWADITRA', '1C', '1C', 'AHMAD KEEFE SHAHBAZ SWADITRA', 'AHMAD KEEFE SHAHBAZ SWADITRA', TRUE, TRUE),
('wali.1C.ALDIANSYAH CAHYA PRATAMA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALDIANSYAH CAHYA PRATAMA', '1C', '1C', 'ALDIANSYAH CAHYA PRATAMA', 'ALDIANSYAH CAHYA PRATAMA', TRUE, TRUE),
('wali.1C.ALMA UNY HAJAR', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALMA UNY HAJAR', '1C', '1C', 'ALMA UNY HAJAR', 'ALMA UNY HAJAR', TRUE, TRUE),
('wali.1C.ALVARO KENZO MAHESWARA ASADI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALVARO KENZO MAHESWARA ASADI', '1C', '1C', 'ALVARO KENZO MAHESWARA ASADI', 'ALVARO KENZO MAHESWARA ASADI', TRUE, TRUE),
('wali.1C.ARISHA ABIDAH WICAKSONO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARISHA ABIDAH WICAKSONO', '1C', '1C', 'ARISHA ABIDAH WICAKSONO', 'ARISHA ABIDAH WICAKSONO', TRUE, TRUE),
('wali.1C.ARSHAKA FATRUKI ALBAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARSHAKA FATRUKI ALBAN', '1C', '1C', 'ARSHAKA FATRUKI ALBAN', 'ARSHAKA FATRUKI ALBAN', TRUE, TRUE),
('wali.1C.ARSHY ADIBA HAFIZHA PUTRI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARSHY ADIBA HAFIZHA PUTRI', '1C', '1C', 'ARSHY ADIBA HAFIZHA PUTRI', 'ARSHY ADIBA HAFIZHA PUTRI', TRUE, TRUE),
('wali.1C.ARSYILA SYAQUILA NAYYARA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARSYILA SYAQUILA NAYYARA', '1C', '1C', 'ARSYILA SYAQUILA NAYYARA', 'ARSYILA SYAQUILA NAYYARA', TRUE, TRUE),
('wali.1C.DANESWARA YAQDHAN PERWIRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari DANESWARA YAQDHAN PERWIRA', '1C', '1C', 'DANESWARA YAQDHAN PERWIRA', 'DANESWARA YAQDHAN PERWIRA', TRUE, TRUE),
('wali.1C.ELVANNO ZHAFRAN ARYANDICTA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ELVANNO ZHAFRAN ARYANDICTA', '1C', '1C', 'ELVANNO ZHAFRAN ARYANDICTA', 'ELVANNO ZHAFRAN ARYANDICTA', TRUE, TRUE),
('wali.1C.FADIL ASYAM HIDAYAT', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FADIL ASYAM HIDAYAT', '1C', '1C', 'FADIL ASYAM HIDAYAT', 'FADIL ASYAM HIDAYAT', TRUE, TRUE),
('wali.1C.FALISHA RUMAISA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FALISHA RUMAISA', '1C', '1C', 'FALISHA RUMAISA', 'FALISHA RUMAISA', TRUE, TRUE),
('wali.1C.HASYEEM KEMAL ABQORY', 'salsabila3', 'salsabila3', 'wali', 'Wali dari HASYEEM KEMAL ABQORY', '1C', '1C', 'HASYEEM KEMAL ABQORY', 'HASYEEM KEMAL ABQORY', TRUE, TRUE),
('wali.1C.KALANDRA ABHIRU FIRMANSYAH', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KALANDRA ABHIRU FIRMANSYAH', '1C', '1C', 'KALANDRA ABHIRU FIRMANSYAH', 'KALANDRA ABHIRU FIRMANSYAH', TRUE, TRUE),
('wali.1C.KALIMBA KANG PUNGKASAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KALIMBA KANG PUNGKASAN', '1C', '1C', 'KALIMBA KANG PUNGKASAN', 'KALIMBA KANG PUNGKASAN', TRUE, TRUE),
('wali.1C.KEN ABIMANYU ZAYYAN MUHAMMAD', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KEN ABIMANYU ZAYYAN MUHAMMAD', '1C', '1C', 'KEN ABIMANYU ZAYYAN MUHAMMAD', 'KEN ABIMANYU ZAYYAN MUHAMMAD', TRUE, TRUE),
('wali.1C.MAULANA MIRZA DANENDRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MAULANA MIRZA DANENDRA', '1C', '1C', 'MAULANA MIRZA DANENDRA', 'MAULANA MIRZA DANENDRA', TRUE, TRUE),
('wali.1C.MEYLIKA AIZA PUTRI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MEYLIKA AIZA PUTRI', '1C', '1C', 'MEYLIKA AIZA PUTRI', 'MEYLIKA AIZA PUTRI', TRUE, TRUE),
('wali.1C.MUHAMMAD AL-FATIH HARTANTO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD AL-FATIH HARTANTO', '1C', '1C', 'MUHAMMAD AL-FATIH HARTANTO', 'MUHAMMAD AL-FATIH HARTANTO', TRUE, TRUE),
('wali.1C.MUHAMMAD ZHAFRAN FIKRI AL-ARSYAD', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD ZHAFRAN FIKRI AL-ARSYAD', '1C', '1C', 'MUHAMMAD ZHAFRAN FIKRI AL-ARSYAD', 'MUHAMMAD ZHAFRAN FIKRI AL-ARSYAD', TRUE, TRUE),
('wali.1C.NAMEIRA AJWA KIANDRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NAMEIRA AJWA KIANDRA', '1C', '1C', 'NAMEIRA AJWA KIANDRA', 'NAMEIRA AJWA KIANDRA', TRUE, TRUE),
('wali.1C.NIESYEICHA ANNAILA AQEENARA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NIESYEICHA ANNAILA AQEENARA', '1C', '1C', 'NIESYEICHA ANNAILA AQEENARA', 'NIESYEICHA ANNAILA AQEENARA', TRUE, TRUE),
('wali.1C.RAFFAN HAFIDZ ALFARIZI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RAFFAN HAFIDZ ALFARIZI', '1C', '1C', 'RAFFAN HAFIDZ ALFARIZI', 'RAFFAN HAFIDZ ALFARIZI', TRUE, TRUE)
ON CONFLICT (username) DO NOTHING;


INSERT INTO auth_accounts (username, password_hash, "passwordHash", role, name, class_id, "classId", student_name, "studentName", first_login, "firstLogin") VALUES
('wali.1C.RAFID HAZAIN AHMAD AL HAJARY', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RAFID HAZAIN AHMAD AL HAJARY', '1C', '1C', 'RAFID HAZAIN AHMAD AL HAJARY', 'RAFID HAZAIN AHMAD AL HAJARY', TRUE, TRUE),
('wali.1C.RAFKA DANIYAL YAHYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RAFKA DANIYAL YAHYA', '1C', '1C', 'RAFKA DANIYAL YAHYA', 'RAFKA DANIYAL YAHYA', TRUE, TRUE),
('wali.1C.RATU YAZMINE', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RATU YAZMINE', '1C', '1C', 'RATU YAZMINE', 'RATU YAZMINE', TRUE, TRUE),
('wali.1C.SYAHILA MAULIDA MAHESWARI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SYAHILA MAULIDA MAHESWARI', '1C', '1C', 'SYAHILA MAULIDA MAHESWARI', 'SYAHILA MAULIDA MAHESWARI', TRUE, TRUE),
('wali.2A.ABYAN SANSKARA DARMAWAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ABYAN SANSKARA DARMAWAN', '2A', '2A', 'ABYAN SANSKARA DARMAWAN', 'ABYAN SANSKARA DARMAWAN', TRUE, TRUE),
('wali.2A.ACHMAD FARZAN ULUL AZMI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ACHMAD FARZAN ULUL AZMI', '2A', '2A', 'ACHMAD FARZAN ULUL AZMI', 'ACHMAD FARZAN ULUL AZMI', TRUE, TRUE),
('wali.2A.ADEEVA ZAHIRA MECCA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ADEEVA ZAHIRA MECCA', '2A', '2A', 'ADEEVA ZAHIRA MECCA', 'ADEEVA ZAHIRA MECCA', TRUE, TRUE),
('wali.2A.ADELIA NUR RAHIMAH', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ADELIA NUR RAHIMAH', '2A', '2A', 'ADELIA NUR RAHIMAH', 'ADELIA NUR RAHIMAH', TRUE, TRUE),
('wali.2A.ADNAN ZAYAN RAFFASYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ADNAN ZAYAN RAFFASYA', '2A', '2A', 'ADNAN ZAYAN RAFFASYA', 'ADNAN ZAYAN RAFFASYA', TRUE, TRUE),
('wali.2A.AISHWARYA JANYAGITA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AISHWARYA JANYAGITA', '2A', '2A', 'AISHWARYA JANYAGITA', 'AISHWARYA JANYAGITA', TRUE, TRUE),
('wali.2A.AL FATH HARITS ZAHIAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AL FATH HARITS ZAHIAN', '2A', '2A', 'AL FATH HARITS ZAHIAN', 'AL FATH HARITS ZAHIAN', TRUE, TRUE),
('wali.2A.ALFIN RAHMAT ISKANDAR', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALFIN RAHMAT ISKANDAR', '2A', '2A', 'ALFIN RAHMAT ISKANDAR', 'ALFIN RAHMAT ISKANDAR', TRUE, TRUE),
('wali.2A.AQILA KAMELIA AZZAHRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AQILA KAMELIA AZZAHRA', '2A', '2A', 'AQILA KAMELIA AZZAHRA', 'AQILA KAMELIA AZZAHRA', TRUE, TRUE),
('wali.2A.ARABELLA KEISHA KHAIRINA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARABELLA KEISHA KHAIRINA', '2A', '2A', 'ARABELLA KEISHA KHAIRINA', 'ARABELLA KEISHA KHAIRINA', TRUE, TRUE),
('wali.2A.AUDIYA FUKAYANA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AUDIYA FUKAYANA', '2A', '2A', 'AUDIYA FUKAYANA', 'AUDIYA FUKAYANA', TRUE, TRUE),
('wali.2A.AXEL AYDIN KHALFANI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AXEL AYDIN KHALFANI', '2A', '2A', 'AXEL AYDIN KHALFANI', 'AXEL AYDIN KHALFANI', TRUE, TRUE),
('wali.2A.BANYU ANGGER ADIGUNA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari BANYU ANGGER ADIGUNA', '2A', '2A', 'BANYU ANGGER ADIGUNA', 'BANYU ANGGER ADIGUNA', TRUE, TRUE),
('wali.2A.DANISH ZAIN ALFARIZI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari DANISH ZAIN ALFARIZI', '2A', '2A', 'DANISH ZAIN ALFARIZI', 'DANISH ZAIN ALFARIZI', TRUE, TRUE),
('wali.2A.EMBUN LAVINA MAHESWARI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari EMBUN LAVINA MAHESWARI', '2A', '2A', 'EMBUN LAVINA MAHESWARI', 'EMBUN LAVINA MAHESWARI', TRUE, TRUE),
('wali.2A.FAIZ SHADIQ RAHARDIAN PRABOWO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FAIZ SHADIQ RAHARDIAN PRABOWO', '2A', '2A', 'FAIZ SHADIQ RAHARDIAN PRABOWO', 'FAIZ SHADIQ RAHARDIAN PRABOWO', TRUE, TRUE),
('wali.2A.HAFID RIZQY RAMADHAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari HAFID RIZQY RAMADHAN', '2A', '2A', 'HAFID RIZQY RAMADHAN', 'HAFID RIZQY RAMADHAN', TRUE, TRUE),
('wali.2A.KIRANIA ALEEYA DAFEENA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KIRANIA ALEEYA DAFEENA', '2A', '2A', 'KIRANIA ALEEYA DAFEENA', 'KIRANIA ALEEYA DAFEENA', TRUE, TRUE),
('wali.2A.LATIFAH NADA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari LATIFAH NADA', '2A', '2A', 'LATIFAH NADA', 'LATIFAH NADA', TRUE, TRUE),
('wali.2A.MUHAMMAD ABDILLAH', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD ABDILLAH', '2A', '2A', 'MUHAMMAD ABDILLAH', 'MUHAMMAD ABDILLAH', TRUE, TRUE),
('wali.2A.MUHAMMAD ALTHAF SALIM', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD ALTHAF SALIM', '2A', '2A', 'MUHAMMAD ALTHAF SALIM', 'MUHAMMAD ALTHAF SALIM', TRUE, TRUE),
('wali.2A.MUQADDAM NUR MAFAHIM', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUQADDAM NUR MAFAHIM', '2A', '2A', 'MUQADDAM NUR MAFAHIM', 'MUQADDAM NUR MAFAHIM', TRUE, TRUE),
('wali.2A.NIAR ALMAHYRA KIRANI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NIAR ALMAHYRA KIRANI', '2A', '2A', 'NIAR ALMAHYRA KIRANI', 'NIAR ALMAHYRA KIRANI', TRUE, TRUE),
('wali.2A.QALESYA SHANUM ALTHAFUNNISA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari QALESYA SHANUM ALTHAFUNNISA', '2A', '2A', 'QALESYA SHANUM ALTHAFUNNISA', 'QALESYA SHANUM ALTHAFUNNISA', TRUE, TRUE),
('wali.2A.RAFIF RAFASYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RAFIF RAFASYA', '2A', '2A', 'RAFIF RAFASYA', 'RAFIF RAFASYA', TRUE, TRUE),
('wali.2A.RAHMAT FAWZI GHANIY HERMAWAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RAHMAT FAWZI GHANIY HERMAWAN', '2A', '2A', 'RAHMAT FAWZI GHANIY HERMAWAN', 'RAHMAT FAWZI GHANIY HERMAWAN', TRUE, TRUE),
('wali.2A.RALINE ALMEERA IRAWAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RALINE ALMEERA IRAWAN', '2A', '2A', 'RALINE ALMEERA IRAWAN', 'RALINE ALMEERA IRAWAN', TRUE, TRUE),
('wali.2A.SASIKIRANA WILUGARBA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SASIKIRANA WILUGARBA', '2A', '2A', 'SASIKIRANA WILUGARBA', 'SASIKIRANA WILUGARBA', TRUE, TRUE),
('wali.2A.SATRIA FARRIS AL ZHAFRAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SATRIA FARRIS AL ZHAFRAN', '2A', '2A', 'SATRIA FARRIS AL ZHAFRAN', 'SATRIA FARRIS AL ZHAFRAN', TRUE, TRUE),
('wali.2B.ALENA ZELVANA SETYAWAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALENA ZELVANA SETYAWAN', '2B', '2B', 'ALENA ZELVANA SETYAWAN', 'ALENA ZELVANA SETYAWAN', TRUE, TRUE),
('wali.2B.ALI ZAINAL ABIDIN EL HAQ', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALI ZAINAL ABIDIN EL HAQ', '2B', '2B', 'ALI ZAINAL ABIDIN EL HAQ', 'ALI ZAINAL ABIDIN EL HAQ', TRUE, TRUE),
('wali.2B.ALHAFIDZ PRADANA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALHAFIDZ PRADANA', '2B', '2B', 'ALHAFIDZ PRADANA', 'ALHAFIDZ PRADANA', TRUE, TRUE),
('wali.2B.ALMAHYRA SHEZA ASHAKI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALMAHYRA SHEZA ASHAKI', '2B', '2B', 'ALMAHYRA SHEZA ASHAKI', 'ALMAHYRA SHEZA ASHAKI', TRUE, TRUE),
('wali.2B.ALMAIRA ROMEESA NALADHIPA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALMAIRA ROMEESA NALADHIPA', '2B', '2B', 'ALMAIRA ROMEESA NALADHIPA', 'ALMAIRA ROMEESA NALADHIPA', TRUE, TRUE),
('wali.2B.AMANINA ZEIYIN KARIMA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AMANINA ZEIYIN KARIMA', '2B', '2B', 'AMANINA ZEIYIN KARIMA', 'AMANINA ZEIYIN KARIMA', TRUE, TRUE),
('wali.2B.ARBANI PAUNDRA IBRAMDEWARI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARBANI PAUNDRA IBRAMDEWARI', '2B', '2B', 'ARBANI PAUNDRA IBRAMDEWARI', 'ARBANI PAUNDRA IBRAMDEWARI', TRUE, TRUE),
('wali.2B.ARFAN BAGAS PRASETIYO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARFAN BAGAS PRASETIYO', '2B', '2B', 'ARFAN BAGAS PRASETIYO', 'ARFAN BAGAS PRASETIYO', TRUE, TRUE),
('wali.2B.ARFAN MIYAZ PUTRA HAMID', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARFAN MIYAZ PUTRA HAMID', '2B', '2B', 'ARFAN MIYAZ PUTRA HAMID', 'ARFAN MIYAZ PUTRA HAMID', TRUE, TRUE),
('wali.2B.BANYU BIRU AL FATIH', 'salsabila3', 'salsabila3', 'wali', 'Wali dari BANYU BIRU AL FATIH', '2B', '2B', 'BANYU BIRU AL FATIH', 'BANYU BIRU AL FATIH', TRUE, TRUE),
('wali.2B.FARZANA ALEA NAURA ELKAFI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FARZANA ALEA NAURA ELKAFI', '2B', '2B', 'FARZANA ALEA NAURA ELKAFI', 'FARZANA ALEA NAURA ELKAFI', TRUE, TRUE),
('wali.2B.FATIHA MARYAM WASKITA AZZAHRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FATIHA MARYAM WASKITA AZZAHRA', '2B', '2B', 'FATIHA MARYAM WASKITA AZZAHRA', 'FATIHA MARYAM WASKITA AZZAHRA', TRUE, TRUE),
('wali.2B.GHANIA DENOVE RAYADINATA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari GHANIA DENOVE RAYADINATA', '2B', '2B', 'GHANIA DENOVE RAYADINATA', 'GHANIA DENOVE RAYADINATA', TRUE, TRUE),
('wali.2B.GHUMAISHA FIRNAS ELSHAGUFTA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari GHUMAISHA FIRNAS ELSHAGUFTA', '2B', '2B', 'GHUMAISHA FIRNAS ELSHAGUFTA', 'GHUMAISHA FIRNAS ELSHAGUFTA', TRUE, TRUE),
('wali.2B.HIZAN ALFATIH PRIMAWAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari HIZAN ALFATIH PRIMAWAN', '2B', '2B', 'HIZAN ALFATIH PRIMAWAN', 'HIZAN ALFATIH PRIMAWAN', TRUE, TRUE),
('wali.2B.KALANDRA MUHAMMAD ALBAR ANWILY', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KALANDRA MUHAMMAD ALBAR ANWILY', '2B', '2B', 'KALANDRA MUHAMMAD ALBAR ANWILY', 'KALANDRA MUHAMMAD ALBAR ANWILY', TRUE, TRUE),
('wali.2B.KHAYRA RAVA RUMAISYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KHAYRA RAVA RUMAISYA', '2B', '2B', 'KHAYRA RAVA RUMAISYA', 'KHAYRA RAVA RUMAISYA', TRUE, TRUE),
('wali.2B.KIRANIA AISYAH ADIYATI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KIRANIA AISYAH ADIYATI', '2B', '2B', 'KIRANIA AISYAH ADIYATI', 'KIRANIA AISYAH ADIYATI', TRUE, TRUE),
('wali.2B.KIRANIA DWI OKTAVIA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KIRANIA DWI OKTAVIA', '2B', '2B', 'KIRANIA DWI OKTAVIA', 'KIRANIA DWI OKTAVIA', TRUE, TRUE),
('wali.2B.MAISAN KANAKA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MAISAN KANAKA', '2B', '2B', 'MAISAN KANAKA', 'MAISAN KANAKA', TRUE, TRUE),
('wali.2B.MUHAMMAD FAWWAZ MUKAFI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD FAWWAZ MUKAFI', '2B', '2B', 'MUHAMMAD FAWWAZ MUKAFI', 'MUHAMMAD FAWWAZ MUKAFI', TRUE, TRUE),
('wali.2B.MUHAMMAD LUQMAN LANGIT ABQARY', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD LUQMAN LANGIT ABQARY', '2B', '2B', 'MUHAMMAD LUQMAN LANGIT ABQARY', 'MUHAMMAD LUQMAN LANGIT ABQARY', TRUE, TRUE),
('wali.2B.NAFISA ALMAHYRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NAFISA ALMAHYRA', '2B', '2B', 'NAFISA ALMAHYRA', 'NAFISA ALMAHYRA', TRUE, TRUE),
('wali.2B.QIANA TAZKIA AZAHRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari QIANA TAZKIA AZAHRA', '2B', '2B', 'QIANA TAZKIA AZAHRA', 'QIANA TAZKIA AZAHRA', TRUE, TRUE),
('wali.2B.QONITA ALIFA HILMI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari QONITA ALIFA HILMI', '2B', '2B', 'QONITA ALIFA HILMI', 'QONITA ALIFA HILMI', TRUE, TRUE),
('wali.2B.RAFLI ANDRIANAS HAMIZAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RAFLI ANDRIANAS HAMIZAN', '2B', '2B', 'RAFLI ANDRIANAS HAMIZAN', 'RAFLI ANDRIANAS HAMIZAN', TRUE, TRUE),
('wali.2B.SALMA MIKHAYLA HUMAIRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SALMA MIKHAYLA HUMAIRA', '2B', '2B', 'SALMA MIKHAYLA HUMAIRA', 'SALMA MIKHAYLA HUMAIRA', TRUE, TRUE),
('wali.2B.SYAHDAN ARGATSANI ADHYASTA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SYAHDAN ARGATSANI ADHYASTA', '2B', '2B', 'SYAHDAN ARGATSANI ADHYASTA', 'SYAHDAN ARGATSANI ADHYASTA', TRUE, TRUE),
('wali.2B.YOLA ALEXANDRIA HANANI PUTRI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari YOLA ALEXANDRIA HANANI PUTRI', '2B', '2B', 'YOLA ALEXANDRIA HANANI PUTRI', 'YOLA ALEXANDRIA HANANI PUTRI', TRUE, TRUE),
('wali.2C.AQILA FADHILA AL HUSNA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AQILA FADHILA AL HUSNA', '2C', '2C', 'AQILA FADHILA AL HUSNA', 'AQILA FADHILA AL HUSNA', TRUE, TRUE),
('wali.2C.ARJUNA NABIL FATIH', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARJUNA NABIL FATIH', '2C', '2C', 'ARJUNA NABIL FATIH', 'ARJUNA NABIL FATIH', TRUE, TRUE),
('wali.2C.ARKAN ABDULLAH HAFIDZ', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARKAN ABDULLAH HAFIDZ', '2C', '2C', 'ARKAN ABDULLAH HAFIDZ', 'ARKAN ABDULLAH HAFIDZ', TRUE, TRUE),
('wali.2C.ARKAN WIRATAMA FATURAKHMAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARKAN WIRATAMA FATURAKHMAN', '2C', '2C', 'ARKAN WIRATAMA FATURAKHMAN', 'ARKAN WIRATAMA FATURAKHMAN', TRUE, TRUE),
('wali.2C.ARSYIL HIKAM DANISWARA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARSYIL HIKAM DANISWARA', '2C', '2C', 'ARSYIL HIKAM DANISWARA', 'ARSYIL HIKAM DANISWARA', TRUE, TRUE),
('wali.2C.ARSY ZAIM FAISAL', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARSY ZAIM FAISAL', '2C', '2C', 'ARSY ZAIM FAISAL', 'ARSY ZAIM FAISAL', TRUE, TRUE),
('wali.2C.AURELIA BIANCA QIANDRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AURELIA BIANCA QIANDRA', '2C', '2C', 'AURELIA BIANCA QIANDRA', 'AURELIA BIANCA QIANDRA', TRUE, TRUE),
('wali.2C.BINTANG KENZIE PERDANA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari BINTANG KENZIE PERDANA', '2C', '2C', 'BINTANG KENZIE PERDANA', 'BINTANG KENZIE PERDANA', TRUE, TRUE),
('wali.2C.BRIYAN ARRAZY', 'salsabila3', 'salsabila3', 'wali', 'Wali dari BRIYAN ARRAZY', '2C', '2C', 'BRIYAN ARRAZY', 'BRIYAN ARRAZY', TRUE, TRUE),
('wali.2C.EARLENE AZKADINA AZIZA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari EARLENE AZKADINA AZIZA', '2C', '2C', 'EARLENE AZKADINA AZIZA', 'EARLENE AZKADINA AZIZA', TRUE, TRUE),
('wali.2C.FAYRA KHAIRINA ALFATHUNISSA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FAYRA KHAIRINA ALFATHUNISSA', '2C', '2C', 'FAYRA KHAIRINA ALFATHUNISSA', 'FAYRA KHAIRINA ALFATHUNISSA', TRUE, TRUE),
('wali.2C.GHAIDA IZZATI KHANSA NUR AZWIYNA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari GHAIDA IZZATI KHANSA NUR AZWIYNA', '2C', '2C', 'GHAIDA IZZATI KHANSA NUR AZWIYNA', 'GHAIDA IZZATI KHANSA NUR AZWIYNA', TRUE, TRUE),
('wali.2C.GIANNIS BANYU RAYA NUGRAHA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari GIANNIS BANYU RAYA NUGRAHA', '2C', '2C', 'GIANNIS BANYU RAYA NUGRAHA', 'GIANNIS BANYU RAYA NUGRAHA', TRUE, TRUE),
('wali.2C.ISWARA AISYAH HABSARA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ISWARA AISYAH HABSARA', '2C', '2C', 'ISWARA AISYAH HABSARA', 'ISWARA AISYAH HABSARA', TRUE, TRUE),
('wali.2C.KALINGGA AHDA ART NATYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KALINGGA AHDA ART NATYA', '2C', '2C', 'KALINGGA AHDA ART NATYA', 'KALINGGA AHDA ART NATYA', TRUE, TRUE),
('wali.2C.KAYYESA ZHUFAIRA GHAISANI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KAYYESA ZHUFAIRA GHAISANI', '2C', '2C', 'KAYYESA ZHUFAIRA GHAISANI', 'KAYYESA ZHUFAIRA GHAISANI', TRUE, TRUE),
('wali.2C.KHAWLA MEDINA RAHMI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KHAWLA MEDINA RAHMI', '2C', '2C', 'KHAWLA MEDINA RAHMI', 'KHAWLA MEDINA RAHMI', TRUE, TRUE),
('wali.2C.MIKHAILA NAYYARA ARSYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MIKHAILA NAYYARA ARSYA', '2C', '2C', 'MIKHAILA NAYYARA ARSYA', 'MIKHAILA NAYYARA ARSYA', TRUE, TRUE),
('wali.2C.MISHA SHABIRA PUTRITAMA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MISHA SHABIRA PUTRITAMA', '2C', '2C', 'MISHA SHABIRA PUTRITAMA', 'MISHA SHABIRA PUTRITAMA', TRUE, TRUE),
('wali.2C.MUHAMMAD GAZA AULIA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD GAZA AULIA', '2C', '2C', 'MUHAMMAD GAZA AULIA', 'MUHAMMAD GAZA AULIA', TRUE, TRUE),
('wali.2C.MUHAMMAD RAFFASYA AL-FATHAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD RAFFASYA AL-FATHAN', '2C', '2C', 'MUHAMMAD RAFFASYA AL-FATHAN', 'MUHAMMAD RAFFASYA AL-FATHAN', TRUE, TRUE),
('wali.2C.QIANU MUMTAZ MIRZA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari QIANU MUMTAZ MIRZA', '2C', '2C', 'QIANU MUMTAZ MIRZA', 'QIANU MUMTAZ MIRZA', TRUE, TRUE),
('wali.2C.RASYA LANANG PRADIPTA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RASYA LANANG PRADIPTA', '2C', '2C', 'RASYA LANANG PRADIPTA', 'RASYA LANANG PRADIPTA', TRUE, TRUE),
('wali.2C.RIHGA ABIMANYU HADIYANTO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RIHGA ABIMANYU HADIYANTO', '2C', '2C', 'RIHGA ABIMANYU HADIYANTO', 'RIHGA ABIMANYU HADIYANTO', TRUE, TRUE),
('wali.2C.SYABILA ADISTI NUGROHO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SYABILA ADISTI NUGROHO', '2C', '2C', 'SYABILA ADISTI NUGROHO', 'SYABILA ADISTI NUGROHO', TRUE, TRUE),
('wali.2C.SYAHBANI KAMAL HUSSEIN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SYAHBANI KAMAL HUSSEIN', '2C', '2C', 'SYAHBANI KAMAL HUSSEIN', 'SYAHBANI KAMAL HUSSEIN', TRUE, TRUE),
('wali.2C.SYAZWAN SHAUM WIDOYO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SYAZWAN SHAUM WIDOYO', '2C', '2C', 'SYAZWAN SHAUM WIDOYO', 'SYAZWAN SHAUM WIDOYO', TRUE, TRUE),
('wali.2C.TANZEELA ALMAHYRA WIJAYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari TANZEELA ALMAHYRA WIJAYA', '2C', '2C', 'TANZEELA ALMAHYRA WIJAYA', 'TANZEELA ALMAHYRA WIJAYA', TRUE, TRUE),
('wali.2C.ZAINA HILYA AZKAYRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ZAINA HILYA AZKAYRA', '2C', '2C', 'ZAINA HILYA AZKAYRA', 'ZAINA HILYA AZKAYRA', TRUE, TRUE),
('wali.3A.ABIZAR NOVANDRA ALFARIZI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ABIZAR NOVANDRA ALFARIZI', '3A', '3A', 'ABIZAR NOVANDRA ALFARIZI', 'ABIZAR NOVANDRA ALFARIZI', TRUE, TRUE),
('wali.3A.AMIRUL WILDAN AL MAROM', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AMIRUL WILDAN AL MAROM', '3A', '3A', 'AMIRUL WILDAN AL MAROM', 'AMIRUL WILDAN AL MAROM', TRUE, TRUE),
('wali.3A.AQMAR NADHIF ALKAREEM', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AQMAR NADHIF ALKAREEM', '3A', '3A', 'AQMAR NADHIF ALKAREEM', 'AQMAR NADHIF ALKAREEM', TRUE, TRUE),
('wali.3A.ARUNA MAULIDYA SYAFA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARUNA MAULIDYA SYAFA', '3A', '3A', 'ARUNA MAULIDYA SYAFA', 'ARUNA MAULIDYA SYAFA', TRUE, TRUE),
('wali.3A.ATARA HAFIZH LUTH FASIHURAHMAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ATARA HAFIZH LUTH FASIHURAHMAN', '3A', '3A', 'ATARA HAFIZH LUTH FASIHURAHMAN', 'ATARA HAFIZH LUTH FASIHURAHMAN', TRUE, TRUE),
('wali.3A.DANZEA SAFANIYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari DANZEA SAFANIYA', '3A', '3A', 'DANZEA SAFANIYA', 'DANZEA SAFANIYA', TRUE, TRUE),
('wali.3A.FAEZIA NAOMI IZARRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FAEZIA NAOMI IZARRA', '3A', '3A', 'FAEZIA NAOMI IZARRA', 'FAEZIA NAOMI IZARRA', TRUE, TRUE),
('wali.3A.FATHAN RYOTA ATALLAH', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FATHAN RYOTA ATALLAH', '3A', '3A', 'FATHAN RYOTA ATALLAH', 'FATHAN RYOTA ATALLAH', TRUE, TRUE),
('wali.3A.FAWWAZ QUTBIE AL QORNY', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FAWWAZ QUTBIE AL QORNY', '3A', '3A', 'FAWWAZ QUTBIE AL QORNY', 'FAWWAZ QUTBIE AL QORNY', TRUE, TRUE)
ON CONFLICT (username) DO NOTHING;


INSERT INTO auth_accounts (username, password_hash, "passwordHash", role, name, class_id, "classId", student_name, "studentName", first_login, "firstLogin") VALUES
('wali.3A.GIANDRA WENING AYUNINDYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari GIANDRA WENING AYUNINDYA', '3A', '3A', 'GIANDRA WENING AYUNINDYA', 'GIANDRA WENING AYUNINDYA', TRUE, TRUE),
('wali.3A.JENNAMIRA KHAIRANI ANINDITA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari JENNAMIRA KHAIRANI ANINDITA', '3A', '3A', 'JENNAMIRA KHAIRANI ANINDITA', 'JENNAMIRA KHAIRANI ANINDITA', TRUE, TRUE),
('wali.3A.KHALIF ZAKY ARRAFIF', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KHALIF ZAKY ARRAFIF', '3A', '3A', 'KHALIF ZAKY ARRAFIF', 'KHALIF ZAKY ARRAFIF', TRUE, TRUE),
('wali.3A.KHAYLA ALESHA NISMARA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KHAYLA ALESHA NISMARA', '3A', '3A', 'KHAYLA ALESHA NISMARA', 'KHAYLA ALESHA NISMARA', TRUE, TRUE),
('wali.3A.MARWA KHAIRUNNISA AZAHRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MARWA KHAIRUNNISA AZAHRA', '3A', '3A', 'MARWA KHAIRUNNISA AZAHRA', 'MARWA KHAIRUNNISA AZAHRA', TRUE, TRUE),
('wali.3A.MASHEL SAFA ARGANI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MASHEL SAFA ARGANI', '3A', '3A', 'MASHEL SAFA ARGANI', 'MASHEL SAFA ARGANI', TRUE, TRUE),
('wali.3A.MUHAMMAD ALFANDY JAVIER RASHDAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD ALFANDY JAVIER RASHDAN', '3A', '3A', 'MUHAMMAD ALFANDY JAVIER RASHDAN', 'MUHAMMAD ALFANDY JAVIER RASHDAN', TRUE, TRUE),
('wali.3A.MUHAMMAD FAHREZA SYAUQI YOGASARA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD FAHREZA SYAUQI YOGASARA', '3A', '3A', 'MUHAMMAD FAHREZA SYAUQI YOGASARA', 'MUHAMMAD FAHREZA SYAUQI YOGASARA', TRUE, TRUE),
('wali.3A.MUHAMMAD FIRDAUSI WIRDAS', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD FIRDAUSI WIRDAS', '3A', '3A', 'MUHAMMAD FIRDAUSI WIRDAS', 'MUHAMMAD FIRDAUSI WIRDAS', TRUE, TRUE),
('wali.3A.MUHAMMAD HISYAM ABDURRAHMAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD HISYAM ABDURRAHMAN', '3A', '3A', 'MUHAMMAD HISYAM ABDURRAHMAN', 'MUHAMMAD HISYAM ABDURRAHMAN', TRUE, TRUE),
('wali.3A.MUHAMMAD NARENDRA AKHTAR ELFARIS', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD NARENDRA AKHTAR ELFARIS', '3A', '3A', 'MUHAMMAD NARENDRA AKHTAR ELFARIS', 'MUHAMMAD NARENDRA AKHTAR ELFARIS', TRUE, TRUE),
('wali.3A.NADYA ALYSSA AZZAHRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NADYA ALYSSA AZZAHRA', '3A', '3A', 'NADYA ALYSSA AZZAHRA', 'NADYA ALYSSA AZZAHRA', TRUE, TRUE),
('wali.3A.NASHMIA SAVA ARDIYAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NASHMIA SAVA ARDIYAN', '3A', '3A', 'NASHMIA SAVA ARDIYAN', 'NASHMIA SAVA ARDIYAN', TRUE, TRUE),
('wali.3A.PAMETRIBUANA IKLILA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari PAMETRIBUANA IKLILA', '3A', '3A', 'PAMETRIBUANA IKLILA', 'PAMETRIBUANA IKLILA', TRUE, TRUE),
('wali.3A.RISANG JALU ARJUNA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RISANG JALU ARJUNA', '3A', '3A', 'RISANG JALU ARJUNA', 'RISANG JALU ARJUNA', TRUE, TRUE),
('wali.3A.SHAREEN MIKAYALA BRAVEI CALISTA WIBOWO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SHAREEN MIKAYALA BRAVEI CALISTA WIBOWO', '3A', '3A', 'SHAREEN MIKAYALA BRAVEI CALISTA WIBOWO', 'SHAREEN MIKAYALA BRAVEI CALISTA WIBOWO', TRUE, TRUE),
('wali.3A.SHAZFA SHAFANA HUMAIRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SHAZFA SHAFANA HUMAIRA', '3A', '3A', 'SHAZFA SHAFANA HUMAIRA', 'SHAZFA SHAFANA HUMAIRA', TRUE, TRUE),
('wali.3A.SYAUQI RAMADHAN ALFARIZI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SYAUQI RAMADHAN ALFARIZI', '3A', '3A', 'SYAUQI RAMADHAN ALFARIZI', 'SYAUQI RAMADHAN ALFARIZI', TRUE, TRUE),
('wali.3A.ZAFRAN RAFFA VENOVIAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ZAFRAN RAFFA VENOVIAN', '3A', '3A', 'ZAFRAN RAFFA VENOVIAN', 'ZAFRAN RAFFA VENOVIAN', TRUE, TRUE),
('wali.3A.ZAKIA NUR RACHMADHANI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ZAKIA NUR RACHMADHANI', '3A', '3A', 'ZAKIA NUR RACHMADHANI', 'ZAKIA NUR RACHMADHANI', TRUE, TRUE),
('wali.3B.AHMADA ZABARJAD MAULA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AHMADA ZABARJAD MAULA', '3B', '3B', 'AHMADA ZABARJAD MAULA', 'AHMADA ZABARJAD MAULA', TRUE, TRUE),
('wali.3B.ALKHALIFI SYAUQI ARDANY', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALKHALIFI SYAUQI ARDANY', '3B', '3B', 'ALKHALIFI SYAUQI ARDANY', 'ALKHALIFI SYAUQI ARDANY', TRUE, TRUE),
('wali.3B.ALZAM IBRAHIM AKBAR', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALZAM IBRAHIM AKBAR', '3B', '3B', 'ALZAM IBRAHIM AKBAR', 'ALZAM IBRAHIM AKBAR', TRUE, TRUE),
('wali.3B.ARSHAKA AQLAN VIRENDRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARSHAKA AQLAN VIRENDRA', '3B', '3B', 'ARSHAKA AQLAN VIRENDRA', 'ARSHAKA AQLAN VIRENDRA', TRUE, TRUE),
('wali.3B.AZAHRA ARSYILA LIOFANY', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AZAHRA ARSYILA LIOFANY', '3B', '3B', 'AZAHRA ARSYILA LIOFANY', 'AZAHRA ARSYILA LIOFANY', TRUE, TRUE),
('wali.3B.DHAFA VERDIANSYAH', 'salsabila3', 'salsabila3', 'wali', 'Wali dari DHAFA VERDIANSYAH', '3B', '3B', 'DHAFA VERDIANSYAH', 'DHAFA VERDIANSYAH', TRUE, TRUE),
('wali.3B.DINDA AYUDYA REANI SANJAYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari DINDA AYUDYA REANI SANJAYA', '3B', '3B', 'DINDA AYUDYA REANI SANJAYA', 'DINDA AYUDYA REANI SANJAYA', TRUE, TRUE),
('wali.3B.ELZAFI SHAKEILA FELLANI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ELZAFI SHAKEILA FELLANI', '3B', '3B', 'ELZAFI SHAKEILA FELLANI', 'ELZAFI SHAKEILA FELLANI', TRUE, TRUE),
('wali.3B.FADHILAH MUMTAZA PUTRI RAHMANTO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FADHILAH MUMTAZA PUTRI RAHMANTO', '3B', '3B', 'FADHILAH MUMTAZA PUTRI RAHMANTO', 'FADHILAH MUMTAZA PUTRI RAHMANTO', TRUE, TRUE),
('wali.3B.GIBRAN ZEIN EL-HAKIM', 'salsabila3', 'salsabila3', 'wali', 'Wali dari GIBRAN ZEIN EL-HAKIM', '3B', '3B', 'GIBRAN ZEIN EL-HAKIM', 'GIBRAN ZEIN EL-HAKIM', TRUE, TRUE),
('wali.3B.MARYAM ARSYILA WIJAYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MARYAM ARSYILA WIJAYA', '3B', '3B', 'MARYAM ARSYILA WIJAYA', 'MARYAM ARSYILA WIJAYA', TRUE, TRUE),
('wali.3B.MUHAMMAD AFNAN KHABIR', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD AFNAN KHABIR', '3B', '3B', 'MUHAMMAD AFNAN KHABIR', 'MUHAMMAD AFNAN KHABIR', TRUE, TRUE),
('wali.3B.MUHAMMAD ARZANKA ALKHALIFI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD ARZANKA ALKHALIFI', '3B', '3B', 'MUHAMMAD ARZANKA ALKHALIFI', 'MUHAMMAD ARZANKA ALKHALIFI', TRUE, TRUE),
('wali.3B.MUHAMMAD GHAISAN ABQARY IBRAHIM', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD GHAISAN ABQARY IBRAHIM', '3B', '3B', 'MUHAMMAD GHAISAN ABQARY IBRAHIM', 'MUHAMMAD GHAISAN ABQARY IBRAHIM', TRUE, TRUE),
('wali.3B.NAIRA AMY DIYANTO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NAIRA AMY DIYANTO', '3B', '3B', 'NAIRA AMY DIYANTO', 'NAIRA AMY DIYANTO', TRUE, TRUE),
('wali.3B.NAJLA SAQUEENA RIYANTO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NAJLA SAQUEENA RIYANTO', '3B', '3B', 'NAJLA SAQUEENA RIYANTO', 'NAJLA SAQUEENA RIYANTO', TRUE, TRUE),
('wali.3B.NAUFAL SAKHI BUONO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NAUFAL SAKHI BUONO', '3B', '3B', 'NAUFAL SAKHI BUONO', 'NAUFAL SAKHI BUONO', TRUE, TRUE),
('wali.3B.OMAR ABDILLAH ADNAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari OMAR ABDILLAH ADNAN', '3B', '3B', 'OMAR ABDILLAH ADNAN', 'OMAR ABDILLAH ADNAN', TRUE, TRUE),
('wali.3B.QUEENSHA KIRANA SALSABILA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari QUEENSHA KIRANA SALSABILA', '3B', '3B', 'QUEENSHA KIRANA SALSABILA', 'QUEENSHA KIRANA SALSABILA', TRUE, TRUE),
('wali.3B.RAFFA ZHAFRAN PUTRA ARDIYANTO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RAFFA ZHAFRAN PUTRA ARDIYANTO', '3B', '3B', 'RAFFA ZHAFRAN PUTRA ARDIYANTO', 'RAFFA ZHAFRAN PUTRA ARDIYANTO', TRUE, TRUE),
('wali.3B.REFAN ARINDRA WIRATAMA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari REFAN ARINDRA WIRATAMA', '3B', '3B', 'REFAN ARINDRA WIRATAMA', 'REFAN ARINDRA WIRATAMA', TRUE, TRUE),
('wali.3B.SALMAN AL GHOZALI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SALMAN AL GHOZALI', '3B', '3B', 'SALMAN AL GHOZALI', 'SALMAN AL GHOZALI', TRUE, TRUE),
('wali.3B.SHAFIYYAH HASNA HAMIDAH', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SHAFIYYAH HASNA HAMIDAH', '3B', '3B', 'SHAFIYYAH HASNA HAMIDAH', 'SHAFIYYAH HASNA HAMIDAH', TRUE, TRUE),
('wali.3B.TAVISHA DELVINAMORA ALFIYYAH', 'salsabila3', 'salsabila3', 'wali', 'Wali dari TAVISHA DELVINAMORA ALFIYYAH', '3B', '3B', 'TAVISHA DELVINAMORA ALFIYYAH', 'TAVISHA DELVINAMORA ALFIYYAH', TRUE, TRUE),
('wali.3B.UWAIS SAKHI ATHARYA RAMADHI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari UWAIS SAKHI ATHARYA RAMADHI', '3B', '3B', 'UWAIS SAKHI ATHARYA RAMADHI', 'UWAIS SAKHI ATHARYA RAMADHI', TRUE, TRUE),
('wali.3B.ZAHWA HUMAIRA AL HANIF', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ZAHWA HUMAIRA AL HANIF', '3B', '3B', 'ZAHWA HUMAIRA AL HANIF', 'ZAHWA HUMAIRA AL HANIF', TRUE, TRUE),
('wali.3B.ZEA MALAIKA HASNA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ZEA MALAIKA HASNA', '3B', '3B', 'ZEA MALAIKA HASNA', 'ZEA MALAIKA HASNA', TRUE, TRUE),
('wali.3C.AIRA IHDA HUSNAYAIN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AIRA IHDA HUSNAYAIN', '3C', '3C', 'AIRA IHDA HUSNAYAIN', 'AIRA IHDA HUSNAYAIN', TRUE, TRUE),
('wali.3C.ALMEERA JEHAN AZKADINA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALMEERA JEHAN AZKADINA', '3C', '3C', 'ALMEERA JEHAN AZKADINA', 'ALMEERA JEHAN AZKADINA', TRUE, TRUE),
('wali.3C.ALVARENDRA ACHMAD PUTRA ATMAJA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALVARENDRA ACHMAD PUTRA ATMAJA', '3C', '3C', 'ALVARENDRA ACHMAD PUTRA ATMAJA', 'ALVARENDRA ACHMAD PUTRA ATMAJA', TRUE, TRUE),
('wali.3C.ANISA ARSI NUR RAMADHANI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ANISA ARSI NUR RAMADHANI', '3C', '3C', 'ANISA ARSI NUR RAMADHANI', 'ANISA ARSI NUR RAMADHANI', TRUE, TRUE),
('wali.3C.ARFADHIA ALIF HERDIAWAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARFADHIA ALIF HERDIAWAN', '3C', '3C', 'ARFADHIA ALIF HERDIAWAN', 'ARFADHIA ALIF HERDIAWAN', TRUE, TRUE),
('wali.3C.ARSYFA RIZKY RAMADANI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARSYFA RIZKY RAMADANI', '3C', '3C', 'ARSYFA RIZKY RAMADANI', 'ARSYFA RIZKY RAMADANI', TRUE, TRUE),
('wali.3C.ASYIFA HASNA KHAIRUNNISA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ASYIFA HASNA KHAIRUNNISA', '3C', '3C', 'ASYIFA HASNA KHAIRUNNISA', 'ASYIFA HASNA KHAIRUNNISA', TRUE, TRUE),
('wali.3C.AZKADINA KIRANA SWADITRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AZKADINA KIRANA SWADITRA', '3C', '3C', 'AZKADINA KIRANA SWADITRA', 'AZKADINA KIRANA SWADITRA', TRUE, TRUE),
('wali.3C.FAHREZA AHNAF FATONI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FAHREZA AHNAF FATONI', '3C', '3C', 'FAHREZA AHNAF FATONI', 'FAHREZA AHNAF FATONI', TRUE, TRUE),
('wali.3C.FATIHA KHUMAIRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FATIHA KHUMAIRA', '3C', '3C', 'FATIHA KHUMAIRA', 'FATIHA KHUMAIRA', TRUE, TRUE),
('wali.3C.HUMAIRA PRAMESTI SULAKSONO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari HUMAIRA PRAMESTI SULAKSONO', '3C', '3C', 'HUMAIRA PRAMESTI SULAKSONO', 'HUMAIRA PRAMESTI SULAKSONO', TRUE, TRUE),
('wali.3C.KENZO SHIFAN ADRIYANTO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KENZO SHIFAN ADRIYANTO', '3C', '3C', 'KENZO SHIFAN ADRIYANTO', 'KENZO SHIFAN ADRIYANTO', TRUE, TRUE),
('wali.3C.KINANTI ATHALLAH MAHYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KINANTI ATHALLAH MAHYA', '3C', '3C', 'KINANTI ATHALLAH MAHYA', 'KINANTI ATHALLAH MAHYA', TRUE, TRUE),
('wali.3C.MALIQ ZHAFRAN ALFAREZEL', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MALIQ ZHAFRAN ALFAREZEL', '3C', '3C', 'MALIQ ZHAFRAN ALFAREZEL', 'MALIQ ZHAFRAN ALFAREZEL', TRUE, TRUE),
('wali.3C.MUHAMMAD ABRAR ABQORY QADDAFA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD ABRAR ABQORY QADDAFA', '3C', '3C', 'MUHAMMAD ABRAR ABQORY QADDAFA', 'MUHAMMAD ABRAR ABQORY QADDAFA', TRUE, TRUE),
('wali.3C.MUHAMMAD ALARIC AZZAHIDA AHZA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD ALARIC AZZAHIDA AHZA', '3C', '3C', 'MUHAMMAD ALARIC AZZAHIDA AHZA', 'MUHAMMAD ALARIC AZZAHIDA AHZA', TRUE, TRUE),
('wali.3C.MUHAMMAD REHAN EVANDRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD REHAN EVANDRA', '3C', '3C', 'MUHAMMAD REHAN EVANDRA', 'MUHAMMAD REHAN EVANDRA', TRUE, TRUE),
('wali.3C.NABHAN AKBAR DEMETRIO AL HAMIDI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NABHAN AKBAR DEMETRIO AL HAMIDI', '3C', '3C', 'NABHAN AKBAR DEMETRIO AL HAMIDI', 'NABHAN AKBAR DEMETRIO AL HAMIDI', TRUE, TRUE),
('wali.3C.NADIA QIYYAMA AZKADINA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NADIA QIYYAMA AZKADINA', '3C', '3C', 'NADIA QIYYAMA AZKADINA', 'NADIA QIYYAMA AZKADINA', TRUE, TRUE),
('wali.3C.RASYID AL KHALIQ ANWAR', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RASYID AL KHALIQ ANWAR', '3C', '3C', 'RASYID AL KHALIQ ANWAR', 'RASYID AL KHALIQ ANWAR', TRUE, TRUE),
('wali.3C.RYOSUKE DIPA SEMESTA AL-ROSYID', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RYOSUKE DIPA SEMESTA AL-ROSYID', '3C', '3C', 'RYOSUKE DIPA SEMESTA AL-ROSYID', 'RYOSUKE DIPA SEMESTA AL-ROSYID', TRUE, TRUE),
('wali.3C.SHASMIRA NADIA ALFATHUNISSA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SHASMIRA NADIA ALFATHUNISSA', '3C', '3C', 'SHASMIRA NADIA ALFATHUNISSA', 'SHASMIRA NADIA ALFATHUNISSA', TRUE, TRUE),
('wali.3C.SOFIA AZRA ANINDITA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SOFIA AZRA ANINDITA', '3C', '3C', 'SOFIA AZRA ANINDITA', 'SOFIA AZRA ANINDITA', TRUE, TRUE),
('wali.3C.SUNNYDEPATHA GIE', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SUNNYDEPATHA GIE', '3C', '3C', 'SUNNYDEPATHA GIE', 'SUNNYDEPATHA GIE', TRUE, TRUE),
('wali.3C.TANGELY IZZATU ILAHY', 'salsabila3', 'salsabila3', 'wali', 'Wali dari TANGELY IZZATU ILAHY', '3C', '3C', 'TANGELY IZZATU ILAHY', 'TANGELY IZZATU ILAHY', TRUE, TRUE),
('wali.3C.VIRENDRA ARYA PRATAMA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari VIRENDRA ARYA PRATAMA', '3C', '3C', 'VIRENDRA ARYA PRATAMA', 'VIRENDRA ARYA PRATAMA', TRUE, TRUE),
('wali.3C.ZAIDAN RAFFASYA AL ATHAYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ZAIDAN RAFFASYA AL ATHAYA', '3C', '3C', 'ZAIDAN RAFFASYA AL ATHAYA', 'ZAIDAN RAFFASYA AL ATHAYA', TRUE, TRUE),
('wali.3C.ZZAHRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ZZAHRA', '3C', '3C', 'ZZAHRA', 'ZZAHRA', TRUE, TRUE),
('wali.4A.ABISTA RETHA DARMAWAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ABISTA RETHA DARMAWAN', '4A', '4A', 'ABISTA RETHA DARMAWAN', 'ABISTA RETHA DARMAWAN', TRUE, TRUE),
('wali.4A.ABYZAM HARYO WANGSAPUTRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ABYZAM HARYO WANGSAPUTRA', '4A', '4A', 'ABYZAM HARYO WANGSAPUTRA', 'ABYZAM HARYO WANGSAPUTRA', TRUE, TRUE),
('wali.4A.ADINDA DWI NURAINI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ADINDA DWI NURAINI', '4A', '4A', 'ADINDA DWI NURAINI', 'ADINDA DWI NURAINI', TRUE, TRUE),
('wali.4A.AHMAD AIMAN GHOZI SULTHONY', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AHMAD AIMAN GHOZI SULTHONY', '4A', '4A', 'AHMAD AIMAN GHOZI SULTHONY', 'AHMAD AIMAN GHOZI SULTHONY', TRUE, TRUE),
('wali.4A.AHMAD FARIS MAULANA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AHMAD FARIS MAULANA', '4A', '4A', 'AHMAD FARIS MAULANA', 'AHMAD FARIS MAULANA', TRUE, TRUE),
('wali.4A.AISHAINA MAISARA PRIMAWAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AISHAINA MAISARA PRIMAWAN', '4A', '4A', 'AISHAINA MAISARA PRIMAWAN', 'AISHAINA MAISARA PRIMAWAN', TRUE, TRUE),
('wali.4A.ATHALLA RAKHA DWITAMA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ATHALLA RAKHA DWITAMA', '4A', '4A', 'ATHALLA RAKHA DWITAMA', 'ATHALLA RAKHA DWITAMA', TRUE, TRUE),
('wali.4A.AZIZAH NUR LATHIFAH', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AZIZAH NUR LATHIFAH', '4A', '4A', 'AZIZAH NUR LATHIFAH', 'AZIZAH NUR LATHIFAH', TRUE, TRUE),
('wali.4A.BIMA ARIZONA PRAMONO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari BIMA ARIZONA PRAMONO', '4A', '4A', 'BIMA ARIZONA PRAMONO', 'BIMA ARIZONA PRAMONO', TRUE, TRUE),
('wali.4A.DHANENDRA DAYA ARKHANA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari DHANENDRA DAYA ARKHANA', '4A', '4A', 'DHANENDRA DAYA ARKHANA', 'DHANENDRA DAYA ARKHANA', TRUE, TRUE),
('wali.4A.FATIH ZULFADLI SYABANI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FATIH ZULFADLI SYABANI', '4A', '4A', 'FATIH ZULFADLI SYABANI', 'FATIH ZULFADLI SYABANI', TRUE, TRUE),
('wali.4A.FATIMAH HANNAN AZ-ZAHRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FATIMAH HANNAN AZ-ZAHRA', '4A', '4A', 'FATIMAH HANNAN AZ-ZAHRA', 'FATIMAH HANNAN AZ-ZAHRA', TRUE, TRUE),
('wali.4A.HANUM SHALIHA KHOIRUNNISA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari HANUM SHALIHA KHOIRUNNISA', '4A', '4A', 'HANUM SHALIHA KHOIRUNNISA', 'HANUM SHALIHA KHOIRUNNISA', TRUE, TRUE),
('wali.4A.KAISA FAYYOLA HERGUNA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KAISA FAYYOLA HERGUNA', '4A', '4A', 'KAISA FAYYOLA HERGUNA', 'KAISA FAYYOLA HERGUNA', TRUE, TRUE),
('wali.4A.KENZIE ATHALLA ZIGGY PUTRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KENZIE ATHALLA ZIGGY PUTRA', '4A', '4A', 'KENZIE ATHALLA ZIGGY PUTRA', 'KENZIE ATHALLA ZIGGY PUTRA', TRUE, TRUE),
('wali.4A.KYARA ARSYAQILA SHEZA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KYARA ARSYAQILA SHEZA', '4A', '4A', 'KYARA ARSYAQILA SHEZA', 'KYARA ARSYAQILA SHEZA', TRUE, TRUE),
('wali.4A.MARYAM TAZKIYATUNNISA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MARYAM TAZKIYATUNNISA', '4A', '4A', 'MARYAM TAZKIYATUNNISA', 'MARYAM TAZKIYATUNNISA', TRUE, TRUE),
('wali.4A.MEHRUNISA ARSYFA PUTRI RENDRYANA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MEHRUNISA ARSYFA PUTRI RENDRYANA', '4A', '4A', 'MEHRUNISA ARSYFA PUTRI RENDRYANA', 'MEHRUNISA ARSYFA PUTRI RENDRYANA', TRUE, TRUE),
('wali.4A.MEYNANDA PUTRI RAMADHINA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MEYNANDA PUTRI RAMADHINA', '4A', '4A', 'MEYNANDA PUTRI RAMADHINA', 'MEYNANDA PUTRI RAMADHINA', TRUE, TRUE),
('wali.4A.MUHAMMAD DANISH ALARIC', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD DANISH ALARIC', '4A', '4A', 'MUHAMMAD DANISH ALARIC', 'MUHAMMAD DANISH ALARIC', TRUE, TRUE),
('wali.4A.MUHAMMAD KHALIFA AULIA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD KHALIFA AULIA', '4A', '4A', 'MUHAMMAD KHALIFA AULIA', 'MUHAMMAD KHALIFA AULIA', TRUE, TRUE),
('wali.4A.NAJMA LUTHFIYA AL ALIYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NAJMA LUTHFIYA AL ALIYA', '4A', '4A', 'NAJMA LUTHFIYA AL ALIYA', 'NAJMA LUTHFIYA AL ALIYA', TRUE, TRUE),
('wali.4A.QIANA PUTRI ANINDITA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari QIANA PUTRI ANINDITA', '4A', '4A', 'QIANA PUTRI ANINDITA', 'QIANA PUTRI ANINDITA', TRUE, TRUE),
('wali.4A.RAFFAZA RAJENDRA EL HASIQ', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RAFFAZA RAJENDRA EL HASIQ', '4A', '4A', 'RAFFAZA RAJENDRA EL HASIQ', 'RAFFAZA RAJENDRA EL HASIQ', TRUE, TRUE),
('wali.4A.SARA NUH SHANNON', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SARA NUH SHANNON', '4A', '4A', 'SARA NUH SHANNON', 'SARA NUH SHANNON', TRUE, TRUE)
ON CONFLICT (username) DO NOTHING;


INSERT INTO auth_accounts (username, password_hash, "passwordHash", role, name, class_id, "classId", student_name, "studentName", first_login, "firstLogin") VALUES
('wali.4A.VIOLETA PERMATA AOZORA PRASETYO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari VIOLETA PERMATA AOZORA PRASETYO', '4A', '4A', 'VIOLETA PERMATA AOZORA PRASETYO', 'VIOLETA PERMATA AOZORA PRASETYO', TRUE, TRUE),
('wali.4B.ABHIMANYU RAMDHAN PUTRA BANIANTORO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ABHIMANYU RAMDHAN PUTRA BANIANTORO', '4B', '4B', 'ABHIMANYU RAMDHAN PUTRA BANIANTORO', 'ABHIMANYU RAMDHAN PUTRA BANIANTORO', TRUE, TRUE),
('wali.4B.ABINAYA RAKA ARFADHIA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ABINAYA RAKA ARFADHIA', '4B', '4B', 'ABINAYA RAKA ARFADHIA', 'ABINAYA RAKA ARFADHIA', TRUE, TRUE),
('wali.4B.ACHMAD HAMZAH AL ROBANI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ACHMAD HAMZAH AL ROBANI', '4B', '4B', 'ACHMAD HAMZAH AL ROBANI', 'ACHMAD HAMZAH AL ROBANI', TRUE, TRUE),
('wali.4B.AHMAD HAMIZAN AHZA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AHMAD HAMIZAN AHZA', '4B', '4B', 'AHMAD HAMIZAN AHZA', 'AHMAD HAMIZAN AHZA', TRUE, TRUE),
('wali.4B.AISHA ZAADA IMAANA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AISHA ZAADA IMAANA', '4B', '4B', 'AISHA ZAADA IMAANA', 'AISHA ZAADA IMAANA', TRUE, TRUE),
('wali.4B.ALESHA AVIOLA SHIDQIA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALESHA AVIOLA SHIDQIA', '4B', '4B', 'ALESHA AVIOLA SHIDQIA', 'ALESHA AVIOLA SHIDQIA', TRUE, TRUE),
('wali.4B.ARETA ZEA KHAIRINA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARETA ZEA KHAIRINA', '4B', '4B', 'ARETA ZEA KHAIRINA', 'ARETA ZEA KHAIRINA', TRUE, TRUE),
('wali.4B.ATHAYA KIRANA KANEISHIA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ATHAYA KIRANA KANEISHIA', '4B', '4B', 'ATHAYA KIRANA KANEISHIA', 'ATHAYA KIRANA KANEISHIA', TRUE, TRUE),
('wali.4B.AZRINA NAHLA YUMNA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AZRINA NAHLA YUMNA', '4B', '4B', 'AZRINA NAHLA YUMNA', 'AZRINA NAHLA YUMNA', TRUE, TRUE),
('wali.4B.BRIGAS RAGIL PARADUTA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari BRIGAS RAGIL PARADUTA', '4B', '4B', 'BRIGAS RAGIL PARADUTA', 'BRIGAS RAGIL PARADUTA', TRUE, TRUE),
('wali.4B.CHIKA AMELIA SHEZA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari CHIKA AMELIA SHEZA', '4B', '4B', 'CHIKA AMELIA SHEZA', 'CHIKA AMELIA SHEZA', TRUE, TRUE),
('wali.4B.DAYYAN ALFAREZEL', 'salsabila3', 'salsabila3', 'wali', 'Wali dari DAYYAN ALFAREZEL', '4B', '4B', 'DAYYAN ALFAREZEL', 'DAYYAN ALFAREZEL', TRUE, TRUE),
('wali.4B.FARZANA SYAFAQ NISMARA PRABOWO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FARZANA SYAFAQ NISMARA PRABOWO', '4B', '4B', 'FARZANA SYAFAQ NISMARA PRABOWO', 'FARZANA SYAFAQ NISMARA PRABOWO', TRUE, TRUE),
('wali.4B.HAMDAN AHMAD RAZIQIN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari HAMDAN AHMAD RAZIQIN', '4B', '4B', 'HAMDAN AHMAD RAZIQIN', 'HAMDAN AHMAD RAZIQIN', TRUE, TRUE),
('wali.4B.JAVIER RAUF AL-FUKHOHA PUTRA SAFA''AT', 'salsabila3', 'salsabila3', 'wali', 'Wali dari JAVIER RAUF AL-FUKHOHA PUTRA SAFA''AT', '4B', '4B', 'JAVIER RAUF AL-FUKHOHA PUTRA SAFA''AT', 'JAVIER RAUF AL-FUKHOHA PUTRA SAFA''AT', TRUE, TRUE),
('wali.4B.KHADIJAH HUSNA HANANIA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KHADIJAH HUSNA HANANIA', '4B', '4B', 'KHADIJAH HUSNA HANANIA', 'KHADIJAH HUSNA HANANIA', TRUE, TRUE),
('wali.4B.MAHESTRI ARETA PRABASWARA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MAHESTRI ARETA PRABASWARA', '4B', '4B', 'MAHESTRI ARETA PRABASWARA', 'MAHESTRI ARETA PRABASWARA', TRUE, TRUE),
('wali.4B.MIKHAILA AGASTIA RIZQIA HAPSARI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MIKHAILA AGASTIA RIZQIA HAPSARI', '4B', '4B', 'MIKHAILA AGASTIA RIZQIA HAPSARI', 'MIKHAILA AGASTIA RIZQIA HAPSARI', TRUE, TRUE),
('wali.4B.MUHAMMAD ARSYAD SYAHPUTRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD ARSYAD SYAHPUTRA', '4B', '4B', 'MUHAMMAD ARSYAD SYAHPUTRA', 'MUHAMMAD ARSYAD SYAHPUTRA', TRUE, TRUE),
('wali.4B.MUHAMMAD SAKHA NUR FATIH', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD SAKHA NUR FATIH', '4B', '4B', 'MUHAMMAD SAKHA NUR FATIH', 'MUHAMMAD SAKHA NUR FATIH', TRUE, TRUE),
('wali.4B.NATHANIA ALTHEZZA HARSANA PUTRI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NATHANIA ALTHEZZA HARSANA PUTRI', '4B', '4B', 'NATHANIA ALTHEZZA HARSANA PUTRI', 'NATHANIA ALTHEZZA HARSANA PUTRI', TRUE, TRUE),
('wali.4B.NIEDIAZCHA ARSENIO ASYRAAF', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NIEDIAZCHA ARSENIO ASYRAAF', '4B', '4B', 'NIEDIAZCHA ARSENIO ASYRAAF', 'NIEDIAZCHA ARSENIO ASYRAAF', TRUE, TRUE),
('wali.4B.RAFIF HAIDAR NADHIFA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RAFIF HAIDAR NADHIFA', '4B', '4B', 'RAFIF HAIDAR NADHIFA', 'RAFIF HAIDAR NADHIFA', TRUE, TRUE),
('wali.4B.ROBI ERIZALLY RAFFASYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ROBI ERIZALLY RAFFASYA', '4B', '4B', 'ROBI ERIZALLY RAFFASYA', 'ROBI ERIZALLY RAFFASYA', TRUE, TRUE),
('wali.4B.TRIMATRA ZAIN ADAM', 'salsabila3', 'salsabila3', 'wali', 'Wali dari TRIMATRA ZAIN ADAM', '4B', '4B', 'TRIMATRA ZAIN ADAM', 'TRIMATRA ZAIN ADAM', TRUE, TRUE),
('wali.4B.ZHAFIRA QIRANIA PUTRI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ZHAFIRA QIRANIA PUTRI', '4B', '4B', 'ZHAFIRA QIRANIA PUTRI', 'ZHAFIRA QIRANIA PUTRI', TRUE, TRUE),
('wali.4C.ABDURRAHMAN ILYAS ALGHIFARI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ABDURRAHMAN ILYAS ALGHIFARI', '4C', '4C', 'ABDURRAHMAN ILYAS ALGHIFARI', 'ABDURRAHMAN ILYAS ALGHIFARI', TRUE, TRUE),
('wali.4C.ADEEVA QUEENARA FASHA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ADEEVA QUEENARA FASHA', '4C', '4C', 'ADEEVA QUEENARA FASHA', 'ADEEVA QUEENARA FASHA', TRUE, TRUE),
('wali.4C.ADIBA UFAIRAH ATHARI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ADIBA UFAIRAH ATHARI', '4C', '4C', 'ADIBA UFAIRAH ATHARI', 'ADIBA UFAIRAH ATHARI', TRUE, TRUE),
('wali.4C.AHMAD ZAKIR FAWAID', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AHMAD ZAKIR FAWAID', '4C', '4C', 'AHMAD ZAKIR FAWAID', 'AHMAD ZAKIR FAWAID', TRUE, TRUE),
('wali.4C.AKBAR FARENDRA ATMAJA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AKBAR FARENDRA ATMAJA', '4C', '4C', 'AKBAR FARENDRA ATMAJA', 'AKBAR FARENDRA ATMAJA', TRUE, TRUE),
('wali.4C.AKBAR ZIGGY SAVERIO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AKBAR ZIGGY SAVERIO', '4C', '4C', 'AKBAR ZIGGY SAVERIO', 'AKBAR ZIGGY SAVERIO', TRUE, TRUE),
('wali.4C.ALEXI PUTRA RAHMAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALEXI PUTRA RAHMAN', '4C', '4C', 'ALEXI PUTRA RAHMAN', 'ALEXI PUTRA RAHMAN', TRUE, TRUE),
('wali.4C.ALIKA ZAFIRA AKEYLA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALIKA ZAFIRA AKEYLA', '4C', '4C', 'ALIKA ZAFIRA AKEYLA', 'ALIKA ZAFIRA AKEYLA', TRUE, TRUE),
('wali.4C.ALISHA FARADIBA WINDARTO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALISHA FARADIBA WINDARTO', '4C', '4C', 'ALISHA FARADIBA WINDARTO', 'ALISHA FARADIBA WINDARTO', TRUE, TRUE),
('wali.4C.ARSYILA RANIA FARZANI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARSYILA RANIA FARZANI', '4C', '4C', 'ARSYILA RANIA FARZANI', 'ARSYILA RANIA FARZANI', TRUE, TRUE),
('wali.4C.BRISHA NAILA VALERIE', 'salsabila3', 'salsabila3', 'wali', 'Wali dari BRISHA NAILA VALERIE', '4C', '4C', 'BRISHA NAILA VALERIE', 'BRISHA NAILA VALERIE', TRUE, TRUE),
('wali.4C.DIMAS SAMIL FALAH', 'salsabila3', 'salsabila3', 'wali', 'Wali dari DIMAS SAMIL FALAH', '4C', '4C', 'DIMAS SAMIL FALAH', 'DIMAS SAMIL FALAH', TRUE, TRUE),
('wali.4C.DZIKRIFFA HUSNA PERMANA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari DZIKRIFFA HUSNA PERMANA', '4C', '4C', 'DZIKRIFFA HUSNA PERMANA', 'DZIKRIFFA HUSNA PERMANA', TRUE, TRUE),
('wali.4C.FAIRUZ ATHARIZZ AL FAHRI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FAIRUZ ATHARIZZ AL FAHRI', '4C', '4C', 'FAIRUZ ATHARIZZ AL FAHRI', 'FAIRUZ ATHARIZZ AL FAHRI', TRUE, TRUE),
('wali.4C.GENTA TYAGA ARYASATYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari GENTA TYAGA ARYASATYA', '4C', '4C', 'GENTA TYAGA ARYASATYA', 'GENTA TYAGA ARYASATYA', TRUE, TRUE),
('wali.4C.HAZLAM ABDULLAH ALDRIC', 'salsabila3', 'salsabila3', 'wali', 'Wali dari HAZLAM ABDULLAH ALDRIC', '4C', '4C', 'HAZLAM ABDULLAH ALDRIC', 'HAZLAM ABDULLAH ALDRIC', TRUE, TRUE),
('wali.4C.JENNAHARA AMEERA ARSYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari JENNAHARA AMEERA ARSYA', '4C', '4C', 'JENNAHARA AMEERA ARSYA', 'JENNAHARA AMEERA ARSYA', TRUE, TRUE),
('wali.4C.LITUHAYU CANTYA ANJANI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari LITUHAYU CANTYA ANJANI', '4C', '4C', 'LITUHAYU CANTYA ANJANI', 'LITUHAYU CANTYA ANJANI', TRUE, TRUE),
('wali.4C.MAHESWARI NAJWA GEMILANG', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MAHESWARI NAJWA GEMILANG', '4C', '4C', 'MAHESWARI NAJWA GEMILANG', 'MAHESWARI NAJWA GEMILANG', TRUE, TRUE),
('wali.4C.MUHAMMAD ABYAZ BRYATTA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD ABYAZ BRYATTA', '4C', '4C', 'MUHAMMAD ABYAZ BRYATTA', 'MUHAMMAD ABYAZ BRYATTA', TRUE, TRUE),
('wali.4C.MUHAMMAD TSAAQIB ANANDYFA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD TSAAQIB ANANDYFA', '4C', '4C', 'MUHAMMAD TSAAQIB ANANDYFA', 'MUHAMMAD TSAAQIB ANANDYFA', TRUE, TRUE),
('wali.4C.NATHANIA NAVI PRAMESTI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NATHANIA NAVI PRAMESTI', '4C', '4C', 'NATHANIA NAVI PRAMESTI', 'NATHANIA NAVI PRAMESTI', TRUE, TRUE),
('wali.4C.NAUFAL AZKA MAULANA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NAUFAL AZKA MAULANA', '4C', '4C', 'NAUFAL AZKA MAULANA', 'NAUFAL AZKA MAULANA', TRUE, TRUE),
('wali.4C.RAFIQ HAIKAL ATHARIZ ALFARIZKI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RAFIQ HAIKAL ATHARIZ ALFARIZKI', '4C', '4C', 'RAFIQ HAIKAL ATHARIZ ALFARIZKI', 'RAFIQ HAIKAL ATHARIZ ALFARIZKI', TRUE, TRUE),
('wali.4C.REYNAND ARKANA BOREALIS', 'salsabila3', 'salsabila3', 'wali', 'Wali dari REYNAND ARKANA BOREALIS', '4C', '4C', 'REYNAND ARKANA BOREALIS', 'REYNAND ARKANA BOREALIS', TRUE, TRUE),
('wali.4C.SAFIYA AZZAHRA MAHARANI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SAFIYA AZZAHRA MAHARANI', '4C', '4C', 'SAFIYA AZZAHRA MAHARANI', 'SAFIYA AZZAHRA MAHARANI', TRUE, TRUE),
('wali.4C.SYBILLA SHANUM MIKHAYLA HAKIM', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SYBILLA SHANUM MIKHAYLA HAKIM', '4C', '4C', 'SYBILLA SHANUM MIKHAYLA HAKIM', 'SYBILLA SHANUM MIKHAYLA HAKIM', TRUE, TRUE),
('wali.5A.ADIBAH ADINE GELIS', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ADIBAH ADINE GELIS', '5A', '5A', 'ADIBAH ADINE GELIS', 'ADIBAH ADINE GELIS', TRUE, TRUE),
('wali.5A.ALMAHYRA TSAQIFA RIGENILA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALMAHYRA TSAQIFA RIGENILA', '5A', '5A', 'ALMAHYRA TSAQIFA RIGENILA', 'ALMAHYRA TSAQIFA RIGENILA', TRUE, TRUE),
('wali.5A.ALTHAFAIREL CHALIF VELKYO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALTHAFAIREL CHALIF VELKYO', '5A', '5A', 'ALTHAFAIREL CHALIF VELKYO', 'ALTHAFAIREL CHALIF VELKYO', TRUE, TRUE),
('wali.5A.ANNISA FADILATU ROHMAH', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ANNISA FADILATU ROHMAH', '5A', '5A', 'ANNISA FADILATU ROHMAH', 'ANNISA FADILATU ROHMAH', TRUE, TRUE),
('wali.5A.AZKA ALMIRA SALSABILA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AZKA ALMIRA SALSABILA', '5A', '5A', 'AZKA ALMIRA SALSABILA', 'AZKA ALMIRA SALSABILA', TRUE, TRUE),
('wali.5A.BRAMASTA SURYA PRADANA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari BRAMASTA SURYA PRADANA', '5A', '5A', 'BRAMASTA SURYA PRADANA', 'BRAMASTA SURYA PRADANA', TRUE, TRUE),
('wali.5A.CHYNTA ZHAFIRAH YUWILOV', 'salsabila3', 'salsabila3', 'wali', 'Wali dari CHYNTA ZHAFIRAH YUWILOV', '5A', '5A', 'CHYNTA ZHAFIRAH YUWILOV', 'CHYNTA ZHAFIRAH YUWILOV', TRUE, TRUE),
('wali.5A.DANREINVA ZINDA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari DANREINVA ZINDA', '5A', '5A', 'DANREINVA ZINDA', 'DANREINVA ZINDA', TRUE, TRUE),
('wali.5A.DZIKRA SYUKRIYA BAIQUNI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari DZIKRA SYUKRIYA BAIQUNI', '5A', '5A', 'DZIKRA SYUKRIYA BAIQUNI', 'DZIKRA SYUKRIYA BAIQUNI', TRUE, TRUE),
('wali.5A.FATAH FILLIO RIKZA WIBOWO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FATAH FILLIO RIKZA WIBOWO', '5A', '5A', 'FATAH FILLIO RIKZA WIBOWO', 'FATAH FILLIO RIKZA WIBOWO', TRUE, TRUE),
('wali.5A.HIKARI AGRA AKSA ABIMANYU', 'salsabila3', 'salsabila3', 'wali', 'Wali dari HIKARI AGRA AKSA ABIMANYU', '5A', '5A', 'HIKARI AGRA AKSA ABIMANYU', 'HIKARI AGRA AKSA ABIMANYU', TRUE, TRUE),
('wali.5A.ILMIRA SABRIA HUMAIRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ILMIRA SABRIA HUMAIRA', '5A', '5A', 'ILMIRA SABRIA HUMAIRA', 'ILMIRA SABRIA HUMAIRA', TRUE, TRUE),
('wali.5A.KEENAR SARALEE ALIYAMURTI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KEENAR SARALEE ALIYAMURTI', '5A', '5A', 'KEENAR SARALEE ALIYAMURTI', 'KEENAR SARALEE ALIYAMURTI', TRUE, TRUE),
('wali.5A.LUBNA SILMI KAFFAH', 'salsabila3', 'salsabila3', 'wali', 'Wali dari LUBNA SILMI KAFFAH', '5A', '5A', 'LUBNA SILMI KAFFAH', 'LUBNA SILMI KAFFAH', TRUE, TRUE),
('wali.5A.MILVA ALMAHYRA SHANUM', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MILVA ALMAHYRA SHANUM', '5A', '5A', 'MILVA ALMAHYRA SHANUM', 'MILVA ALMAHYRA SHANUM', TRUE, TRUE),
('wali.5A.MUHAMMAD ARSYAD HAFIZH SAPUTRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD ARSYAD HAFIZH SAPUTRA', '5A', '5A', 'MUHAMMAD ARSYAD HAFIZH SAPUTRA', 'MUHAMMAD ARSYAD HAFIZH SAPUTRA', TRUE, TRUE),
('wali.5A.MUHAMMAD KAFA BILLAH', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD KAFA BILLAH', '5A', '5A', 'MUHAMMAD KAFA BILLAH', 'MUHAMMAD KAFA BILLAH', TRUE, TRUE),
('wali.5A.NAQIYYAH FUDHLA AULIA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NAQIYYAH FUDHLA AULIA', '5A', '5A', 'NAQIYYAH FUDHLA AULIA', 'NAQIYYAH FUDHLA AULIA', TRUE, TRUE),
('wali.5A.PRADIPTA ABID AMZARI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari PRADIPTA ABID AMZARI', '5A', '5A', 'PRADIPTA ABID AMZARI', 'PRADIPTA ABID AMZARI', TRUE, TRUE),
('wali.5A.PRINGGA ANJAYA SETIYAWAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari PRINGGA ANJAYA SETIYAWAN', '5A', '5A', 'PRINGGA ANJAYA SETIYAWAN', 'PRINGGA ANJAYA SETIYAWAN', TRUE, TRUE),
('wali.5A.RIDZKY BINTANG RAMADHAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RIDZKY BINTANG RAMADHAN', '5A', '5A', 'RIDZKY BINTANG RAMADHAN', 'RIDZKY BINTANG RAMADHAN', TRUE, TRUE),
('wali.5A.SULTAN MUHAMMAD AL FATIH', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SULTAN MUHAMMAD AL FATIH', '5A', '5A', 'SULTAN MUHAMMAD AL FATIH', 'SULTAN MUHAMMAD AL FATIH', TRUE, TRUE),
('wali.5A.YAFIQ ABQORY ILMAN JUNIOR', 'salsabila3', 'salsabila3', 'wali', 'Wali dari YAFIQ ABQORY ILMAN JUNIOR', '5A', '5A', 'YAFIQ ABQORY ILMAN JUNIOR', 'YAFIQ ABQORY ILMAN JUNIOR', TRUE, TRUE),
('wali.5B.AHMAD SYAUQILLAH AHZA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AHMAD SYAUQILLAH AHZA', '5B', '5B', 'AHMAD SYAUQILLAH AHZA', 'AHMAD SYAUQILLAH AHZA', TRUE, TRUE),
('wali.5B.ALESHA ISKANDAR', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALESHA ISKANDAR', '5B', '5B', 'ALESHA ISKANDAR', 'ALESHA ISKANDAR', TRUE, TRUE),
('wali.5B.ALISHA KEINARRA PUTRI HERAWAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALISHA KEINARRA PUTRI HERAWAN', '5B', '5B', 'ALISHA KEINARRA PUTRI HERAWAN', 'ALISHA KEINARRA PUTRI HERAWAN', TRUE, TRUE),
('wali.5B.ALJARAS AKTAM KILAN IBRAHIM', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALJARAS AKTAM KILAN IBRAHIM', '5B', '5B', 'ALJARAS AKTAM KILAN IBRAHIM', 'ALJARAS AKTAM KILAN IBRAHIM', TRUE, TRUE),
('wali.5B.AZALEA NASYAUQI ANDYNY', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AZALEA NASYAUQI ANDYNY', '5B', '5B', 'AZALEA NASYAUQI ANDYNY', 'AZALEA NASYAUQI ANDYNY', TRUE, TRUE),
('wali.5B.AZQIARA NAJLA SAKHI UTOMO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AZQIARA NAJLA SAKHI UTOMO', '5B', '5B', 'AZQIARA NAJLA SAKHI UTOMO', 'AZQIARA NAJLA SAKHI UTOMO', TRUE, TRUE),
('wali.5B.AZZAM ASKARI HANSHEL', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AZZAM ASKARI HANSHEL', '5B', '5B', 'AZZAM ASKARI HANSHEL', 'AZZAM ASKARI HANSHEL', TRUE, TRUE),
('wali.5B.DHAFFA JIHAD FISABILILLAH', 'salsabila3', 'salsabila3', 'wali', 'Wali dari DHAFFA JIHAD FISABILILLAH', '5B', '5B', 'DHAFFA JIHAD FISABILILLAH', 'DHAFFA JIHAD FISABILILLAH', TRUE, TRUE),
('wali.5B.DIRGANTARA ARIENDRA WIDODO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari DIRGANTARA ARIENDRA WIDODO', '5B', '5B', 'DIRGANTARA ARIENDRA WIDODO', 'DIRGANTARA ARIENDRA WIDODO', TRUE, TRUE),
('wali.5B.FARREL ANDRA WIJAYANTO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FARREL ANDRA WIJAYANTO', '5B', '5B', 'FARREL ANDRA WIJAYANTO', 'FARREL ANDRA WIJAYANTO', TRUE, TRUE),
('wali.5B.GALIH ADIPATI GANENDRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari GALIH ADIPATI GANENDRA', '5B', '5B', 'GALIH ADIPATI GANENDRA', 'GALIH ADIPATI GANENDRA', TRUE, TRUE),
('wali.5B.GHAITSA RHAZES ELSHANUM', 'salsabila3', 'salsabila3', 'wali', 'Wali dari GHAITSA RHAZES ELSHANUM', '5B', '5B', 'GHAITSA RHAZES ELSHANUM', 'GHAITSA RHAZES ELSHANUM', TRUE, TRUE),
('wali.5B.GIFTAN AZFAR WIFQULKHAIR EL FAEYZA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari GIFTAN AZFAR WIFQULKHAIR EL FAEYZA', '5B', '5B', 'GIFTAN AZFAR WIFQULKHAIR EL FAEYZA', 'GIFTAN AZFAR WIFQULKHAIR EL FAEYZA', TRUE, TRUE),
('wali.5B.HANNA NOVIANA NURITA SARI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari HANNA NOVIANA NURITA SARI', '5B', '5B', 'HANNA NOVIANA NURITA SARI', 'HANNA NOVIANA NURITA SARI', TRUE, TRUE),
('wali.5B.KHAIRA LUBNA ZULFA ADELINE', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KHAIRA LUBNA ZULFA ADELINE', '5B', '5B', 'KHAIRA LUBNA ZULFA ADELINE', 'KHAIRA LUBNA ZULFA ADELINE', TRUE, TRUE),
('wali.5B.MUHAMMAD AZKI AL FATHI WIJAYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD AZKI AL FATHI WIJAYA', '5B', '5B', 'MUHAMMAD AZKI AL FATHI WIJAYA', 'MUHAMMAD AZKI AL FATHI WIJAYA', TRUE, TRUE),
('wali.5B.MUHAMMAD AZZAM ARROYYAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD AZZAM ARROYYAN', '5B', '5B', 'MUHAMMAD AZZAM ARROYYAN', 'MUHAMMAD AZZAM ARROYYAN', TRUE, TRUE),
('wali.5B.MUHAMMAD DZABIR TAUHID', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD DZABIR TAUHID', '5B', '5B', 'MUHAMMAD DZABIR TAUHID', 'MUHAMMAD DZABIR TAUHID', TRUE, TRUE),
('wali.5B.MUHAMMAD REYNAND ABRISAM AVANOSKA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD REYNAND ABRISAM AVANOSKA', '5B', '5B', 'MUHAMMAD REYNAND ABRISAM AVANOSKA', 'MUHAMMAD REYNAND ABRISAM AVANOSKA', TRUE, TRUE),
('wali.5B.NESYA ANINDYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NESYA ANINDYA', '5B', '5B', 'NESYA ANINDYA', 'NESYA ANINDYA', TRUE, TRUE),
('wali.5B.NOVANICA HASNA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NOVANICA HASNA', '5B', '5B', 'NOVANICA HASNA', 'NOVANICA HASNA', TRUE, TRUE),
('wali.5B.QUEENA AZZAHRA BATARI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari QUEENA AZZAHRA BATARI', '5B', '5B', 'QUEENA AZZAHRA BATARI', 'QUEENA AZZAHRA BATARI', TRUE, TRUE),
('wali.5B.SYABIL MIRZA ASQALANI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SYABIL MIRZA ASQALANI', '5B', '5B', 'SYABIL MIRZA ASQALANI', 'SYABIL MIRZA ASQALANI', TRUE, TRUE)
ON CONFLICT (username) DO NOTHING;


INSERT INTO auth_accounts (username, password_hash, "passwordHash", role, name, class_id, "classId", student_name, "studentName", first_login, "firstLogin") VALUES
('wali.5C.AISYA SAFA NURAINI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AISYA SAFA NURAINI', '5C', '5C', 'AISYA SAFA NURAINI', 'AISYA SAFA NURAINI', TRUE, TRUE),
('wali.5C.ALISHA SABRINA PRAMESWARI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALISHA SABRINA PRAMESWARI', '5C', '5C', 'ALISHA SABRINA PRAMESWARI', 'ALISHA SABRINA PRAMESWARI', TRUE, TRUE),
('wali.5C.ALTHAF FAUSTIN NABIL', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALTHAF FAUSTIN NABIL', '5C', '5C', 'ALTHAF FAUSTIN NABIL', 'ALTHAF FAUSTIN NABIL', TRUE, TRUE),
('wali.5C.ANINDITO HANAN RAMADHAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ANINDITO HANAN RAMADHAN', '5C', '5C', 'ANINDITO HANAN RAMADHAN', 'ANINDITO HANAN RAMADHAN', TRUE, TRUE),
('wali.5C.ANNAJMA ANRA ASSYIFA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ANNAJMA ANRA ASSYIFA', '5C', '5C', 'ANNAJMA ANRA ASSYIFA', 'ANNAJMA ANRA ASSYIFA', TRUE, TRUE),
('wali.5C.ARALYN HAFIZATUL HUSNA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARALYN HAFIZATUL HUSNA', '5C', '5C', 'ARALYN HAFIZATUL HUSNA', 'ARALYN HAFIZATUL HUSNA', TRUE, TRUE),
('wali.5C.ARARYA WISANGGENI PURBAWASESA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARARYA WISANGGENI PURBAWASESA', '5C', '5C', 'ARARYA WISANGGENI PURBAWASESA', 'ARARYA WISANGGENI PURBAWASESA', TRUE, TRUE),
('wali.5C.ERWIN ATIQAH ZAHRA FITRIYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ERWIN ATIQAH ZAHRA FITRIYA', '5C', '5C', 'ERWIN ATIQAH ZAHRA FITRIYA', 'ERWIN ATIQAH ZAHRA FITRIYA', TRUE, TRUE),
('wali.5C.FARESTIAN AZKA ABVINATTA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FARESTIAN AZKA ABVINATTA', '5C', '5C', 'FARESTIAN AZKA ABVINATTA', 'FARESTIAN AZKA ABVINATTA', TRUE, TRUE),
('wali.5C.FARREL HAMADA EL HAQ', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FARREL HAMADA EL HAQ', '5C', '5C', 'FARREL HAMADA EL HAQ', 'FARREL HAMADA EL HAQ', TRUE, TRUE),
('wali.5C.IBNATU AQILA ARDHANI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari IBNATU AQILA ARDHANI', '5C', '5C', 'IBNATU AQILA ARDHANI', 'IBNATU AQILA ARDHANI', TRUE, TRUE),
('wali.5C.KALYSTA LINTANG KIRANA ANWILY', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KALYSTA LINTANG KIRANA ANWILY', '5C', '5C', 'KALYSTA LINTANG KIRANA ANWILY', 'KALYSTA LINTANG KIRANA ANWILY', TRUE, TRUE),
('wali.5C.KEUMALAHAYATI AZZAHRA IMAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KEUMALAHAYATI AZZAHRA IMAN', '5C', '5C', 'KEUMALAHAYATI AZZAHRA IMAN', 'KEUMALAHAYATI AZZAHRA IMAN', TRUE, TRUE),
('wali.5C.KHILDA AULIA ALFAYZA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KHILDA AULIA ALFAYZA', '5C', '5C', 'KHILDA AULIA ALFAYZA', 'KHILDA AULIA ALFAYZA', TRUE, TRUE),
('wali.5C.MOZA ZHALFA MEDINA AKHTAR', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MOZA ZHALFA MEDINA AKHTAR', '5C', '5C', 'MOZA ZHALFA MEDINA AKHTAR', 'MOZA ZHALFA MEDINA AKHTAR', TRUE, TRUE),
('wali.5C.MUHAMMAD TSAQIB RASYDAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD TSAQIB RASYDAN', '5C', '5C', 'MUHAMMAD TSAQIB RASYDAN', 'MUHAMMAD TSAQIB RASYDAN', TRUE, TRUE),
('wali.5C.NAWWAL KAISA ALFAWWAZ', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NAWWAL KAISA ALFAWWAZ', '5C', '5C', 'NAWWAL KAISA ALFAWWAZ', 'NAWWAL KAISA ALFAWWAZ', TRUE, TRUE),
('wali.5C.RAHARDIAN AZRIEL AL FIRDAUS', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RAHARDIAN AZRIEL AL FIRDAUS', '5C', '5C', 'RAHARDIAN AZRIEL AL FIRDAUS', 'RAHARDIAN AZRIEL AL FIRDAUS', TRUE, TRUE),
('wali.5C.SAQILLA ASMA QURRATA''AINI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SAQILLA ASMA QURRATA''AINI', '5C', '5C', 'SAQILLA ASMA QURRATA''AINI', 'SAQILLA ASMA QURRATA''AINI', TRUE, TRUE),
('wali.5C.SHOFIYAH UZMA PUTRI RAHMANTO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SHOFIYAH UZMA PUTRI RAHMANTO', '5C', '5C', 'SHOFIYAH UZMA PUTRI RAHMANTO', 'SHOFIYAH UZMA PUTRI RAHMANTO', TRUE, TRUE),
('wali.5C.ULUNG AZIZAN ABIDIN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ULUNG AZIZAN ABIDIN', '5C', '5C', 'ULUNG AZIZAN ABIDIN', 'ULUNG AZIZAN ABIDIN', TRUE, TRUE),
('wali.5D.ADIVA MEISIE NATHANIA PUTRI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ADIVA MEISIE NATHANIA PUTRI', '5D', '5D', 'ADIVA MEISIE NATHANIA PUTRI', 'ADIVA MEISIE NATHANIA PUTRI', TRUE, TRUE),
('wali.5D.AHZA AZIZI KAMAL ABQORI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AHZA AZIZI KAMAL ABQORI', '5D', '5D', 'AHZA AZIZI KAMAL ABQORI', 'AHZA AZIZI KAMAL ABQORI', TRUE, TRUE),
('wali.5D.AISHA FELLA ATTAQI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AISHA FELLA ATTAQI', '5D', '5D', 'AISHA FELLA ATTAQI', 'AISHA FELLA ATTAQI', TRUE, TRUE),
('wali.5D.ARJUNA DANISH JAYA HARTONO PUTRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARJUNA DANISH JAYA HARTONO PUTRA', '5D', '5D', 'ARJUNA DANISH JAYA HARTONO PUTRA', 'ARJUNA DANISH JAYA HARTONO PUTRA', TRUE, TRUE),
('wali.5D.BRAMUNDITO ATHAYA PRAMUDYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari BRAMUNDITO ATHAYA PRAMUDYA', '5D', '5D', 'BRAMUNDITO ATHAYA PRAMUDYA', 'BRAMUNDITO ATHAYA PRAMUDYA', TRUE, TRUE),
('wali.5D.ERVINA ZULFA CAHYANINGRUM', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ERVINA ZULFA CAHYANINGRUM', '5D', '5D', 'ERVINA ZULFA CAHYANINGRUM', 'ERVINA ZULFA CAHYANINGRUM', TRUE, TRUE),
('wali.5D.FAHREZA RAFIF ARFAN SETYAWAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FAHREZA RAFIF ARFAN SETYAWAN', '5D', '5D', 'FAHREZA RAFIF ARFAN SETYAWAN', 'FAHREZA RAFIF ARFAN SETYAWAN', TRUE, TRUE),
('wali.5D.FAIRELL ATHARIZZ ADYATMA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FAIRELL ATHARIZZ ADYATMA', '5D', '5D', 'FAIRELL ATHARIZZ ADYATMA', 'FAIRELL ATHARIZZ ADYATMA', TRUE, TRUE),
('wali.5D.FIONA KINANTI IRAWAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FIONA KINANTI IRAWAN', '5D', '5D', 'FIONA KINANTI IRAWAN', 'FIONA KINANTI IRAWAN', TRUE, TRUE),
('wali.5D.GHIFARI YARDAN ALMUQOFFI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari GHIFARI YARDAN ALMUQOFFI', '5D', '5D', 'GHIFARI YARDAN ALMUQOFFI', 'GHIFARI YARDAN ALMUQOFFI', TRUE, TRUE),
('wali.5D.HAFIZ BAGUS NUR WICAKSONO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari HAFIZ BAGUS NUR WICAKSONO', '5D', '5D', 'HAFIZ BAGUS NUR WICAKSONO', 'HAFIZ BAGUS NUR WICAKSONO', TRUE, TRUE),
('wali.5D.HASNA AYYARA PANGESTU', 'salsabila3', 'salsabila3', 'wali', 'Wali dari HASNA AYYARA PANGESTU', '5D', '5D', 'HASNA AYYARA PANGESTU', 'HASNA AYYARA PANGESTU', TRUE, TRUE),
('wali.5D.HILMI RAFIF MANSHUR', 'salsabila3', 'salsabila3', 'wali', 'Wali dari HILMI RAFIF MANSHUR', '5D', '5D', 'HILMI RAFIF MANSHUR', 'HILMI RAFIF MANSHUR', TRUE, TRUE),
('wali.5D.JIHAN LAKSITA HAYUNINGTYAS SUDIRAYUDA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari JIHAN LAKSITA HAYUNINGTYAS SUDIRAYUDA', '5D', '5D', 'JIHAN LAKSITA HAYUNINGTYAS SUDIRAYUDA', 'JIHAN LAKSITA HAYUNINGTYAS SUDIRAYUDA', TRUE, TRUE),
('wali.5D.KAMILA AYUDIA INARA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KAMILA AYUDIA INARA', '5D', '5D', 'KAMILA AYUDIA INARA', 'KAMILA AYUDIA INARA', TRUE, TRUE),
('wali.5D.KEVIN AHNAF NURDAFA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KEVIN AHNAF NURDAFA', '5D', '5D', 'KEVIN AHNAF NURDAFA', 'KEVIN AHNAF NURDAFA', TRUE, TRUE),
('wali.5D.MUHAMMAD ARSYAD FIRDAUS AR RAFA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD ARSYAD FIRDAUS AR RAFA', '5D', '5D', 'MUHAMMAD ARSYAD FIRDAUS AR RAFA', 'MUHAMMAD ARSYAD FIRDAUS AR RAFA', TRUE, TRUE),
('wali.5D.RAFANDA SHAKILA HANY', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RAFANDA SHAKILA HANY', '5D', '5D', 'RAFANDA SHAKILA HANY', 'RAFANDA SHAKILA HANY', TRUE, TRUE),
('wali.5D.RAHMA NUR WIDYASTUTI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RAHMA NUR WIDYASTUTI', '5D', '5D', 'RAHMA NUR WIDYASTUTI', 'RAHMA NUR WIDYASTUTI', TRUE, TRUE),
('wali.5D.RANIA APRILIANA HANIF', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RANIA APRILIANA HANIF', '5D', '5D', 'RANIA APRILIANA HANIF', 'RANIA APRILIANA HANIF', TRUE, TRUE),
('wali.6A.ADZKIA HAFSAH FARAHI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ADZKIA HAFSAH FARAHI', '6A', '6A', 'ADZKIA HAFSAH FARAHI', 'ADZKIA HAFSAH FARAHI', TRUE, TRUE),
('wali.6A.ADZKIA NADHIRA PUTRI KURNIAWAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ADZKIA NADHIRA PUTRI KURNIAWAN', '6A', '6A', 'ADZKIA NADHIRA PUTRI KURNIAWAN', 'ADZKIA NADHIRA PUTRI KURNIAWAN', TRUE, TRUE),
('wali.6A.AIDAN SYAHM AL''ABBAD', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AIDAN SYAHM AL''ABBAD', '6A', '6A', 'AIDAN SYAHM AL''ABBAD', 'AIDAN SYAHM AL''ABBAD', TRUE, TRUE),
('wali.6A.ALISHA SOPHIA WARDANI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALISHA SOPHIA WARDANI', '6A', '6A', 'ALISHA SOPHIA WARDANI', 'ALISHA SOPHIA WARDANI', TRUE, TRUE),
('wali.6A.ARKAAN GHAISAN OMAR', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARKAAN GHAISAN OMAR', '6A', '6A', 'ARKAAN GHAISAN OMAR', 'ARKAAN GHAISAN OMAR', TRUE, TRUE),
('wali.6A.ARKANA FAUZAN TEGAR', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARKANA FAUZAN TEGAR', '6A', '6A', 'ARKANA FAUZAN TEGAR', 'ARKANA FAUZAN TEGAR', TRUE, TRUE),
('wali.6A.ARLINGGA SANTANU ABRARDEWARI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARLINGGA SANTANU ABRARDEWARI', '6A', '6A', 'ARLINGGA SANTANU ABRARDEWARI', 'ARLINGGA SANTANU ABRARDEWARI', TRUE, TRUE),
('wali.6A.ASKANA SAKHI PRASETYO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ASKANA SAKHI PRASETYO', '6A', '6A', 'ASKANA SAKHI PRASETYO', 'ASKANA SAKHI PRASETYO', TRUE, TRUE),
('wali.6A.AZKIYA RAIHAN FATONI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AZKIYA RAIHAN FATONI', '6A', '6A', 'AZKIYA RAIHAN FATONI', 'AZKIYA RAIHAN FATONI', TRUE, TRUE),
('wali.6A.BRAGA ACUZIO JOVANICK', 'salsabila3', 'salsabila3', 'wali', 'Wali dari BRAGA ACUZIO JOVANICK', '6A', '6A', 'BRAGA ACUZIO JOVANICK', 'BRAGA ACUZIO JOVANICK', TRUE, TRUE),
('wali.6A.EIFELYN SHERLY AZZAHRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari EIFELYN SHERLY AZZAHRA', '6A', '6A', 'EIFELYN SHERLY AZZAHRA', 'EIFELYN SHERLY AZZAHRA', TRUE, TRUE),
('wali.6A.FATHAN ATTAYA AZHAR', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FATHAN ATTAYA AZHAR', '6A', '6A', 'FATHAN ATTAYA AZHAR', 'FATHAN ATTAYA AZHAR', TRUE, TRUE),
('wali.6A.FULANDA KANIA AISYA SHABIRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FULANDA KANIA AISYA SHABIRA', '6A', '6A', 'FULANDA KANIA AISYA SHABIRA', 'FULANDA KANIA AISYA SHABIRA', TRUE, TRUE),
('wali.6A.HELGA AFIFAH JANITRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari HELGA AFIFAH JANITRA', '6A', '6A', 'HELGA AFIFAH JANITRA', 'HELGA AFIFAH JANITRA', TRUE, TRUE),
('wali.6A.KALILA TANEESHA MUJAYADI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KALILA TANEESHA MUJAYADI', '6A', '6A', 'KALILA TANEESHA MUJAYADI', 'KALILA TANEESHA MUJAYADI', TRUE, TRUE),
('wali.6A.MAHIRA AZKA MAULANA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MAHIRA AZKA MAULANA', '6A', '6A', 'MAHIRA AZKA MAULANA', 'MAHIRA AZKA MAULANA', TRUE, TRUE),
('wali.6A.MUHAMMAD ARFA AL AZKIYYA ROHMAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD ARFA AL AZKIYYA ROHMAN', '6A', '6A', 'MUHAMMAD ARFA AL AZKIYYA ROHMAN', 'MUHAMMAD ARFA AL AZKIYYA ROHMAN', TRUE, TRUE),
('wali.6A.MUHAMMAD RAYHAN AL FIKRY', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD RAYHAN AL FIKRY', '6A', '6A', 'MUHAMMAD RAYHAN AL FIKRY', 'MUHAMMAD RAYHAN AL FIKRY', TRUE, TRUE),
('wali.6A.NADYA PUTRI NARESWARI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NADYA PUTRI NARESWARI', '6A', '6A', 'NADYA PUTRI NARESWARI', 'NADYA PUTRI NARESWARI', TRUE, TRUE),
('wali.6A.NAFISA SAFIYA ANINDITA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NAFISA SAFIYA ANINDITA', '6A', '6A', 'NAFISA SAFIYA ANINDITA', 'NAFISA SAFIYA ANINDITA', TRUE, TRUE),
('wali.6A.NAJWA HUMAIRA SETYAWAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NAJWA HUMAIRA SETYAWAN', '6A', '6A', 'NAJWA HUMAIRA SETYAWAN', 'NAJWA HUMAIRA SETYAWAN', TRUE, TRUE),
('wali.6A.NATHANIA DERRYS NAYOTTAMA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NATHANIA DERRYS NAYOTTAMA', '6A', '6A', 'NATHANIA DERRYS NAYOTTAMA', 'NATHANIA DERRYS NAYOTTAMA', TRUE, TRUE),
('wali.6A.NISRINA ADELIA YUWANA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NISRINA ADELIA YUWANA', '6A', '6A', 'NISRINA ADELIA YUWANA', 'NISRINA ADELIA YUWANA', TRUE, TRUE),
('wali.6B.AHMAD HAFNI NAFIS', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AHMAD HAFNI NAFIS', '6B', '6B', 'AHMAD HAFNI NAFIS', 'AHMAD HAFNI NAFIS', TRUE, TRUE),
('wali.6B.ALMAHIRA GHANIYYA LUBNA MAULIDA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALMAHIRA GHANIYYA LUBNA MAULIDA', '6B', '6B', 'ALMAHIRA GHANIYYA LUBNA MAULIDA', 'ALMAHIRA GHANIYYA LUBNA MAULIDA', TRUE, TRUE),
('wali.6B.ARJUNA ZIO AL FAEYZA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ARJUNA ZIO AL FAEYZA', '6B', '6B', 'ARJUNA ZIO AL FAEYZA', 'ARJUNA ZIO AL FAEYZA', TRUE, TRUE),
('wali.6B.ATHARIZ FAISAL ZAKI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ATHARIZ FAISAL ZAKI', '6B', '6B', 'ATHARIZ FAISAL ZAKI', 'ATHARIZ FAISAL ZAKI', TRUE, TRUE),
('wali.6B.CELENA ADIERA PADMA LESTARI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari CELENA ADIERA PADMA LESTARI', '6B', '6B', 'CELENA ADIERA PADMA LESTARI', 'CELENA ADIERA PADMA LESTARI', TRUE, TRUE),
('wali.6B.DANINZA AMEERA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari DANINZA AMEERA', '6B', '6B', 'DANINZA AMEERA', 'DANINZA AMEERA', TRUE, TRUE),
('wali.6B.FACHRY RAMADHAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FACHRY RAMADHAN', '6B', '6B', 'FACHRY RAMADHAN', 'FACHRY RAMADHAN', TRUE, TRUE),
('wali.6B.FATHIR AZZAMY AMSYAR', 'salsabila3', 'salsabila3', 'wali', 'Wali dari FATHIR AZZAMY AMSYAR', '6B', '6B', 'FATHIR AZZAMY AMSYAR', 'FATHIR AZZAMY AMSYAR', TRUE, TRUE),
('wali.6B.KEVIN ADHYASTA PRANOTO', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KEVIN ADHYASTA PRANOTO', '6B', '6B', 'KEVIN ADHYASTA PRANOTO', 'KEVIN ADHYASTA PRANOTO', TRUE, TRUE),
('wali.6B.KIRANA ANNISA WULANDARI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KIRANA ANNISA WULANDARI', '6B', '6B', 'KIRANA ANNISA WULANDARI', 'KIRANA ANNISA WULANDARI', TRUE, TRUE),
('wali.6B.LAKSMI SINAR KRISTAL', 'salsabila3', 'salsabila3', 'wali', 'Wali dari LAKSMI SINAR KRISTAL', '6B', '6B', 'LAKSMI SINAR KRISTAL', 'LAKSMI SINAR KRISTAL', TRUE, TRUE),
('wali.6B.MAULIDYA NUR AZIZAH FITRIA KHOIRUNNISA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MAULIDYA NUR AZIZAH FITRIA KHOIRUNNISA', '6B', '6B', 'MAULIDYA NUR AZIZAH FITRIA KHOIRUNNISA', 'MAULIDYA NUR AZIZAH FITRIA KHOIRUNNISA', TRUE, TRUE),
('wali.6B.MOHAMMAD FAQIH AZZAM KARNAWAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MOHAMMAD FAQIH AZZAM KARNAWAN', '6B', '6B', 'MOHAMMAD FAQIH AZZAM KARNAWAN', 'MOHAMMAD FAQIH AZZAM KARNAWAN', TRUE, TRUE),
('wali.6B.MUHAMAD YAZID ASY SYAKUR', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMAD YAZID ASY SYAKUR', '6B', '6B', 'MUHAMAD YAZID ASY SYAKUR', 'MUHAMAD YAZID ASY SYAKUR', TRUE, TRUE),
('wali.6B.MUHAMMAD ADRIAN SIDIK', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD ADRIAN SIDIK', '6B', '6B', 'MUHAMMAD ADRIAN SIDIK', 'MUHAMMAD ADRIAN SIDIK', TRUE, TRUE),
('wali.6B.RADITYA AHMAD', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RADITYA AHMAD', '6B', '6B', 'RADITYA AHMAD', 'RADITYA AHMAD', TRUE, TRUE),
('wali.6B.SAYYIDA SAKHI HAKAMA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari SAYYIDA SAKHI HAKAMA', '6B', '6B', 'SAYYIDA SAKHI HAKAMA', 'SAYYIDA SAKHI HAKAMA', TRUE, TRUE),
('wali.6B.ZALFA TALINA BAIDA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ZALFA TALINA BAIDA', '6B', '6B', 'ZALFA TALINA BAIDA', 'ZALFA TALINA BAIDA', TRUE, TRUE),
('wali.6B.ZHAFRAN ARSYAVANO ARRAFIF', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ZHAFRAN ARSYAVANO ARRAFIF', '6B', '6B', 'ZHAFRAN ARSYAVANO ARRAFIF', 'ZHAFRAN ARSYAVANO ARRAFIF', TRUE, TRUE),
('wali.6C.ABDAN KHAIRY RAHMAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ABDAN KHAIRY RAHMAN', '6C', '6C', 'ABDAN KHAIRY RAHMAN', 'ABDAN KHAIRY RAHMAN', TRUE, TRUE),
('wali.6C.AGHARR KHAFIDZ WIRYAWAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AGHARR KHAFIDZ WIRYAWAN', '6C', '6C', 'AGHARR KHAFIDZ WIRYAWAN', 'AGHARR KHAFIDZ WIRYAWAN', TRUE, TRUE),
('wali.6C.AHMAD FADHIL', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AHMAD FADHIL', '6C', '6C', 'AHMAD FADHIL', 'AHMAD FADHIL', TRUE, TRUE),
('wali.6C.AINI MALIKA ALTHAFUNNISA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AINI MALIKA ALTHAFUNNISA', '6C', '6C', 'AINI MALIKA ALTHAFUNNISA', 'AINI MALIKA ALTHAFUNNISA', TRUE, TRUE),
('wali.6C.AISYAH ALESHA SHAKILA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari AISYAH ALESHA SHAKILA', '6C', '6C', 'AISYAH ALESHA SHAKILA', 'AISYAH ALESHA SHAKILA', TRUE, TRUE),
('wali.6C.ALMAIRA MAHARDIKA ZAHRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ALMAIRA MAHARDIKA ZAHRA', '6C', '6C', 'ALMAIRA MAHARDIKA ZAHRA', 'ALMAIRA MAHARDIKA ZAHRA', TRUE, TRUE),
('wali.6C.ANANDA SITI FATIMAH', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ANANDA SITI FATIMAH', '6C', '6C', 'ANANDA SITI FATIMAH', 'ANANDA SITI FATIMAH', TRUE, TRUE),
('wali.6C.GIVANNA ANINDYA BESTARIE', 'salsabila3', 'salsabila3', 'wali', 'Wali dari GIVANNA ANINDYA BESTARIE', '6C', '6C', 'GIVANNA ANINDYA BESTARIE', 'GIVANNA ANINDYA BESTARIE', TRUE, TRUE),
('wali.6C.KAFKA ABIAN YAHYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari KAFKA ABIAN YAHYA', '6C', '6C', 'KAFKA ABIAN YAHYA', 'KAFKA ABIAN YAHYA', TRUE, TRUE),
('wali.6C.MUHAMMAD ALTHAF RAFISQY', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD ALTHAF RAFISQY', '6C', '6C', 'MUHAMMAD ALTHAF RAFISQY', 'MUHAMMAD ALTHAF RAFISQY', TRUE, TRUE),
('wali.6C.MUHAMMAD ANINDRA TECTONA GRANDIS', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD ANINDRA TECTONA GRANDIS', '6C', '6C', 'MUHAMMAD ANINDRA TECTONA GRANDIS', 'MUHAMMAD ANINDRA TECTONA GRANDIS', TRUE, TRUE),
('wali.6C.MUHAMMAD BILAL MAULANA IBRAHIM', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD BILAL MAULANA IBRAHIM', '6C', '6C', 'MUHAMMAD BILAL MAULANA IBRAHIM', 'MUHAMMAD BILAL MAULANA IBRAHIM', TRUE, TRUE),
('wali.6C.MUHAMMAD HANIF AL FATIH', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD HANIF AL FATIH', '6C', '6C', 'MUHAMMAD HANIF AL FATIH', 'MUHAMMAD HANIF AL FATIH', TRUE, TRUE),
('wali.6C.MUHAMMAD NAUFAL ZAFRAN ARGANI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari MUHAMMAD NAUFAL ZAFRAN ARGANI', '6C', '6C', 'MUHAMMAD NAUFAL ZAFRAN ARGANI', 'MUHAMMAD NAUFAL ZAFRAN ARGANI', TRUE, TRUE),
('wali.6C.NABIHAN AUFA QUTHBIE ANDRIAN', 'salsabila3', 'salsabila3', 'wali', 'Wali dari NABIHAN AUFA QUTHBIE ANDRIAN', '6C', '6C', 'NABIHAN AUFA QUTHBIE ANDRIAN', 'NABIHAN AUFA QUTHBIE ANDRIAN', TRUE, TRUE),
('wali.6C.RAFI NAUFAL ALFARIZKY', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RAFI NAUFAL ALFARIZKY', '6C', '6C', 'RAFI NAUFAL ALFARIZKY', 'RAFI NAUFAL ALFARIZKY', TRUE, TRUE),
('wali.6C.RAISYA AQILA PUTRI', 'salsabila3', 'salsabila3', 'wali', 'Wali dari RAISYA AQILA PUTRI', '6C', '6C', 'RAISYA AQILA PUTRI', 'RAISYA AQILA PUTRI', TRUE, TRUE)
ON CONFLICT (username) DO NOTHING;


INSERT INTO auth_accounts (username, password_hash, "passwordHash", role, name, class_id, "classId", student_name, "studentName", first_login, "firstLogin") VALUES
('wali.6C.TALITA AIDA ZAHRA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari TALITA AIDA ZAHRA', '6C', '6C', 'TALITA AIDA ZAHRA', 'TALITA AIDA ZAHRA', TRUE, TRUE),
('wali.6C.VEDA DISKA AULIA MARSHA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari VEDA DISKA AULIA MARSHA', '6C', '6C', 'VEDA DISKA AULIA MARSHA', 'VEDA DISKA AULIA MARSHA', TRUE, TRUE),
('wali.6C.ZALFA RASYIDATU MUAZARA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ZALFA RASYIDATU MUAZARA', '6C', '6C', 'ZALFA RASYIDATU MUAZARA', 'ZALFA RASYIDATU MUAZARA', TRUE, TRUE),
('wali.6C.ZASYARRETA ZAAFIRAH PUTRI ADITYA', 'salsabila3', 'salsabila3', 'wali', 'Wali dari ZASYARRETA ZAAFIRAH PUTRI ADITYA', '6C', '6C', 'ZASYARRETA ZAAFIRAH PUTRI ADITYA', 'ZASYARRETA ZAAFIRAH PUTRI ADITYA', TRUE, TRUE)
ON CONFLICT (username) DO NOTHING;


-- =========================================================================
-- SELESAI: Skema dan seluruh data awal (485 santri, 18 guru, 19 kelas) siap digunakan di Supabase.
-- =========================================================================