import React from 'react';
import {
  School,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  ArrowRight,
  Phone,
  BarChart2
} from 'lucide-react';
import { UserAccount } from '../../types';
import { storage } from '../../services/storageService';

interface WaliKelasDashboardProps {
  currentUser: UserAccount;
  onNavigate: (menu: string, params?: any) => void;
  onRefresh: () => void;
}

export const WaliKelasDashboard: React.FC<WaliKelasDashboardProps> = ({
  currentUser,
  onNavigate,
  onRefresh
}) => {
  const teacherId = currentUser.relatedTeacherId || 'tch-2'; // Budi Santoso (Wali VII-A)
  const teacher = storage.getTeacherById(teacherId);
  const myClass = storage.getClasses().find(c => c.homeroomTeacherId === teacherId) || storage.getClasses()[0];

  const students = storage.getStudentsByClass(myClass.id);
  const recap = storage.getClassRecap(myClass.id);

  // Pending leaves for this class
  const studentIds = students.map(s => s.id);
  const pendingLeaves = storage.getLeaveRequests().filter(l => 
    studentIds.includes(l.studentId) && l.status === 'MENUNGGU'
  );

  // Attention students (<80%)
  const attentionStudents = recap.studentRecaps.filter(s => s.needsAttention);

  const handleApproveLeave = (leaveId: string) => {
    storage.processLeaveRequest(leaveId, 'DISETUJUI', 'Disetujui oleh Wali Kelas', teacherId);
    onRefresh();
  };

  const handleRejectLeave = (leaveId: string) => {
    const reason = prompt('Masukkan alasan penolakan pengajuan izin:');
    if (reason !== null) {
      storage.processLeaveRequest(leaveId, 'DITOLAK', reason || 'Ditolak oleh Wali Kelas', teacherId);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-700/80 text-emerald-100 border border-emerald-600 mb-2">
            <span>Wali Kelas Binaan</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Dashboard Wali Kelas {myClass.name}
          </h2>
          <p className="text-xs md:text-sm text-emerald-100 mt-1">
            Wali Kelas: {teacher?.frontTitle} {teacher?.name} {teacher?.backTitle} · {students.length} Siswa Terdaftar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('absensi_siswa', { classId: myClass.id })}
            className="px-4 py-2 bg-white text-emerald-900 hover:bg-emerald-50 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            Presensi Kelas {myClass.name}
          </button>
          <button
            onClick={() => onNavigate('rekap_absensi', { classId: myClass.id })}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <BarChart2 className="w-4 h-4" />
            Rekap Kehadiran
          </button>
        </div>
      </div>

      {/* Class Attendance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Tingkat Kehadiran Kelas</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700">{recap.avgPercentage}%</span>
            <span className="text-xs text-slate-400">rata-rata</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Total {recap.totalSessions} pertemuan presensi
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Siswa Terdaftar</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{students.length}</span>
            <span className="text-xs text-slate-400">siswa</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {students.filter(s => s.gender === 'L').length} Laki-laki · {students.filter(s => s.gender === 'P').length} Perempuan
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Izin & Sakit Tertunda</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-700">{pendingLeaves.length}</span>
            <span className="text-xs text-amber-600 font-medium">surat masuk</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Perlu persetujuan wali kelas
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Siswa Perlu Perhatian</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-700">{attentionStudents.length}</span>
            <span className="text-xs text-rose-600 font-medium">peringatan</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-700">
            Kehadiran di bawah 80% / alpa tinggi
          </div>
        </div>
      </div>

      {/* Two columns: Pending Leaves to process & Attention Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Leave Requests */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Persetujuan Izin & Sakit Siswa ({pendingLeaves.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('pengajuan_izin')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1"
            >
              Semua Izin <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {pendingLeaves.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              Tidak ada pengajuan izin/sakit yang menunggu persetujuan.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingLeaves.map(leave => {
                const student = storage.getStudentById(leave.studentId);
                return (
                  <div key={leave.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-xs text-slate-900">{student?.name}</span>
                        <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                          {leave.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {leave.startDate} s.d {leave.endDate}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 mt-2 font-medium">
                      Alasan: {leave.reason}
                    </p>
                    {leave.notes && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Keterangan: {leave.notes}
                      </p>
                    )}
                    {leave.attachmentName && (
                      <div className="text-[10px] text-emerald-700 mt-1">
                        📎 Lampiran: {leave.attachmentName}
                      </div>
                    )}

                    <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRejectLeave(leave.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Tolak
                      </button>
                      <button
                        onClick={() => handleApproveLeave(leave.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded shadow-2xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Setujui
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Attention Students in this class */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Siswa Perlu Pembinaan Khusus</h3>
            </div>
            <span className="text-xs text-slate-400">Batas: &lt; 80%</span>
          </div>

          {attentionStudents.length === 0 ? (
            <div className="text-center py-10 text-xs text-emerald-700 bg-emerald-50 rounded-lg p-4">
              Semua siswa di Kelas {myClass.name} memiliki tingkat kehadiran di atas batas minimum 80%.
            </div>
          ) : (
            <div className="space-y-3">
              {attentionStudents.map(({ student, percentage, hadir, terlambat, izin, sakit, alpa }) => (
                <div key={student.id} className="p-3 rounded-lg border border-rose-200 bg-rose-50/30 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-slate-900">{student.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      NIS: {student.nis} · Alpa: {alpa} · Sakit: {sakit} · Telat: {terlambat}
                    </div>
                    {student.phone && (
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>Kontak Orang Tua: {student.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-rose-100 text-rose-800">
                      {percentage}%
                    </span>
                    <div className="text-[10px] font-semibold text-rose-600 mt-0.5">
                      Perlu Perhatian
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
