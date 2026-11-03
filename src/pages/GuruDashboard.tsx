import React, { useState } from 'react';
import { User, MemorizationType, ScoreGrade, MemorizationRecord, TahfidzActivity } from '../types';
import { storage, useStorageSubscription } from '../lib/storage';
import { YANFAUNA_BOOKS, QURAN_SURAHS } from '../data/initialData';
import { LetterheadKop } from '../components/LetterheadKop';
import { exportRekapToExcel, MONTH_NAMES, getMonthLabel, AVAILABLE_YEARS } from '../lib/exportUtils';
import { 
  initDriveAuth, 
  signInWithGoogleDrive, 
  uploadRekapToGoogleDrive, 
  disconnectGoogleDrive, 
  getDriveAccessToken 
} from '../lib/googleDriveService';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  Bookmark, 
  Award, 
  FileText, 
  Save, 
  Download, 
  Printer, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Clock, 
  Filter, 
  Search,
  BookMarked,
  CloudUpload,
  ExternalLink,
  Check,
  Pencil,
  X
} from 'lucide-react';

interface GuruDashboardProps {
  currentUser: User;
}

export const GuruDashboard: React.FC<GuruDashboardProps> = ({ currentUser }) => {
  useStorageSubscription();
  const todayStr = new Date().toISOString().split('T')[0];

  // Form states
  const [date, setDate] = useState<string>(todayStr);
  const [selectedClass, setSelectedClass] = useState<string>('1A');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [type, setType] = useState<MemorizationType>('tahsin');

  // Tahsin states
  const [tahsinBook, setTahsinBook] = useState<string>(YANFAUNA_BOOKS[0]);
  const [tahsinPage, setTahsinPage] = useState<string>('1');
  const [tahsinSurahNumber, setTahsinSurahNumber] = useState<number>(1);
  const [tahsinLastAyat, setTahsinLastAyat] = useState<string>('');

  // Tahfidz states
  const [tahfidzActivity, setTahfidzActivity] = useState<TahfidzActivity>('Ziyadah (Tambahan)');
  const [tahfidzJuz, setTahfidzJuz] = useState<number>(30); // Default juz 30 (Juz 'Amma) which is commonly started
  const [tahfidzSurahNumber, setTahfidzSurahNumber] = useState<number>(78); // An-Naba'
  const [tahfidzAyatRange, setTahfidzAyatRange] = useState<string>('1 - 10');

  // Evaluation & Notes
  const [grade, setGrade] = useState<ScoreGrade>('A (Mumtaz)');
  const [notes, setNotes] = useState<string>('');

  // UI state
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter Periode State for Preview & Riwayat (Semua Riwayat, Dropdown Bulan, Dropdown Tahun)
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const defaultYear = Math.max(2025, currentYear);
  const [filterPeriodMode, setFilterPeriodMode] = useState<'semua' | 'custom'>('semua');
  const [filterPeriodMonth, setFilterPeriodMonth] = useState<number | string>(currentMonth);
  const [filterPeriodYear, setFilterPeriodYear] = useState<number | string>(defaultYear);

  // Filter Kelas & Filter Guru untuk Preview & Riwayat Input
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterTeacher, setFilterTeacher] = useState<string>('ALL');

  // Edit Record Modal state
  const [editingRecord, setEditingRecord] = useState<MemorizationRecord | null>(null);
  const [editDate, setEditDate] = useState<string>('');
  const [editClassId, setEditClassId] = useState<string>('1A');
  const [editStudentId, setEditStudentId] = useState<string>('');
  const [editStudentName, setEditStudentName] = useState<string>('');
  const [editType, setEditType] = useState<MemorizationType>('tahsin');
  const [editTahsinBook, setEditTahsinBook] = useState<string>(YANFAUNA_BOOKS[0]);
  const [editTahsinPage, setEditTahsinPage] = useState<string>('1');
  const [editTahsinSurahNumber, setEditTahsinSurahNumber] = useState<number>(1);
  const [editTahsinLastAyat, setEditTahsinLastAyat] = useState<string>('');
  const [editTahfidzActivity, setEditTahfidzActivity] = useState<TahfidzActivity>('Ziyadah (Tambahan)');
  const [editTahfidzJuz, setEditTahfidzJuz] = useState<number>(30);
  const [editTahfidzSurahNumber, setEditTahfidzSurahNumber] = useState<number>(78);
  const [editTahfidzAyatRange, setEditTahfidzAyatRange] = useState<string>('1 - 10');
  const [editGrade, setEditGrade] = useState<ScoreGrade>('A (Mumtaz)');
  const [editNotes, setEditNotes] = useState<string>('');

  // Recap Filter Card State (UNDUH REKAP BULANAN SISWA GURU)
  const [rekapClass, setRekapClass] = useState<string>('1A');
  const [rekapMonth, setRekapMonth] = useState<number | string>(currentMonth);
  const [rekapYear, setRekapYear] = useState<number | string>(defaultYear);
  const [rekapJenis, setRekapJenis] = useState<'all' | 'tahsin' | 'tahfidz'>('all');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Dynamic lists from storage
  const classes = storage.getClasses();
  const teachers = storage.getTeachers();
  const students = storage.getStudents(selectedClass);
  const editStudentsInClass = storage.getStudents(editClassId);

  // Handle class change -> auto pick first student
  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);
    const inClass = storage.getStudents(newClass);
    if (inClass.length > 0) {
      setSelectedStudentId(inClass[0].id);
    } else {
      setSelectedStudentId('');
    }
  };

  // Set default student if empty and students available
  React.useEffect(() => {
    if ((!selectedStudentId || !students.some(s => s.id === selectedStudentId)) && students.length > 0) {
      setSelectedStudentId(students[0].id);
    }
  }, [selectedClass, students, selectedStudentId]);

  // When tahfidz surah changes, update Juz accordingly if known
  const handleSurahChange = (surahNum: number) => {
    setTahfidzSurahNumber(surahNum);
    const found = QURAN_SURAHS.find(s => s.number === surahNum);
    if (found) {
      setTahfidzJuz(found.juzStart);
    }
  };

  // Records query
  const allRecords = storage.getRecords();
  const todayRecords = allRecords.filter(r => r.date === todayStr);

  // Google Drive state
  const [driveUser, setDriveUser] = useState<any>(null);
  const [isDriveUploading, setIsDriveUploading] = useState<boolean>(false);
  const [driveFileLink, setDriveFileLink] = useState<string | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);

  React.useEffect(() => {
    const unsubscribe = initDriveAuth(
      (user) => setDriveUser(user),
      () => setDriveUser(null)
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleConnectDrive = async () => {
    setDriveError(null);
    try {
      const res = await signInWithGoogleDrive();
      if (res) {
        setDriveUser(res.user);
      }
    } catch (err: any) {
      setDriveError('Gagal menghubungkan Google Drive: ' + (err?.message || 'Login dibatalkan'));
    }
  };

  const handleUploadDrive = async () => {
    if (rekapData.length === 0) return;
    setDriveError(null);
    setDriveFileLink(null);

    let token = getDriveAccessToken();
    if (!token) {
      try {
        const res = await signInWithGoogleDrive();
        if (!res) return;
        setDriveUser(res.user);
        token = res.token;
      } catch (err: any) {
        setDriveError('Gagal menghubungkan ke Google Drive: ' + (err?.message || 'Akses ditolak'));
        return;
      }
    }

    // MANDATORY confirmation dialog before mutating Drive data
    const confirmed = window.confirm(
      `Simpan file Rekap Perkembangan Santri (${rekapData.length} data) ke akun Google Drive Anda? Tindakan ini akan membuat spreadsheet baru di Google Drive Anda.`
    );
    if (!confirmed) return;

    setIsDriveUploading(true);
    try {
      const res = await uploadRekapToGoogleDrive(rekapData, rekapClass, rekapMonth, rekapYear);
      setDriveFileLink(res.webViewLink);
    } catch (err: any) {
      setDriveError('Gagal mengunggah ke Google Drive: ' + (err?.message || 'Terjadi kesalahan'));
    } finally {
      setIsDriveUploading(false);
    }
  };

  // Records filtering based on Filter Periode (Semua Riwayat vs Dropdown Bulan & Tahun), Filter Kelas, and Filter Guru
  const displayedRecords = allRecords.filter(r => {
    if (filterPeriodMode === 'custom') {
      const recDate = new Date(r.date);
      const rMonth = recDate.getMonth() + 1;
      const rYear = recDate.getFullYear();

      if (filterPeriodMonth !== 'ALL' && rMonth !== Number(filterPeriodMonth)) {
        return false;
      }
      if (filterPeriodYear !== 'ALL' && rYear !== Number(filterPeriodYear)) {
        return false;
      }
    }

    if (filterClass !== 'ALL' && r.classId.toUpperCase() !== filterClass.toUpperCase()) {
      return false;
    }

    if (filterTeacher !== 'ALL' && r.teacherName !== filterTeacher && r.teacherId !== filterTeacher) {
      return false;
    }

    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return r.studentName.toLowerCase().includes(q) || r.classId.toLowerCase().includes(q) || r.teacherName.toLowerCase().includes(q);
  });

  // Handle Open Edit Modal
  const handleOpenEditModal = (rec: MemorizationRecord) => {
    setEditingRecord(rec);
    setEditDate(rec.date);
    setEditClassId(rec.classId);
    setEditStudentId(rec.studentId);
    setEditStudentName(rec.studentName);
    setEditType(rec.type);
    setEditTahsinBook(rec.tahsinBook || YANFAUNA_BOOKS[0]);
    setEditTahsinPage(rec.tahsinPage || '1');
    setEditTahsinSurahNumber(rec.tahsinSurahNumber || 1);
    setEditTahsinLastAyat(rec.tahsinLastAyat || '');
    setEditTahfidzActivity(rec.tahfidzActivity || 'Ziyadah (Tambahan)');
    setEditTahfidzJuz(rec.tahfidzJuz || 30);
    setEditTahfidzSurahNumber(rec.tahfidzSurahNumber || 78);
    setEditTahfidzAyatRange(rec.tahfidzAyatRange || '1 - 10');
    setEditGrade(rec.grade);
    setEditNotes(rec.notes || '');
  };

  const handleEditClassChange = (newClass: string) => {
    setEditClassId(newClass);
    const inClass = storage.getStudents(newClass);
    if (inClass.length > 0) {
      setEditStudentId(inClass[0].id);
      setEditStudentName(inClass[0].name);
    } else {
      setEditStudentId('');
      setEditStudentName('');
    }
  };

  const handleEditStudentChange = (stId: string) => {
    setEditStudentId(stId);
    const found = editStudentsInClass.find(s => s.id === stId);
    if (found) {
      setEditStudentName(found.name);
    }
  };

  const handleEditSurahChange = (surahNum: number) => {
    setEditTahfidzSurahNumber(surahNum);
    const found = QURAN_SURAHS.find(s => s.number === surahNum);
    if (found) {
      setEditTahfidzJuz(found.juzStart);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const selectedTahfidzSurah = QURAN_SURAHS.find(s => s.number === editTahfidzSurahNumber);
    const selectedTahsinSurah = QURAN_SURAHS.find(s => s.number === editTahsinSurahNumber);

    storage.updateRecord(editingRecord.id, {
      date: editDate,
      classId: editClassId,
      studentId: editStudentId,
      studentName: editStudentName,
      type: editType,
      tahsinBook: editType === 'tahsin' ? editTahsinBook : undefined,
      tahsinPage: editType === 'tahsin' && editTahsinBook !== "Al-Qur'an" ? editTahsinPage : undefined,
      tahsinSurahNumber: editType === 'tahsin' && editTahsinBook === "Al-Qur'an" ? Number(editTahsinSurahNumber) : undefined,
      tahsinSurahName: editType === 'tahsin' && editTahsinBook === "Al-Qur'an" ? (selectedTahsinSurah?.name || `Surat ke-${editTahsinSurahNumber}`) : undefined,
      tahsinLastAyat: editType === 'tahsin' && editTahsinBook === "Al-Qur'an" ? editTahsinLastAyat : undefined,
      tahfidzActivity: editType === 'tahfidz' ? editTahfidzActivity : undefined,
      tahfidzJuz: editType === 'tahfidz' ? Number(editTahfidzJuz) : undefined,
      tahfidzSurahNumber: editType === 'tahfidz' ? Number(editTahfidzSurahNumber) : undefined,
      tahfidzSurahName: editType === 'tahfidz' ? (selectedTahfidzSurah?.name || `Surat ke-${editTahfidzSurahNumber}`) : undefined,
      tahfidzAyatRange: editType === 'tahfidz' ? editTahfidzAyatRange : undefined,
      grade: editGrade,
      notes: editNotes
    }, currentUser.name);

    setEditingRecord(null);
  };

  // Handle Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) {
      alert('Pilih siswa terlebih dahulu.');
      return;
    }

    const selectedTahfidzSurah = QURAN_SURAHS.find(s => s.number === tahfidzSurahNumber);
    const selectedTahsinSurah = QURAN_SURAHS.find(s => s.number === tahsinSurahNumber);

    storage.addRecord({
      date,
      classId: selectedClass,
      studentId: student.id,
      studentName: student.name,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      type,
      tahsinBook: type === 'tahsin' ? tahsinBook : undefined,
      tahsinPage: type === 'tahsin' && tahsinBook !== "Al-Qur'an" ? tahsinPage : undefined,
      tahsinSurahNumber: type === 'tahsin' && tahsinBook === "Al-Qur'an" ? Number(tahsinSurahNumber) : undefined,
      tahsinSurahName: type === 'tahsin' && tahsinBook === "Al-Qur'an" ? (selectedTahsinSurah?.name || `Surat ke-${tahsinSurahNumber}`) : undefined,
      tahsinLastAyat: type === 'tahsin' && tahsinBook === "Al-Qur'an" ? tahsinLastAyat : undefined,
      tahfidzActivity: type === 'tahfidz' ? tahfidzActivity : undefined,
      tahfidzJuz: type === 'tahfidz' ? Number(tahfidzJuz) : undefined,
      tahfidzSurahNumber: type === 'tahfidz' ? Number(tahfidzSurahNumber) : undefined,
      tahfidzSurahName: type === 'tahfidz' ? (selectedTahfidzSurah?.name || `Surat ke-${tahfidzSurahNumber}`) : undefined,
      tahfidzAyatRange: type === 'tahfidz' ? tahfidzAyatRange : undefined,
      grade,
      notes
    });

    setSaveSuccess(true);
    setNotes('');

    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Hapus data setoran ini?')) {
      storage.deleteRecord(id, currentUser.name);
    }
  };

  // Recap filtering
  const rekapData = storage.getRekapGuru(rekapClass, rekapMonth, rekapYear, rekapJenis);

  const handleDownloadExcel = () => {
    exportRekapToExcel(rekapData, rekapClass, rekapMonth, rekapYear, rekapJenis);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-[#00C2A0] to-[#008E75] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <BookMarked className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Portal Input Pembelajaran Qur'an</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ahlan wa Sahlan, {currentUser.name}
          </h1>
          <p className="mt-1 text-sm text-teal-50 max-w-2xl">
            Catatan dan evaluasi kemajuan Tahsin & Tahfidz siswa SD IT Salsabila 3 Banguntapan.
          </p>
        </div>
      </div>

      {/* Main Grid: Form Input (Left) & Preview / Log (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* FORM INPUT SETORAN */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-[#3F4E5A] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#00C2A0]" />
                <span>Form Input Laporan Siswa</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Pilih jenis pembelajaran, santri, dan evaluasi hasil hafalan.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-[#008E75] rounded-lg border border-teal-100">
              Guru: {currentUser.name.split(' ')[0]}
            </span>
          </div>

          {saveSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-sm flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-[#00C2A0] shrink-0" />
              <div>
                <p className="font-bold">Alhamdulillah, Data Berhasil Disimpan!</p>
                <p className="text-xs text-teal-600">Laporan capaian langsung tampil pada riwayat dan dashboard wali.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tanggal & Kelas Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#3F4E5A] mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#00C2A0]" />
                  <span>Tanggal Input</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#00C2A0] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3F4E5A] mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#00C2A0]" />
                  <span>Pilih Kelas</span>
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#00C2A0] focus:border-transparent font-semibold text-gray-700 bg-white"
                >
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>Kelas {cls}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nama Peserta Didik (Tanpa NIS) */}
            <div>
              <label className="block text-xs font-bold text-[#3F4E5A] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#00C2A0]" />
                  <span>Data Peserta Didik (Kelas {selectedClass})</span>
                </span>
                <span className="text-[11px] font-normal text-gray-400">
                  {students.length} Siswa Terdaftar
                </span>
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#00C2A0] focus:border-transparent text-gray-800 font-medium bg-white"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle Jenis Pelajaran: Tahsin atau Tahfidz */}
            <div>
              <label className="block text-xs font-bold text-[#3F4E5A] mb-1.5">
                Pilihan Jenis Pembelajaran
              </label>
              <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setType('tahsin')}
                  className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    type === 'tahsin'
                      ? 'bg-white text-[#00C2A0] shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Tahsin (Yanfa'una / Al-Qur'an)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('tahfidz')}
                  className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    type === 'tahfidz'
                      ? 'bg-white text-[#00C2A0] shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Tahfidz (Hafalan Al-Qur'an)</span>
                </button>
              </div>
            </div>

            {/* CONDITIONAL: TAHSIN FIELDS */}
            {type === 'tahsin' && (
              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-4 animate-in fade-in">
                <div className="text-xs font-bold text-[#008E75] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Detail Materi Tahsin</span>
                </div>

                {tahsinBook !== "Al-Qur'an" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Pilihan Buku
                      </label>
                      <select
                        value={tahsinBook}
                        onChange={(e) => setTahsinBook(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#00C2A0]"
                      >
                        {YANFAUNA_BOOKS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Halaman
                      </label>
                      <input
                        type="text"
                        value={tahsinPage}
                        onChange={(e) => setTahsinPage(e.target.value)}
                        placeholder="Contoh: 12 atau 12-14"
                        required={tahsinBook !== "Al-Qur'an"}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#00C2A0]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Pilihan Buku
                      </label>
                      <select
                        value={tahsinBook}
                        onChange={(e) => setTahsinBook(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-[#00C2A0]"
                      >
                        {YANFAUNA_BOOKS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-teal-200/60 animate-in fade-in">
                      <div>
                        <label className="block text-xs font-bold text-[#3F4E5A] mb-1">
                          Surat dalam Al-Qur'an
                        </label>
                        <select
                          value={tahsinSurahNumber}
                          onChange={(e) => setTahsinSurahNumber(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-teal-300 text-xs font-medium focus:ring-2 focus:ring-[#00C2A0]"
                        >
                          {QURAN_SURAHS.map((surah) => (
                            <option key={surah.number} value={surah.number}>
                              {surah.number}. {surah.name} ({surah.arabicName} - {surah.totalAyat} ayat)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#3F4E5A] mb-1">
                          Kolom Penulisan Ayat Terakhir yang Dibaca
                        </label>
                        <input
                          type="text"
                          value={tahsinLastAyat}
                          onChange={(e) => setTahsinLastAyat(e.target.value)}
                          placeholder="Contoh: Ayat 45 atau 1-20"
                          required={tahsinBook === "Al-Qur'an"}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-teal-300 text-xs focus:ring-2 focus:ring-[#00C2A0]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CONDITIONAL: TAHFIDZ FIELDS */}
            {type === 'tahfidz' && (
              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-4 animate-in fade-in">
                <div className="text-xs font-bold text-[#008E75] flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Detail Materi Tahfidz</span>
                </div>

                {/* 1. Aktifitas Pembelajaran */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Aktifitas Pembelajaran
                  </label>
                  <select
                    value={tahfidzActivity}
                    onChange={(e) => setTahfidzActivity(e.target.value as TahfidzActivity)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#00C2A0]"
                  >
                    <option value="Ziyadah (Tambahan)">Ziyadah (Tambahan)</option>
                    <option value="Murojaah (Mengulang)">Murojaah (Mengulang)</option>
                    <option value="Evaluasi (Penilaian Hafalan)">Evaluasi (Penilaian Hafalan)</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 2. Juz 1-30 */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Juz 1-30
                    </label>
                    <select
                      value={tahfidzJuz}
                      onChange={(e) => setTahfidzJuz(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#00C2A0]"
                    >
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                        <option key={juz} value={juz}>Juz {juz}</option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Surat 114 */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Surat
                    </label>
                    <select
                      value={tahfidzSurahNumber}
                      onChange={(e) => handleSurahChange(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#00C2A0]"
                    >
                      {QURAN_SURAHS.map((surah) => (
                        <option key={surah.number} value={surah.number}>
                          {surah.number}. {surah.name} ({surah.arabicName} - {surah.totalAyat} ayat)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. Rentang Ayat */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Rentang Ayat
                  </label>
                  <input
                    type="text"
                    value={tahfidzAyatRange}
                    onChange={(e) => setTahfidzAyatRange(e.target.value)}
                    placeholder="Tulis manual, contoh: 1 - 10 atau 1 - 30"
                    required
                    className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#00C2A0]"
                  />
                </div>
              </div>
            )}

            {/* Kolom Penilaian & Evaluasi */}
            <div>
              <label className="block text-xs font-bold text-[#3F4E5A] mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#00C2A0]" />
                <span>Kolom Penilaian Evaluasi & Pencapaian</span>
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as ScoreGrade)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold focus:ring-2 focus:ring-[#00C2A0] focus:border-transparent bg-white text-gray-800"
              >
                <option value="A (Mumtaz)">A (Mumtaz)</option>
                <option value="A- (Jayyid Jiddan)">A- (Jayyid Jiddan)</option>
                <option value="B (Jayyid)">B (Jayyid)</option>
                <option value="Mengulang">Mengulang</option>
              </select>
            </div>

            {/* Kolom Keterangan / Catatan Guru */}
            <div>
              <label className="block text-xs font-bold text-[#3F4E5A] mb-1.5">
                Kolom Keterangan / Catatan Guru
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Catatan makhraj, kelancaran tajwid, adab, atau pesan motivasi untuk siswa..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#00C2A0] focus:border-transparent"
              />
            </div>

            {/* Tombol Simpan Data */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-[#00C2A0] hover:bg-[#009e82] text-white text-sm font-bold shadow-lg transition-all duration-150 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Data Hafalan</span>
            </button>
          </form>
        </div>

        {/* PREVIEW HASIL SIMPAN HARI INI & RIWAYAT INPUTAN SEBELUMNYA */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 flex flex-col min-h-[580px]">
          <div className="pb-4 mb-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#3F4E5A] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#00C2A0]" />
              <span>Preview & Riwayat Input</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Pantau data hasil input dan riwayat perkembangan hafalan santri.
            </p>
          </div>

          {/* FILTER PERIODE, FILTER KELAS, & FILTER GURU */}
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 mb-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#3F4E5A] flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#00C2A0]" />
                <span>Filter Riwayat:</span>
              </span>
              <span className="text-[11px] font-semibold text-[#008E75] text-right truncate max-w-[220px]">
                {filterPeriodMode === 'semua'
                  ? 'Semua Periode'
                  : `${filterPeriodMonth === 'ALL' ? 'Semua Bulan' : MONTH_NAMES[Number(filterPeriodMonth) - 1]} ${filterPeriodYear}`}
                {filterClass !== 'ALL' && ` • Kelas ${filterClass}`}
                {filterTeacher !== 'ALL' && ` • ${filterTeacher.split(' ')[0]}`}
              </span>
            </div>

            {/* Row 1: Filter Periode (Semua, Bulan, Tahun) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Pilihan Semua Riwayat */}
              <button
                type="button"
                onClick={() => {
                  setFilterPeriodMode('semua');
                  setFilterPeriodMonth('ALL');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  filterPeriodMode === 'semua'
                    ? 'bg-[#00C2A0] text-white border-[#00C2A0] shadow-xs'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Semua Riwayat
              </button>

              {/* Dropdown Bulan */}
              <select
                value={filterPeriodMode === 'semua' ? 'ALL' : filterPeriodMonth}
                onChange={(e) => {
                  setFilterPeriodMode('custom');
                  setFilterPeriodMonth(e.target.value);
                }}
                className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-700 focus:ring-2 focus:ring-[#00C2A0]"
              >
                <option value="ALL">Semua Bulan</option>
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx + 1}>{name}</option>
                ))}
              </select>

              {/* Dropdown Tahun (2025 sampai seterusnya) */}
              <select
                value={filterPeriodYear}
                onChange={(e) => {
                  setFilterPeriodMode('custom');
                  setFilterPeriodYear(Number(e.target.value));
                }}
                className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-700 focus:ring-2 focus:ring-[#00C2A0]"
              >
                {AVAILABLE_YEARS.map((y) => (
                  <option key={y} value={y}>Tahun {y}</option>
                ))}
              </select>
            </div>

            {/* Row 2: Filter Kelas & Filter Guru */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-200/60">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Filter Kelas:
                </label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full py-2 px-2.5 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-700 focus:ring-2 focus:ring-[#00C2A0]"
                >
                  <option value="ALL">Semua Kelas</option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>Kelas {cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Filter Guru Pengampu:
                </label>
                <select
                  value={filterTeacher}
                  onChange={(e) => setFilterTeacher(e.target.value)}
                  className="w-full py-2 px-2.5 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-700 focus:ring-2 focus:ring-[#00C2A0]"
                >
                  <option value="ALL">Semua Guru Pengampu</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Search filter within preview */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama siswa, kelas, atau guru..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C2A0]"
            />
          </div>

          {/* Records List */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[460px] pr-1">
            {displayedRecords.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300 stroke-1" />
                <p className="text-sm font-semibold text-gray-500">
                  Belum ada data rekaman pada filter ini
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Sesuaikan filter atau gunakan form di samping untuk menginput capaian siswa.
                </p>
              </div>
            ) : (
              displayedRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl border border-gray-100 hover:border-teal-200 bg-[#FDFDFD] hover:bg-teal-50/20 transition group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-[#3F4E5A]">
                          {rec.studentName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-200 text-gray-700">
                          {rec.classId}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            rec.type === 'tahsin'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {rec.type === 'tahsin' ? 'Tahsin' : 'Tahfidz'}
                        </span>
                      </div>

                      <div className="mt-1 text-xs text-gray-600 font-medium">
                        {rec.type === 'tahsin' ? (
                          rec.tahsinBook === "Al-Qur'an" ? (
                            <span>
                              📖 <strong>Al-Qur'an</strong>: Surat {rec.tahsinSurahName || '-'}, Ayat Terakhir: <strong className="text-[#00C2A0]">{rec.tahsinLastAyat || '-'}</strong>
                            </span>
                          ) : (
                            <span>
                              📖 {rec.tahsinBook} — <strong>Halaman {rec.tahsinPage}</strong>
                            </span>
                          )
                        ) : (
                          <span>
                            🌟 {rec.tahfidzActivity ? <strong className="text-emerald-700">[{rec.tahfidzActivity}] </strong> : null}
                            <strong>Surat {rec.tahfidzSurahName}</strong> (Juz {rec.tahfidzJuz}), Ayat {rec.tahfidzAyatRange}
                          </span>
                        )}
                      </div>

                      {rec.notes && (
                        <p className="mt-1 text-[11px] text-gray-500 italic bg-white p-2 rounded-lg border border-gray-100">
                          "{rec.notes}"
                        </p>
                      )}

                      <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-2">
                        <span>📅 {rec.date}</span>
                        <span>&bull;</span>
                        <span>Oleh: {rec.teacherName}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border whitespace-nowrap ${
                        rec.grade === 'Mengulang'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-[#00C2A0]/10 text-[#008E75] border-[#00C2A0]/20'
                      }`}>
                        {rec.grade}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(rec)}
                          className="text-gray-400 hover:text-[#00C2A0] p-1.5 rounded-lg hover:bg-teal-50 transition cursor-pointer"
                          title="Edit rekaman ini"
                        >
                          <Pencil className="w-3.5 h-3.5 text-gray-400 hover:text-[#00C2A0]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(rec.id)}
                          className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                          title="Hapus rekaman ini"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* KARTU ANTARMUKA: "UNDUH REKAP BULANAN SISWA (GURU)" */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-6 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#008E75] text-xs font-bold mb-2">
              <Download className="w-3.5 h-3.5" />
              <span>Modul Ekspor & Pelaporan Guru</span>
            </div>
            <h2 className="text-xl font-black text-[#3F4E5A] tracking-tight uppercase">
              UNDUH REKAP BULANAN SISWA (GURU)
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Filter data log perkembangan hafalan santri di SD IT Salsabila 3 Banguntapan dan konversi instan ke file Microsoft Excel atau cetak resmi PDF.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadExcel}
              disabled={rekapData.length === 0}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleUploadDrive}
              disabled={rekapData.length === 0 || isDriveUploading}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#00C2A0] hover:bg-[#009e82] text-white text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
              title="Simpan rekap capaian langsung ke Google Drive"
            >
              <CloudUpload className="w-4 h-4" />
              <span>{isDriveUploading ? 'Menyimpan...' : 'Simpan ke Google Drive'}</span>
            </button>

            <button
              onClick={() => setShowPrintModal(true)}
              disabled={rekapData.length === 0}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#3F4E5A] hover:bg-[#2B3740] text-white text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF Resmi</span>
            </button>
          </div>
        </div>

        {/* Google Drive Status Notification */}
        {driveFileLink && (
          <div className="mb-4 p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#00C2A0] shrink-0" />
              <div>
                <p className="font-bold">Rekap Berhasil Disimpan ke Google Drive Anda!</p>
                <p className="text-[11px] text-teal-700">File spreadsheet telah dibuat dan siap diakses kapan saja.</p>
              </div>
            </div>
            <a
              href={driveFileLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-white text-[#008E75] font-bold text-xs border border-teal-200 hover:bg-teal-100 flex items-center gap-1.5 shadow-xs"
            >
              <span>Buka di Google Drive</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {driveError && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {driveError}
          </div>
        )}

        {/* Flexible Filter Form: Jenis, Kelas, Bulan, Tahun */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#FDFDFD] border border-gray-100 mb-6">
          <div>
            <label className="block text-xs font-bold text-[#3F4E5A] mb-1">
              Pilihan Rekap Pembelajaran
            </label>
            <select
              value={rekapJenis}
              onChange={(e) => setRekapJenis(e.target.value as 'all' | 'tahsin' | 'tahfidz')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-teal-300 text-xs font-bold text-[#008E75] focus:ring-2 focus:ring-[#00C2A0] bg-teal-50/50"
            >
              <option value="all">Semua (Tahsin & Tahfidz)</option>
              <option value="tahsin">Khusus Rekapan Tahsin</option>
              <option value="tahfidz">Khusus Rekapan Tahfidz</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3F4E5A] mb-1">
              Kombinasi Kelas
            </label>
            <select
              value={rekapClass}
              onChange={(e) => setRekapClass(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-[#00C2A0] bg-white"
            >
              <option value="ALL">Semua Kelas</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>Kelas {cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3F4E5A] mb-1">
              Bulan Perkembangan
            </label>
            <select
              value={rekapMonth}
              onChange={(e) => setRekapMonth(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-[#00C2A0] bg-white"
            >
              <option value="ALL">Semua Bulan</option>
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3F4E5A] mb-1">
              Tahun Perkembangan
            </label>
            <select
              value={rekapYear}
              onChange={(e) => setRekapYear(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-[#00C2A0] bg-white"
            >
              <option value="ALL">Semua Tahun</option>
              {AVAILABLE_YEARS.map((y) => (
                <option key={y} value={y}>Tahun {y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Filter Summary & Table Preview */}
        <div>
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-[#3F4E5A]">
              Hasil Filter: <span className="text-[#00C2A0]">{rekapData.length} Data Capaian Ditemukan</span>
              {rekapJenis !== 'all' && (
                <span className="ml-2 px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 font-bold text-[10px]">
                  {rekapJenis === 'tahsin' ? 'Rekap Tahsin' : 'Rekap Tahfidz'}
                </span>
              )}
            </span>
            <span className="text-gray-400">
              Periode: {rekapMonth === 'ALL' ? 'Semua Bulan' : getMonthLabel(rekapMonth)} {rekapYear}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3">Nama Siswa</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3">Materi / Capaian</th>
                  <th className="px-4 py-3">Nilai</th>
                  <th className="px-4 py-3">Catatan</th>
                  <th className="px-4 py-3">Guru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {rekapData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                      Tidak ada data log hafalan untuk kombinasi kelas, bulan, dan tahun ini.
                    </td>
                  </tr>
                ) : (
                  rekapData.map((row, index) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-400 font-mono">{index + 1}</td>
                      <td className="px-4 py-2.5 font-medium whitespace-nowrap">{row.date}</td>
                      <td className="px-4 py-2.5 font-bold text-gray-700">{row.classId}</td>
                      <td className="px-4 py-2.5 font-bold text-[#3F4E5A]">{row.studentName}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                          row.type === 'tahsin' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {row.type === 'tahsin' ? 'Tahsin' : 'Tahfidz'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-700 font-medium">
                        {row.type === 'tahsin'
                          ? (row.tahsinBook === "Al-Qur'an"
                              ? `Al-Qur'an: Surat ${row.tahsinSurahName || '-'} (Ayat Terakhir: ${row.tahsinLastAyat || '-'})`
                              : `${row.tahsinBook} (Hal. ${row.tahsinPage})`)
                          : `${row.tahfidzActivity ? `[${row.tahfidzActivity}] ` : ''}Surat ${row.tahfidzSurahName} (Juz ${row.tahfidzJuz}), Ayat ${row.tahfidzAyatRange}`}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-[#008E75]">{row.grade}</td>
                      <td className="px-4 py-2.5 text-gray-500 max-w-xs truncate">{row.notes || '-'}</td>
                      <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{row.teacherName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PRINTABLE OFFICIAL REPORT MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-100 no-print">
              <h3 className="text-lg font-bold text-[#3F4E5A]">Preview Cetak Dokumen Resmi</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-[#00C2A0] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Sekarang</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div id="printable-rekap-area">
              <LetterheadKop
                title={`REKAP PERKEMBANGAN ${rekapJenis === 'tahsin' ? 'TAHSIN' : rekapJenis === 'tahfidz' ? 'TAHFIDZ' : 'TAHFIDZ & TAHSIN'} SISWA`}
                subtitle={`Kelas: ${rekapClass === 'ALL' ? 'Semua Kelas' : rekapClass} | Periode: ${rekapMonth === 'ALL' ? 'Semua Bulan' : getMonthLabel(rekapMonth)} ${rekapYear}`}
              />

              <div className="mt-4 mb-6">
                <table className="w-full border-collapse border border-gray-300 text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-2 py-1.5 text-center">No</th>
                      <th className="border border-gray-300 px-2 py-1.5">Tanggal</th>
                      <th className="border border-gray-300 px-2 py-1.5">Kelas</th>
                      <th className="border border-gray-300 px-2 py-1.5">Nama Siswa</th>
                      <th className="border border-gray-300 px-2 py-1.5">Pelajaran</th>
                      <th className="border border-gray-300 px-2 py-1.5">Materi / Capaian</th>
                      <th className="border border-gray-300 px-2 py-1.5">Nilai</th>
                      <th className="border border-gray-300 px-2 py-1.5">Catatan Guru</th>
                      <th className="border border-gray-300 px-2 py-1.5">Guru Pengampu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rekapData.map((r, i) => (
                      <tr key={r.id}>
                        <td className="border border-gray-300 px-2 py-1.5 text-center">{i + 1}</td>
                        <td className="border border-gray-300 px-2 py-1.5 whitespace-nowrap">{r.date}</td>
                        <td className="border border-gray-300 px-2 py-1.5 text-center font-bold">{r.classId}</td>
                        <td className="border border-gray-300 px-2 py-1.5 font-semibold">{r.studentName}</td>
                        <td className="border border-gray-300 px-2 py-1.5">{r.type === 'tahsin' ? 'Tahsin' : 'Tahfidz'}</td>
                        <td className="border border-gray-300 px-2 py-1.5">
                          {r.type === 'tahsin'
                            ? (r.tahsinBook === "Al-Qur'an"
                                ? `Al-Qur'an: Surat ${r.tahsinSurahName || '-'} (Ayat Terakhir: ${r.tahsinLastAyat || '-'})`
                                : `${r.tahsinBook} Hal. ${r.tahsinPage}`)
                            : `${r.tahfidzActivity ? `[${r.tahfidzActivity}] ` : ''}Surat ${r.tahfidzSurahName} (Ayat ${r.tahfidzAyatRange})`}
                        </td>
                        <td className="border border-gray-300 px-2 py-1.5 font-bold">{r.grade}</td>
                        <td className="border border-gray-300 px-2 py-1.5">{r.notes || '-'}</td>
                        <td className="border border-gray-300 px-2 py-1.5 whitespace-nowrap">{r.teacherName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signature area */}
              <div className="flex justify-between items-end mt-12 text-xs pt-4">
                <div className="text-center">
                  <p>Mengetahui,</p>
                  <p className="font-bold">Kepala SD IT Salsabila 3 Banguntapan</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">Ustadz / Ustadzah Kepala</p>
                  <p className="text-[11px] text-gray-500">NIP / NIY. 19820415 200812 1 002</p>
                </div>

                <div className="text-center">
                  <p>Bantul, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="font-bold">Guru Koordinator Qur'an,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{currentUser.name}</p>
                  <p className="text-[11px] text-gray-500">Guru Pengampu Al-Qur'an</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT DATA SETORAN */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#00C2A0] flex items-center justify-center border border-teal-100">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#3F4E5A]">Edit Riwayat Capaian Siswa</h3>
                  <p className="text-xs text-gray-400">Perbarui data hafalan santri yang telah tersimpan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Tanggal & Kelas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#3F4E5A] mb-1">
                    Tanggal Setoran
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#00C2A0]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3F4E5A] mb-1">
                    Kelas
                  </label>
                  <select
                    value={editClassId}
                    onChange={(e) => handleEditClassChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold bg-white focus:ring-2 focus:ring-[#00C2A0]"
                  >
                    {classes.map((cls) => (
                      <option key={cls} value={cls}>Kelas {cls}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Santri */}
              <div>
                <label className="block text-xs font-bold text-[#3F4E5A] mb-1">
                  Nama Santri
                </label>
                <select
                  value={editStudentId}
                  onChange={(e) => handleEditStudentChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold bg-white focus:ring-2 focus:ring-[#00C2A0]"
                >
                  {editStudentsInClass.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Jenis Pembelajaran Toggle */}
              <div>
                <label className="block text-xs font-bold text-[#3F4E5A] mb-1">
                  Jenis Pembelajaran
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setEditType('tahsin')}
                    className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      editType === 'tahsin'
                        ? 'bg-white text-[#00C2A0] shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Tahsin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType('tahfidz')}
                    className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      editType === 'tahfidz'
                        ? 'bg-white text-[#00C2A0] shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Tahfidz</span>
                  </button>
                </div>
              </div>

              {/* Tahsin Fields */}
              {editType === 'tahsin' && (
                <div className="p-3.5 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Pilihan Buku
                    </label>
                    <select
                      value={editTahsinBook}
                      onChange={(e) => setEditTahsinBook(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#00C2A0]"
                    >
                      {YANFAUNA_BOOKS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {editTahsinBook !== "Al-Qur'an" ? (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Halaman
                      </label>
                      <input
                        type="text"
                        value={editTahsinPage}
                        onChange={(e) => setEditTahsinPage(e.target.value)}
                        placeholder="Contoh: 12 atau 12-14"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#00C2A0]"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Surat dalam Al-Qur'an
                        </label>
                        <select
                          value={editTahsinSurahNumber}
                          onChange={(e) => setEditTahsinSurahNumber(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#00C2A0]"
                        >
                          {QURAN_SURAHS.map((surah) => (
                            <option key={surah.number} value={surah.number}>
                              {surah.number}. {surah.name} ({surah.totalAyat} ayat)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Ayat Terakhir yang Dibaca
                        </label>
                        <input
                          type="text"
                          value={editTahsinLastAyat}
                          onChange={(e) => setEditTahsinLastAyat(e.target.value)}
                          placeholder="Contoh: Ayat 45 atau 1-20"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#00C2A0]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tahfidz Fields */}
              {editType === 'tahfidz' && (
                <div className="p-3.5 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Aktifitas Pembelajaran
                    </label>
                    <select
                      value={editTahfidzActivity}
                      onChange={(e) => setEditTahfidzActivity(e.target.value as TahfidzActivity)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#00C2A0]"
                    >
                      <option value="Ziyadah (Tambahan)">Ziyadah (Tambahan)</option>
                      <option value="Murojaah (Mengulang)">Murojaah (Mengulang)</option>
                      <option value="Evaluasi (Penilaian Hafalan)">Evaluasi (Penilaian Hafalan)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Juz 1-30
                      </label>
                      <select
                        value={editTahfidzJuz}
                        onChange={(e) => setEditTahfidzJuz(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#00C2A0]"
                      >
                        {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                          <option key={juz} value={juz}>Juz {juz}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Surat
                      </label>
                      <select
                        value={editTahfidzSurahNumber}
                        onChange={(e) => handleEditSurahChange(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#00C2A0]"
                      >
                        {QURAN_SURAHS.map((surah) => (
                          <option key={surah.number} value={surah.number}>
                            {surah.number}. {surah.name} ({surah.totalAyat} ayat)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Rentang Ayat
                    </label>
                    <input
                      type="text"
                      value={editTahfidzAyatRange}
                      onChange={(e) => setEditTahfidzAyatRange(e.target.value)}
                      placeholder="Contoh: 1 - 10"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#00C2A0]"
                    />
                  </div>
                </div>
              )}

              {/* Nilai */}
              <div>
                <label className="block text-xs font-bold text-[#3F4E5A] mb-1">
                  Penilaian
                </label>
                <select
                  value={editGrade}
                  onChange={(e) => setEditGrade(e.target.value as ScoreGrade)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-white focus:ring-2 focus:ring-[#00C2A0]"
                >
                  <option value="A (Mumtaz)">A (Mumtaz)</option>
                  <option value="A- (Jayyid Jiddan)">A- (Jayyid Jiddan)</option>
                  <option value="B (Jayyid)">B (Jayyid)</option>
                  <option value="Mengulang">Mengulang</option>
                </select>
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-xs font-bold text-[#3F4E5A] mb-1">
                  Catatan Guru
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  placeholder="Catatan makhraj, kelancaran tajwid, dll..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#00C2A0]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#00C2A0] hover:bg-[#009e82] transition shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
