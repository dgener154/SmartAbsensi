import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  X,
  Calendar,
  Sparkles,
  Save,
  Coffee,
  CheckSquare,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SchoolSession, UserAccount, SchoolProfile } from '../../types';
import { storage } from '../../services/storageService';

interface JamPelajaranPageProps {
  currentUser: UserAccount;
}

export const JamPelajaranPage: React.FC<JamPelajaranPageProps> = ({ currentUser }) => {
  const [profile, setProfile] = useState<SchoolProfile>(storage.getSchoolProfile());
  const [sessions, setSessions] = useState<SchoolSession[]>(storage.getSessions());
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Weekly Holiday state
  const [weeklyHolidays, setWeeklyHolidays] = useState<string[]>(
    profile.weeklyHolidays || ['Minggu']
  );

  // Auto duration generator state
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState<number>(
    profile.defaultSessionDurationMinutes || 40
  );
  const [schoolStartTime, setSchoolStartTime] = useState<string>(
    profile.schoolHours?.start || '07:00'
  );
  const [totalSessionsCount, setTotalSessionsCount] = useState<number>(8);
  const [break1AfterSession, setBreak1AfterSession] = useState<number>(4);
  const [break1DurationMinutes, setBreak1DurationMinutes] = useState<number>(
    profile.breakDurationMinutes || 20
  );
  const [break2AfterSession, setBreak2AfterSession] = useState<number>(6);
  const [break2DurationMinutes, setBreak2DurationMinutes] = useState<number>(40);

  // Single Session Modal Form State
  const [formName, setFormName] = useState<string>('');
  const [formNumber, setFormNumber] = useState<number>(1);
  const [formStart, setFormStart] = useState<string>('07:00');
  const [formEnd, setFormEnd] = useState<string>('07:40');
  const [formDuration, setFormDuration] = useState<number>(40);
  const [formType, setFormType] = useState<any>('Pelajaran');
  const [toastMsg, setToastMsg] = useState<string>('');

  const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  const refreshList = () => {
    setSessions(storage.getSessions());
    setProfile(storage.getSchoolProfile());
  };

  // Helper to add minutes to HH:mm string
  const addMinutes = (timeStr: string, minutes: number): string => {
    const [h, m] = timeStr.split(':').map(Number);
    const total = h * 60 + m + minutes;
    const newH = Math.floor(total / 60) % 24;
    const newM = total % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  };

  // Helper to calculate difference in minutes
  const getDiffMinutes = (start: string, end: string): number => {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  };

  // Toggle weekly holiday
  const handleToggleHoliday = (day: string) => {
    if (weeklyHolidays.includes(day)) {
      setWeeklyHolidays(weeklyHolidays.filter(d => d !== day));
    } else {
      setWeeklyHolidays([...weeklyHolidays, day]);
    }
  };

  // Save weekly holidays to school profile
  const handleSaveWeeklyHolidays = () => {
    storage.updateSchoolProfile({
      weeklyHolidays: weeklyHolidays
    });
    setProfile(storage.getSchoolProfile());
    setToastMsg(`Hari libur mingguan berhasil disimpan: ${weeklyHolidays.join(', ') || 'Tidak ada'}.`);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Automatically Generate All Sessions based on duration settings
  const handleAutoGenerateSessions = () => {
    if (confirm(`Apakah Anda yakin ingin men-generate ulang seluruh jam sesi otomatis dengan durasi ${sessionDurationMinutes} menit per sesi mulai jam ${schoolStartTime}?`)) {
      const generated: SchoolSession[] = [];
      let currentTime = schoolStartTime;
      let lessonCounter = 1;
      let orderCounter = 1;

      for (let i = 1; i <= totalSessionsCount; i++) {
        // Lesson period
        const lessonEnd = addMinutes(currentTime, sessionDurationMinutes);
        generated.push({
          id: `ses-${orderCounter}`,
          sessionNumber: orderCounter,
          name: `Sesi ${lessonCounter} (${sessionDurationMinutes} Menit)`,
          startTime: currentTime,
          endTime: lessonEnd,
          type: 'Pelajaran',
          isActive: true
        });
        currentTime = lessonEnd;
        orderCounter++;

        // Break 1 check
        if (lessonCounter === break1AfterSession && break1DurationMinutes > 0) {
          const break1End = addMinutes(currentTime, break1DurationMinutes);
          generated.push({
            id: `ses-${orderCounter}`,
            sessionNumber: orderCounter,
            name: `Istirahat 1 (${break1DurationMinutes} Menit)`,
            startTime: currentTime,
            endTime: break1End,
            type: 'Istirahat',
            isActive: true
          });
          currentTime = break1End;
          orderCounter++;
        }

        // Break 2 check (e.g. Sholat Dzuhur & Makan)
        if (lessonCounter === break2AfterSession && break2DurationMinutes > 0) {
          const break2End = addMinutes(currentTime, break2DurationMinutes);
          generated.push({
            id: `ses-${orderCounter}`,
            sessionNumber: orderCounter,
            name: `Istirahat 2 / Sholat Dzuhur (${break2DurationMinutes} Menit)`,
            startTime: currentTime,
            endTime: break2End,
            type: 'Sholat',
            isActive: true
          });
          currentTime = break2End;
          orderCounter++;
        }

        lessonCounter++;
      }

      // Update storage sessions
      localStorage.setItem('sas_sessions', JSON.stringify(generated));
      storage.updateSchoolProfile({
        defaultSessionDurationMinutes: sessionDurationMinutes,
        breakDurationMinutes: break1DurationMinutes,
        schoolHours: {
          start: schoolStartTime,
          end: currentTime
        }
      });

      refreshList();
      setToastMsg(`Berhasil menghasilkan ${generated.length} sesi jam pelajaran otomatis (selesai pukul ${currentTime} WIB).`);
      setTimeout(() => setToastMsg(''), 4500);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    const lastSession = sessions[sessions.length - 1];
    const nextStart = lastSession ? lastSession.endTime : '07:00';
    const nextEnd = addMinutes(nextStart, sessionDurationMinutes);

    setFormName(`Sesi ${sessions.length + 1}`);
    setFormNumber(sessions.length + 1);
    setFormStart(nextStart);
    setFormEnd(nextEnd);
    setFormDuration(sessionDurationMinutes);
    setFormType('Pelajaran');
    setShowModal(true);
  };

  const handleOpenEdit = (s: SchoolSession) => {
    setEditingId(s.id);
    setFormName(s.name);
    setFormNumber(s.sessionNumber);
    setFormStart(s.startTime);
    setFormEnd(s.endTime);
    const diff = getDiffMinutes(s.startTime, s.endTime);
    setFormDuration(diff > 0 ? diff : 40);
    setFormType(s.type);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus sesi ini?')) {
      const updated = sessions.filter(s => s.id !== id);
      localStorage.setItem('sas_sessions', JSON.stringify(updated));
      refreshList();
      setToastMsg('Sesi berhasil dihapus.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  // When form start time or duration changes, auto calculate end time
  const handleFormStartChange = (val: string) => {
    setFormStart(val);
    setFormEnd(addMinutes(val, formDuration));
  };

  const handleFormDurationChange = (minutes: number) => {
    setFormDuration(minutes);
    setFormEnd(addMinutes(formStart, minutes));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: SchoolSession = {
      id: editingId || `ses-${Date.now()}`,
      sessionNumber: formNumber,
      name: formName,
      startTime: formStart,
      endTime: formEnd,
      type: formType,
      isActive: true
    };
    storage.saveSession(newSession);
    refreshList();
    setShowModal(false);
    setToastMsg('Jam pelajaran/sesi berhasil disimpan.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-700" />
            <span>Jam Pelajaran, Durasi Sesi & Hari Libur</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi durasi otomatis setiap sesi pembelajaran, waktu istirahat terpadu, dan penetapan hari libur mingguan sekolah.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Sesi Manual</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Grid Settings: 1. Hari Libur Mingguan & 2. Pengaturan Durasi Sesi Otomatis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Pengaturan Hari Libur Mingguan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>Pengaturan Hari Libur Mingguan</span>
            </h3>
            <span className="text-[11px] px-2 py-0.5 bg-rose-50 text-rose-800 rounded font-semibold border border-rose-200">
              {weeklyHolidays.length} Hari Libur
            </span>
          </div>

          <p className="text-slate-500 text-xs">
            Pilih hari libur rutin mingguan madrasah/sekolah. Hari yang dipilih tidak akan diagendakan KBM dan otomatis ditandai Libur pada sistem presensi.
          </p>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Pilihan Cepat:</span>
            <button
              type="button"
              onClick={() => setWeeklyHolidays(['Sabtu', 'Minggu'])}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold border border-slate-200"
            >
              5 Hari Sekolah (Sabtu & Minggu Libur)
            </button>
            <button
              type="button"
              onClick={() => setWeeklyHolidays(['Minggu'])}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold border border-slate-200"
            >
              6 Hari Sekolah (Hanya Minggu Libur)
            </button>
          </div>

          {/* Days buttons */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {daysOfWeek.map(day => {
              const isHoliday = weeklyHolidays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleToggleHoliday(day)}
                  className={`py-2 px-1 rounded-lg border text-center font-bold transition-all text-xs ${
                    isHoliday
                      ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>{day}</div>
                  <div className="text-[9px] font-normal opacity-90 mt-0.5">
                    {isHoliday ? 'LIBUR' : 'MASUK'}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveWeeklyHolidays}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Hari Libur Mingguan</span>
            </button>
          </div>
        </div>

        {/* Card 2: Pengaturan Durasi Sesi & Generator Otomatis */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Otomatisasi Durasi Sesi & Jam Pelajaran</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              Standar: {sessionDurationMinutes} Menit/JP
            </span>
          </div>

          <p className="text-slate-500 text-xs">
            Atur durasi per jam pelajaran (JP) dan waktu istirahat. Sistem akan otomatis menghitung waktu mulai dan selesai untuk semua sesi KBM.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Durasi per Sesi KBM</label>
              <select
                value={sessionDurationMinutes}
                onChange={(e) => setSessionDurationMinutes(parseInt(e.target.value) || 40)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
              >
                <option value={35}>35 Menit (SD/MI)</option>
                <option value={40}>40 Menit (SMP/MTs)</option>
                <option value={45}>45 Menit (SMA/MA/SMK)</option>
                <option value={50}>50 Menit</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Jam Masuk Pertama</label>
              <input
                type="time"
                value={schoolStartTime}
                onChange={(e) => setSchoolStartTime(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Total Sesi Pelajaran</label>
              <select
                value={totalSessionsCount}
                onChange={(e) => setTotalSessionsCount(parseInt(e.target.value) || 8)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
              >
                <option value={6}>6 Jam Pelajaran (JP)</option>
                <option value={7}>7 Jam Pelajaran (JP)</option>
                <option value={8}>8 Jam Pelajaran (JP)</option>
                <option value={9}>9 Jam Pelajaran (JP)</option>
                <option value={10}>10 Jam Pelajaran (JP)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Istirahat 1 (Setelah Sesi {break1AfterSession})
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={break1DurationMinutes}
                  onChange={(e) => setBreak1DurationMinutes(parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-center"
                />
                <span className="text-slate-500">Menit</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Istirahat 2 / Dzuhur (Setelah Sesi {break2AfterSession})
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={90}
                  value={break2DurationMinutes}
                  onChange={(e) => setBreak2DurationMinutes(parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-center"
                />
                <span className="text-slate-500">Menit</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleAutoGenerateSessions}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hitung & Generate Jam Sesi Otomatis</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Daftar Urutan Sesi Jam Pelajaran Aktif ({sessions.length} Sesi)
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Jam Operasional: <strong>{sessions[0]?.startTime || '07:00'} - {sessions[sessions.length - 1]?.endTime || '14:00'} WIB</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3 w-16 text-center">Urutan</th>
                <th className="p-3">Nama Sesi / Kegiatan</th>
                <th className="p-3">Waktu Mulai</th>
                <th className="p-3">Waktu Selesai</th>
                <th className="p-3 text-center">Durasi</th>
                <th className="p-3">Jenis Sesi</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map(s => {
                const typeBadges: Record<string, string> = {
                  Pelajaran: 'bg-emerald-100 text-emerald-800',
                  Istirahat: 'bg-amber-100 text-amber-800',
                  Sholat: 'bg-blue-100 text-blue-800',
                  Upacara: 'bg-purple-100 text-purple-800',
                  'Kegiatan Khusus': 'bg-slate-100 text-slate-800'
                };
                const duration = getDiffMinutes(s.startTime, s.endTime);

                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-center font-mono font-bold text-slate-900">{s.sessionNumber}</td>
                    <td className="p-3 font-semibold text-slate-900">{s.name}</td>
                    <td className="p-3 font-mono font-semibold text-slate-800">{s.startTime} WIB</td>
                    <td className="p-3 font-mono font-semibold text-slate-800">{s.endTime} WIB</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-semibold text-[11px]">
                        {duration > 0 ? `${duration} Menit` : '-'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${typeBadges[s.type] || 'bg-slate-100'}`}>
                        {s.type}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Session Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                {editingId ? 'Edit Sesi Pelajaran' : 'Tambah Sesi Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Sesi</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Sesi 1 / Istirahat 1..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nomor Urut</label>
                  <input
                    type="number"
                    required
                    value={formNumber}
                    onChange={(e) => setFormNumber(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jenis Kegiatan</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="Pelajaran">Pelajaran</option>
                    <option value="Istirahat">Istirahat</option>
                    <option value="Sholat">Sholat</option>
                    <option value="Upacara">Upacara</option>
                    <option value="Kegiatan Khusus">Kegiatan Khusus</option>
                  </select>
                </div>
              </div>

              {/* Automatic Duration Calculator Helper in Modal */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-900 text-[11px]">Hitung Otomatis Berdasarkan Durasi:</span>
                  <div className="flex items-center gap-1">
                    {[35, 40, 45, 20].map(dur => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => handleFormDurationChange(dur)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          formDuration === dur
                            ? 'bg-emerald-700 text-white'
                            : 'bg-white text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {dur}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Durasi Menit:</span>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={formDuration}
                    onChange={(e) => handleFormDurationChange(parseInt(e.target.value) || 40)}
                    className="w-20 px-2 py-1 bg-white border border-emerald-300 rounded font-mono font-bold text-center"
                  />
                  <span className="text-[10px] text-slate-500 italic">
                    (Waktu Selesai otomatis dihitung dari Waktu Mulai + Durasi)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Waktu Mulai</label>
                  <input
                    type="time"
                    required
                    value={formStart}
                    onChange={(e) => handleFormStartChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Waktu Selesai (Otomatis)</label>
                  <input
                    type="time"
                    required
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-sm"
                >
                  Simpan Sesi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
