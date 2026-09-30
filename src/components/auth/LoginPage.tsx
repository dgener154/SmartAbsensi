import React, { useState } from 'react';
import {
  School,
  KeyRound,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  BookOpen,
  Users,
  Shield,
  CheckCircle2,
  Check,
  X,
  Lock,
  RotateCcw
} from 'lucide-react';
import { UserAccount, UserRole } from '../../types';
import { storage } from '../../services/storageService';

interface LoginPageProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('GURU');
  const [username, setUsername] = useState('198709182010012011'); // NIP Guru Siti Rahmawati default
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isHuman, setIsHuman] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin Reset Password Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetNpsn, setResetNpsn] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('123456');
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const school = storage.getSchoolProfile();

  // Role metadata and rules according to specification
  const roleConfigs: Record<UserRole, {
    label: string;
    icon: React.ElementType;
    badge: string;
    identifierLabel: string;
    placeholder: string;
    ruleDescription: string;
    exampleId: string;
  }> = {
    GURU: {
      label: 'Guru (NIP / NUPTK)',
      icon: BookOpen,
      badge: 'NIP / NUPTK',
      identifierLabel: 'NIP / NUPTK Guru Terdaftar',
      placeholder: 'Contoh: 198709182010012011 atau NUPTK...',
      ruleDescription: 'Login guru menggunakan NIP atau NUPTK yang terdaftar di database sekolah.',
      exampleId: '198709182010012011'
    },
    WALI_KELAS: {
      label: 'Wali Kelas (NIP / NUPTK)',
      icon: Users,
      badge: 'NIP / NUPTK Wali',
      identifierLabel: 'NIP / NUPTK Guru Wali Kelas',
      placeholder: 'Contoh: 198402102008011005 (Wali Kelas VII-A)...',
      ruleDescription: 'Wali Kelas menggunakan NIP/NUPTK guru yang memiliki SK jabatan wali kelas.',
      exampleId: '198402102008011005'
    },
    SISWA: {
      label: 'Siswa (NISN Siswa)',
      icon: GraduationCap,
      badge: 'NISN Siswa',
      identifierLabel: 'NISN Siswa Terdaftar',
      placeholder: 'Contoh: 0112345671...',
      ruleDescription: 'Siswa masuk menggunakan Nomor Induk Siswa Nasional (NISN) terdaftar.',
      exampleId: '0112345671'
    },
    ORANG_TUA: {
      label: 'Orang Tua (NISN Siswa)',
      icon: Users,
      badge: 'NISN Siswa',
      identifierLabel: 'NISN Siswa (Putra / Putri)',
      placeholder: 'Contoh: 0112345671...',
      ruleDescription: 'Orang Tua memantau kehadiran anak menggunakan NISN siswa yang terdaftar.',
      exampleId: '0112345671'
    },
    ADMIN: {
      label: 'Administrator (admin)',
      icon: Shield,
      badge: 'Username',
      identifierLabel: 'Username Administrator',
      placeholder: 'admin',
      ruleDescription: 'Administrator pengelola master data, sistem presensi, dan jadwal sekolah.',
      exampleId: 'admin'
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg('');
    setUsername(roleConfigs[role].exampleId);
    setPassword('123456');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Check simple robot verification
    if (!isHuman) {
      setErrorMsg('Harap centang verifikasi "Saya bukan robot" terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const cleanInput = (username || '').trim();
      const user = storage.login(cleanInput, password, selectedRole);

      if (user) {
        onLoginSuccess(user);
      } else {
        if (selectedRole === 'WALI_KELAS') {
          setErrorMsg(
            'NIP/NUPTK tidak ditemukan atau guru ini tidak memiliki SK jabatan Wali Kelas. Pastikan menggunakan NIP wali kelas dan kata sandi 123456.'
          );
        } else if (selectedRole === 'GURU') {
          setErrorMsg('NIP atau NUPTK guru tidak terdaftar di sistem. Silakan periksa kembali nomor NIP/NUPTK Anda.');
        } else if (selectedRole === 'SISWA') {
          setErrorMsg('NISN siswa tidak ditemukan dalam database siswa aktif. Pastikan nomor NISN sudah benar.');
        } else if (selectedRole === 'ORANG_TUA') {
          setErrorMsg('Data siswa dengan NISN tersebut tidak ditemukan. Gunakan NISN siswa putra/putri yang terdaftar.');
        } else {
          setErrorMsg('Username atau kata sandi tidak valid. Kata sandi default adalah 123456.');
        }
      }
      setIsSubmitting(false);
    }, 250);
  };

  const handleResetAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    // Verify NPSN
    const cleanNpsn = (resetNpsn || '').trim();
    if (cleanNpsn !== school.npsn) {
      setResetError(`NPSN Sekolah tidak cocok. NPSN resmi sekolah adalah ${school.npsn}`);
      return;
    }

    if (!newAdminPassword || newAdminPassword.trim().length < 4) {
      setResetError('Kata sandi baru minimal 4 karakter.');
      return;
    }

    setIsResetting(true);
    setTimeout(() => {
      const success = storage.resetAdminPassword(newAdminPassword.trim());
      setIsResetting(false);

      if (success) {
        setIsResetModalOpen(false);
        setResetNpsn('');
        setSelectedRole('ADMIN');
        setUsername('admin');
        setPassword(newAdminPassword.trim());
        setSuccessMsg(`Kata sandi akun Administrator berhasil direset ke "${newAdminPassword.trim()}"!`);
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        setResetError('Gagal mereset kata sandi akun Admin. Silakan coba kembali.');
      }
    }, 300);
  };

  const currentConfig = roleConfigs[selectedRole];

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
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]" />

      {/* Container */}
      <div className="relative z-10 max-w-md w-full space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          {school.logoUrl ? (
            <div className="w-20 h-20 rounded-2xl bg-white/95 p-2 shadow-2xl shadow-black/50 mx-auto flex items-center justify-center border border-white/30">
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
          <h1 className="text-xl font-bold tracking-tight text-white uppercase drop-shadow-md">
            {school.name}
          </h1>
          <p className="text-xs text-emerald-400 font-medium tracking-wide uppercase drop-shadow-sm">
            Sistem Informasi Presensi &amp; Jadwal Pelajaran
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 border border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">Masuk ke Akun Anda</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih peran akun Anda dan masukkan ID resmi terdaftar (NIP/NUPTK/NISN).
            </p>
          </div>

          {/* Success Notification */}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{successMsg}</span>
            </div>
          )}

          {/* Error Notification */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {/* Role Selection Dropdown */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Pilih Peran Pengguna
              </label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-xs focus:outline-emerald-600 focus:bg-white transition-colors cursor-pointer appearance-none pr-8"
                >
                  <option value="GURU">Guru (NIP / NUPTK)</option>
                  <option value="WALI_KELAS">Wali Kelas (NIP / NUPTK)</option>
                  <option value="SISWA">Siswa (NISN Siswa)</option>
                  <option value="ORANG_TUA">Orang Tua (NISN Siswa)</option>
                  <option value="ADMIN">Administrator (admin)</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-slate-500">
                  ▼
                </div>
              </div>
            </div>

            {/* Identifier Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-semibold">{currentConfig.identifierLabel}</label>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {currentConfig.badge}
                </span>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-2.5 text-slate-400">
                  {React.createElement(currentConfig.icon, { className: 'w-4 h-4' })}
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={currentConfig.placeholder}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-emerald-600 focus:bg-white font-medium text-xs transition-colors"
                />
              </div>
            </div>

            {/* Password Input with Toggle View Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-semibold">Kata Sandi (Password)</label>
                <span className="text-[10px] text-slate-500">
                  Default: <strong className="text-emerald-700 font-mono">123456</strong>
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-emerald-600 focus:bg-white font-mono text-xs transition-colors"
                />
                {/* View Password Toggle Icon */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none cursor-pointer"
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                  aria-label="Toggle view password"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Simple "Saya bukan robot" verification checklist */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={isHuman}
                    onChange={(e) => {
                      setIsHuman(e.target.checked);
                      if (e.target.checked && errorMsg.includes('bukan robot')) {
                        setErrorMsg('');
                      }
                    }}
                    className="w-5 h-5 rounded border-2 border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer transition-colors accent-emerald-600"
                  />
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  Saya bukan robot
                </span>
              </label>
              <div className="flex flex-col items-center select-none">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                  isHuman
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-300'
                }`}>
                  <Check className={`w-3.5 h-3.5 ${isHuman ? 'opacity-100' : 'opacity-0'}`} />
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5">Verifikasi</span>
              </div>
            </div>

            {/* Submit Button (LOGIN) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white rounded-xl font-bold tracking-wider shadow-md transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'MEMVERIFIKASI...' : 'LOGIN'}</span>
            </button>
          </form>

          {/* Reset Password Khusus Admin Link */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setResetError('');
                setResetNpsn('');
                setNewAdminPassword('123456');
                setIsResetModalOpen(true);
              }}
              className="text-xs text-slate-500 hover:text-emerald-700 font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Reset Password Khusus Admin</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400">
          {school.name} · Tahun Pelajaran 2025/2026 (Semester Ganjil)
        </div>
      </div>

      {/* Modal Reset Password Khusus Admin */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 relative animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Reset Password Admin</h3>
                  <p className="text-[11px] text-slate-500">Khusus pemulihan akun Administrator</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{resetError}</span>
              </div>
            )}

            <form onSubmit={handleResetAdminPassword} className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-700 font-semibold">NPSN Sekolah (Verifikasi)</label>
                  <span className="text-[10px] text-emerald-700 font-mono">NPSN: {school.npsn}</span>
                </div>
                <input
                  type="text"
                  required
                  value={resetNpsn}
                  onChange={(e) => setResetNpsn(e.target.value)}
                  placeholder={`Ketik NPSN (${school.npsn})...`}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:outline-emerald-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Masukkan nomor NPSN resmi sekolah sebagai kunci keamanan validasi.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="text"
                  required
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Ketik kata sandi baru (default: 123456)..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="w-1/2 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isResetting ? 'Mereset...' : 'Reset Sekarang'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
