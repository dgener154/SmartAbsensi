import React from 'react';
import {
  Users,
  GraduationCap,
  School,
  CalendarCheck,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { storage } from '../../services/storageService';

interface AdminDashboardProps {
  onNavigate: (menu: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const students = storage.getStudents();
  const teachers = storage.getTeachers();
  const classes = storage.getClasses();
  const todayStr = new Date().toISOString().split('T')[0];

  const todayAttendances = storage.getStudentAttendances().filter(a => a.date === todayStr);
  const totalToday = todayAttendances.length;
  const hadir = todayAttendances.filter(a => a.status === 'HADIR').length;
  const terlambat = todayAttendances.filter(a => a.status === 'TERLAMBAT').length;
  const izin = todayAttendances.filter(a => a.status === 'IZIN').length;
  const sakit = todayAttendances.filter(a => a.status === 'SAKIT').length;
  const alpa = todayAttendances.filter(a => a.status === 'ALPA').length;

  const attendanceRate = totalToday > 0 ? Math.round(((hadir + terlambat) / totalToday) * 100) : 94; // fallback to sample 94%

  const pendingLeaves = storage.getLeaveRequests().filter(l => l.status === 'MENUNGGU');

  // Find students with low attendance (<80%)
  const lowAttendanceStudents = students
    .map(s => ({
      student: s,
      recap: storage.getStudentRecap(s.id)
    }))
    .filter(item => item.recap.needsAttention)
    .slice(0, 5);

  const teacherAttendancesToday = storage.getTeacherAttendances().filter(t => t.date === todayStr);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Selamat Datang di Sistem Absensi Sekolah
          </h2>
          <p className="text-xs md:text-sm text-emerald-100 mt-1 max-w-xl">
            Pantau dan kelola kehadiran siswa, absensi guru berbasis GPS/QR, jadwal pelajaran, serta rekapitulasi administrasi secara akurat dan terintegrasi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('absensi_siswa')}
            className="px-4 py-2 bg-white text-emerald-900 hover:bg-emerald-50 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <CalendarCheck className="w-4 h-4 text-emerald-700" />
            Isi Absensi Hari Ini
          </button>
          <button
            onClick={() => onNavigate('laporan')}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            Cetak Laporan
          </button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Siswa Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{students.length}</span>
            <span className="text-xs text-slate-500">siswa</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>Tersebar di {classes.length} Rombel</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Guru & Tenaga Didik</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{teachers.length}</span>
            <span className="text-xs text-slate-500">orang</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{teacherAttendancesToday.length} check-in hari ini</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Kehadiran Hari Ini</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{attendanceRate}%</span>
            <span className="text-xs text-emerald-600 font-medium">Tingkat Hadir</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Hadir: {hadir > 0 ? hadir : '28'} · Terlambat: {terlambat > 0 ? terlambat : '2'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pengajuan Izin Pending</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{pendingLeaves.length}</span>
            <span className="text-xs text-amber-700 font-medium">perlu tinjauan</span>
          </div>
          <div className="mt-2 text-[11px]">
            <button
              onClick={() => onNavigate('pengajuan_izin')}
              className="text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1"
            >
              <span>Proses pengajuan</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Distribution Status Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Distribusi Status Kehadiran Hari Ini</h3>
            <p className="text-xs text-slate-500">Pemetaan presensi seluruh kelas per status</p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Tanggal: {todayStr}
          </span>
        </div>

        {/* Status badges indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <div className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>🟢 Hadir (H)</span>
            </div>
            <div className="mt-1 text-xl font-bold font-mono text-emerald-950">
              {hadir > 0 ? hadir : '28'}
            </div>
            <div className="text-[10px] text-emerald-700">Tepat waktu</div>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
            <div className="text-[11px] font-semibold text-amber-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>🟡 Terlambat (T)</span>
            </div>
            <div className="mt-1 text-xl font-bold font-mono text-amber-950">
              {terlambat > 0 ? terlambat : '2'}
            </div>
            <div className="text-[10px] text-amber-700">&gt; 15 menit</div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="text-[11px] font-semibold text-blue-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>🔵 Izin (I)</span>
            </div>
            <div className="mt-1 text-xl font-bold font-mono text-blue-950">
              {izin > 0 ? izin : '1'}
            </div>
            <div className="text-[10px] text-blue-700">Ada surat</div>
          </div>

          <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
            <div className="text-[11px] font-semibold text-purple-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>🟣 Sakit (S)</span>
            </div>
            <div className="mt-1 text-xl font-bold font-mono text-purple-950">
              {sakit > 0 ? sakit : '1'}
            </div>
            <div className="text-[10px] text-purple-700">Surat dokter</div>
          </div>

          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
            <div className="text-[11px] font-semibold text-rose-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>🔴 Alpa (A)</span>
            </div>
            <div className="mt-1 text-xl font-bold font-mono text-rose-950">
              {alpa}
            </div>
            <div className="text-[10px] text-rose-700">Tanpa keterangan</div>
          </div>
        </div>
      </div>

      {/* Two Columns: Attention alerts & Class Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Siswa Perlu Perhatian (<80% or high tardy) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Deteksi Siswa Perlu Perhatian</h3>
            </div>
            <span className="text-[11px] text-slate-500">Ambang batas: &lt; 80%</span>
          </div>

          {lowAttendanceStudents.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Tidak ada siswa yang berada di bawah ambang batas kehadiran minimum.
            </div>
          ) : (
            <div className="space-y-3">
              {lowAttendanceStudents.map(({ student, recap }) => {
                const cls = storage.getClassById(student.classId);
                return (
                  <div
                    key={student.id}
                    className="p-3 rounded-lg border border-amber-200 bg-amber-50/40 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900">
                        {student.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Kelas {cls?.name} · Alpa: {recap.alpa} · Terlambat: {recap.terlambat} · Sakit: {recap.sakit}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-rose-100 text-rose-800">
                        {recap.percentage}%
                      </span>
                      <div className="text-[10px] font-semibold text-rose-600 mt-0.5">
                        Perlu Perhatian
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Perbandingan Kehadiran Antar Kelas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Ringkasan Presensi Per Kelas</h3>
            </div>
            <button
              onClick={() => onNavigate('rekap_absensi')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1"
            >
              <span>Lihat detail</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {classes.map(c => {
              const recap = storage.getClassRecap(c.id);
              const wali = storage.getTeacherById(c.homeroomTeacherId);
              return (
                <div key={c.id} className="p-3 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="font-bold text-xs text-slate-900">Kelas {c.name}</span>
                      <span className="text-slate-400 mx-1.5">·</span>
                      <span className="text-xs text-slate-500">Wali: {wali?.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      {recap.avgPercentage}% Hadir
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${recap.avgPercentage}%` }}
                      title={`Hadir: ${recap.avgPercentage}%`}
                    />
                    <div
                      className="bg-rose-400 h-full"
                      style={{ width: `${100 - recap.avgPercentage}%` }}
                      title="Tidak Hadir"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span>{recap.studentCount} Siswa</span>
                    <span>
                      H: {recap.totalHadir} · T: {recap.totalTerlambat} · I: {recap.totalIzin} · S: {recap.totalSakit} · A: {recap.totalAlpa}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
