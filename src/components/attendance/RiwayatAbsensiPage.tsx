import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { StudentAttendance, AttendanceStatus, UserAccount } from '../../types';
import { storage } from '../../services/storageService';
import { KopSurat } from '../common/KopSurat';

interface RiwayatAbsensiPageProps {
  currentUser: UserAccount;
  initialParams?: {
    studentId?: string;
  };
}

export const RiwayatAbsensiPage: React.FC<RiwayatAbsensiPageProps> = ({ currentUser, initialParams }) => {
  const schoolProfile = storage.getSchoolProfile();
  const classes = storage.getClasses();
  const subjects = storage.getSubjects();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  const allAttendances = storage.getStudentAttendances();

  // Filter logic
  const filtered = allAttendances.filter(item => {
    // If student logged in, restrict to own records
    if (currentUser.role === 'SISWA' && currentUser.relatedStudentId) {
      if (item.studentId !== currentUser.relatedStudentId) return false;
    }

    // If initial studentId passed (e.g. from parent dashboard)
    if (initialParams?.studentId) {
      if (item.studentId !== initialParams.studentId) return false;
    }

    if (filterClass !== 'ALL' && item.classId !== filterClass) return false;
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
    if (startDate && item.date < startDate) return false;
    if (endDate && item.date > endDate) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const student = storage.getStudentById(item.studentId);
      const studentName = student?.name.toLowerCase() || '';
      const nis = student?.nis || '';
      const notes = (item.notes || '').toLowerCase();
      if (!studentName.includes(q) && !nis.includes(q) && !notes.includes(q)) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCsv = () => {
    let csv = 'Tanggal,NIS,Nama Siswa,Kelas,Mata Pelajaran,Jam Hadir,Status,Catatan\n';
    filtered.forEach(item => {
      const student = storage.getStudentById(item.studentId);
      const cls = storage.getClassById(item.classId);
      const sub = storage.getSubjectById(item.subjectId || '');
      csv += `"${item.date}","${student?.nis || '-'}","${student?.name || '-'}","${cls?.name || '-'}","${sub?.name || '-'}","${item.checkInTime}","${item.status}","${item.notes || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `riwayat_absensi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print only official letterhead */}
      <div className="print-only">
        <KopSurat
          profile={schoolProfile}
          title="RIWAYAT DAN BUKTI PRESENSI SISWA"
          subTitle={`Tahun Pelajaran: ${storage.getActiveAcademicYear()?.name || '2025/2026'} · Dicetak: ${new Date().toLocaleDateString('id-ID')}`}
        />
      </div>

      {/* Header controls (no-print) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-700" />
              <span>Riwayat Presensi Siswa</span>
            </h2>
            <p className="text-xs text-slate-500">
              Telusuri arsip data presensi harian siswa lengkap dengan filter multi-parameter dan ekspor CSV.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Dokumen</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Cari Nama / NIS</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Ketik nama atau NIS..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Kelas</label>
            <select
              value={filterClass}
              onChange={(e) => { setFilterClass(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-emerald-600"
            >
              <option value="ALL">Semua Kelas</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>Kelas {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Status Kehadiran</label>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-emerald-600"
            >
              <option value="ALL">Semua Status</option>
              <option value="HADIR">🟢 Hadir</option>
              <option value="TERLAMBAT">🟡 Terlambat</option>
              <option value="IZIN">🔵 Izin</option>
              <option value="SAKIT">🟣 Sakit</option>
              <option value="ALPA">🔴 Alpa</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">NIS</th>
                <th className="p-3">Nama Siswa</th>
                <th className="p-3">Kelas</th>
                <th className="p-3">Mata Pelajaran</th>
                <th className="p-3">Jam Hadir</th>
                <th className="p-3">Status</th>
                <th className="p-3">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Tidak ditemukan data riwayat absensi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                paginated.map(item => {
                  const student = storage.getStudentById(item.studentId);
                  const cls = storage.getClassById(item.classId);
                  const sub = storage.getSubjectById(item.subjectId || '');

                  const statusStyles: Record<string, string> = {
                    HADIR: 'bg-emerald-100 text-emerald-800',
                    TERLAMBAT: 'bg-amber-100 text-amber-800',
                    IZIN: 'bg-blue-100 text-blue-800',
                    SAKIT: 'bg-purple-100 text-purple-800',
                    ALPA: 'bg-rose-100 text-rose-800',
                  };

                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-900 whitespace-nowrap">{item.date}</td>
                      <td className="p-3 font-mono text-slate-500">{student?.nis || '-'}</td>
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{student?.name || '-'}</td>
                      <td className="p-3">{cls?.name || '-'}</td>
                      <td className="p-3 whitespace-nowrap">{sub?.name || 'Reguler'}</td>
                      <td className="p-3 font-mono">{item.checkInTime}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusStyles[item.status] || 'bg-slate-100'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 max-w-xs truncate">{item.notes || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar (no-print) */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 no-print">
          <div>
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} dari total {filtered.length} catatan
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono">
              Hal. {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
