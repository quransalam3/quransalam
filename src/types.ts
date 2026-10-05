export type UserRole = 'guru' | 'wali' | 'admin';

export type ScoreGrade = 'A (Mumtaz)' | 'A- (Jayyid Jiddan)' | 'B (Jayyid)';

export type MemorizationType = 'tahsin' | 'tahfidz';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  classId?: string;
  studentName?: string;
  firstLogin?: boolean;
}

export interface AuthAccount {
  username: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  classId?: string;
  studentName?: string;
  firstLogin: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  username: string;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
}

export interface Surah {
  number: number;
  name: string;
  arabicName: string;
  totalAyat: number;
  juzStart: number;
}

export interface MemorizationRecord {
  id: string;
  date: string;
  classId: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  type: MemorizationType;
  // Tahsin
  tahsinBook?: string;
  tahsinPage?: string;
  tahsinSurahNumber?: number;
  tahsinSurahName?: string;
  tahsinLastAyat?: string;
  // Tahfidz
  tahfidzJuz?: number;
  tahfidzSurahNumber?: number;
  tahfidzSurahName?: string;
  tahfidzAyatRange?: string;
  // Evaluation
  grade: ScoreGrade;
  notes: string;
  createdAt: string;
  updatedAt?: string;
}

export type ActionType = 
  | 'TAMBAH_SISWA'
  | 'EDIT_SISWA'
  | 'HAPUS_SISWA'
  | 'TAMBAH_GURU'
  | 'EDIT_GURU'
  | 'HAPUS_GURU'
  | 'RESET_PASSWORD'
  | 'UBAH_PASSWORD'
  | 'TAMBAH_SETORAN'
  | 'HAPUS_SETORAN';

export interface ActivityLog {
  id: string;
  timestamp: string;
  actionType: ActionType;
  performedBy: string;
  target: string;
  details: string;
}
