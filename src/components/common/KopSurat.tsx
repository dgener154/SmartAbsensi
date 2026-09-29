import React from 'react';
import { SchoolProfile } from '../../types';

interface KopSuratProps {
  profile: SchoolProfile;
  title: string;
  subTitle?: string;
}

export const KopSurat: React.FC<KopSuratProps> = ({ profile, title, subTitle }) => {
  return (
    <div className="w-full pb-4 mb-6 border-b-2 border-slate-900 border-double">
      <div className="flex items-center justify-between gap-4">
        {/* Logo Left */}
        {profile.logoUrl ? (
          <div className="w-20 h-20 shrink-0 flex items-center justify-center p-1">
            <img src={profile.logoUrl} alt="Logo Sekolah" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="w-20 h-20 shrink-0 flex items-center justify-center bg-emerald-700 text-white rounded-lg shadow-sm font-bold text-center p-2 text-xs">
            <div className="flex flex-col items-center">
              <svg className="w-8 h-8 text-emerald-100 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                <path d="M6 6h10"/>
                <path d="M6 10h10"/>
              </svg>
              <span>{profile.name.split(' ')[0] || 'SEKOLAH'}</span>
            </div>
          </div>
        )}

        {/* Center Header Details */}
        <div className="text-center flex-1 px-2">
          <h4 className="text-xs uppercase tracking-wider text-slate-600 font-semibold mb-0.5">
            {profile.foundation}
          </h4>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
            {profile.name}
          </h1>
          <p className="text-xs text-slate-600">
            NPSN: {profile.npsn} · NSM: {profile.nsm} · Status: {profile.status}
          </p>
          <p className="text-xs text-slate-600 mt-0.5">
            {profile.address}, {profile.village}, {profile.district}, {profile.city}, {profile.province} {profile.postalCode}
          </p>
          <p className="text-xs text-slate-500">
            Telp: {profile.phone} · Email: {profile.email} · Web: {profile.website}
          </p>
        </div>

        {/* Logo Right / Badge */}
        <div className="w-20 h-20 shrink-0 hidden sm:flex items-center justify-center bg-slate-100 border border-slate-300 rounded-lg text-slate-800 text-center p-1 text-[10px] font-semibold">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-1">
              A
            </div>
            <span>TERAKREDITASI</span>
          </div>
        </div>
      </div>

      {/* Report Title */}
      <div className="text-center mt-5 pt-3 border-t border-slate-200">
        <h2 className="text-base md:text-lg font-bold uppercase tracking-wide text-slate-900">
          {title}
        </h2>
        {subTitle && (
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-0.5">
            {subTitle}
          </p>
        )}
      </div>
    </div>
  );
};
