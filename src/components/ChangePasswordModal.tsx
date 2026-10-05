import React, { useState } from 'react';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, X } from 'lucide-react';
import { storage } from '../lib/storage';

interface ChangePasswordModalProps {
  username: string;
  isFirstLogin?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  username,
  isFirstLogin = false,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword === 'salsabila3') {
      setError('Password baru tidak boleh sama dengan password default (salsabila3).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    const ok = storage.changePassword(username, newPassword);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setNewPassword('');
        setConfirmPassword('');
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } else {
      setError('Gagal mengubah password. Silakan coba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00C2A0]/10 text-[#00C2A0] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#3F4E5A]">
                {isFirstLogin ? 'Ganti Password Awal' : 'Ubah Password'}
              </h3>
              <p className="text-xs text-gray-500">
                Akun: <span className="font-semibold text-gray-700">{username}</span>
              </p>
            </div>
          </div>

          {!isFirstLogin && (
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {isFirstLogin && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              Demi keamanan akun, Anda diwajibkan mengganti password bawaan (<strong>salsabila3</strong>) pada login pertama kali.
            </span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-teal-100 text-[#00C2A0] mx-auto flex items-center justify-center mb-2 animate-bounce">
              <CheckCircle className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-[#3F4E5A]">Password Berhasil Diperbarui!</p>
            <p className="text-xs text-gray-500 mt-1">Menutup jendela...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2A0] focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Ulangi Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password baru"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2A0] focus:border-transparent pr-10"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              {!isFirstLogin && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-[#00C2A0] hover:bg-[#009e82] text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                Simpan Password Baru
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
