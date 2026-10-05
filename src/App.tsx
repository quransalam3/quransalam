import React, { useState, useEffect } from 'react';
import { User } from './types';
import { storage } from './lib/storage';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { GuruDashboard } from './pages/GuruDashboard';
import { WaliDashboard } from './pages/WaliDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ChangePasswordModal } from './components/ChangePasswordModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.getCurrentUser());
  const [showFirstLoginModal, setShowFirstLoginModal] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser?.firstLogin) {
      setShowFirstLoginModal(true);
    }
  }, [currentUser]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.firstLogin) {
      setShowFirstLoginModal(true);
    }
  };

  const handleLogout = () => {
    storage.logout();
    setCurrentUser(null);
    setShowFirstLoginModal(false);
  };

  const handleFirstPasswordChanged = () => {
    setShowFirstLoginModal(false);
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        firstLogin: false
      });
    }
  };

  if (!currentUser) {
    return (
      <main className="min-h-screen">
        <LoginPage onLoginSuccess={handleLoginSuccess} />
        <OfflineIndicator />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans">
      <Navbar user={currentUser} onLogout={handleLogout} />

      <main className="flex-1 pb-16">
        {currentUser.role === 'guru' && <GuruDashboard currentUser={currentUser} />}
        {currentUser.role === 'wali' && <WaliDashboard currentUser={currentUser} />}
        {currentUser.role === 'admin' && <AdminDashboard currentUser={currentUser} />}
      </main>

      <OfflineIndicator />

      {/* Mandatory Change Password on First Login */}
      {showFirstLoginModal && (
        <ChangePasswordModal
          username={currentUser.username}
          isFirstLogin={true}
          isOpen={showFirstLoginModal}
          onClose={() => setShowFirstLoginModal(false)}
          onSuccess={handleFirstPasswordChanged}
        />
      )}
    </div>
  );
}
