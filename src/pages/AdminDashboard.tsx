import React, { useState } from 'react';
import { User, Student, Teacher, ActivityLog, MemorizationRecord } from '../types';
import { storage, DEFAULT_PASSWORD, makeWaliUsername } from '../lib/storage';
import { getCloudConfig, saveCloudConfig, isCloudConnected } from '../lib/supabaseClient';
import { AVAILABLE_YEARS, MONTH_NAMES } from '../lib/exportUtils';
import { generateSupabaseSqlScript } from '../lib/sqlExport';
import { 
  Users, 
  BookOpen, 
  Layers, 
  KeyRound, 
  History, 
  Database, 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  BarChart3,
  Calendar,
  ShieldCheck,
  Download,
  Filter,
  Copy,
  Check
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'siswa' | 'guru' | 'kelas' | 'reset-pass' | 'logs' | 'database'>('monitoring');

  // Monitoring filter states (Semua Riwayat, Dropdown Bulan, Dropdown Tahun 2025 onwards)
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const defaultYear = Math.max(2025, currentYear);
  const [monPeriodMode, setMonPeriodMode] = useState<'semua' | 'custom'>('semua');
  const [monMonth, setMonMonth] = useState<number | string>(currentMonth);
  const [monYear, setMonYear] = useState<number | string>(defaultYear);
  const [monClass, setMonClass] = useState<string>('ALL');
  const [monSearch, setMonSearch] = useState<string>('');

  // Search and filter states
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('ALL');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');

  // Modals & form states
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('1A');

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentClass, setEditStudentClass] = useState('');

  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherUsername, setNewTeacherUsername] = useState('');

  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editTeacherName, setEditTeacherName] = useState('');
  const [editTeacherUsername, setEditTeacherUsername] = useState('');

  const [newClassName, setNewClassName] = useState('');

  // Reset pass states
  const [authAccounts, setAuthAccounts] = useState(() => storage.getAllAuthAccounts());
  const [resetSearch, setResetSearch] = useState('');
  const [resetRoleFilter, setResetRoleFilter] = useState<'ALL' | 'guru' | 'wali' | 'admin'>('ALL');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  const [accountToReset, setAccountToReset] = useState<{ username: string; name: string } | null>(null);

  // Cloud Database state (Bersih tanpa ada tulisan brand)
  const cloudConfig = getCloudConfig();
  const [cloudUrl, setCloudUrl] = useState(cloudConfig.url);
  const [cloudKey, setCloudKey] = useState(cloudConfig.anonKey);
  const [showCloudKey, setShowCloudKey] = useState(false);
  const [cloudStatusMsg, setCloudStatusMsg] = useState('');

  // Data from storage
  const classes = storage.getClasses();
  const teachers = storage.getTeachers();
  const students = storage.getStudents();
  const logs = storage.getLogs();
  const records = storage.getRecords();

  // --- Student handlers ---
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    storage.addStudent(newStudentName, newStudentClass, currentUser.name);
    setNewStudentName('');
    setShowAddStudentModal(false);
  };

  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editStudentName.trim()) return;
    storage.updateStudent(editingStudent.id, editStudentName, editStudentClass, currentUser.name);
    setEditingStudent(null);
  };

  const handleDeleteStudent = (student: Student) => {
    if (window.confirm(`Hapus data siswa "${student.name}" dari kelas ${student.classId}?`)) {
      storage.deleteStudent(student.id, currentUser.name);
    }
  };

  // --- Teacher handlers ---
  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim()) return;
    storage.addTeacher(newTeacherName, newTeacherUsername, currentUser.name);
    setNewTeacherName('');
    setNewTeacherUsername('');
    setShowAddTeacherModal(false);
  };

  const handleUpdateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher || !editTeacherName.trim()) return;
    storage.updateTeacher(editingTeacher.id, editTeacherName, editTeacherUsername, currentUser.name);
    setEditingTeacher(null);
  };

  const handleDeleteTeacher = (teacher: Teacher) => {
    if (window.confirm(`Hapus data guru "${teacher.name}"? Akun login terkait juga akan dinonaktifkan.`)) {
      storage.deleteTeacher(teacher.id, currentUser.name);
    }
  };

  // --- Class handlers ---
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    const ok = storage.addClass(newClassName, currentUser.name);
    if (ok) {
      setNewClassName('');
    } else {
      alert('Nama kelas sudah ada atau tidak valid.');
    }
  };

  // --- Reset Password handlers ---
  const handleOpenResetModal = (username: string, accountName: string) => {
    setAccountToReset({ username, name: accountName });
  };

  const handleConfirmReset = () => {
    if (!accountToReset) return;
    const ok = storage.resetPassword(accountToReset.username, currentUser.name);
    if (ok) {
      setAuthAccounts(storage.getAllAuthAccounts());
      setResetSuccessMessage(`Password akun "${accountToReset.username}" (${accountToReset.name}) berhasil direset ke "${DEFAULT_PASSWORD}".`);
      setTimeout(() => setResetSuccessMessage(''), 4000);
    }
    setAccountToReset(null);
  };

  // --- Cloud Database Save handler ---
  const handleSaveCloudConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveCloudConfig(cloudUrl, cloudKey);
    setCloudStatusMsg('Konfigurasi Basis Data Cloud berhasil disimpan.');
    setTimeout(() => setCloudStatusMsg(''), 3000);
  };

  // SQL Script generator with all simulation data (Classes, Teachers, Students, Accounts, Records, Logs)
  const [sqlCopied, setSqlCopied] = useState(false);
  const sqlScript = React.useMemo(() => {
    return generateSupabaseSqlScript(
      classes,
      teachers,
      students,
      records,
      logs,
      authAccounts
    );
  }, [classes, teachers, students, records, logs, authAccounts]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 3000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([sqlScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SALAM_Quran_Supabase_Schema_Data.sql';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filtered queries
  const filteredStudents = students.filter(s => {
    const matchClass = studentClassFilter === 'ALL' || s.classId === studentClassFilter;
    const matchName = !studentSearch || s.name.toLowerCase().includes(studentSearch.toLowerCase());
    return matchClass && matchName;
  });

  const filteredTeachers = teachers.filter(t => 
    !teacherSearch || 
    t.name.toLowerCase().includes(teacherSearch.toLowerCase()) || 
    t.username.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  const filteredLogs = logs.filter(l => 
    !logSearch || 
    l.target.toLowerCase().includes(logSearch.toLowerCase()) || 
    l.details.toLowerCase().includes(logSearch.toLowerCase()) ||
    l.performedBy.toLowerCase().includes(logSearch.toLowerCase())
  );

  const filteredAuth = authAccounts.filter(a => {
    const matchRole = resetRoleFilter === 'ALL' || a.role === resetRoleFilter;
    const matchQuery = !resetSearch ||
      a.username.toLowerCase().includes(resetSearch.toLowerCase()) ||
      a.name.toLowerCase().includes(resetSearch.toLowerCase());
    return matchRole && matchQuery;
  });

  const filteredRecords = records.filter(r => {
    if (monClass !== 'ALL' && r.classId !== monClass) return false;
    if (monPeriodMode === 'custom') {
      const recDate = new Date(r.date);
      const rMonth = recDate.getMonth() + 1;
      const rYear = recDate.getFullYear();
      if (monMonth !== 'ALL' && rMonth !== Number(monMonth)) return false;
      if (monYear !== 'ALL' && rYear !== Number(monYear)) return false;
    }
    if (monSearch) {
      const q = monSearch.toLowerCase();
      if (!r.studentName.toLowerCase().includes(q) && !r.teacherName.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Header Card */}
      <div className="bg-gradient-to-r from-[#3F4E5A] to-[#2B3740] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-400/20 text-[#00C2A0] text-xs font-bold mb-2 border border-[#00C2A0]/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Pusat Kendali Administrator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Manajemen SALAM Quran SD IT Salsabila 3
            </h1>
            <p className="mt-1 text-xs text-gray-300">
              Kelola data peserta didik, 18 dewan guru, kelas, reset password, log audit, dan monitoring.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xs text-right border border-white/10">
              <span className="text-[10px] text-gray-300 block font-semibold">Total Siswa</span>
              <strong className="text-lg font-black text-[#00C2A0]">{students.length}</strong>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xs text-right border border-white/10">
              <span className="text-[10px] text-gray-300 block font-semibold">Guru Qur'an</span>
              <strong className="text-lg font-black text-white">{teachers.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'monitoring', label: 'Monitoring Input', icon: BarChart3 },
          { id: 'siswa', label: `Kelola Siswa (${students.length})`, icon: Users },
          { id: 'guru', label: `Kelola Guru (${teachers.length})`, icon: BookOpen },
          { id: 'kelas', label: `Kelola Kelas (${classes.length})`, icon: Layers },
          { id: 'reset-pass', label: 'Reset Password', icon: KeyRound },
          { id: 'logs', label: `Log Aktivitas (${logs.length})`, icon: History },
          { id: 'database', label: 'Basis Data Cloud', icon: Database },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-[#00C2A0] text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: MONITORING SEMUA INPUT GURU */}
      {activeTab === 'monitoring' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-[#3F4E5A]">Monitoring Input Seluruh Guru</h2>
              <p className="text-xs text-gray-400">Seluruh setoran hafalan dan tahsin yang tersimpan di sistem.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 bg-teal-50 text-[#008E75] rounded-xl">
                {filteredRecords.length} / {records.length} Data Ditampilkan
              </span>
            </div>
          </div>

          {/* Filter Periode & Kelas Bar */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#3F4E5A] flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#00C2A0]" />
                <span>Filter Periode & Kelas:</span>
              </span>
              <span className="text-[11px] font-semibold text-[#008E75]">
                {monPeriodMode === 'semua'
                  ? 'Menampilkan Semua Riwayat'
                  : `${monMonth === 'ALL' ? 'Semua Bulan' : MONTH_NAMES[Number(monMonth) - 1]} ${monYear}`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {/* Pilihan Semua Riwayat */}
              <button
                type="button"
                onClick={() => setMonPeriodMode('semua')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  monPeriodMode === 'semua'
                    ? 'bg-[#00C2A0] text-white border-[#00C2A0] shadow-xs'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Semua Riwayat
              </button>

              {/* Dropdown Bulan */}
              <select
                value={monPeriodMode === 'semua' ? 'ALL' : monMonth}
                onChange={(e) => {
                  setMonPeriodMode('custom');
                  setMonMonth(e.target.value);
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
                value={monYear}
                onChange={(e) => {
                  setMonPeriodMode('custom');
                  setMonYear(Number(e.target.value));
                }}
                className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-700 focus:ring-2 focus:ring-[#00C2A0]"
              >
                {AVAILABLE_YEARS.map((y) => (
                  <option key={y} value={y}>Tahun {y}</option>
                ))}
              </select>

              {/* Filter Kelas */}
              <select
                value={monClass}
                onChange={(e) => setMonClass(e.target.value)}
                className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-700 focus:ring-2 focus:ring-[#00C2A0]"
              >
                <option value="ALL">Semua Kelas</option>
                {classes.map((cls) => (
                  <option key={cls} value={cls}>Kelas {cls}</option>
                ))}
              </select>

              {/* Pencarian Nama */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={monSearch}
                  onChange={(e) => setMonSearch(e.target.value)}
                  placeholder="Cari siswa / guru..."
                  className="w-full pl-8 pr-2.5 py-2 text-xs rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-[#00C2A0]"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3">Nama Siswa</th>
                  <th className="px-4 py-3">Pelajaran</th>
                  <th className="px-4 py-3">Materi / Halaman</th>
                  <th className="px-4 py-3">Nilai</th>
                  <th className="px-4 py-3">Catatan</th>
                  <th className="px-4 py-3">Guru Penginput</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                      Tidak ada data rekaman hafalan pada filter periode ini.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 whitespace-nowrap">{r.date}</td>
                      <td className="px-4 py-2.5 font-bold text-gray-700">{r.classId}</td>
                      <td className="px-4 py-2.5 font-bold text-[#3F4E5A]">{r.studentName}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.type === 'tahsin' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {r.type === 'tahsin' ? 'Tahsin' : 'Tahfidz'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-700">
                        {r.type === 'tahsin' 
                          ? (r.tahsinBook === "Al-Qur'an"
                              ? `Al-Qur'an: Surat ${r.tahsinSurahName || '-'} (Hal. ${r.tahsinPage || '-'}, Ayat: ${r.tahsinLastAyat || '-'})`
                              : `${r.tahsinBook} Hal. ${r.tahsinPage}`)
                          : `Surat ${r.tahfidzSurahName} (${r.tahfidzAyatRange})`}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-[#008E75]">{r.grade}</td>
                      <td className="px-4 py-2.5 text-gray-500 max-w-xs truncate">{r.notes || '-'}</td>
                      <td className="px-4 py-2.5 font-medium whitespace-nowrap">{r.teacherName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: KELOLA SISWA */}
      {activeTab === 'siswa' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-[#3F4E5A]">Daftar Peserta Didik (Tanpa NIS)</h2>
              <p className="text-xs text-gray-400">Tambah, edit nama, pindah kelas, atau hapus data santri.</p>
            </div>
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00C2A0] hover:bg-[#009e82] text-white text-xs font-bold shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Siswa Baru</span>
            </button>
          </div>

          {/* Search & Class Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                placeholder="Cari nama siswa..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C2A0]"
              />
            </div>
            <div>
              <select
                value={studentClassFilter}
                onChange={e => setStudentClassFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C2A0] bg-white font-semibold"
              >
                <option value="ALL">Semua Kelas ({students.length})</option>
                {classes.map(c => (
                  <option key={c} value={c}>Kelas {c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-200 max-h-[500px]">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3">Nama Lengkap Siswa</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                      Siswa tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-400 font-mono">{idx + 1}</td>
                      <td className="px-4 py-2.5 font-bold text-[#008E75]">{s.classId}</td>
                      <td className="px-4 py-2.5 font-bold text-[#3F4E5A]">{s.name}</td>
                      <td className="px-4 py-2.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenResetModal(makeWaliUsername(s.classId, s.name), `Wali ${s.name} (${s.classId})`)}
                          className="px-2 py-1 text-[10px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg border border-amber-200 transition cursor-pointer"
                          title="Reset Password Akun Wali Siswa ke salsabila3"
                        >
                          Reset Pass
                        </button>
                        <button
                          onClick={() => {
                            setEditingStudent(s);
                            setEditStudentName(s.name);
                            setEditStudentClass(s.classId);
                          }}
                          className="p-1 text-gray-500 hover:text-[#00C2A0] rounded transition cursor-pointer"
                          title="Edit Siswa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(s)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded transition cursor-pointer"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: KELOLA GURU */}
      {activeTab === 'guru' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-[#3F4E5A]">Daftar Guru Qur'an SD IT Salsabila 3</h2>
              <p className="text-xs text-gray-400">Kelola 18 pengampu Al-Qur'an dan akun login mereka.</p>
            </div>
            <button
              onClick={() => setShowAddTeacherModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00C2A0] hover:bg-[#009e82] text-white text-xs font-bold shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Guru Baru</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={teacherSearch}
              onChange={e => setTeacherSearch(e.target.value)}
              placeholder="Cari nama guru atau username..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C2A0]"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Nama Lengkap & Gelar</th>
                  <th className="px-4 py-3">Username Login</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredTeachers.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 font-mono">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-[#3F4E5A]">{t.name}</td>
                    <td className="px-4 py-3 font-mono text-[#008E75]">{t.username}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[10px] font-bold">
                        Guru Qur'an
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenResetModal(t.username, t.name)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg border border-amber-200 transition cursor-pointer"
                        title="Reset Password Guru ke salsabila3"
                      >
                        Reset Pass
                      </button>
                      <button
                        onClick={() => {
                          setEditingTeacher(t);
                          setEditTeacherName(t.name);
                          setEditTeacherUsername(t.username);
                        }}
                        className="p-1 text-gray-500 hover:text-[#00C2A0] rounded transition cursor-pointer"
                        title="Edit Guru"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeacher(t)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded transition cursor-pointer"
                        title="Hapus Guru"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: KELOLA KELAS */}
      {activeTab === 'kelas' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-6">
          <div className="pb-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#3F4E5A]">Kelola Daftar Kelas</h2>
            <p className="text-xs text-gray-400">Total 19 kelas jenjang 1 s/d 6 di SD IT Salsabila 3 Banguntapan.</p>
          </div>

          <form onSubmit={handleAddClass} className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
              placeholder="Contoh: 1D atau 7A"
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C2A0]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#00C2A0] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#009e82] cursor-pointer"
            >
              Tambah Kelas
            </button>
          </form>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {classes.map(c => {
              const countInClass = students.filter(s => s.classId === c).length;
              return (
                <div key={c} className="p-4 rounded-2xl border border-gray-100 bg-[#FDFDFD] text-center">
                  <span className="text-lg font-black text-[#3F4E5A] block">Kelas {c}</span>
                  <span className="text-xs text-[#00C2A0] font-bold mt-1 block">{countInClass} Siswa</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: RESET PASSWORD AKUN */}
      {activeTab === 'reset-pass' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-6">
          <div className="pb-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#3F4E5A]">Reset Password Akun Siswa, Wali, & Guru</h2>
            <p className="text-xs text-gray-400">
              Reset password akun kembali ke kata sandi standar awal: <strong className="text-gray-700 font-mono">salsabila3</strong>.
            </p>
          </div>

          {resetSuccessMessage && (
            <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00C2A0]" />
              <span>{resetSuccessMessage}</span>
            </div>
          )}

          {/* Filter Role Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'ALL', label: `Semua Akun (${authAccounts.length})` },
                { id: 'guru', label: `Guru (${authAccounts.filter(a => a.role === 'guru').length})` },
                { id: 'wali', label: `Siswa / Wali (${authAccounts.filter(a => a.role === 'wali').length})` },
                { id: 'admin', label: `Admin (${authAccounts.filter(a => a.role === 'admin').length})` },
              ].map(rf => (
                <button
                  key={rf.id}
                  type="button"
                  onClick={() => setResetRoleFilter(rf.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap border ${
                    resetRoleFilter === rf.id
                      ? 'bg-[#00C2A0] text-white border-[#00C2A0] shadow-xs'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={resetSearch}
                onChange={e => setResetSearch(e.target.value)}
                placeholder="Cari username atau nama..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C2A0] bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 max-h-[500px]">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">Username Akun</th>
                  <th className="px-4 py-3">Nama Pemilik</th>
                  <th className="px-4 py-3">Peran / Role</th>
                  <th className="px-4 py-3">Status Password</th>
                  <th className="px-4 py-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredAuth.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      Akun tidak ditemukan pada filter ini.
                    </td>
                  </tr>
                ) : (
                  filteredAuth.map((acc, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-mono text-[#3F4E5A] font-bold">{acc.username}</td>
                      <td className="px-4 py-2.5 font-medium">{acc.name}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          acc.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          acc.role === 'guru' ? 'bg-teal-100 text-teal-800' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {acc.role}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        {acc.passwordHash === DEFAULT_PASSWORD ? (
                          <span className="text-gray-400 text-[11px]">Bawaan (salsabila3)</span>
                        ) : (
                          <span className="text-emerald-600 font-semibold text-[11px]">Sudah Diganti</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenResetModal(acc.username, acc.name)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset Password</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: LOG AKTIVITAS ADMIN */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-[#3F4E5A]">Sistem Log Aktivitas Admin</h2>
              <p className="text-xs text-gray-400">Catatan audit riwayat perubahan data siswa, guru, kelas, dan reset password.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-700 rounded-xl">
              {logs.length} Riwayat Log
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={logSearch}
              onChange={e => setLogSearch(e.target.value)}
              placeholder="Cari aktivitas, admin, atau target..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C2A0]"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 max-h-[500px]">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">Waktu</th>
                  <th className="px-4 py-3">Aksi</th>
                  <th className="px-4 py-3">Pelaku</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Rincian Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      Belum ada catatan log aktivitas.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(l => (
                    <tr key={l.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 whitespace-nowrap text-gray-500 font-mono text-[11px]">
                        {new Date(l.timestamp).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-2.5 font-bold">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-700 font-mono">
                          {l.actionType}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-[#3F4E5A]">{l.performedBy}</td>
                      <td className="px-4 py-2.5 text-[#008E75] font-semibold">{l.target}</td>
                      <td className="px-4 py-2.5 text-gray-600">{l.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: BASIS DATA CLOUD (BERSIH TANPA KATA BERMEREK) */}
      {activeTab === 'database' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-6">
          <div className="pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#00C2A0] flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#3F4E5A]">Pengaturan Basis Data Cloud & Sinkronisasi</h2>
                <p className="text-xs text-gray-400">
                  Koneksi database terpusat online yang siap di-deploy ke Vercel dengan sinkronisasi otomatis.
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
            isCloudConnected() ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-gray-50 border-gray-200 text-gray-600'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isCloudConnected() ? 'bg-[#00C2A0] animate-pulse' : 'bg-gray-400'}`}></span>
              <span className="font-bold">
                Status Koneksi Cloud: {isCloudConnected() ? 'Terhubung & Aktif' : 'Lokal / Menunggu Konfigurasi Cloud'}
              </span>
            </div>
            {isCloudConnected() && (
              <span className="text-[11px] font-semibold bg-white px-2 py-0.5 rounded-md border border-teal-200">
                Mode Sinkronisasi Otomatis
              </span>
            )}
          </div>

          {cloudStatusMsg && (
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
              {cloudStatusMsg}
            </div>
          )}

          <form onSubmit={handleSaveCloudConfig} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-[#3F4E5A] mb-1">
                URL Basis Data Cloud (Endpoint URL)
              </label>
              <input
                type="text"
                value={cloudUrl}
                onChange={e => setCloudUrl(e.target.value)}
                placeholder="https://xyzcompany.co"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#00C2A0] font-mono"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Di Vercel, dapat diisi otomatis via variabel lingkungan <code className="font-mono">VITE_SUPABASE_URL</code>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3F4E5A] mb-1">
                Kunci Anonim Publik (API Public Anon Key)
              </label>
              <div className="relative">
                <input
                  type={showCloudKey ? 'text' : 'password'}
                  value={cloudKey}
                  onChange={e => setCloudKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#00C2A0] font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCloudKey(!showCloudKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showCloudKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Di Vercel, dapat diisi via <code className="font-mono">VITE_SUPABASE_ANON_KEY</code>.
              </p>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#00C2A0] hover:bg-[#009e82] text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
            >
              Simpan & Hubungkan Basis Data
            </button>
          </form>

          {/* SQL Migration & Complete Data Script */}
          <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#008E75] text-xs font-bold mb-1.5">
                  <Database className="w-3.5 h-3.5" />
                  <span>Struktur Tabel & Data Lengkap Supabase</span>
                </div>
                <h3 className="text-base font-bold text-[#3F4E5A]">
                  Skrip Struktur Tabel SQL & Seluruh Data Simulasi
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Skrip ini mencakup struktur 6 tabel database, kebijakan RLS, serta seluruh data awal ({classes.length} kelas, {teachers.length} guru, {students.length} santri, dan akun login).
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                    sqlCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#00C2A0] hover:bg-[#009e82] text-white'
                  }`}
                >
                  {sqlCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{sqlCopied ? 'Tersalin ke Clipboard!' : 'Salin Skrip SQL'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSql}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3F4E5A] hover:bg-[#2B3740] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh File .sql</span>
                </button>
              </div>
            </div>

            {/* Quick Summary Badges */}
            <div className="flex items-center gap-2 flex-wrap text-[11px] font-semibold text-gray-600">
              <span className="px-2.5 py-1 bg-gray-100 rounded-lg border border-gray-200">
                📦 6 Tabel DDL
              </span>
              <span className="px-2.5 py-1 bg-gray-100 rounded-lg border border-gray-200">
                🏫 {classes.length} Kelas
              </span>
              <span className="px-2.5 py-1 bg-gray-100 rounded-lg border border-gray-200">
                👨‍🏫 {teachers.length} Guru Qur'an
              </span>
              <span className="px-2.5 py-1 bg-gray-100 rounded-lg border border-gray-200">
                👦👧 {students.length} Siswa Terdaftar
              </span>
              <span className="px-2.5 py-1 bg-gray-100 rounded-lg border border-gray-200">
                🔑 Akun Login (Default: salsabila3)
              </span>
              <span className="px-2.5 py-1 bg-gray-100 rounded-lg border border-gray-200">
                🛡️ RLS & Public Policies
              </span>
            </div>

            {/* Step by step tutorial */}
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/70 text-xs text-teal-900 space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00C2A0]" />
                <span>Petunjuk Eksekusi di Supabase Dashboard:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-teal-800">
                <li>Buka dashboard proyek Supabase Anda: <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[#008E75] font-semibold">{cloudUrl || 'https://ubyrtmcrdeltgcfurouy.supabase.co'}</code></li>
                <li>Pada bilah menu sebelah kiri, pilih menu <strong>SQL Editor</strong>.</li>
                <li>Klik tombol <strong>New query</strong> (+).</li>
                <li>Klik tombol <strong>Salin Skrip SQL</strong> di atas, lalu tempelkan (paste) ke editor query Supabase.</li>
                <li>Klik tombol hijau <strong>Run</strong> (atau tekan Ctrl+Enter). Seluruh tabel dan {students.length} data siswa akan langsung terpasang dan tersinkronisasi otomatis!</li>
              </ol>
            </div>

            {/* Code preview block */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-800 shadow-md">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-950 text-gray-400 text-[11px] font-mono border-b border-gray-800">
                <span>SALAM_Quran_Supabase_Schema_Data.sql</span>
                <span>{(sqlScript.length / 1024).toFixed(1)} KB &bull; {sqlScript.split('\n').length} baris</span>
              </div>
              <pre className="p-4 bg-gray-900 text-teal-300 text-[11px] font-mono overflow-x-auto max-h-80 leading-relaxed scrollbar-thin">
                {sqlScript}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH SISWA */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-[#3F4E5A] mb-4">Tambah Siswa Baru</h3>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Siswa</label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  placeholder="Contoh: MUHAMMAD HAFIDZ AL-FATIH"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C2A0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kelas</label>
                <select
                  value={newStudentClass}
                  onChange={e => setNewStudentClass(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C2A0] bg-white"
                >
                  {classes.map(c => (
                    <option key={c} value={c}>Kelas {c}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00C2A0] text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SISWA */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-[#3F4E5A] mb-4">Edit Data Siswa</h3>
            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Siswa</label>
                <input
                  type="text"
                  value={editStudentName}
                  onChange={e => setEditStudentName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C2A0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kelas</label>
                <select
                  value={editStudentClass}
                  onChange={e => setEditStudentClass(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C2A0] bg-white"
                >
                  {classes.map(c => (
                    <option key={c} value={c}>Kelas {c}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00C2A0] text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Perbarui Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH GURU */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-[#3F4E5A] mb-4">Tambah Guru Qur'an Baru</h3>
            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={newTeacherName}
                  onChange={e => setNewTeacherName(e.target.value)}
                  placeholder="Contoh: Muhammad Ali, S.Pd.I."
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C2A0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Username Login</label>
                <input
                  type="text"
                  value={newTeacherUsername}
                  onChange={e => setNewTeacherUsername(e.target.value)}
                  placeholder="Contoh: muhammadali"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C2A0]"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Password bawaan awal adalah <strong className="text-gray-600">salsabila3</strong>.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00C2A0] text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Simpan Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT GURU */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-[#3F4E5A] mb-4">Edit Data Guru</h3>
            <form onSubmit={handleUpdateTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={editTeacherName}
                  onChange={e => setEditTeacherName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C2A0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Username Login</label>
                <input
                  type="text"
                  value={editTeacherUsername}
                  onChange={e => setEditTeacherUsername(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C2A0]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00C2A0] text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Perbarui Data Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL KONFIRMASI RESET PASSWORD */}
      {accountToReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#3F4E5A]">Konfirmasi Reset Password</h3>
                <p className="text-xs text-gray-500">Kembalikan password ke kata sandi standar</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-2">
              <p>
                Anda akan mereset kata sandi untuk akun:
              </p>
              <div className="bg-white p-3 rounded-xl border border-amber-200 font-mono">
                <p className="font-bold text-[#3F4E5A]">{accountToReset.name}</p>
                <p className="text-[#008E75] text-[11px] mt-0.5">Username: {accountToReset.username}</p>
              </div>
              <p className="text-[11px] text-amber-700">
                Password baru akan kembali menjadi kata sandi standar awal: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300">{DEFAULT_PASSWORD}</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAccountToReset(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ya, Reset Password</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
