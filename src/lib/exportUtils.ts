import * as XLSX from 'xlsx';
import { MemorizationRecord } from '../types';

export const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const START_YEAR = 2025;
const CURRENT_YEAR = new Date().getFullYear();
const MAX_YEAR = Math.max(2035, CURRENT_YEAR + 5);
export const AVAILABLE_YEARS = Array.from(
  { length: MAX_YEAR - START_YEAR + 1 },
  (_, idx) => START_YEAR + idx
);

export function getMonthLabel(monthNumber: number | string): string {
  const m = Number(monthNumber);
  if (m >= 1 && m <= 12) {
    return MONTH_NAMES[m - 1];
  }
  return 'Semua Bulan';
}

export function exportRekapToExcel(
  records: MemorizationRecord[],
  kelas: string,
  bulan: number | string,
  tahun: number | string
) {
  const bulanText = bulan === 'ALL' ? 'Semua-Bulan' : getMonthLabel(bulan);
  const kelasText = kelas === 'ALL' ? 'Semua-Kelas' : `Kelas-${kelas}`;

  const rows = records.map((r, index) => {
    let materi = '';
    if (r.type === 'tahsin') {
      if (r.tahsinBook === "Al-Qur'an") {
        materi = `Al-Qur'an: Surat ${r.tahsinSurahName || '-'} (Ayat Terakhir: ${r.tahsinLastAyat || '-'})`;
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
      'Jenis Pembelajaran': r.type === 'tahsin' ? 'Tahsin' : 'Tahfidz',
      'Capaian / Materi': materi,
      'Penilaian': r.grade,
      'Catatan Guru': r.notes || '-',
      'Guru Pengampu': r.teacherName
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 12 }, // Tanggal
    { wch: 8 },  // Kelas
    { wch: 32 }, // Nama Siswa
    { wch: 18 }, // Jenis
    { wch: 35 }, // Materi
    { wch: 20 }, // Penilaian
    { wch: 30 }, // Catatan
    { wch: 28 }, // Guru
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Capaian');

  // Generate filename
  const fileName = `Rekap_SALAM_Quran_${kelasText}_${bulanText}_${tahun}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportSingleStudentToExcel(
  records: MemorizationRecord[],
  studentName: string,
  classId: string
) {
  const rows = records.map((r, index) => {
    let materi = '';
    if (r.type === 'tahsin') {
      if (r.tahsinBook === "Al-Qur'an") {
        materi = `Al-Qur'an: Surat ${r.tahsinSurahName || '-'} (Ayat Terakhir: ${r.tahsinLastAyat || '-'})`;
      } else {
        materi = `${r.tahsinBook || 'Yanfa\'una'} (Hal. ${r.tahsinPage || '-'})`;
      }
    } else {
      materi = `Surat ${r.tahfidzSurahName || '-'} (Juz ${r.tahfidzJuz || '-'}, Ayat ${r.tahfidzAyatRange || '-'})`;
    }

    return {
      'No': index + 1,
      'Tanggal': r.date,
      'Pelajaran': r.type === 'tahsin' ? 'Tahsin' : 'Tahfidz',
      'Materi / Halaman / Surat': materi,
      'Nilai Evaluasi': r.grade,
      'Catatan Ustadz/Ustadzah': r.notes || '-',
      'Guru Qur\'an': r.teacherName
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 14 },
    { wch: 14 },
    { wch: 35 },
    { wch: 20 },
    { wch: 35 },
    { wch: 28 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Hafalan');

  const cleanName = studentName.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Laporan_Hafalan_${cleanName}_Kelas_${classId}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
