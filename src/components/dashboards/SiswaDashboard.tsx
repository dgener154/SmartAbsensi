import React from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FilePlus,
  BookOpen,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { UserAccount } from '../../types';
import { storage } from '../../services/storageService';

interface SiswaDashboardProps {
  currentUser: UserAccount;
  onNavigate: (menu: string, params?: any) => void;
}

export const SiswaDashboard: React.FC<SiswaDashboardProps> = ({ currentUser, onNavigate }) => {
  const studentId = currentUser.relatedStudentId || 'std-101'; // Muhammad Rizky Pratama
  const student = storage.getStudentById(studentId) || storage.getStudents()[0];
  const classroom = storage.getClassById(student.classId);
  const wali = classroom ? storage.getTeacherById(classroom.homeroomTeacherId) : null;

  const recap = storage.getStudentRecap(student.id);

  // Student's class schedule
  const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayDay = daysIndo[new Date().getDay()] as any;
  const todaySchedules = storage.getSchedules().filter(s => 
    s.classId === student.classId && (s.day === todayDay || s.day === 'Senin')
  );

  // Recent attendance records
  const recentAttendances = storage.getStudentAttendances()
    .filter(a => a.studentId === student.id)
    .slice(-7)
    .reverse();

  return (
    <div className="space-y-6">
      {/* Student Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-700/80 text-emerald-100 border border-emerald-600 mb-2">
            <span>Siswa Aktif</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Halo, {student.name}
          </h2>
          <p className="text-xs md:text-sm text-emerald-100 mt-1">
            Kelas {classroom?.name} · NIS: {student.nis} · NISN: {student.nisn} · Wali Kelas: {wali?.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('pengajuan_izin', { studentId: student.id })}
            className="px-4 py-2 bg-white text-emerald-900 hover:bg-emerald-50 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <FilePlus className="w-4 h-4 text-emerald-700" />
            Ajukan Izin / Sakit
          </button>
          <button
            onClick={() => onNavigate('qr_scanner')}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            Presensi QR
          </button>
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium">% Kehadiran</span>
          <div className="mt-1 text-2xl font-bold font-mono text-emerald-700">
            {recap.percentage}%
          </div>
          <div className="mt-1 text-[10px] font-semibold text-emerald-600">
            {recap.needsAttention ? '⚠️ Perlu Perhatian' : '🟢 Kehadiran Baik'}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-emerald-50/50 shadow-2xs">
          <span className="text-[11px] text-emerald-800 font-medium">Hadir</span>
          <div className="mt-1 text-2xl font-bold font-mono text-emerald-900">
            {recap.hadir}
          </div>
          <div className="mt-1 text-[10px] text-emerald-700">Tepat waktu</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-amber-50/50 shadow-2xs">
          <span className="text-[11px] text-amber-800 font-medium">Terlambat</span>
          <div className="mt-1 text-2xl font-bold font-mono text-amber-900">
            {recap.terlambat}
          </div>
          <div className="mt-1 text-[10px] text-amber-700">Tercatat telat</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-blue-50/50 shadow-2xs">
          <span className="text-[11px] text-blue-800 font-medium">Izin</span>
          <div className="mt-1 text-2xl font-bold font-mono text-blue-900">
            {recap.izin}
          </div>
          <div className="mt-1 text-[10px] text-blue-700">Ada dispensasi</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-purple-50/50 shadow-2xs">
          <span className="text-[11px] text-purple-800 font-medium">Sakit</span>
          <div className="mt-1 text-2xl font-bold font-mono text-purple-900">
            {recap.sakit}
          </div>
          <div className="mt-1 text-[10px] text-purple-700">Surat dokter</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-rose-50/50 shadow-2xs">
          <span className="text-[11px] text-rose-800 font-medium">Alpa</span>
          <div className="mt-1 text-2xl font-bold font-mono text-rose-900">
            {recap.alpa}
          </div>
          <div className="mt-1 text-[10px] text-rose-700">Tanpa keterangan</div>
        </div>
      </div>

      {/* Two columns: Today's Schedule & Attendance History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>Jadwal Pelajaran Hari Ini ({todayDay})</span>
            </h3>
            <button
              onClick={() => onNavigate('jadwal')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium"
            >
              Lihat Mingguan
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {todaySchedules.map(sch => {
              const sub = storage.getSubjectById(sch.subjectId);
              const tch = storage.getTeacherById(sch.teacherId);
              const rm = storage.getRooms().find(r => r.id === sch.roomId);
              return (
                <div key={sch.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-center text-xs font-mono font-bold text-emerald-800 bg-emerald-50 py-1 rounded">
                      {sch.startTime}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-900">{sub?.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Guru: {tch?.name} · {rm?.name}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {sch.startTime} - {sch.endTime}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span>Riwayat Kehadiran Terakhir</span>
            </h3>
            <button
              onClick={() => onNavigate('riwayat_absensi')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium"
            >
              Lihat Semua
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentAttendances.map(att => {
              const statusStyles: Record<string, string> = {
                HADIR: 'bg-emerald-100 text-emerald-800',
                TERLAMBAT: 'bg-amber-100 text-amber-800',
                IZIN: 'bg-blue-100 text-blue-800',
                SAKIT: 'bg-purple-100 text-purple-800',
                ALPA: 'bg-rose-100 text-rose-800',
              };

              return (
                <div key={att.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-slate-900">{att.date}</span>
                    <span className="text-slate-400 mx-1.5">·</span>
                    <span className="text-slate-500 font-mono">Jam: {att.checkInTime}</span>
                    {att.notes && (
                      <p className="text-[10px] text-slate-400 mt-0.5">{att.notes}</p>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusStyles[att.status] || 'bg-slate-100 text-slate-700'}`}>
                    {att.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
