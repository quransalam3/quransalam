import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-2 rounded-lg bg-[#00C2A0] hover:bg-[#009e82] text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-all duration-150 cursor-pointer ${className || ''}`}
        title="Install SALAM Quran sebagai Aplikasi PWA"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install PWA</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-lg border border-[#00C2A0] text-[#00C2A0] hover:bg-[#00C2A0]/10 px-3 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer ${className || ''}`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#00C2A0] text-white flex items-center justify-center font-bold text-sm">
                    SQ
                  </div>
                  <h3 className="text-base font-bold text-[#3F4E5A]">Install di iPhone / iPad</h3>
                </div>
                <button 
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
                <p className="flex items-start gap-2">
                  <span className="font-bold text-[#00C2A0] bg-[#00C2A0]/10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs">1</span>
                  <span>Buka halaman ini di browser <strong>Safari</strong> iPhone/iPad.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-[#00C2A0] bg-[#00C2A0]/10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs">2</span>
                  <span>Tekan tombol <strong>Share</strong> (ikon kotak dengan panah ke atas di bawah layar).</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-[#00C2A0] bg-[#00C2A0]/10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs">3</span>
                  <span>Gulir ke bawah dan pilih <strong>"Add to Home Screen" (Tambah ke Layar Utama)</strong>.</span>
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-[#00C2A0] hover:bg-[#009e82] text-white py-2.5 text-sm font-semibold transition cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
