import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle,
  Copy,
  Filter,
  X,
  Printer,
  Layers,
  Sparkles
} from 'lucide-react';
import { ScheduleItem, Classroom, Subject, Teacher, Room, UserAccount, ScheduleSlotTemplate } from '../../types';
import { storage } from '../../services/storageService';
import { KopSurat } from '../common/KopSurat';

interface JadwalPelajaranPageProps {
  currentUser: UserAccount;
}

export const JadwalPelajaranPage: React.FC<JadwalPelajaranPageProps> = ({ currentUser }) => {
  const classes = storage.getClasses();
  const subjects = storage.getSubjects();
  const teachers = storage.getTeachers();
  const rooms = storage.getRooms();
  const sessions = storage.getSessions();
  const schoolProfile = storage.getSchoolProfile();
  const slotTemplates = storage.getScheduleSlotTemplates();
  const activeAyObj = storage.getActiveAcademicYear();
  const activeSemObj = storage.getActiveSemester();
  const activeAy = activeAyObj?.id || 'ay-2025-2026';
  const activeSem = activeSemObj?.id || 'sem-1';

  const [schedules, setSchedules] = useState<ScheduleItem[]>(storage.getSchedules());
  const [filterDay, setFilterDay] = useState<string>('ALL');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterTeacher, setFilterTeacher] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'LIST' | 'WEEKLY'>('WEEKLY');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Modal form state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formDay, setFormDay] = useState<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu'>('Senin');
  const [formSlotId, setFormSlotId] = useState<string>('');
  const [formSessionId, setFormSessionId] = useState<string>(sessions[0]?.id || 'ses-1');
  const [formClassId, setFormClassId] = useState<string>(classes[0]?.id || 'cls-7a');
  const [formSubjectId, setFormSubjectId] = useState<string>(subjects[0]?.id || 'sb-mtk');
  const [formTeacherId, setFormTeacherId] = useState<string>(teachers[0]?.id || 'tch-2');
  const [formRoomId, setFormRoomId] = useState<string>(rooms[0]?.id || 'rm-101');
  const [conflictError, setConflictError] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string>('');

  const days: ('Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu')[] = [
    'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
  ];

  const refreshList = () => {
    setSchedules(storage.getSchedules());
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setConflictError('');
    const day = formDay || 'Senin';
    const availableSlots = slotTemplates.filter(s => s.applicableDays.includes(day) && (s.isActive ?? true));
    const firstSlot = availableSlots[0];
    if (firstSlot) {
      setFormSlotId(firstSlot.id);
      setFormSessionId(firstSlot.sessionId);
    } else {
      setFormSlotId('');
      setFormSessionId(sessions[0]?.id || 'ses-1');
    }
    setShowModal(true);
  };

  const handleDayChangeInModal = (newDay: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu') => {
    setFormDay(newDay);
    const availableSlots = slotTemplates.filter(s => s.applicableDays.includes(newDay) && (s.isActive ?? true));
    const matchedSlot = availableSlots.find(s => s.sessionId === formSessionId) || availableSlots[0];
    if (matchedSlot) {
      setFormSlotId(matchedSlot.id);
      setFormSessionId(matchedSlot.sessionId);
    } else {
      setFormSlotId('');
    }
  };

  const handleSlotChangeInModal = (slotId: string) => {
    setFormSlotId(slotId);
    const selectedSlot = slotTemplates.find(s => s.id === slotId);
    if (selectedSlot) {
      setFormSessionId(selectedSlot.sessionId);
    }
  };

  const handleOpenEdit = (item: ScheduleItem) => {
    setEditingId(item.id);
    setFormDay(item.day);
    setFormClassId(item.classId);
    setFormSubjectId(item.subjectId);
    setFormTeacherId(item.teacherId);
    setFormRoomId(item.roomId);
    setFormSessionId(item.sessionId);

    // Match slot template for this day and session
    const matchedSlot = slotTemplates.find(s =>
      s.applicableDays.includes(item.day) &&
      (s.sessionId === item.sessionId || (s.startTime === item.startTime && s.endTime === item.endTime))
    ) || slotTemplates.find(s => s.sessionId === item.sessionId);

    if (matchedSlot) {
      setFormSlotId(matchedSlot.id);
    } else {
      setFormSlotId('');
    }

    setConflictError('');
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      storage.deleteSchedule(id);
      refreshList();
      setToastMsg('Jadwal berhasil dihapus.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleDuplicate = (item: ScheduleItem) => {
    const nextDays: Record<string, any> = {
      'Senin': 'Selasa',
      'Selasa': 'Rabu',
      'Rabu': 'Kamis',
      'Kamis': 'Jumat',
      'Jumat': 'Sabtu',
      'Sabtu': 'Senin'
    };
    const targetDay = nextDays[item.day];

    const duplicateItem: ScheduleItem = {
      ...item,
      id: `sch-${Date.now()}`,
      day: targetDay
    };

    const res = storage.saveSchedule(duplicateItem);
    if (!res.success) {
      alert(`Gagal duplikasi: ${res.message}`);
    } else {
      refreshList();
      setToastMsg(`Jadwal berhasil diduplikasi ke hari ${targetDay}.`);
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError('');

    // Determine start and end time from slot template or session
    const selectedSlot = slotTemplates.find(s => s.id === formSlotId);
    const sessionObj = sessions.find(s => s.id === formSessionId);

    const startTime = selectedSlot?.startTime || sessionObj?.startTime || '07:00';
    const endTime = selectedSlot?.endTime || sessionObj?.endTime || '07:45';
    const finalSessionId = selectedSlot?.sessionId || formSessionId || 'ses-1';

    const scheduleData: ScheduleItem = {
      id: editingId || `sch-${Date.now()}`,
      day: formDay,
      sessionId: finalSessionId,
      startTime: startTime,
      endTime: endTime,
      classId: formClassId,
      subjectId: formSubjectId,
      teacherId: formTeacherId,
      roomId: formRoomId,
      academicYearId: activeAy,
      semesterId: activeSem,
      isActive: true
    };

    const result = storage.saveSchedule(scheduleData);
    if (!result.success) {
      setConflictError(`Jadwal bentrok dengan jadwal yang sudah ada: ${result.message}`);
      return;
    }

    refreshList();
    setShowModal(false);
    setToastMsg('Jadwal pelajaran berhasil disimpan.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Filter schedules
  const filtered = schedules.filter(s => {
    if (filterDay !== 'ALL' && s.day !== filterDay) return false;
    if (filterClass !== 'ALL' && s.classId !== filterClass) return false;
    if (filterTeacher !== 'ALL' && s.teacherId !== filterTeacher) return false;
    return true;
  });

  const canEdit = currentUser.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-700" />
            <span>Jadwal Pelajaran Sekolah</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistem otomatis mencegah bentrok guru mengajar dua kelas bersamaan, ruang bentrok, atau kelas ganda pada sesi yang sama.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPrintModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Jadwal Pelajaran</span>
          </button>

          {canEdit && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jadwal Baru</span>
            </button>
          )}
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Filter & View Mode */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div>
            <label className="text-slate-600 font-semibold mr-1.5">Hari:</label>
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
            >
              <option value="ALL">Semua Hari</option>
              {days.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-600 font-semibold mr-1.5">Kelas:</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
            >
              <option value="ALL">Semua Kelas</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>Kelas {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-600 font-semibold mr-1.5">Guru:</label>
            <select
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium max-w-[150px] truncate"
            >
              <option value="ALL">Semua Guru</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start text-xs font-semibold">
          <button
            onClick={() => setViewMode('WEEKLY')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              viewMode === 'WEEKLY' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tampilan Mingguan
          </button>
          <button
            onClick={() => setViewMode('LIST')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              viewMode === 'LIST' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tampilan Daftar Tabel
          </button>
        </div>
      </div>

      {/* View Mode 1: Weekly Grid */}
      {viewMode === 'WEEKLY' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map(dayName => {
            const daySchedules = filtered.filter(s => s.day === dayName);
            if (filterDay !== 'ALL' && filterDay !== dayName) return null;

            return (
              <div key={dayName} className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span>{dayName}</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">
                    {daySchedules.length} Sesi
                  </span>
                </div>

                <div className="p-3 divide-y divide-slate-100 flex-1 space-y-2">
                  {daySchedules.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      Tidak ada jadwal di hari {dayName}.
                    </div>
                  ) : (
                    daySchedules.map(item => {
                      const cls = storage.getClassById(item.classId);
                      const sub = storage.getSubjectById(item.subjectId);
                      const tch = storage.getTeacherById(item.teacherId);
                      const rm = storage.getRooms().find(r => r.id === item.roomId);
                      const ses = storage.getSessions().find(s => s.id === item.sessionId);

                      return (
                        <div key={item.id} className="pt-2 first:pt-0">
                          <div className="flex items-start justify-between">
                            <span className="font-bold text-xs text-slate-900">{sub?.name}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Kelas {cls?.name}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                            <div>Guru: <strong>{tch?.name}</strong></div>
                            <div>Waktu: {item.startTime} - {item.endTime} ({ses?.name})</div>
                            <div>Ruang: {rm?.name}</div>
                          </div>

                          {canEdit && (
                            <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-end gap-1 text-[11px]">
                              <button
                                onClick={() => handleDuplicate(item)}
                                className="p-1 text-slate-500 hover:text-emerald-700"
                                title="Duplikasi ke hari berikutnya"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="p-1 text-slate-500 hover:text-blue-700"
                                title="Edit Jadwal"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1 text-slate-500 hover:text-rose-700"
                                title="Hapus Jadwal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View Mode 2: Table List */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">Hari</th>
                  <th className="p-3">Jam / Sesi</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Mata Pelajaran</th>
                  <th className="p-3">Guru Pengampu</th>
                  <th className="p-3">Ruang</th>
                  {canEdit && <th className="p-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(item => {
                  const cls = storage.getClassById(item.classId);
                  const sub = storage.getSubjectById(item.subjectId);
                  const tch = storage.getTeacherById(item.teacherId);
                  const rm = storage.getRooms().find(r => r.id === item.roomId);
                  const ses = storage.getSessions().find(s => s.id === item.sessionId);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{item.day}</td>
                      <td className="p-3 font-mono">{item.startTime} - {item.endTime} ({ses?.name})</td>
                      <td className="p-3 font-semibold text-emerald-800">Kelas {cls?.name}</td>
                      <td className="p-3 font-medium text-slate-900">{sub?.name}</td>
                      <td className="p-3">{tch?.name}</td>
                      <td className="p-3 text-slate-500">{rm?.name}</td>
                      {canEdit && (
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleDuplicate(item)}
                              className="p-1 text-slate-400 hover:text-emerald-700"
                              title="Duplikasi Jadwal"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-1 text-slate-400 hover:text-blue-700"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-700"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                {editingId ? 'Edit Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              {conflictError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{conflictError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hari</label>
                  <select
                    value={formDay}
                    onChange={(e) => handleDayChangeInModal(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    {days.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                    <span>Slot Template Jadwal</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">Hari {formDay}</span>
                  </label>
                  {(() => {
                    const daySlots = slotTemplates.filter(s => s.applicableDays.includes(formDay) && (s.isActive ?? true));
                    if (daySlots.length === 0) {
                      return (
                        <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800">
                          Belum ada slot untuk {formDay}. Atur di menu Template Jadwal.
                        </div>
                      );
                    }
                    return (
                      <select
                        value={formSlotId}
                        onChange={(e) => handleSlotChangeInModal(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium font-mono"
                      >
                        {daySlots.map(slot => (
                          <option key={slot.id} value={slot.id}>
                            {slot.name} ({slot.startTime} - {slot.endTime})
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kelas</label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>Kelas {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ruangan</label>
                  <select
                    value={formRoomId}
                    onChange={(e) => setFormRoomId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mata Pelajaran</label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>[{s.code}] {s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Guru Pengampu</label>
                <select
                  value={formTeacherId}
                  onChange={(e) => setFormTeacherId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.subjectTaught})</option>
                  ))}
                </select>
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
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cetak Jadwal Pelajaran Modal (Print Preview) */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-sm text-slate-900">
                  Pratinjau Cetak Jadwal Pelajaran Resmi
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content with Official Kop Surat & Logo */}
            <div className="p-4 bg-white print:p-0">
              <KopSurat
                profile={schoolProfile}
                title="JADWAL PELAJARAN TERPADU SEKOLAH"
                subTitle={`Tahun Pelajaran: ${activeAyObj?.name || '2025/2026'} · Semester: ${activeSemObj?.name || 'Ganjil'} · ${filterClass !== 'ALL' ? `Kelas ${classes.find(c => c.id === filterClass)?.name}` : 'Semua Kelas'}`}
              />

              <div className="overflow-x-auto my-4">
                <table className="w-full text-xs border-collapse border border-slate-400">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400 text-center">
                      <th className="p-2 border border-slate-400 w-24">Hari</th>
                      <th className="p-2 border border-slate-400 w-32">Waktu / Sesi</th>
                      <th className="p-2 border border-slate-400">Kelas</th>
                      <th className="p-2 border border-slate-400">Mata Pelajaran</th>
                      <th className="p-2 border border-slate-400">Guru Pengampu</th>
                      <th className="p-2 border border-slate-400">Ruangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-slate-500">
                          Tidak ada jadwal yang terdaftar untuk filter ini.
                        </td>
                      </tr>
                    ) : (
                      filtered.map(item => {
                        const cls = classes.find(c => c.id === item.classId);
                        const subj = subjects.find(s => s.id === item.subjectId);
                        const tch = teachers.find(t => t.id === item.teacherId);
                        const rm = rooms.find(r => r.id === item.roomId);
                        const sess = sessions.find(s => s.id === item.sessionId);

                        return (
                          <tr key={item.id} className="border-b border-slate-300 hover:bg-slate-50">
                            <td className="p-2 border border-slate-300 font-semibold text-center">{item.day}</td>
                            <td className="p-2 border border-slate-300 text-center font-mono text-[11px]">
                              {item.startTime} - {item.endTime} WIB
                              {sess ? <div className="text-[10px] text-slate-500">({sess.name})</div> : null}
                            </td>
                            <td className="p-2 border border-slate-300 font-bold text-center">Kelas {cls?.name || item.classId}</td>
                            <td className="p-2 border border-slate-300 font-semibold">[{subj?.code}] {subj?.name}</td>
                            <td className="p-2 border border-slate-300">{tch?.name}</td>
                            <td className="p-2 border border-slate-300 text-center font-medium">{rm?.name}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Signature Block */}
              <div className="mt-8 flex justify-between text-xs px-6">
                <div className="text-center">
                  <p className="text-slate-600">Mengetahui,</p>
                  <p className="font-bold text-slate-900 mt-1">Kepala Sekolah / Madrasah</p>
                  <div className="h-16" />
                  <p className="font-bold underline text-slate-900">{schoolProfile.principalName}</p>
                  <p className="text-[11px] text-slate-500 font-mono">NIP. {schoolProfile.principalNip || '-'}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-600">{schoolProfile.city || 'Jakarta'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="font-bold text-slate-900 mt-1">Waka. Kurikulum / Operator</p>
                  <div className="h-16" />
                  <p className="font-bold underline text-slate-900">{schoolProfile.operatorName || 'Administrator Kurikulum'}</p>
                  <p className="text-[11px] text-slate-500 font-mono">NIP / ID. {schoolProfile.operatorPhone || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
