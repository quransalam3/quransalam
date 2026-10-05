import React from 'react';

interface LetterheadKopProps {
  title?: string;
  subtitle?: string;
}

export const LetterheadKop: React.FC<LetterheadKopProps> = ({
  title = "LAPORAN HASIL CAPAIAN TAHFIDZ & TAHSIN AL-QUR'AN",
  subtitle = "Sistem SALAM Quran SD IT Salsabila 3 Banguntapan"
}) => {
  return (
    <div className="border-b-2 border-[#3F4E5A] pb-3 mb-5">
      <div className="flex items-center justify-between gap-4">
        {/* Logo / Embelm */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00C2A0] to-[#008E75] flex items-center justify-center text-white font-extrabold text-xl shadow-md shrink-0 border border-teal-200">
          <span className="font-serif">SQ</span>
        </div>

        {/* Header Institution text */}
        <div className="text-center flex-1">
          <p className="text-xs uppercase tracking-widest font-semibold text-gray-500">
            YAYASAN SALSABILA YOGYAKARTA
          </p>
          <h1 className="text-lg md:text-xl font-extrabold text-[#3F4E5A] tracking-tight uppercase">
            SD ISLAM TERPADU SALSABILA 3 BANGUNTAPAN
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Jl. Pelem Raya, Baturetno, Banguntapan, Bantul, D.I. Yogyakarta 55197
          </p>
          <p className="text-[11px] text-gray-400">
            Telp: (0274) 453-8790 | Email: sdit.salsabila3@gmail.com | Website: salsabila3.sch.id
          </p>
        </div>

        {/* Decorative Badge */}
        <div className="hidden sm:flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-center p-1 shrink-0">
          <span className="text-[9px] font-bold uppercase leading-tight">SALAM</span>
          <span className="text-xs font-black text-[#00C2A0]">QUR'AN</span>
        </div>
      </div>

      {/* Double border line typical in Indonesian formal school letterhead */}
      <div className="mt-3 border-t-2 border-[#3F4E5A]"></div>
      <div className="mt-0.5 border-t border-[#3F4E5A]"></div>

      {/* Title Banner */}
      <div className="mt-3 text-center">
        <h2 className="text-base font-bold text-[#3F4E5A] uppercase tracking-wide">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
