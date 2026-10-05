import React, { useState } from 'react';
import { User, MemorizationRecord } from '../types';
import { storage } from '../lib/storage';
import { LetterheadKop } from '../components/LetterheadKop';
import { exportSingleStudentToExcel, AVAILABLE_YEARS, MONTH_NAMES } from '../lib/exportUtils';
import { 
  BookOpen, 
  Bookmark, 
  Award, 
  Calendar, 
  Download, 
  Printer, 
  Sparkles, 
  UserCheck, 
  TrendingUp, 
  CheckCircle,
  FileCheck,
  Filter
} from 'lucide-react';

interface WaliDashboardProps {
  currentUser: User;
}

export const WaliDashboard: React.FC<WaliDashboardProps> = ({ currentUser }) => {
  const studentName = currentUser.studentName || 'Putra/Putri Anda';
  const classId = currentUser.classId || '1A';

  // Filter state (Semua Riwayat, Dropdown Bulan, Dropdown Tahun)
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const defaultYear = Math.max(2025, currentYear);
  const [filterPeriodMode, setFilterPeriodMode] = useState<'semua' | 'custom'>('semua');
  const [filterMonth, setFilterMonth] = useState<number | string>(currentMonth);
  const [filterYear, setFilterYear] = useState<number | string>(defaultYear);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Retrieve records for this student
  const allStudentRecords = storage.getRecords({
    classId: classId,
    studentName: studentName
  });

  // Apply period filter: semua riwayat, dropdown bulan, dropdown tahun
  const filteredRecords = allStudentRecords.filter((r) => {
    if (filterPeriodMode === 'custom') {
      const recDate = new Date(r.date);
      const recMonth = recDate.getMonth() + 1; // 1-12
      const recYear = recDate.getFullYear();

      if (filterMonth !== 'ALL' && recMonth !== Number(filterMonth)) {
        return false;
      }
      if (filterYear !== 'ALL' && recYear !== Number(filterYear)) {
        return false;
      }
    }
    return true;
  });

  // Analytics
  const totalSetoran = filteredRecords.length;
  const tahsinCount = filteredRecords.filter(r => r.type === 'tahsin').length;
  const tahfidzCount = filteredRecords.filter(r => r.type === 'tahfidz').length;

  const mumtazCount = filteredRecords.filter(r => r.grade.includes('Mumtaz')).length;
  const jayyidJiddanCount = filteredRecords.filter(r => r.grade.includes('Jayyid Jiddan')).length;
  const jayyidCount = filteredRecords.filter(r => r.grade === 'B (Jayyid)').length;

  // Latest Tahsin progress
  const latestTahsin = filteredRecords.find(r => r.type === 'tahsin');
  // Latest Tahfidz progress
  const latestTahfidz = filteredRecords.find(r => r.type === 'tahfidz');

  const handleDownloadExcel = () => {
    exportSingleStudentToExcel(filteredRecords, studentName, classId);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#00C2A0] to-[#008E75] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Dashboard Monitoring Wali Santri</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Perkembangan Al-Qur'an: {studentName}
          </h1>
          <p className="mt-1 text-sm text-teal-50">
            Kelas: <strong className="text-white">{classId}</strong> &bull; SD Islam Terpadu Salsabila 3 Banguntapan
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">Total Setoran</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#00C2A0] flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#3F4E5A] mt-2">{totalSetoran}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Sesi pembelajaran tercatat</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">Capaian Tahsin Terakhir</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm font-extrabold text-[#3F4E5A] mt-2 truncate">
            {latestTahsin ? (latestTahsin.tahsinBook === "Al-Qur'an" ? `Al-Qur'an: Surat ${latestTahsin.tahsinSurahName || '-'}` : `${latestTahsin.tahsinBook}`) : 'Belum ada data'}
          </p>
          <p className="text-[11px] text-[#008E75] font-semibold mt-0.5 truncate">
            {latestTahsin ? (latestTahsin.tahsinBook === "Al-Qur'an" ? `Ayat Terakhir: ${latestTahsin.tahsinLastAyat || '-'}` : `Halaman ${latestTahsin.tahsinPage}`) : 'Menunggu input'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">Capaian Tahfidz Terakhir</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm font-extrabold text-[#3F4E5A] mt-2 truncate">
            {latestTahfidz ? `Surat ${latestTahfidz.tahfidzSurahName}` : 'Belum ada data'}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            {latestTahfidz ? `Juz ${latestTahfidz.tahfidzJuz} (Ayat ${latestTahfidz.tahfidzAyatRange})` : 'Menunggu input'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">Prestasi Nilai Mumtaz</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#3F4E5A] mt-2">{mumtazCount}</p>
          <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Nilai A (Mumtaz)</p>
        </div>
      </div>

      {/* FILTER & ACTIONS BAR */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-[#3F4E5A] flex items-center gap-1.5 mr-1">
            <Filter className="w-4 h-4 text-[#00C2A0]" />
            <span>Filter Periode:</span>
          </span>

          {/* Pilihan Semua Riwayat */}
          <button
            onClick={() => {
              setFilterPeriodMode('semua');
              setFilterMonth('ALL');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
              filterPeriodMode === 'semua'
                ? 'bg-[#00C2A0] text-white border-[#00C2A0] shadow-xs'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            Semua Riwayat
          </button>

          {/* Dropdown Bulan */}
          <select
            value={filterPeriodMode === 'semua' ? 'ALL' : filterMonth}
            onChange={(e) => {
              setFilterPeriodMode('custom');
              setFilterMonth(e.target.value);
            }}
            className="py-2 px-3 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-700 focus:ring-2 focus:ring-[#00C2A0]"
          >
            <option value="ALL">Semua Bulan</option>
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx + 1}>{name}</option>
            ))}
          </select>

          {/* Dropdown Tahun (2025 sampai seterusnya) */}
          <select
            value={filterYear}
            onChange={(e) => {
              setFilterPeriodMode('custom');
              setFilterYear(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value));
            }}
            className="py-2 px-3 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-700 focus:ring-2 focus:ring-[#00C2A0]"
          >
            <option value="ALL">Semua Tahun</option>
            {AVAILABLE_YEARS.map((y) => (
              <option key={y} value={y}>Tahun {y}</option>
            ))}
          </select>
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadExcel}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Excel</span>
          </button>
          <button
            onClick={() => setShowPrintModal(true)}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3F4E5A] hover:bg-[#2B3740] text-white text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Raport Ringkas</span>
          </button>
        </div>
      </div>

      {/* TIMELINE RIWAYAT LENGKAP DENGAN NAMA LENGKAP GURU */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-[#3F4E5A] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#00C2A0]" />
              <span>Log Riwayat Belajar & Capaian Santri</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Menampilkan rincian materi, penilaian, dan nama lengkap guru pengampu yang menginput.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-teal-50 text-[#008E75] rounded-xl border border-teal-100">
            {filteredRecords.length} Catatan
          </span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300 stroke-1" />
            <p className="text-sm font-semibold text-gray-600">Belum ada riwayat pembelajaran</p>
            <p className="text-xs text-gray-400 mt-1">
              Catatan hafalan dan tahsin dari ustadz/ustadzah akan langsung muncul di sini secara otomatis.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-gray-100 hover:border-teal-200 bg-[#FDFDFD] transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-bold text-[#3F4E5A] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#00C2A0]" />
                      {new Date(item.date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        item.type === 'tahsin'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.type === 'tahsin' ? 'Tahsin Al-Qur\'an' : 'Tahfidz Al-Qur\'an'}
                    </span>
                  </div>

                  <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-[#00C2A0]/10 text-[#008E75] border border-[#00C2A0]/30 self-start sm:self-auto">
                    {item.grade}
                  </span>
                </div>

                <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Material detail */}
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 block mb-0.5">Materi Pembelajaran</span>
                    {item.type === 'tahsin' ? (
                      item.tahsinBook === "Al-Qur'an" ? (
                        <p className="text-sm font-bold text-gray-800">
                          📖 <strong>Al-Qur'an</strong>: Surat {item.tahsinSurahName || '-'} (Ayat Terakhir: <strong className="text-[#008E75]">{item.tahsinLastAyat || '-'}</strong>)
                        </p>
                      ) : (
                        <p className="text-sm font-bold text-gray-800">
                          📖 {item.tahsinBook} — <span className="text-[#00C2A0]">Halaman {item.tahsinPage}</span>
                        </p>
                      )
                    ) : (
                      <p className="text-sm font-bold text-gray-800">
                        🌟 Surat {item.tahfidzSurahName} (Juz {item.tahfidzJuz}) &bull; <span className="text-[#00C2A0]">Ayat {item.tahfidzAyatRange}</span>
                      </p>
                    )}

                    {item.notes && (
                      <div className="mt-2 p-2.5 rounded-xl bg-white border border-gray-100 text-xs text-gray-600 italic">
                        "{item.notes}"
                      </div>
                    )}
                  </div>

                  {/* Right: Guru Pengampu (Nama Lengkap Guru) */}
                  <div className="flex flex-col justify-end md:items-end">
                    <span className="text-[11px] font-bold text-gray-400 block mb-0.5">Guru Pengampu Al-Qur'an</span>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-teal-100 text-[#008E75] flex items-center justify-center text-xs font-bold">
                        <UserCheck className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-extrabold text-[#3F4E5A]">
                        {item.teacherName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PRINTABLE RAPORT MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-100 no-print">
              <h3 className="text-lg font-bold text-[#3F4E5A]">Preview Raport Hafalan Santri</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-[#00C2A0] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

            <div>
              <LetterheadKop
                title="LEMBAR HASIL CAPAIAN TAHFIDZ & TAHSIN SISWA"
                subtitle={`Nama Siswa: ${studentName} | Kelas: ${classId}`}
              />

              <div className="my-4 p-4 rounded-xl bg-gray-50 border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">Nama Santri:</span>
                  <strong className="text-[#3F4E5A]">{studentName}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Kelas:</span>
                  <strong className="text-[#3F4E5A]">{classId}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Total Sesi Belajar:</span>
                  <strong className="text-[#00C2A0]">{filteredRecords.length} Pertemuan</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Predikat Dominan:</span>
                  <strong className="text-amber-600">{mumtazCount >= jayyidJiddanCount ? 'A (Mumtaz)' : 'A- (Jayyid Jiddan)'}</strong>
                </div>
              </div>

              <div className="mt-4 mb-6">
                <table className="w-full border-collapse border border-gray-300 text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-2 py-1.5 text-center">No</th>
                      <th className="border border-gray-300 px-2 py-1.5">Tanggal</th>
                      <th className="border border-gray-300 px-2 py-1.5">Materi Pembelajaran</th>
                      <th className="border border-gray-300 px-2 py-1.5 text-center">Nilai</th>
                      <th className="border border-gray-300 px-2 py-1.5">Catatan Evaluasi</th>
                      <th className="border border-gray-300 px-2 py-1.5">Guru Pengampu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((r, i) => (
                      <tr key={r.id}>
                        <td className="border border-gray-300 px-2 py-1.5 text-center">{i + 1}</td>
                        <td className="border border-gray-300 px-2 py-1.5 whitespace-nowrap">{r.date}</td>
                        <td className="border border-gray-300 px-2 py-1.5">
                          {r.type === 'tahsin'
                            ? (r.tahsinBook === "Al-Qur'an"
                                ? `Tahsin: Al-Qur'an Surat ${r.tahsinSurahName || '-'} (Hal. ${r.tahsinPage || '-'}, Ayat: ${r.tahsinLastAyat || '-'})`
                                : `Tahsin: ${r.tahsinBook} Hal. ${r.tahsinPage}`)
                            : `Tahfidz: Surat ${r.tahfidzSurahName} (Juz ${r.tahfidzJuz}, Ayat ${r.tahfidzAyatRange})`}
                        </td>
                        <td className="border border-gray-300 px-2 py-1.5 text-center font-bold">{r.grade}</td>
                        <td className="border border-gray-300 px-2 py-1.5">{r.notes || '-'}</td>
                        <td className="border border-gray-300 px-2 py-1.5 whitespace-nowrap">{r.teacherName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-end mt-12 text-xs pt-4">
                <div className="text-center">
                  <p>Mengetahui,</p>
                  <p className="font-bold">Orang Tua / Wali Santri</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">( ............................................ )</p>
                </div>

                <div className="text-center">
                  <p>Bantul, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="font-bold">Guru Koordinator Qur'an,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{latestTahfidz?.teacherName || latestTahsin?.teacherName || 'Guru Al-Qur\'an'}</p>
                  <p className="text-[11px] text-gray-500">SD IT Salsabila 3 Banguntapan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
