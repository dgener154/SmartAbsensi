import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  CalendarCheck,
  BookOpen,
  MapPin,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { UserAccount, Teacher } from '../../types';
import { storage } from '../../services/storageService';

interface GuruDashboardProps {
  currentUser: UserAccount;
  onNavigate: (menu: string, params?: any) => void;
}

export const GuruDashboard: React.FC<GuruDashboardProps> = ({ currentUser, onNavigate }) => {
  const teacherId = currentUser.relatedTeacherId || 'tch-3'; // fallback Siti Rahmawati
  const teacher = storage.getTeacherById(teacherId);

  const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayDay = daysIndo[new Date().getDay()] as any;
  const todayStr = new Date().toISOString().split('T')[0];

  // Teacher's schedule today
  const todaySchedules = storage.getSchedules().filter(s => 
    s.teacherId === teacherId && (s.day === todayDay || s.day === 'Senin') // fallback to Senin for demo richness
  );

  // Check teacher's own attendance today
  const myAttendanceToday = storage.getTeacherAttendances().find(a => 
    a.teacherId === teacherId && a.date === todayStr
  );

  // Teacher's assignments
  const assignments = storage.getTeacherAssignments().filter(a => a.teacherId === teacherId);

  return (
    <div className="space-y-6">
      {/* Teacher Profile Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-700/80 text-emerald-100 border border-emerald-600 mb-2">
            <span>Peran: Guru Mata Pelajaran</span>
            {teacher?.isHomeroomTeacher && <span>· Wali Kelas</span>}
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Selamat Datang, {teacher?.frontTitle} {teacher?.name} {teacher?.backTitle}
          </h2>
          <p className="text-xs md:text-sm text-emerald-100 mt-1">
            NIP: {teacher?.nip || '-'} · Mengajar: {teacher?.subjectTaught}
          </p>
        </div>

        {/* Quick Teacher Check-in Status */}
        <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/20 text-xs">
          <div className="text-emerald-200 text-[11px] font-medium">Presensi Kehadiran Guru Hari Ini:</div>
          {myAttendanceToday ? (
            <div className="mt-1 flex items-center gap-2 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              <span>Sudah Check-In ({myAttendanceToday.checkInTime} WIB via {myAttendanceToday.method})</span>
            </div>
          ) : (
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="text-amber-300 font-medium">Belum Melakukan Presensi</span>
              <button
                onClick={() => onNavigate('absensi_guru')}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-[11px] transition-colors"
              >
                Presensi Sekarang
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Today's Teaching Schedule & Quick Attendance */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>Jadwal Mengajar Hari Ini ({todayDay})</span>
            </h3>
            <p className="text-xs text-slate-500">Klik "Isi Absensi" untuk langsung mendata kehadiran siswa</p>
          </div>
          <span className="text-xs font-mono font-medium text-slate-500">
            {todaySchedules.length} Sesi Terjadwal
          </span>
        </div>

        {todaySchedules.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Tidak ada jadwal mengajar pada hari ini.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todaySchedules.map(sch => {
              const cls = storage.getClassById(sch.classId);
              const sub = storage.getSubjectById(sch.subjectId);
              const room = storage.getRooms().find(r => r.id === sch.roomId);
              const session = storage.getSessions().find(s => s.id === sch.sessionId);

              // Check if attendance already recorded for this session today
              const existingRecords = storage.getAttendanceByFilter(todayStr, sch.classId, sch.sessionId, sch.subjectId);
              const isRecorded = existingRecords.length > 0;

              return (
                <div key={sch.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex flex-col items-center justify-center font-bold text-xs shrink-0">
                      <span>{sch.startTime}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{sub?.name}</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          Kelas {cls?.name}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {sch.startTime} - {sch.endTime} ({session?.name})
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {room?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isRecorded ? (
                      <div className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Absensi Selesai ({existingRecords.length} siswa)</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Belum Diabsen</span>
                      </div>
                    )}

                    <button
                      onClick={() => onNavigate('absensi_siswa', {
                        classId: sch.classId,
                        subjectId: sch.subjectId,
                        sessionId: sch.sessionId,
                        date: todayStr
                      })}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      <span>{isRecorded ? 'Koreksi Absensi' : 'Isi Absensi'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Teacher Assigned Classes & Subjects */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-700" />
          <span>Daftar Kelas & Mata Pelajaran yang Diampu</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {assignments.map(asg => {
            const cls = storage.getClassById(asg.classId);
            const sub = storage.getSubjectById(asg.subjectId);
            const studentsInClass = storage.getStudentsByClass(asg.classId);
            return (
              <div key={asg.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Kelas {cls?.name}</span>
                  <span className="text-[11px] font-mono text-emerald-700 font-semibold">{studentsInClass.length} Siswa</span>
                </div>
                <div className="text-xs text-slate-600 mt-1 font-medium">
                  {sub?.name}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Kode: {sub?.code}</span>
                  <button
                    onClick={() => onNavigate('absensi_siswa', { classId: asg.classId, subjectId: asg.subjectId })}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
                  >
                    Presensi <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
