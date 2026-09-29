import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  Filter,
  AlertTriangle,
  CheckCircle,
  Users,
  School
} from 'lucide-react';
import { Classroom, UserAccount } from '../../types';
import { storage } from '../../services/storageService';
import { KopSurat } from '../common/KopSurat';

interface RekapAbsensiPageProps {
  currentUser: UserAccount;
  initialParams?: {
    classId?: string;
  };
}

export const RekapAbsensiPage: React.FC<RekapAbsensiPageProps> = ({ currentUser, initialParams }) => {
  const schoolProfile = storage.getSchoolProfile();
  const classes = storage.getClasses();
  const activeAy = storage.getActiveAcademicYear()?.name || '2025/2026';
  const activeSem = storage.getActiveSemester()?.name || 'Ganjil';

  const [activeTab, setActiveTab] = useState<'SISWA' | 'KELAS'>('SISWA');
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialParams?.classId || (classes[0]?.id ?? 'cls-7a')
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(''); // e.g. "2026-09"

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const classRecap = selectedClass ? storage.getClassRecap(selectedClass.id, { month: selectedMonth }) : null;

  // Export CSV
  const handleExportCsv = () => {
    let csv = '';
    if (activeTab === 'SISWA' && classRecap) {
      csv = 'NIS,Nama Siswa,Kelas,Hadir,Terlambat,Izin,Sakit,Alpa,Total,Persentase,Status\n';
      classRecap.studentRecaps.forEach(item => {
        csv += `"${item.student.nis}","${item.student.name}","${selectedClass?.name}","${item.hadir}","${item.terlambat}","${item.izin}","${item.sakit}","${item.alpa}","${item.total}","${item.percentage}%","${item.needsAttention ? 'Perlu Perhatian' : 'Baik'}"\n`;
      });
    } else {
      csv = 'Kelas,Wali Kelas,Jumlah Siswa,Total Sesi,Hadir,Terlambat,Izin,Sakit,Alpa,Rata-rata Kehadiran\n';
      classes.forEach(c => {
        const rc = storage.getClassRecap(c.id, { month: selectedMonth });
        const wali = storage.getTeacherById(c.homeroomTeacherId);
        csv += `"${c.name}","${wali?.name || '-'}","${rc.studentCount}","${rc.totalSessions}","${rc.totalHadir}","${rc.totalTerlambat}","${rc.totalIzin}","${rc.totalSakit}","${rc.totalAlpa}","${rc.avgPercentage}%"\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap_presensi_${activeTab.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print only letterhead */}
      <div className="print-only">
        <KopSurat
          profile={schoolProfile}
          title={`REKAPITULASI PRESENSI ${activeTab === 'SISWA' ? `KELAS ${selectedClass?.name}` : 'SELURUH KELAS'}`}
          subTitle={`Tahun Pelajaran ${activeAy} (${activeSem}) · Periode: ${selectedMonth || 'Satu Semester'}`}
        />
      </div>

      {/* Header (no-print) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-700" />
              <span>Rekapitulasi Kehadiran Siswa & Kelas</span>
            </h2>
            <p className="text-xs text-slate-500">
              Analisis persentase kehadiran kumulatif dan identifikasi otomatis siswa yang membutuhkan perhatian khusus.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Rekap</span>
            </button>
          </div>
        </div>

        {/* Tab & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
            <button
              onClick={() => setActiveTab('SISWA')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'SISWA' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rekap Per Siswa (Kelas)
            </button>
            <button
              onClick={() => setActiveTab('KELAS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'KELAS' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rekap Antar Kelas
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {activeTab === 'SISWA' && (
              <div className="flex items-center gap-1.5">
                <label className="text-slate-600 font-semibold">Kelas:</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>Kelas {c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <label className="text-slate-600 font-semibold">Filter Bulan:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
              />
              {selectedMonth && (
                <button
                  onClick={() => setSelectedMonth('')}
                  className="text-slate-400 hover:text-slate-600 text-xs underline"
                >
                  Semua
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab 1: Student Recap */}
      {activeTab === 'SISWA' && classRecap && (
        <div className="space-y-4">
          {/* Class Summary Box */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Kelas {selectedClass?.name} ({storage.getTeacherById(selectedClass?.homeroomTeacherId || '')?.name})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total {classRecap.studentCount} Siswa · Rata-rata Kehadiran: <strong className="text-emerald-700">{classRecap.avgPercentage}%</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 font-semibold">
                H: {classRecap.totalHadir}
              </span>
              <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 font-semibold">
                T: {classRecap.totalTerlambat}
              </span>
              <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 font-semibold">
                I: {classRecap.totalIzin}
              </span>
              <span className="px-2.5 py-1 rounded bg-purple-50 text-purple-800 font-semibold">
                S: {classRecap.totalSakit}
              </span>
              <span className="px-2.5 py-1 rounded bg-rose-50 text-rose-800 font-semibold">
                A: {classRecap.totalAlpa}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3 w-10 text-center">No</th>
                    <th className="p-3">NIS</th>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3 text-center">L/P</th>
                    <th className="p-3 text-right">Hadir</th>
                    <th className="p-3 text-right">Terlambat</th>
                    <th className="p-3 text-right">Izin</th>
                    <th className="p-3 text-right">Sakit</th>
                    <th className="p-3 text-right">Alpa</th>
                    <th className="p-3 text-right">Total Sesi</th>
                    <th className="p-3 text-right font-bold">% Kehadiran</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classRecap.studentRecaps.map((item, idx) => (
                    <tr key={item.student.id} className="hover:bg-slate-50">
                      <td className="p-3 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-mono text-slate-600">{item.student.nis}</td>
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{item.student.name}</td>
                      <td className="p-3 text-center font-semibold">{item.student.gender}</td>
                      <td className="p-3 text-right font-mono text-emerald-700 font-medium">{item.hadir}</td>
                      <td className="p-3 text-right font-mono text-amber-700 font-medium">{item.terlambat}</td>
                      <td className="p-3 text-right font-mono text-blue-700 font-medium">{item.izin}</td>
                      <td className="p-3 text-right font-mono text-purple-700 font-medium">{item.sakit}</td>
                      <td className="p-3 text-right font-mono text-rose-700 font-medium">{item.alpa}</td>
                      <td className="p-3 text-right font-mono text-slate-600">{item.total}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900 text-sm">
                        {item.percentage}%
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        {item.needsAttention ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                            Perlu Perhatian
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Baik
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Class-by-Class Comparison Recap */}
      {activeTab === 'KELAS' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Perbandingan Kehadiran Antar Kelas (Rombel)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-100 font-semibold text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">Nama Kelas</th>
                  <th className="p-3">Wali Kelas</th>
                  <th className="p-3 text-center">Jumlah Siswa</th>
                  <th className="p-3 text-right">Total Pertemuan</th>
                  <th className="p-3 text-right">Hadir</th>
                  <th className="p-3 text-right">Terlambat</th>
                  <th className="p-3 text-right">Izin</th>
                  <th className="p-3 text-right">Sakit</th>
                  <th className="p-3 text-right">Alpa</th>
                  <th className="p-3 text-right font-bold">% Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classes.map(c => {
                  const rc = storage.getClassRecap(c.id, { month: selectedMonth });
                  const wali = storage.getTeacherById(c.homeroomTeacherId);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">Kelas {c.name}</td>
                      <td className="p-3">{wali?.name || '-'}</td>
                      <td className="p-3 text-center font-mono">{rc.studentCount}</td>
                      <td className="p-3 text-right font-mono">{rc.totalSessions}</td>
                      <td className="p-3 text-right font-mono text-emerald-700 font-medium">{rc.totalHadir}</td>
                      <td className="p-3 text-right font-mono text-amber-700 font-medium">{rc.totalTerlambat}</td>
                      <td className="p-3 text-right font-mono text-blue-700 font-medium">{rc.totalIzin}</td>
                      <td className="p-3 text-right font-mono text-purple-700 font-medium">{rc.totalSakit}</td>
                      <td className="p-3 text-right font-mono text-rose-700 font-medium">{rc.totalAlpa}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900 text-sm">
                        {rc.avgPercentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
