import React, { useState } from 'react';
import { User } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { ChangePasswordModal } from './ChangePasswordModal';
import { LogOut, KeyRound, User as UserIcon, BookOpen, Shield, HeartHandshake } from 'lucide-react';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const getRoleBadge = () => {
    switch (user.role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
            <Shield className="w-3 h-3" />
            Admin Sekolah
          </span>
        );
      case 'guru':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-[#008E75] border border-teal-200">
            <BookOpen className="w-3 h-3" />
            Guru Qur'an
          </span>
        );
      case 'wali':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <HeartHandshake className="w-3 h-3" />
            Wali Siswa ({user.classId})
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00C2A0] to-[#008E75] flex items-center justify-center text-white font-extrabold text-lg shadow-sm border border-teal-200 shrink-0">
                <span className="font-serif">SQ</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg tracking-tight text-[#3F4E5A]">SALAM</span>
                  <span className="font-bold text-lg text-[#00C2A0]">Qur'an</span>
                </div>
                <p className="text-[11px] font-medium text-gray-400 hidden sm:block leading-none">
                  SD IT Salsabila 3 Banguntapan
                </p>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* PWA Install Button */}
              <PWAInstallButton />

              {/* User details */}
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-[#3F4E5A] truncate max-w-[200px]">
                  {user.name}
                </span>
                <div className="mt-0.5">{getRoleBadge()}</div>
              </div>

              {/* Actions dropdown/buttons */}
              <div className="flex items-center gap-1 pl-2 border-l border-gray-200">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="p-2 text-gray-500 hover:text-[#00C2A0] hover:bg-gray-100 rounded-xl transition cursor-pointer"
                  title="Ubah Password"
                >
                  <KeyRound className="w-4 h-4" />
                </button>

                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                  title="Keluar / Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Manual Change Password Modal */}
      <ChangePasswordModal
        username={user.username}
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
};
