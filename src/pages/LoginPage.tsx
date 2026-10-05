import React, { useState } from 'react';
import { storage, makeWaliUsername, DEFAULT_PASSWORD } from '../lib/storage';
import { User, Student } from '../types';
import { Lock, User as UserIcon, Eye, EyeOff, Shield, BookOpen, HeartHandshake, Info, ChevronRight } from 'lucide-react';
import { PWAInstallButton } from '../components/PWAInstallButton';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'guru' | 'wali' | 'admin'>('guru');
  
  // Generic form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Wali helper selection
  const [selectedClass, setSelectedClass] = useState('1A');
  const [selectedStudent, setSelectedStudent] = useState('');

  const classes = storage.getClasses();
  const teachers = storage.getTeachers();
  const studentsInClass = storage.getStudents(selectedClass);

  const handleTabChange = (tab: 'guru' | 'wali' | 'admin') => {
    setActiveTab(tab);
    setError('');
    setPassword('');
    if (tab === 'admin') {
      setUsername('admin');
    } else if (tab === 'guru') {
      setUsername(teachers[0]?.username || '');
    } else if (tab === 'wali') {
      if (studentsInClass.length > 0) {
        setUsername(makeWaliUsername(selectedClass, studentsInClass[0].name));
        setSelectedStudent(studentsInClass[0].name);
      } else {
        setUsername(`wali.${selectedClass}.`);
      }
    }
  };

  // When class changes in Wali tab
  const handleWaliClassChange = (newClass: string) => {
    setSelectedClass(newClass);
    const students = storage.getStudents(newClass);
    if (students.length > 0) {
      setSelectedStudent(students[0].name);
      setUsername(makeWaliUsername(newClass, students[0].name));
    } else {
      setSelectedStudent('');
      setUsername(`wali.${newClass}.`);
    }
  };

  // When student changes in Wali tab
  const handleWaliStudentChange = (studentName: string) => {
    setSelectedStudent(studentName);
    setUsername(makeWaliUsername(selectedClass, studentName));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const res = storage.login(username, password);
      setLoading(false);
      if (res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Username atau password tidak sesuai.');
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFDFD] via-teal-50/30 to-[#FDFDFD] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Banner & PWA Button */}
      <div className="absolute top-4 right-4">
        <PWAInstallButton />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Emblem & Title */}
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00C2A0] to-[#008E75] flex items-center justify-center text-white font-extrabold text-2xl shadow-lg border-2 border-teal-200">
            <span className="font-serif">SQ</span>
          </div>
        </div>

        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-[#3F4E5A] tracking-tight">
          SALAM <span className="text-[#00C2A0]">Qur'an</span>
        </h2>
        <p className="mt-1 text-center text-xs font-semibold text-gray-500 uppercase tracking-widest">
          SD Islam Terpadu Salsabila 3 Banguntapan
        </p>
        <p className="text-center text-xs text-gray-400 mt-0.5">
          Salsabila Achievement, Learning, And Application for Monitoring Qur’an
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-gray-100">
          
          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 rounded-2xl mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleTabChange('guru')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'guru'
                  ? 'bg-white text-[#00C2A0] shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guru Qur'an</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('wali')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'wali'
                  ? 'bg-white text-[#00C2A0] shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Wali Siswa</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('admin')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-white text-[#00C2A0] shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {/* Quick Helper for Teacher Selection */}
          {activeTab === 'guru' && (
            <div className="mb-4 p-3 bg-teal-50/60 rounded-2xl border border-teal-100">
              <label className="block text-[11px] font-bold text-teal-800 mb-1">
                Pilih Nama Guru untuk Login Cepat:
              </label>
              <select
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-white border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C2A0] text-gray-700 font-medium"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.username}>
                    {t.name} (username: {t.username})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Helper for Wali Selection */}
          {activeTab === 'wali' && (
            <div className="mb-4 p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800">
                  Pencari Cepat Akun Siswa:
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">
                  Format: wali.(Kelas).(Nama)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Kelas</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => handleWaliClassChange(e.target.value)}
                    className="w-full text-xs py-2 px-2.5 bg-white border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C2A0]"
                  >
                    {classes.map((c) => (
                      <option key={c} value={c}>Kelas {c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Nama Putra/Putri</label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => handleWaliStudentChange(e.target.value)}
                    className="w-full text-xs py-2 px-2.5 bg-white border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C2A0] truncate"
                  >
                    {studentsInClass.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#3F4E5A] mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    activeTab === 'wali'
                      ? 'wali.1A.NAMA SISWA'
                      : activeTab === 'guru'
                      ? 'username guru'
                      : 'admin'
                  }
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2A0] focus:border-transparent text-gray-800"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#3F4E5A]">
                  Password
                </label>
                <span className="text-[11px] text-gray-400">
                  Bawaan awal: <strong className="text-gray-600 font-mono">salsabila3</strong>
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2A0] focus:border-transparent text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-2xl shadow-md text-sm font-bold text-white bg-[#00C2A0] hover:bg-[#009e82] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00C2A0] transition cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Memverifikasi...</span>
                ) : (
                  <>
                    <span>Masuk ke Akun</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Institutional note */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-start gap-2 text-[11px] text-gray-400">
            <Info className="w-4 h-4 text-[#00C2A0] shrink-0 mt-0.5" />
            <span>
              Akun baru memiliki password default <strong className="text-gray-600">salsabila3</strong>. Anda dapat langsung mengubah password setelah login.
            </span>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-4 text-center text-xs text-gray-400">
          SALAM Quran &bull; SDIT Salsabila 3 Banguntapan Yogyakarta
        </p>
      </div>
    </div>
  );
};
