import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import * as XLSX from 'xlsx';
import { MemorizationRecord } from '../types';
import { getMonthLabel } from './exportUtils';

export const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets'
];

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
for (const scope of SCOPES) {
  provider.addScope(scope);
}

// In-memory token cache (NEVER in localStorage/sessionStorage as required)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initDriveAuth = (
  onAuthSuccess?: (user: FirebaseUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else if (!isSigningIn) {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleDrive = async (): Promise<{ user: FirebaseUser; token: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, token: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getDriveAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const disconnectGoogleDrive = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

/**
 * Uploads monthly Quran report to Google Drive with explicit user confirmation.
 */
export async function uploadRekapToGoogleDrive(
  records: MemorizationRecord[],
  kelas: string,
  bulan: number | string,
  tahun: number | string
): Promise<{ fileId: string; webViewLink: string }> {
  if (!cachedAccessToken) {
    throw new Error('Belum terhubung ke Google Drive. Silakan Masuk dengan Google terlebih dahulu.');
  }

  const bulanText = bulan === 'ALL' ? 'Semua Bulan' : getMonthLabel(bulan);
  const kelasText = kelas === 'ALL' ? 'Semua Kelas' : `Kelas ${kelas}`;
  const fileName = `Rekap SALAM Quran ${kelasText} - ${bulanText} ${tahun}.xlsx`;

  // 1. Build workbook
  const rows = records.map((r, index) => {
    let materi = '';
    if (r.type === 'tahsin') {
      if (r.tahsinBook === "Al-Qur'an") {
        materi = `Al-Qur'an: Surat ${r.tahsinSurahName || '-'} (Hal. ${r.tahsinPage || '-'}, Ayat Terakhir: ${r.tahsinLastAyat || '-'})`;
      } else {
        materi = `${r.tahsinBook || 'Yanfa\'una'} (Hal. ${r.tahsinPage || '-'})`;
      }
    } else {
      materi = `Surat ${r.tahfidzSurahName || '-'} (Juz ${r.tahfidzJuz || '-'}, Ayat ${r.tahfidzAyatRange || '-'})`;
    }

    return {
      'No': index + 1,
      'Tanggal': r.date,
      'Kelas': r.classId,
      'Nama Siswa': r.studentName,
      'Jenis': r.type === 'tahsin' ? 'Tahsin' : 'Tahfidz',
      'Materi Capaian': materi,
      'Nilai': r.grade,
      'Catatan Guru': r.notes || '-',
      'Guru Pengampu': r.teacherName
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Capaian');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  // 2. Prepare multipart upload to Google Drive v3
  const metadata = {
    name: fileName,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    description: `Rekap capaian Tahsin & Tahfidz SD IT Salsabila 3 Banguntapan - ${kelasText} ${bulanText} ${tahun}`
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', blob);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cachedAccessToken}`
      },
      body: form
    }
  );

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Gagal mengunggah file ke Google Drive');
  }

  const result = await res.json();
  return {
    fileId: result.id,
    webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`
  };
}
