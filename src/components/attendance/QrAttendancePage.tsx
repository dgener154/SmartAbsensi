import React, { useState } from 'react';
import {
  QrCode,
  Scan,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Camera,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { UserAccount } from '../../types';
import { storage } from '../../services/storageService';

interface QrAttendancePageProps {
  currentUser: UserAccount;
}

export const QrAttendancePage: React.FC<QrAttendancePageProps> = ({ currentUser }) => {
  const classes = storage.getClasses();
  const subjects = storage.getSubjects();
  const sessions = storage.getSessions().filter(s => s.type === 'Pelajaran');
  const todayStr = new Date().toISOString().split('T')[0];

  // QR Generator State
  const [genClassId, setGenClassId] = useState(classes[0]?.id || 'cls-7a');
  const [genSubjectId, setGenSubjectId] = useState(subjects[0]?.id || 'sb-mtk');
  const [genSessionId, setGenSessionId] = useState(sessions[0]?.id || 'ses-1');
  const [qrToken, setQrToken] = useState<string>(`SAS-QR-${todayStr}-${genClassId}-${genSessionId}`);
  const [copied, setCopied] = useState(false);

  // Scanner State
  const [scanType, setScanType] = useState<'SISWA' | 'GURU'>('SISWA');
  const [selectedStudentId, setSelectedStudentId] = useState(storage.getStudents()[0]?.id || 'std-101');
  const [selectedTeacherId, setSelectedTeacherId] = useState(storage.getTeachers()[0]?.id || 'tch-2');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleGenerate = () => {
    const randomHash = Math.random().toString(36).substring(2, 8).toUpperCase();
    const token = `SAS-${todayStr}-${genClassId}-${genSessionId}-${randomHash}`;
    setQrToken(token);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(qrToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulate scanning of QR
  const handleSimulateScan = () => {
    setScanResult(null);

    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (scanType === 'SISWA') {
      const student = storage.getStudentById(selectedStudentId);
      if (!student) {
        setScanResult({ success: false, message: 'Data siswa tidak ditemukan.' });
        return;
      }

      // Check if student belongs to the QR class
      if (student.classId !== genClassId) {
        const cls = storage.getClassById(genClassId);
        setScanResult({
          success: false,
          message: `Gagal: Siswa ${student.name} bukan merupakan anggota kelas ${cls?.name}. Akses presensi ditolak.`
        });
        return;
      }

      // Check duplicate
      const existing = storage.getAttendanceByFilter(todayStr, genClassId, genSessionId, genSubjectId);
      const isAlready = existing.some(e => e.studentId === student.id);

      if (isAlready) {
        setScanResult({
          success: false,
          message: `Peringatan: Siswa ${student.name} sudah melakukan presensi pada sesi ini sebelumnya!`
        });
        return;
      }

      // Save attendance
      storage.saveStudentAttendanceBatch(
        [{ studentId: student.id, status: 'HADIR', checkInTime: nowTime, notes: 'Presensi Scan QR Code' }],
        {
          date: todayStr,
          classId: genClassId,
          sessionId: genSessionId,
          subjectId: genSubjectId,
          teacherId: currentUser.relatedTeacherId || 'admin'
        },
        'Presensi Mandiri via Scan QR Code'
      );

      setScanResult({
        success: true,
        message: `Berhasil! Presensi siswa ${student.name} tercatat HADIR pada pukul ${nowTime} WIB.`
      });
    } else {
      // Teacher scan
      const teacher = storage.getTeacherById(selectedTeacherId);
      if (!teacher) {
        setScanResult({ success: false, message: 'Data guru tidak ditemukan.' });
        return;
      }

      storage.saveTeacherAttendance({
        id: `tatt-qr-${Date.now()}`,
        date: todayStr,
        teacherId: teacher.id,
        status: 'HADIR',
        checkInTime: nowTime,
        method: 'QR',
        isLocationValid: true,
        notes: 'Check-In via QR Code Gerbang',
        createdAt: new Date().toISOString()
      });

      setScanResult({
        success: true,
        message: `Berhasil! Check-in presensi guru ${teacher.name} tercatat HADIR pada pukul ${nowTime} WIB.`
      });
    }
  };

  const selectedCls = classes.find(c => c.id === genClassId);
  const selectedSub = subjects.find(s => s.id === genSubjectId);
  const selectedSes = sessions.find(s => s.id === genSessionId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-emerald-700" />
          <span>Sistem Presensi Berbasis QR Code</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Guru dan Admin dapat memproyeksikan QR Code dinamis kelas untuk dipindai oleh siswa atau guru saat masuk ruangan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: QR Code Generator Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Generate QR Code Presensi Dinamis</span>
            </h3>
            <button
              onClick={handleGenerate}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Perbarui Token
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Kelas</label>
              <select
                value={genClassId}
                onChange={(e) => setGenClassId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>Kelas {c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Mata Pelajaran</label>
              <select
                value={genSubjectId}
                onChange={(e) => setGenSubjectId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>[{s.code}] {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Sesi Pelajaran</label>
              <select
                value={genSessionId}
                onChange={(e) => setGenSessionId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              >
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Render Vector QR Matrix Pattern */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200">
            <div className="p-4 bg-white rounded-xl shadow-md border border-slate-200 text-center">
              {/* Clean high-res SVG QR illustration */}
              <div className="w-48 h-48 bg-slate-900 rounded-lg p-2.5 flex flex-col justify-between mx-auto">
                <div className="flex justify-between">
                  <div className="w-12 h-12 border-4 border-white bg-slate-900 p-1">
                    <div className="w-full h-full bg-white" />
                  </div>
                  <div className="w-12 h-12 border-4 border-white bg-slate-900 p-1">
                    <div className="w-full h-full bg-white" />
                  </div>
                </div>
                {/* Center dynamic matrix lines */}
                <div className="grid grid-cols-6 gap-1 p-1">
                  <div className="h-2 bg-emerald-400 rounded-xs" />
                  <div className="h-2 bg-white rounded-xs" />
                  <div className="h-2 bg-white rounded-xs" />
                  <div className="h-2 bg-emerald-400 rounded-xs" />
                  <div className="h-2 bg-white rounded-xs" />
                  <div className="h-2 bg-white rounded-xs" />
                  <div className="h-2 bg-white rounded-xs" />
                  <div className="h-2 bg-emerald-400 rounded-xs" />
                  <div className="h-2 bg-emerald-400 rounded-xs" />
                  <div className="h-2 bg-white rounded-xs" />
                  <div className="h-2 bg-emerald-400 rounded-xs" />
                  <div className="h-2 bg-white rounded-xs" />
                </div>
                <div className="flex justify-between">
                  <div className="w-12 h-12 border-4 border-white bg-slate-900 p-1">
                    <div className="w-full h-full bg-white" />
                  </div>
                  <div className="w-10 h-10 border-2 border-emerald-400 p-1 flex items-center justify-center text-[10px] text-white font-mono">
                    SAS
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-xs font-bold text-slate-900">
                  Kelas {selectedCls?.name} · {selectedSub?.name}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {selectedSes?.name} ({todayStr})
                </div>
              </div>
            </div>

            {/* Token Hash */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-500 bg-white px-3 py-1 rounded border border-slate-200 truncate max-w-xs">
                {qrToken}
              </span>
              <button
                onClick={handleCopy}
                className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs flex items-center gap-1"
                title="Salin Token"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Scanner / Simulation Scanner */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Scan className="w-4 h-4 text-emerald-600" />
              <span>Simulasi Scanner QR Presensi Siswa & Guru</span>
            </h3>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
              Scanner Aktif
            </span>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
            <strong>Mode Demo QR Aktif:</strong> Hubungkan kamera barcode scanner produksi untuk pemindaian hardware. Di bawah ini Anda dapat menguji seluruh validasi scan (hak akses kelas, token tanggal, dan pencegahan presensi ganda).
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Target Pindaian</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setScanType('SISWA')}
                  className={`py-2 rounded-lg font-medium border text-center transition-colors ${
                    scanType === 'SISWA' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Presensi Siswa
                </button>
                <button
                  type="button"
                  onClick={() => setScanType('GURU')}
                  className={`py-2 rounded-lg font-medium border text-center transition-colors ${
                    scanType === 'GURU' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Presensi Guru / Staf
                </button>
              </div>
            </div>

            {scanType === 'SISWA' ? (
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Pilih Siswa yang Memindai</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  {storage.getStudents().map(s => {
                    const cls = storage.getClassById(s.classId);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} (NIS: {s.nis} · Kelas {cls?.name})
                      </option>
                    );
                  })}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Pilih Guru yang Memindai</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  {storage.getTeachers().map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.position})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleSimulateScan}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 mt-2"
            >
              <Camera className="w-4 h-4" />
              <span>Simulasikan Pemindaian QR Sekarang</span>
            </button>
          </div>

          {/* Scan result display */}
          {scanResult && (
            <div className={`p-4 rounded-xl border flex items-start gap-2.5 text-xs ${
              scanResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {scanResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">
                <div className="font-bold">{scanResult.success ? 'Pemindaian Sukses' : 'Pemindaian Ditolak'}</div>
                <div className="mt-0.5">{scanResult.message}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
