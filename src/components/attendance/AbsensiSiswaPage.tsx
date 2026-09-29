import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  Save,
  Lock,
  Unlock,
  AlertCircle,
  Users,
  CheckSquare,
  Sparkles,
  Info
} from 'lucide-react';
import { AttendanceStatus, Classroom, Subject, SchoolSession, UserAccount } from '../../types';
import { storage } from '../../services/storageService';

interface AbsensiSiswaPageProps {
  currentUser: UserAccount;
  initialParams?: {
    classId?: string;
    subjectId?: string;
    sessionId?: string;
    date?: string;
  };
}

export const AbsensiSiswaPage: React.FC<AbsensiSiswaPageProps> = ({ currentUser, initialParams }) => {
  const classes = storage.getClasses();
  const subjects = storage.getSubjects();
  const sessions = storage.getSessions().filter(s => s.type === 'Pelajaran');
  const schoolProfile = storage.getSchoolProfile();

  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialParams?.classId || (classes[0]?.id ?? 'cls-7a')
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialParams?.subjectId || (subjects[0]?.id ?? 'sb-mtk')
  );
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    initialParams?.sessionId || (sessions[0]?.id ?? 'ses-1')
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    initialParams?.date || new Date().toISOString().split('T')[0]
  );

  const [students, setStudents] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, {
    status: AttendanceStatus;
    checkInTime: string;
    notes: string;
  }>>({});

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [changeReason, setChangeReason] = useState<string>('');
  const [showReasonModal, setShowReasonModal] = useState<boolean>(false);
  const [pendingSavePayload, setPendingSavePayload] = useState<any>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Load students and existing attendance
  useEffect(() => {
    const classStudents = storage.getStudentsByClass(selectedClassId);
    setStudents(classStudents);

    // Get existing records
    const existing = storage.getAttendanceByFilter(
      selectedDate,
      selectedClassId,
      selectedSessionId,
      selectedSubjectId
    );

    const isRecordLocked = existing.length > 0 && existing.some(e => e.isLocked);
    setIsLocked(isRecordLocked);

    const initialMap: Record<string, { status: AttendanceStatus; checkInTime: string; notes: string }> = {};

    classStudents.forEach(st => {
      const match = existing.find(e => e.studentId === st.id);
      if (match) {
        initialMap[st.id] = {
          status: match.status,
          checkInTime: match.checkInTime,
          notes: match.notes || ''
        };
      } else {
        // Default to HADIR for convenience
        initialMap[st.id] = {
          status: 'HADIR',
          checkInTime: '07:00',
          notes: ''
        };
      }
    });

    setAttendanceData(initialMap);
  }, [selectedClassId, selectedSubjectId, selectedSessionId, selectedDate]);

  const handleMarkAllPresent = () => {
    if (isLocked) return;
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const updated = { ...attendanceData };
    students.forEach(st => {
      updated[st.id] = {
        ...updated[st.id],
        status: 'HADIR',
        checkInTime: nowTime
      };
    });
    setAttendanceData(updated);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    if (isLocked) return;
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        checkInTime: status === 'HADIR' || status === 'TERLAMBAT' ? nowTime : '-'
      }
    }));
  };

  const handleNoteChange = (studentId: string, notes: string) => {
    if (isLocked) return;
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
  };

  const handleSaveClick = () => {
    const existing = storage.getAttendanceByFilter(
      selectedDate,
      selectedClassId,
      selectedSessionId,
      selectedSubjectId
    );

    // If existing records were modified, prompt for reason (Prompt section 14)
    if (existing.length > 0) {
      setShowReasonModal(true);
    } else {
      executeSave('');
    }
  };

  const executeSave = (reason: string) => {
    const records = students.map(st => ({
      studentId: st.id,
      status: attendanceData[st.id]?.status || 'HADIR',
      checkInTime: attendanceData[st.id]?.checkInTime || '07:00',
      notes: attendanceData[st.id]?.notes || ''
    }));

    storage.saveStudentAttendanceBatch(
      records,
      {
        date: selectedDate,
        classId: selectedClassId,
        sessionId: selectedSessionId,
        subjectId: selectedSubjectId,
        teacherId: currentUser.relatedTeacherId || 'admin'
      },
      reason
    );

    setSaveSuccessMsg('Data absensi berhasil disimpan dan dicatat ke log sistem.');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
    setShowReasonModal(false);
    setChangeReason('');
  };

  const handleToggleLock = () => {
    const newLockState = !isLocked;
    storage.setAttendanceLock(selectedDate, selectedClassId, selectedSessionId, newLockState);
    setIsLocked(newLockState);
    setSaveSuccessMsg(`Data absensi telah ${newLockState ? 'dikunci (tidak dapat diubah)' : 'dibuka kembali'}.`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const currentClass = classes.find(c => c.id === selectedClassId);
  const currentSubject = subjects.find(s => s.id === selectedSubjectId);
  const currentSession = sessions.find(s => s.id === selectedSessionId);

  // Status counters
  const hadirCount = Object.values(attendanceData).filter(v => v.status === 'HADIR').length;
  const terlambatCount = Object.values(attendanceData).filter(v => v.status === 'TERLAMBAT').length;
  const izinCount = Object.values(attendanceData).filter(v => v.status === 'IZIN').length;
  const sakitCount = Object.values(attendanceData).filter(v => v.status === 'SAKIT').length;
  const alpaCount = Object.values(attendanceData).filter(v => v.status === 'ALPA').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Selection Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>Formulir Pengisian Presensi Siswa</span>
            </h2>
            <p className="text-xs text-slate-500">
              Pilih kelas, mata pelajaran, tanggal dan sesi untuk mencatat kehadiran siswa secara real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {currentUser.role === 'ADMIN' && (
              <button
                onClick={handleToggleLock}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isLocked
                    ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Kunci absensi agar tidak dapat diubah guru"
              >
                {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-700" /> : <Unlock className="w-3.5 h-3.5 text-slate-500" />}
                <span>{isLocked ? 'Terkunci (Buka Kunci)' : 'Kunci Absensi'}</span>
              </button>
            )}

            <button
              disabled={isLocked}
              onClick={handleSaveClick}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Presensi</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Tanggal</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-emerald-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Kelas / Rombel</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-emerald-600 font-medium"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>Kelas {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Mata Pelajaran</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-emerald-600 font-medium"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>[{s.code}] {s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Jam Pelajaran / Sesi</label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-emerald-600 font-medium"
            >
              {sessions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.startTime} - {s.endTime})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lock warning if locked */}
        {isLocked && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-900">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Perhatian:</strong> Data absensi pada sesi ini telah dikunci oleh Administrator. Hanya Admin yang dapat membuka kunci data ini untuk perubahan.
            </span>
          </div>
        )}

        {/* Success toast */}
        {saveSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-900">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Summary Count Bar & Tandai Semua Hadir */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-700">Ringkasan:</span>
          <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold">
            🟢 Hadir: {hadirCount}
          </span>
          <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 font-bold">
            🟡 Terlambat: {terlambatCount}
          </span>
          <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-bold">
            🔵 Izin: {izinCount}
          </span>
          <span className="px-2.5 py-1 rounded bg-purple-100 text-purple-800 font-bold">
            🟣 Sakit: {sakitCount}
          </span>
          <span className="px-2.5 py-1 rounded bg-rose-100 text-rose-800 font-bold">
            🔴 Alpa: {alpaCount}
          </span>
          <span className="text-slate-400">· Total: {students.length} Siswa</span>
        </div>

        <button
          disabled={isLocked}
          onClick={handleMarkAllPresent}
          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 self-start md:self-auto disabled:opacity-50"
        >
          <CheckSquare className="w-4 h-4 text-emerald-600" />
          <span>Tandai Semua Hadir</span>
        </button>
      </div>

      {/* Student Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3 w-10 text-center">No</th>
                <th className="p-3">NIS / NISN</th>
                <th className="p-3">Nama Siswa</th>
                <th className="p-3 text-center">L/P</th>
                <th className="p-3">Status Kehadiran</th>
                <th className="p-3 w-28">Jam Hadir</th>
                <th className="p-3">Catatan / Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ada siswa terdaftar pada kelas ini.
                  </td>
                </tr>
              ) : (
                students.map((st, idx) => {
                  const currentRec = attendanceData[st.id] || { status: 'HADIR', checkInTime: '07:00', notes: '' };

                  return (
                    <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-mono text-slate-600">
                        <div>{st.nis}</div>
                        <div className="text-[10px] text-slate-400">{st.nisn}</div>
                      </td>
                      <td className="p-3 font-medium text-slate-900 whitespace-nowrap">
                        {st.name}
                      </td>
                      <td className="p-3 text-center font-semibold">
                        <span className={st.gender === 'L' ? 'text-blue-600' : 'text-pink-600'}>
                          {st.gender}
                        </span>
                      </td>
                      <td className="p-3">
                        {/* Status Radio / Button Group */}
                        <div className="flex items-center gap-1">
                          {(['HADIR', 'TERLAMBAT', 'IZIN', 'SAKIT', 'ALPA'] as AttendanceStatus[]).map((statusOption) => {
                            const isSelected = currentRec.status === statusOption;
                            const colors: Record<AttendanceStatus, string> = {
                              HADIR: isSelected ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                              TERLAMBAT: isSelected ? 'bg-amber-500 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                              IZIN: isSelected ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                              SAKIT: isSelected ? 'bg-purple-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                              ALPA: isSelected ? 'bg-rose-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            };

                            const shortNames: Record<AttendanceStatus, string> = {
                              HADIR: 'Hadir',
                              TERLAMBAT: 'Telat',
                              IZIN: 'Izin',
                              SAKIT: 'Sakit',
                              ALPA: 'Alpa'
                            };

                            return (
                              <button
                                key={statusOption}
                                disabled={isLocked}
                                onClick={() => handleStatusChange(st.id, statusOption)}
                                className={`px-2.5 py-1 rounded text-[11px] transition-all disabled:opacity-50 ${colors[statusOption]}`}
                              >
                                {shortNames[statusOption]}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          disabled={isLocked || (currentRec.status !== 'HADIR' && currentRec.status !== 'TERLAMBAT')}
                          value={currentRec.checkInTime}
                          onChange={(e) => {
                            setAttendanceData(prev => ({
                              ...prev,
                              [st.id]: {
                                ...prev[st.id],
                                checkInTime: e.target.value
                              }
                            }));
                          }}
                          className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono text-center text-xs focus:outline-emerald-600 disabled:opacity-50"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          disabled={isLocked}
                          placeholder="Catatan..."
                          value={currentRec.notes}
                          onChange={(e) => handleNoteChange(st.id, e.target.value)}
                          className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-emerald-600 placeholder:text-slate-400 disabled:opacity-50"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Reason Modal (Prompt section 14 requirement!) */}
      {showReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-2 text-slate-900">
              <Info className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm">Konfirmasi Perubahan Data Absensi</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Anda sedang memperbarui data absensi yang sebelumnya sudah pernah tersimpan. Sesuai aturan sistem presensi sekolah, setiap modifikasi harus mencantumkan alasan untuk dicatat pada <strong>Audit Log</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alasan Perubahan / Koreksi:
              </label>
              <textarea
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Contoh: Siswa menyusul surat sakit dari dokter, atau koreksi salah klik status..."
                rows={3}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-emerald-600"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowReasonModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Batal
              </button>
              <button
                onClick={() => executeSave(changeReason)}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-sm"
              >
                Simpan & Catat Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
