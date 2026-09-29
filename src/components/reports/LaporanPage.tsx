import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Filter,
  Users,
  School,
  CheckCircle,
  FileText
} from 'lucide-react';
import { UserAccount } from '../../types';
import { storage } from '../../services/storageService';
import { KopSurat } from '../common/KopSurat';

interface LaporanPageProps {
  currentUser: UserAccount;
}

export const LaporanPage: React.FC<LaporanPageProps> = ({ currentUser }) => {
  const schoolProfile = storage.getSchoolProfile();
  const classes = storage.getClasses();
  const teachers = storage.getTeachers();
  const students = storage.getStudents();
  const activeAy = storage.getActiveAcademicYear()?.name || '2025/2026';
  const activeSem = storage.getActiveSemester()?.name || 'Ganjil';
  const todayStr = new Date().toISOString().split('T')[0];

  const [reportType, setReportType] = useState<
    'HARIAN' | 'MINGGUAN' | 'BULANAN' | 'SEMESTER' | 'PER_SISWA' | 'PER_KELAS' | 'PER_GURU' | 'ABSENSI_GURU'
  >('HARIAN');

  const [filterClassId, setFilterClassId] = useState(classes[0]?.id || 'cls-7a');
  const [filterStudentId, setFilterStudentId] = useState(students[0]?.id || 'std-101');
  const [filterTeacherId, setFilterTeacherId] = useState(teachers[0]?.id || 'tch-2');
  const [filterDate, setFilterDate] = useState(todayStr);
  const [filterMonth, setFilterMonth] = useState('2026-09');

  const allStudentAtt = storage.getStudentAttendances();
  const allTeacherAtt = storage.getTeacherAttendances();

  const getReportTitle = () => {
    switch (reportType) {
      case 'HARIAN':
        return `LAPORAN PRESENSI HARIAN SISWA (TANGGAL: ${filterDate})`;
      case 'MINGGUAN':
        return `LAPORAN PRESENSI MINGGUAN KELAS ${storage.getClassById(filterClassId)?.name}`;
      case 'BULANAN':
        return `LAPORAN PRESENSI BULANAN (BULAN: ${filterMonth})`;
      case 'SEMESTER':
        return `LAPORAN REKAPITULASI PRESENSI SEMESTER ${activeSem.toUpperCase()}`;
      case 'PER_SISWA':
        return `LAPORAN BUKTI KEHADIRAN INDIVIDUAL SISWA: ${storage.getStudentById(filterStudentId)?.name}`;
      case 'PER_KELAS':
        return `LAPORAN PRESENSI RESMI KELAS ${storage.getClassById(filterClassId)?.name}`;
      case 'PER_GURU':
        return `LAPORAN JADWAL & BEBAN MENGAJAR GURU: ${storage.getTeacherById(filterTeacherId)?.name}`;
      case 'ABSENSI_GURU':
        return `LAPORAN REKAPITULASI PRESENSI GURU & PEGAWAI`;
      default:
        return 'LAPORAN PRESENSI SEKOLAH';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    let csv = '';
    const title = getReportTitle().replace(/,/g, '');
    csv += `"${title}"\n\n`;

    if (reportType === 'HARIAN' || reportType === 'MINGGUAN') {
      csv += 'Tanggal,NIS,Nama Siswa,Kelas,Jam Masuk,Status,Catatan\n';
      const items = allStudentAtt.filter(a => reportType === 'HARIAN' ? a.date === filterDate : a.classId === filterClassId);
      items.forEach(a => {
        const st = storage.getStudentById(a.studentId);
        const cl = storage.getClassById(a.classId);
        csv += `"${a.date}","${st?.nis || '-'}","${st?.name || '-'}","${cl?.name || '-'}","${a.checkInTime}","${a.status}","${a.notes || ''}"\n`;
      });
    } else if (reportType === 'ABSENSI_GURU') {
      csv += 'Tanggal,Nama Guru,NIP,Jam Masuk,Jam Pulang,Status,Metode,Catatan\n';
      allTeacherAtt.forEach(a => {
        const tc = storage.getTeacherById(a.teacherId);
        csv += `"${a.date}","${tc?.name || '-'}","${tc?.nip || '-'}","${a.checkInTime}","${a.checkOutTime || '-'}","${a.status}","${a.method}","${a.notes || ''}"\n`;
      });
    } else {
      csv += 'NIS,Nama Siswa,Kelas,Hadir,Terlambat,Izin,Sakit,Alpa,Persentase Kehadiran\n';
      const rc = storage.getClassRecap(filterClassId);
      rc.studentRecaps.forEach(item => {
        csv += `"${item.student.nis}","${item.student.name}","${classes.find(c => c.id === filterClassId)?.name}","${item.hadir}","${item.terlambat}","${item.izin}","${item.sakit}","${item.alpa}","${item.percentage}%"\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `laporan_presensi_${reportType.toLowerCase()}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Control bar (no-print) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
              <span>Pusat Laporan & Berkas Administrasi Presensi</span>
            </h2>
            <p className="text-xs text-slate-500">
              Cetak berkas laporan resmi berserta KOP surat sekolah, tanda tangan Kepala Sekolah, dan ekspor CSV.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Cetak PDF</span>
            </button>
          </div>
        </div>

        {/* Report Type Selector */}
        <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
          {[
            { id: 'HARIAN', label: '1. Presensi Harian' },
            { id: 'MINGGUAN', label: '2. Presensi Mingguan' },
            { id: 'BULANAN', label: '3. Presensi Bulanan' },
            { id: 'SEMESTER', label: '4. Presensi Semester' },
            { id: 'PER_SISWA', label: '5. Presensi Per Siswa' },
            { id: 'PER_KELAS', label: '6. Presensi Per Kelas' },
            { id: 'PER_GURU', label: '7. Jadwal Guru' },
            { id: 'ABSENSI_GURU', label: '8. Presensi Guru' },
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setReportType(r.id as any)}
              className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                reportType === r.id
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Dynamic Filters depending on Report Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-slate-100">
          {(reportType === 'HARIAN') && (
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Tanggal Presensi</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
              />
            </div>
          )}

          {(reportType === 'BULANAN') && (
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Pilih Bulan</label>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
              />
            </div>
          )}

          {(['MINGGUAN', 'PER_KELAS', 'SEMESTER'].includes(reportType)) && (
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Pilih Kelas</label>
              <select
                value={filterClassId}
                onChange={(e) => setFilterClassId(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>Kelas {c.name}</option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'PER_SISWA' && (
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Pilih Siswa</label>
              <select
                value={filterStudentId}
                onChange={(e) => setFilterStudentId(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
              >
                {students.map(s => {
                  const cl = storage.getClassById(s.classId);
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} (Kelas {cl?.name})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {reportType === 'PER_GURU' && (
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Pilih Guru</label>
              <select
                value={filterTeacherId}
                onChange={(e) => setFilterTeacherId(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* REPORT SHEET CONTAINER (PREVIEW & PRINT) */}
      <div className="bg-white p-8 md:p-12 rounded-xl border border-slate-200 shadow-md print-sheet mx-auto max-w-4xl text-slate-900">
        {/* Kop Surat Header */}
        <KopSurat
          profile={schoolProfile}
          title={getReportTitle()}
          subTitle={`Tahun Pelajaran: ${activeAy} · Semester: ${activeSem}`}
        />

        {/* Body of Report */}
        {reportType === 'HARIAN' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-600 mb-2">
              Daftar presensi seluruh siswa yang tercatat pada tanggal: <strong>{filterDate}</strong>
            </div>
            <table className="w-full text-xs text-left border border-slate-300">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300 w-8 text-center">No</th>
                  <th className="p-2 border-r border-slate-300">NIS</th>
                  <th className="p-2 border-r border-slate-300">Nama Siswa</th>
                  <th className="p-2 border-r border-slate-300">Kelas</th>
                  <th className="p-2 border-r border-slate-300 text-center">Jam</th>
                  <th className="p-2 border-r border-slate-300 text-center">Status</th>
                  <th className="p-2">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {allStudentAtt.filter(a => a.date === filterDate).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      Belum ada data presensi pada tanggal ini.
                    </td>
                  </tr>
                ) : (
                  allStudentAtt.filter(a => a.date === filterDate).slice(0, 30).map((a, i) => {
                    const st = storage.getStudentById(a.studentId);
                    const cl = storage.getClassById(a.classId);
                    return (
                      <tr key={a.id}>
                        <td className="p-2 border-r border-slate-200 text-center font-mono">{i + 1}</td>
                        <td className="p-2 border-r border-slate-200 font-mono">{st?.nis || '-'}</td>
                        <td className="p-2 border-r border-slate-200 font-semibold">{st?.name}</td>
                        <td className="p-2 border-r border-slate-200">{cl?.name}</td>
                        <td className="p-2 border-r border-slate-200 text-center font-mono">{a.checkInTime}</td>
                        <td className="p-2 border-r border-slate-200 text-center font-bold">{a.status}</td>
                        <td className="p-2 text-slate-600">{a.notes || '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {(reportType === 'PER_KELAS' || reportType === 'SEMESTER' || reportType === 'BULANAN') && (
          <div className="space-y-4">
            <div className="text-xs text-slate-600 mb-2 flex justify-between">
              <span>Kelas: <strong>{classes.find(c => c.id === filterClassId)?.name}</strong></span>
              <span>Wali Kelas: <strong>{storage.getTeacherById(classes.find(c => c.id === filterClassId)?.homeroomTeacherId || '')?.name}</strong></span>
            </div>
            <table className="w-full text-xs text-left border border-slate-300">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300 w-8 text-center">No</th>
                  <th className="p-2 border-r border-slate-300">NIS</th>
                  <th className="p-2 border-r border-slate-300">Nama Siswa</th>
                  <th className="p-2 border-r border-slate-300 text-center">L/P</th>
                  <th className="p-2 border-r border-slate-300 text-center">H</th>
                  <th className="p-2 border-r border-slate-300 text-center">T</th>
                  <th className="p-2 border-r border-slate-300 text-center">I</th>
                  <th className="p-2 border-r border-slate-300 text-center">S</th>
                  <th className="p-2 border-r border-slate-300 text-center">A</th>
                  <th className="p-2 border-r border-slate-300 text-center">Total</th>
                  <th className="p-2 text-center">% Hadir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {storage.getClassRecap(filterClassId).studentRecaps.map((item, idx) => (
                  <tr key={item.student.id}>
                    <td className="p-2 border-r border-slate-200 text-center font-mono">{idx + 1}</td>
                    <td className="p-2 border-r border-slate-200 font-mono">{item.student.nis}</td>
                    <td className="p-2 border-r border-slate-200 font-semibold">{item.student.name}</td>
                    <td className="p-2 border-r border-slate-200 text-center">{item.student.gender}</td>
                    <td className="p-2 border-r border-slate-200 text-center font-mono">{item.hadir}</td>
                    <td className="p-2 border-r border-slate-200 text-center font-mono">{item.terlambat}</td>
                    <td className="p-2 border-r border-slate-200 text-center font-mono">{item.izin}</td>
                    <td className="p-2 border-r border-slate-200 text-center font-mono">{item.sakit}</td>
                    <td className="p-2 border-r border-slate-200 text-center font-mono text-rose-700 font-bold">{item.alpa}</td>
                    <td className="p-2 border-r border-slate-200 text-center font-mono">{item.total}</td>
                    <td className="p-2 text-center font-mono font-bold">{item.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'PER_SISWA' && (
          <div className="space-y-4">
            {(() => {
              const st = storage.getStudentById(filterStudentId);
              const rc = storage.getStudentRecap(filterStudentId);
              const cl = st ? storage.getClassById(st.classId) : null;
              const atts = allStudentAtt.filter(a => a.studentId === filterStudentId).slice(-20);

              return (
                <div>
                  <div className="grid grid-cols-2 gap-4 text-xs p-4 bg-slate-50 border border-slate-200 rounded-lg mb-4">
                    <div>
                      <p>Nama Siswa: <strong>{st?.name}</strong></p>
                      <p>NIS / NISN: <span className="font-mono">{st?.nis} / {st?.nisn}</span></p>
                      <p>Kelas: <strong>{cl?.name}</strong></p>
                    </div>
                    <div>
                      <p>Persentase Kehadiran: <strong className="text-base text-emerald-800">{rc.percentage}%</strong></p>
                      <p>Hadir: {rc.hadir} · Telat: {rc.terlambat} · Izin: {rc.izin} · Sakit: {rc.sakit} · Alpa: {rc.alpa}</p>
                      <p>Status: <strong className={rc.needsAttention ? 'text-rose-600' : 'text-emerald-700'}>{rc.needsAttention ? 'Perlu Pembinaan Khusus' : 'Sangat Baik'}</strong></p>
                    </div>
                  </div>

                  <table className="w-full text-xs text-left border border-slate-300">
                    <thead className="bg-slate-100 font-bold border-b border-slate-300">
                      <tr>
                        <th className="p-2 border-r border-slate-300 w-8 text-center">No</th>
                        <th className="p-2 border-r border-slate-300">Tanggal</th>
                        <th className="p-2 border-r border-slate-300 text-center">Jam Hadir</th>
                        <th className="p-2 border-r border-slate-300 text-center">Status</th>
                        <th className="p-2">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {atts.map((a, i) => (
                        <tr key={a.id}>
                          <td className="p-2 border-r border-slate-200 text-center font-mono">{i + 1}</td>
                          <td className="p-2 border-r border-slate-200 font-medium">{a.date}</td>
                          <td className="p-2 border-r border-slate-200 text-center font-mono">{a.checkInTime}</td>
                          <td className="p-2 border-r border-slate-200 text-center font-bold">{a.status}</td>
                          <td className="p-2 text-slate-600">{a.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        )}

        {reportType === 'ABSENSI_GURU' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-600 mb-2">
              Rekapitulasi catatan absensi kedatangan dan kepulangan seluruh guru/pegawai:
            </div>
            <table className="w-full text-xs text-left border border-slate-300">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300 w-8 text-center">No</th>
                  <th className="p-2 border-r border-slate-300">Tanggal</th>
                  <th className="p-2 border-r border-slate-300">Nama Guru / Staf</th>
                  <th className="p-2 border-r border-slate-300 text-center">Masuk</th>
                  <th className="p-2 border-r border-slate-300 text-center">Status</th>
                  <th className="p-2 border-r border-slate-300 text-center">Metode</th>
                  <th className="p-2">Catatan Lokasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {allTeacherAtt.map((a, i) => {
                  const tc = storage.getTeacherById(a.teacherId);
                  return (
                    <tr key={a.id}>
                      <td className="p-2 border-r border-slate-200 text-center font-mono">{i + 1}</td>
                      <td className="p-2 border-r border-slate-200">{a.date}</td>
                      <td className="p-2 border-r border-slate-200 font-bold">{tc?.name}</td>
                      <td className="p-2 border-r border-slate-200 text-center font-mono">{a.checkInTime}</td>
                      <td className="p-2 border-r border-slate-200 text-center font-bold">{a.status}</td>
                      <td className="p-2 border-r border-slate-200 text-center">{a.method}</td>
                      <td className="p-2 text-slate-600">{a.notes || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Signature Footer Block (Prompt Section 29 requirement!) */}
        <div className="mt-12 pt-6 border-t border-slate-300 flex justify-between items-start text-xs">
          <div>
            <p className="text-slate-500">Mengetahui,</p>
            <p className="font-semibold text-slate-700">Wali Kelas / Guru Piket</p>
            <div className="h-16" />
            <p className="font-bold underline text-slate-900">{currentUser.name}</p>
            <p className="text-slate-500">NIP. -</p>
          </div>

          <div className="text-right">
            <p className="text-slate-500">
              {schoolProfile.city}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="font-semibold text-slate-700">Kepala Sekolah,</p>
            <div className="h-16" />
            <p className="font-bold underline text-slate-900">{schoolProfile.principalName}</p>
            <p className="text-slate-500 font-mono">NIP. {schoolProfile.principalNip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
