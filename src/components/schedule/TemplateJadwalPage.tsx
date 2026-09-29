import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Calendar,
  Sparkles,
  X,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { ScheduleSlotTemplate, UserAccount } from '../../types';
import { storage } from '../../services/storageService';

interface TemplateJadwalPageProps {
  currentUser: UserAccount;
  onNavigateToJadwal?: () => void;
}

export const TemplateJadwalPage: React.FC<TemplateJadwalPageProps> = ({
  currentUser,
  onNavigateToJadwal
}) => {
  const sessions = storage.getSessions();
  const [slots, setSlots] = useState<ScheduleSlotTemplate[]>(storage.getScheduleSlotTemplates());
  const [filterDay, setFilterDay] = useState<string>('ALL');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState<string>('');
  const [formSessionId, setFormSessionId] = useState<string>(sessions[0]?.id || 'ses-1');
  const [formStart, setFormStart] = useState<string>('07:00');
  const [formEnd, setFormEnd] = useState<string>('07:45');
  const [formDays, setFormDays] = useState<('Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu')[]>([
    'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'
  ]);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<string>('');

  const allDays: ('Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu')[] = [
    'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
  ];

  const refreshList = () => {
    setSlots(storage.getScheduleSlotTemplates());
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    const nextSlotNum = slots.length + 1;
    const matchedSession = sessions[nextSlotNum - 1] || sessions[0];

    setFormName(`Slot Jam ke-${nextSlotNum} (${matchedSession?.startTime || '07:00'} - ${matchedSession?.endTime || '07:45'})`);
    setFormSessionId(matchedSession?.id || 'ses-1');
    setFormStart(matchedSession?.startTime || '07:00');
    setFormEnd(matchedSession?.endTime || '07:45');
    setFormDays(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']);
    setFormIsActive(true);
    setShowModal(true);
  };

  const handleOpenEdit = (slot: ScheduleSlotTemplate) => {
    setEditingId(slot.id);
    setFormName(slot.name);
    setFormSessionId(slot.sessionId);
    setFormStart(slot.startTime);
    setFormEnd(slot.endTime);
    setFormDays(slot.applicableDays || []);
    setFormIsActive(slot.isActive ?? true);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus slot template ini?')) {
      storage.deleteScheduleSlotTemplate(id);
      refreshList();
      setToastMsg('Slot template jadwal berhasil dihapus.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleToggleDay = (day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu') => {
    if (formDays.includes(day)) {
      setFormDays(formDays.filter(d => d !== day));
    } else {
      setFormDays([...formDays, day]);
    }
  };

  const handleSessionChange = (sessId: string) => {
    setFormSessionId(sessId);
    const sess = sessions.find(s => s.id === sessId);
    if (sess) {
      setFormStart(sess.startTime);
      setFormEnd(sess.endTime);
      if (!editingId) {
        setFormName(`Slot ${sess.name} (${sess.startTime} - ${sess.endTime})`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formDays.length === 0) {
      alert('Pilih minimal 1 hari penggunaan untuk slot jadwal ini.');
      return;
    }

    const slotData: ScheduleSlotTemplate = {
      id: editingId || `slot-${Date.now()}`,
      name: formName,
      sessionId: formSessionId,
      startTime: formStart,
      endTime: formEnd,
      applicableDays: formDays,
      isActive: formIsActive
    };

    storage.saveScheduleSlotTemplate(slotData);
    refreshList();
    setShowModal(false);
    setToastMsg(`Slot template "${formName}" berhasil disimpan.`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Generate Slot Otomatis dari Jam Pelajaran / Sesi
  const handleAutoGenerateFromSessions = () => {
    if (confirm(`Buat slot template secara otomatis dari ${sessions.length} sesi jam pelajaran yang aktif?`)) {
      const generated: ScheduleSlotTemplate[] = sessions
        .filter(s => s.type === 'Pelajaran' || s.type === 'Kegiatan Khusus')
        .map((s, idx) => ({
          id: `slot-auto-${s.id}-${idx}`,
          name: `Slot ${s.name} (${s.startTime} - ${s.endTime})`,
          sessionId: s.id,
          startTime: s.startTime,
          endTime: s.endTime,
          applicableDays: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
          isActive: true
        }));

      storage.setScheduleSlotTemplates(generated);
      refreshList();
      setToastMsg(`Berhasil men-generate ${generated.length} slot template jadwal untuk hari Senin-Jumat.`);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  // Filter slots by selected day
  const filteredSlots = slots.filter(s => {
    if (filterDay === 'ALL') return true;
    return s.applicableDays.includes(filterDay as any);
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-700" />
            <span>Template Slot Jadwal Pelajaran</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola master slot waktu dan hari berlakunya slot sebelum membuat jadwal pelajaran kelas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAutoGenerateFromSessions}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            title="Generate slot otomatis dari sesi jam pelajaran aktif"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Auto-Generate dari Sesi</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Slot Baru</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Filter Tabs by Day */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-slate-700 mr-2 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter Hari Penggunaan:</span>
          </span>
          <button
            onClick={() => setFilterDay('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterDay === 'ALL'
                ? 'bg-emerald-700 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Hari ({slots.length})
          </button>
          {allDays.map(d => {
            const count = slots.filter(s => s.applicableDays.includes(d)).length;
            return (
              <button
                key={d}
                onClick={() => setFilterDay(d)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterDay === d
                    ? 'bg-emerald-700 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d} ({count})
              </button>
            );
          })}
        </div>

        {onNavigateToJadwal && (
          <button
            onClick={onNavigateToJadwal}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-semibold flex items-center gap-1"
          >
            <span>Buka Jadwal Pelajaran</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Slots Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3 w-12 text-center">No</th>
                <th className="p-3">Nama Slot Template</th>
                <th className="p-3">Waktu (Mulai - Selesai)</th>
                <th className="p-3">Sesi Terkait</th>
                <th className="p-3">Hari Penggunaan Slot</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSlots.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Belum ada slot template untuk hari yang dipilih. Klik "Tambah Slot Baru" atau "Auto-Generate dari Sesi".
                  </td>
                </tr>
              ) : (
                filteredSlots.map((slot, idx) => {
                  const sess = sessions.find(s => s.id === slot.sessionId);

                  return (
                    <tr key={slot.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-center font-mono font-semibold text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">
                        {slot.name}
                      </td>
                      <td className="p-3 font-mono font-semibold text-emerald-800 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{slot.startTime} - {slot.endTime} WIB</span>
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {sess?.name || slot.sessionId}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {slot.applicableDays.map(day => (
                            <span
                              key={day}
                              className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                                day === 'Jumat'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : day === 'Sabtu'
                                  ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {day}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${slot.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                          {slot.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(slot)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(slot.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Card */}
      <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-3">
        <Layers className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-emerald-950 mb-0.5">Cara Kerja Slot Template Jadwal:</h4>
          <p className="text-slate-600 leading-relaxed">
            Slot template ini mendefinisikan jam pelajaran yang tersedia untuk setiap hari sekolah. Di menu <strong>Jadwal Pelajaran</strong>, saat admin memilih hari (misal: "Senin"), sistem hanya akan menampilkan slot yang telah Anda tandai berlaku untuk hari tersebut. Hal ini memudahkan pengaturan jika ada hari dengan durasi berbeda (seperti hari Jumat dengan jam lebih pendek).
          </p>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>{editingId ? 'Edit Slot Template Jadwal' : 'Tambah Slot Template Jadwal'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Slot Template</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Slot Jam ke-1 (07:00 - 07:45)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Hubungkan dengan Sesi Sekolah</label>
                <select
                  value={formSessionId}
                  onChange={(e) => handleSessionChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.startTime} - {s.endTime} WIB) - [{s.type}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Waktu Mulai</label>
                  <input
                    type="time"
                    required
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Waktu Selesai</label>
                  <input
                    type="time"
                    required
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-medium"
                  />
                </div>
              </div>

              {/* Applicable Days Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-700 font-semibold">
                    Slot Berlaku untuk Hari Apa Saja:
                  </label>
                  <div className="space-x-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setFormDays(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'])}
                      className="text-emerald-700 hover:underline font-semibold"
                    >
                      Senin-Jumat
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setFormDays(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'])}
                      className="text-emerald-700 hover:underline font-semibold"
                    >
                      Senin-Sabtu
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {allDays.map(day => {
                    const isSelected = formDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleToggleDay(day)}
                        className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                {formDays.length === 0 && (
                  <p className="text-[11px] text-rose-600 mt-1">Pilih minimal 1 hari penggunaan.</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-700">Status Aktifkan Slot</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
                </label>
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
                  Simpan Slot Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
