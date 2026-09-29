import React, { useState } from 'react';
import {
  Settings,
  Save,
  MapPin,
  Clock,
  QrCode,
  School,
  CheckCircle,
  Compass,
  Upload,
  Image as ImageIcon,
  Trash2,
  Sparkles
} from 'lucide-react';
import { SchoolProfile } from '../../types';
import { storage } from '../../services/storageService';

export const PengaturanSekolahPage: React.FC = () => {
  const [profile, setProfile] = useState<SchoolProfile>(storage.getSchoolProfile());
  const [toastMsg, setToastMsg] = useState('');

  const loginBgPresets = [
    {
      name: 'Kampus Hijau Modern',
      url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Gedung Sekolah & Taman',
      url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Perpustakaan Edukasi',
      url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  const handleChange = (field: keyof SchoolProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('png') && !file.type.includes('image')) {
      alert('Mohon pilih file gambar (diutamakan format PNG transparan).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setProfile(prev => ({
          ...prev,
          logoUrl: dataUrl
        }));
        setToastMsg('Logo sekolah berhasil dimuat. Jangan lupa klik "Simpan Perubahan".');
        setTimeout(() => setToastMsg(''), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setProfile(prev => ({
      ...prev,
      logoUrl: ''
    }));
    setToastMsg('Logo sekolah dihapus.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setProfile(prev => ({
          ...prev,
          loginBackgroundUrl: dataUrl
        }));
        setToastMsg('Background login berhasil dimuat. Jangan lupa klik "Simpan Perubahan".');
        setTimeout(() => setToastMsg(''), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = () => {
    setProfile(prev => ({
      ...prev,
      loginBackgroundUrl: ''
    }));
    setToastMsg('Background login dikembalikan ke standar.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateSchoolProfile(profile);
    setToastMsg('Pengaturan sekolah, logo, dan background login berhasil disimpan.');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleGetCoordinates = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setProfile(prev => ({
            ...prev,
            schoolLat: pos.coords.latitude,
            schoolLng: pos.coords.longitude
          }));
          setToastMsg('Titik koordinat GPS berhasil diperbarui.');
          setTimeout(() => setToastMsg(''), 3000);
        },
        () => {
          // sandbox fallback: Jakarta Kemang coordinates
          setProfile(prev => ({
            ...prev,
            schoolLat: -6.2625,
            schoolLng: 106.8242
          }));
          setToastMsg('Koordinat gerbang sekolah ditetapkan ke Kemang, Jakarta Selatan (-6.2625, 106.8242).');
          setTimeout(() => setToastMsg(''), 4000);
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-700" />
            <span>Identitas Sekolah & Pengaturan Presensi</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi profil resmi madrasah/sekolah, toleransi keterlambatan, koordinat GPS sekolah, dan sistem QR code.
          </p>
        </div>

        <button
          form="school-form"
          type="submit"
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Perubahan</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <form id="school-form" onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Section 1: School Identity */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <School className="w-4 h-4 text-emerald-700" />
            <span>Identitas Resmi Sekolah / Madrasah</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Nama Resmi Sekolah / Madrasah</label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nama Yayasan Penyelenggara</label>
              <input
                type="text"
                value={profile.foundation}
                onChange={(e) => handleChange('foundation', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">NPSN</label>
              <input
                type="text"
                required
                value={profile.npsn}
                onChange={(e) => handleChange('npsn', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">NSM (Nomor Statistik)</label>
              <input
                type="text"
                value={profile.nsm}
                onChange={(e) => handleChange('nsm', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Jenjang Pendidikan</label>
              <select
                value={profile.level}
                onChange={(e) => handleChange('level', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
              >
                <option value="SD/MI">SD / MI</option>
                <option value="SMP/MTs">SMP / MTs</option>
                <option value="SMA/MA">SMA / MA</option>
                <option value="SMK">SMK</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Status Akreditasi</label>
              <input
                type="text"
                value={profile.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Alamat Jalan</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Desa / Kelurahan</label>
              <input
                type="text"
                value={profile.village}
                onChange={(e) => handleChange('village', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Kecamatan</label>
              <input
                type="text"
                value={profile.district}
                onChange={(e) => handleChange('district', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Kabupaten / Kota</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Provinsi</label>
              <input
                type="text"
                value={profile.province}
                onChange={(e) => handleChange('province', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Kode Pos</label>
              <input
                type="text"
                value={profile.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nomor Telepon</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email Resmi</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Situs Web</label>
              <input
                type="text"
                value={profile.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nama Kepala Sekolah / Madrasah</label>
              <input
                type="text"
                value={profile.principalName}
                onChange={(e) => handleChange('principalName', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={profile.principalNip}
                onChange={(e) => handleChange('principalNip', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>
          </div>

          {/* Upload Logo PNG Resmi Sekolah */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-slate-700 font-semibold mb-2">Logo Resmi Sekolah (Format PNG Transparan)</label>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {profile.logoUrl ? (
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-300 p-1.5 flex items-center justify-center shadow-xs shrink-0">
                    <img src={profile.logoUrl} alt="Logo Sekolah" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex flex-col items-center justify-center text-center p-1 shrink-0">
                    <School className="w-6 h-6 text-emerald-600 mb-0.5" />
                    <span className="text-[9px] font-bold">Default</span>
                  </div>
                )}
                <div>
                  <div className="font-bold text-slate-900 text-xs">
                    {profile.logoUrl ? 'Logo Kustom Aktif (PNG)' : 'Gunakan Logo Sekolah PNG'}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Logo ini otomatis digunakan pada <strong>Kop Surat Cetak Jadwal Pelajaran</strong>, <strong>Cetak Laporan Presensi</strong>, header aplikasi, dan login.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <label className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-2xs transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pilih Logo PNG</span>
                  <input
                    type="file"
                    accept="image/png,image/*"
                    className="sr-only"
                    onChange={handleLogoUpload}
                  />
                </label>
                {profile.logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-3 py-2 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    Hapus Logo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Custom Background Halaman Login */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-700" />
              <span>Background Halaman Login (Kustom Gambar)</span>
            </h3>
            {profile.loginBackgroundUrl && (
              <button
                type="button"
                onClick={handleRemoveBackground}
                className="text-xs text-rose-600 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset ke Background Standar</span>
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Anda dapat menyesuaikan gambar latar belakang halaman login dengan mengunggah foto sekolah, gedung, atau memilih gambar suasana belajar di bawah ini.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            {/* Live Preview Mockup Box */}
            <div>
              <div className="text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Pratinjau Tampilan Halaman Login:</span>
              </div>
              <div
                className="relative h-48 rounded-xl overflow-hidden border border-slate-300 shadow-md bg-slate-900 bg-cover bg-center flex flex-col items-center justify-center text-center p-4"
                style={profile.loginBackgroundUrl ? { backgroundImage: `url(${profile.loginBackgroundUrl})` } : undefined}
              >
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px]" />
                <div className="relative z-10 text-white space-y-1.5 max-w-xs">
                  {profile.logoUrl ? (
                    <div className="w-12 h-12 rounded-xl bg-white/95 p-1 shadow-lg mx-auto flex items-center justify-center">
                      <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center mx-auto text-white shadow-md">
                      <School className="w-5 h-5" />
                    </div>
                  )}
                  <div className="text-xs font-bold uppercase tracking-tight line-clamp-1">{profile.name}</div>
                  <div className="text-[9px] text-emerald-400 font-medium">Sistem Absensi Sekolah</div>
                  <div className="bg-white/10 border border-white/20 rounded-md py-1 px-3 text-[9px] text-slate-200">
                    Kartu Login Siswa & Guru
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Controls & Presets */}
            <div className="space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Unggah Gambar Sendiri (JPG / PNG):
                </label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-xl cursor-pointer bg-slate-50 hover:bg-emerald-50/40 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-2 pb-2">
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <p className="text-xs text-slate-600 font-medium">Klik untuk memilih file gambar</p>
                    <p className="text-[10px] text-slate-400">Rekomendasi resolusi 1920x1080 (HD / Landscape)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBackgroundUpload}
                  />
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Atau Pilih Contoh Latar Belakang Edukasi:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {loginBgPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleChange('loginBackgroundUrl', preset.url)}
                      className="group relative h-16 rounded-lg overflow-hidden border border-slate-200 hover:border-emerald-600 focus:ring-2 focus:ring-emerald-500 transition-all text-left"
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <span className="absolute inset-x-1 bottom-1 text-white text-[9px] font-semibold truncate block leading-tight">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Attendance Rules */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>Aturan Presensi & Toleransi Keterlambatan</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Toleransi Keterlambatan (Menit)</label>
              <input
                type="number"
                min={0}
                max={60}
                value={profile.lateThresholdMinutes}
                onChange={(e) => handleChange('lateThresholdMinutes', parseInt(e.target.value) || 15)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold"
              />
              <p className="text-[11px] text-slate-500 mt-1">Siswa/Guru masuk lewat dari menit ini dihitung Terlambat.</p>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Kehadiran Minimum (%)</label>
              <input
                type="number"
                min={50}
                max={100}
                value={profile.minAttendancePercentage}
                onChange={(e) => handleChange('minAttendancePercentage', parseInt(e.target.value) || 80)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold"
              />
              <p className="text-[11px] text-slate-500 mt-1">Di bawah persentase ini akan ditandai "Perlu Perhatian".</p>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Zona Waktu Sistem</label>
              <input
                type="text"
                disabled
                value={profile.timezone}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: GPS Geolocation & Radius */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Titik Koordinat Sekolah (GPS Geolocation)</span>
            </h3>

            <button
              type="button"
              onClick={handleGetCoordinates}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-semibold flex items-center gap-1"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Gunakan Lokasi Gerbang Saya</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Latitude Sekolah</label>
              <input
                type="number"
                step="any"
                value={profile.schoolLat}
                onChange={(e) => handleChange('schoolLat', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Longitude Sekolah</label>
              <input
                type="number"
                step="any"
                value={profile.schoolLng}
                onChange={(e) => handleChange('schoolLng', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Maksimum Radius Valid (Meter)</label>
              <input
                type="number"
                value={profile.maxGpsRadiusMeters}
                onChange={(e) => handleChange('maxGpsRadiusMeters', parseInt(e.target.value) || 150)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 4: QR Code & Integration */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-700" />
            <span>Pengaturan Presensi QR Code</span>
          </h3>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="font-bold text-slate-900">Aktifkan Presensi QR Code Dinamis</span>
              <p className="text-slate-500 mt-0.5">Memungkinkan guru menampilkan QR pada infocus atau tablet kelas.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={profile.qrAttendanceEnabled}
                onChange={(e) => handleChange('qrAttendanceEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};
