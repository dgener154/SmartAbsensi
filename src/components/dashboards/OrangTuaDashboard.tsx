import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Calendar,
  CheckCircle2,
  FilePlus,
  TrendingUp,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { UserAccount, Student } from '../../types';
import { storage } from '../../services/storageService';

interface OrangTuaDashboardProps {
  currentUser: UserAccount;
  onNavigate: (menu: string, params?: any) => void;
}

export const OrangTuaDashboard: React.FC<OrangTuaDashboardProps> = ({ currentUser, onNavigate }) => {
  const parentId = currentUser.relatedParentId || 'prt-1';
  const parent = storage.getParentById(parentId) || storage.getParents()[0];

  // Get children associated with this parent
  const myChildren: Student[] = parent.studentIds
    .map(id => storage.getStudentById(id))
    .filter((s): s is Student => s !== undefined);

  const [selectedChildId, setSelectedChildId] = useState<string>(
    myChildren.length > 0 ? myChildren[0].id : 'std-101'
  );

  const currentChild = myChildren.find(c => c.id === selectedChildId) || myChildren[0];
  const classroom = currentChild ? storage.getClassById(currentChild.classId) : null;
  const wali = classroom ? storage.getTeacherById(classroom.homeroomTeacherId) : null;

  const recap = currentChild ? storage.getStudentRecap(currentChild.id) : null;

  // Recent attendance of selected child
  const attendances = currentChild
    ? storage.getStudentAttendances().filter(a => a.studentId === currentChild.id).slice(-8).reverse()
    : [];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-700/80 text-emerald-100 border border-emerald-600 mb-2">
            <span>Portal Orang Tua / Wali Murid</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Selamat Datang, {parent.fatherName || parent.motherName}
          </h2>
          <p className="text-xs md:text-sm text-emerald-100 mt-1">
            Pantau kehadiran, jadwal, dan ajukan permohonan izin/sakit untuk putra/putri Anda secara transparan.
          </p>
        </div>

        {currentChild && (
          <button
            onClick={() => onNavigate('pengajuan_izin', { studentId: currentChild.id })}
            className="px-4 py-2 bg-white text-emerald-900 hover:bg-emerald-50 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 self-start md:self-auto shrink-0"
          >
            <FilePlus className="w-4 h-4 text-emerald-700" />
            Ajukan Izin untuk {currentChild.name.split(' ')[0]}
          </button>
        )}
      </div>

      {/* Child Switcher (If parent has > 1 child) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Pilih Putra / Putri Anda ({myChildren.length} Terdaftar):
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {myChildren.map(child => {
            const cls = storage.getClassById(child.classId);
            const isSelected = child.id === selectedChildId;
            return (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-xs text-left transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-2xs ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {child.gender === 'L' ? '👦' : '👧'}
                </div>
                <div>
                  <div className="font-semibold text-sm">{child.name}</div>
                  <div className="text-[11px] text-slate-500">
                    Kelas {cls?.name} · NIS: {child.nis}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Child Overview */}
      {currentChild && recap && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Tingkat Hadir</span>
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
              <div className="mt-1 text-[10px] text-amber-700">Masuk telat</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-blue-50/50 shadow-2xs">
              <span className="text-[11px] text-blue-800 font-medium">Izin</span>
              <div className="mt-1 text-2xl font-bold font-mono text-blue-900">
                {recap.izin}
              </div>
              <div className="mt-1 text-[10px] text-blue-700">Surat izin</div>
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
              <div className="mt-1 text-[10px] text-rose-700">Tanpa kabar</div>
            </div>
          </div>

          {/* Child's Attendance Log */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                  <span>Riwayat Presensi Terbaru: {currentChild.name}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Wali Kelas: {wali?.name} ({wali?.phone || '-'})
                </p>
              </div>
              <button
                onClick={() => onNavigate('riwayat_absensi', { studentId: currentChild.id })}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium"
              >
                Lihat Semua Riwayat
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Waktu Masuk</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendances.map(att => {
                    const statusBadge: Record<string, string> = {
                      HADIR: 'bg-emerald-100 text-emerald-800',
                      TERLAMBAT: 'bg-amber-100 text-amber-800',
                      IZIN: 'bg-blue-100 text-blue-800',
                      SAKIT: 'bg-purple-100 text-purple-800',
                      ALPA: 'bg-rose-100 text-rose-800',
                    };
                    return (
                      <tr key={att.id} className="hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-900">{att.date}</td>
                        <td className="p-3 font-mono">{att.checkInTime}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusBadge[att.status] || 'bg-slate-100 text-slate-700'}`}>
                            {att.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{att.notes || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
