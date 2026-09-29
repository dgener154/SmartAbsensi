import React, { useState } from 'react';
import { School, KeyRound, User, LogIn, AlertCircle, Shield, Check } from 'lucide-react';
import { UserAccount, UserRole } from '../../types';
import { storage } from '../../services/storageService';

interface LoginPageProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const school = storage.getSchoolProfile();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      const user = storage.login(username, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setErrorMsg('Username atau kata sandi tidak valid. Silakan coba lagi atau gunakan akun demo.');
      }
      setIsSubmitting(false);
    }, 200);
  };

  const handleQuickDemoLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    const user = storage.login(u, p);
    if (user) {
      onLoginSuccess(user);
    }
  };

  const demoAccounts = [
    { role: 'ADMIN', user: 'admin', pass: 'admin123', label: 'Administrator', desc: 'Akses Penuh Seluruh Modul', color: 'bg-rose-50 border-rose-200 text-rose-900' },
    { role: 'GURU', user: 'guru', pass: 'guru123', label: 'Guru Mapel (Siti Rahmawati)', desc: 'Presensi Siswa & Jadwal Mengajar', color: 'bg-blue-50 border-blue-200 text-blue-900' },
    { role: 'WALI_KELAS', user: 'walikelas', pass: 'wali123', label: 'Wali Kelas VII-A (Budi)', desc: 'Kelas Binaan, Rekap & Persetujuan Izin', color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
    { role: 'SISWA', user: 'siswa', pass: 'siswa123', label: 'Siswa (Muhammad Rizky)', desc: 'Jadwal & Pengajuan Izin Sendiri', color: 'bg-amber-50 border-amber-200 text-amber-900' },
    { role: 'ORANG_TUA', user: 'orangtua', pass: 'ortu123', label: 'Orang Tua (Ridwan Hakim)', desc: 'Pantau Kehadiran & Izin Anak', color: 'bg-purple-50 border-purple-200 text-purple-900' },
  ];

  return (
    <div
      className="min-h-screen relative flex flex-col justify-center items-center p-4 bg-slate-900 bg-cover bg-center transition-all duration-300"
      style={
        school.loginBackgroundUrl
          ? { backgroundImage: `url(${school.loginBackgroundUrl})` }
          : undefined
      }
    >
      {/* Dark overlay for contrast and readability */}
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px]" />

      {/* Container */}
      <div className="relative z-10 max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          {school.logoUrl ? (
            <div className="w-20 h-20 rounded-2xl bg-white/90 p-2 shadow-xl shadow-black/40 mx-auto flex items-center justify-center border border-white/20">
              <img
                src={school.logoUrl}
                alt="Logo Sekolah"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-lg shadow-emerald-900/50">
              <School className="w-9 h-9" />
            </div>
          )}
          <h1 className="text-xl font-bold tracking-tight text-white uppercase drop-shadow-sm">
            {school.name}
          </h1>
          <p className="text-xs text-emerald-400 font-medium tracking-wide uppercase drop-shadow-sm">
            Sistem Informasi Presensi & Jadwal Sekolah
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5 border border-slate-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Masuk ke Akun Anda</h2>
            <p className="text-xs text-slate-500">
              Gunakan kredensial resmi sekolah atau tombol akun demo di bawah.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Username / ID Pengguna</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin / guru / walikelas..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-emerald-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Kata Sandi (Password)</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-emerald-600 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-md transition-all flex items-center justify-center gap-2 text-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'Memverifikasi...' : 'Masuk Aplikasi'}</span>
            </button>
          </form>

          {/* Quick Demo Logins (Section 37 of prompt!) */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Akses Cepat Mode Demo (5 Role):</span>
            </div>

            <div className="space-y-1.5">
              {demoAccounts.map(demo => (
                <button
                  key={demo.user}
                  type="button"
                  onClick={() => handleQuickDemoLogin(demo.user, demo.pass)}
                  className={`w-full p-2 rounded-lg border text-left flex items-center justify-between transition-all hover:scale-[1.01] ${demo.color}`}
                >
                  <div>
                    <div className="font-bold text-xs">{demo.label}</div>
                    <div className="text-[10px] opacity-75">{demo.desc}</div>
                  </div>
                  <div className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/70 shadow-2xs">
                    {demo.user}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400">
          {school.name} · Tahun Pelajaran 2025/2026 (Semester Ganjil)
        </div>
      </div>
    </div>
  );
};
