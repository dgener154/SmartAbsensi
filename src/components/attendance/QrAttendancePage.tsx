import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Check,
  Video,
  VideoOff,
  SwitchCamera,
  Barcode,
  Volume2,
  Users,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { UserAccount } from '../../types';
import { storage } from '../../services/storageService';

interface QrAttendancePageProps {
  currentUser: UserAccount;
}

interface ScanLog {
  id: string;
  name: string;
  code: string;
  type: 'SISWA' | 'GURU';
  status: 'HADIR' | 'GAGAL';
  time: string;
  message: string;
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

  // Active Scanner Mode & Camera States
  const [activeScanMode, setActiveScanMode] = useState<'CAMERA' | 'HARDWARE' | 'TEST'>('CAMERA');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; title: string } | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [recentScans, setRecentScans] = useState<ScanLog[]>([]);

  // Simulation test state
  const [testTargetType, setTestTargetType] = useState<'SISWA' | 'GURU'>('SISWA');
  const [selectedStudentId, setSelectedStudentId] = useState(storage.getStudents()[0]?.id || 'std-101');
  const [selectedTeacherId, setSelectedTeacherId] = useState(storage.getTeachers()[0]?.id || 'tch-2');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScannedTimeRef = useRef<number>(0);
  const lastScannedCodeRef = useRef<string>('');

  // Audio feedback helper
  const playBeep = useCallback((isSuccess = true) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isSuccess) {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1760, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.22);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // Audio not permitted or supported
    }
  }, []);

  // Initialize and start live camera
  const startCamera = useCallback(async (facing: 'environment' | 'user' = cameraFacing) => {
    setIsStartingCamera(true);
    setCameraError(null);

    // Stop any existing stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    try {
      if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play().catch(() => {});
        }
        setIsCameraActive(true);
      } else {
        setCameraError('Kamera tidak didukung oleh browser ini. Anda dapat menggunakan mode scanner barcode hardware atau input kode.');
        setIsCameraActive(false);
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      const isBlocked = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      setCameraError(
        isBlocked
          ? 'Izin kamera diblokir. Klik ikon gembok/kamera di bilah URL browser Anda lalu pilih "Izinkan" agar kamera aktif.'
          : `Kamera tidak dapat dimulai (${err.name || 'Device Error'}). Pastikan webcam tidak dipakai aplikasi lain.`
      );
      setIsCameraActive(false);
    } finally {
      setIsStartingCamera(false);
    }
  }, [cameraFacing]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  const toggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const switchFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  // Start camera when component mounts or mode switches to CAMERA
  useEffect(() => {
    if (activeScanMode === 'CAMERA') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeScanMode, startCamera, stopCamera]);

  // Main code processing engine (handles SAS tokens, NISN, NIS, NIP, Barcodes)
  const processScannedCode = useCallback((rawCode: string) => {
    const code = (rawCode || '').trim();
    if (!code) return;

    // Prevent immediate multiple scans of identical code within 2 seconds
    const now = Date.now();
    if (code === lastScannedCodeRef.current && now - lastScannedTimeRef.current < 2500) {
      return;
    }
    lastScannedCodeRef.current = code;
    lastScannedTimeRef.current = now;

    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const students = storage.getStudents();
    const teachers = storage.getTeachers();

    // CASE 1: Code is a generated SAS Session QR Token (e.g. SAS-2025-07-14-cls-7a-ses-1-...)
    if (code.startsWith('SAS-') || code.startsWith('SAS_')) {
      const parts = code.split('-');
      // Expected: SAS, YYYY, MM, DD, classId, sessionId, hash
      const targetClassId = parts[4] || genClassId;
      const targetSessionId = parts[5] || genSessionId;

      // Determine which student is scanning: if current user is Siswa, use current user
      let student = currentUser.relatedStudentId ? storage.getStudentById(currentUser.relatedStudentId) : null;
      if (!student) {
        student = storage.getStudentById(selectedStudentId) || students[0];
      }

      if (!student) {
        playBeep(false);
        setScanResult({
          success: false,
          title: 'Pemindaian Gagal',
          message: 'Data siswa pemindai QR tidak ditemukan.'
        });
        return;
      }

      if (student.classId !== targetClassId) {
        const cls = storage.getClassById(targetClassId);
        playBeep(false);
        setScanResult({
          success: false,
          title: 'Presensi Ditolak (Beda Kelas)',
          message: `Siswa ${student.name} bukan anggota kelas ${cls?.name || targetClassId}. QR Code ini untuk kelas lain.`
        });
        return;
      }

      // Check duplicate attendance for today and session
      const existing = storage.getAttendanceByFilter(todayStr, targetClassId, targetSessionId);
      if (existing.some(e => e.studentId === student!.id)) {
        playBeep(false);
        setScanResult({
          success: false,
          title: 'Presensi Sudah Tercatat',
          message: `Siswa ${student.name} sudah melakukan presensi pada sesi pelajaran ini sebelumnya!`
        });
        return;
      }

      // Save student attendance
      storage.saveStudentAttendanceBatch(
        [{ studentId: student.id, status: 'HADIR', checkInTime: nowTime, notes: `Scan QR Sesi: ${code.substring(0, 16)}...` }],
        {
          date: todayStr,
          classId: targetClassId,
          sessionId: targetSessionId,
          subjectId: genSubjectId,
          teacherId: currentUser.relatedTeacherId || 'admin'
        },
        'Presensi Mandiri via Scan Kamera'
      );

      playBeep(true);
      const successMsg = `Presensi siswa ${student.name} (NISN: ${student.nisn}) berhasil dicatat HADIR pukul ${nowTime} WIB.`;
      setScanResult({
        success: true,
        title: 'Presensi QR Berhasil',
        message: successMsg
      });

      setRecentScans(prev => [
        {
          id: `scan-${Date.now()}`,
          name: student!.name,
          code: student!.nisn,
          type: 'SISWA',
          status: 'HADIR',
          time: nowTime,
          message: 'HADIR via Scan Kamera QR'
        },
        ...prev.slice(0, 9)
      ]);
      return;
    }

    // CASE 2: Code matches a Student (by NISN, NIS, or ID)
    const matchedStudent = students.find(
      s => s.nisn === code || s.nis === code || s.id === code || (s.nik && s.nik === code)
    );

    if (matchedStudent) {
      // Check duplicate
      const existing = storage.getAttendanceByFilter(todayStr, matchedStudent.classId, genSessionId, genSubjectId);
      const isAlready = existing.some(e => e.studentId === matchedStudent.id);

      if (isAlready) {
        playBeep(false);
        setScanResult({
          success: false,
          title: 'Presensi Sudah Tercatat',
          message: `Siswa ${matchedStudent.name} (NISN: ${matchedStudent.nisn}) sudah berstatus HADIR pada hari dan sesi ini.`
        });
        return;
      }

      storage.saveStudentAttendanceBatch(
        [{ studentId: matchedStudent.id, status: 'HADIR', checkInTime: nowTime, notes: `Barcode/Kamera ID: ${code}` }],
        {
          date: todayStr,
          classId: matchedStudent.classId,
          sessionId: genSessionId,
          subjectId: genSubjectId,
          teacherId: currentUser.relatedTeacherId || 'admin'
        },
        'Presensi via Scan Barcode/Kamera'
      );

      playBeep(true);
      const studentClass = storage.getClassById(matchedStudent.classId);
      const successMsg = `Siswa: ${matchedStudent.name} · Kelas: ${studentClass?.name || '-'} · NISN: ${matchedStudent.nisn} tercatat HADIR pukul ${nowTime} WIB.`;
      setScanResult({
        success: true,
        title: 'Presensi Siswa Berhasil',
        message: successMsg
      });

      setRecentScans(prev => [
        {
          id: `scan-${Date.now()}`,
          name: matchedStudent.name,
          code: matchedStudent.nisn,
          type: 'SISWA',
          status: 'HADIR',
          time: nowTime,
          message: `Kelas ${studentClass?.name || ''} - HADIR`
        },
        ...prev.slice(0, 9)
      ]);
      return;
    }

    // CASE 3: Code matches a Teacher (by NIP, NUPTK, or ID)
    const matchedTeacher = teachers.find(
      t => t.nip === code || t.nuptk === code || t.id === code || (t.username && t.username.toLowerCase() === code.toLowerCase())
    );

    if (matchedTeacher) {
      storage.saveTeacherAttendance({
        id: `tatt-scan-${Date.now()}`,
        date: todayStr,
        teacherId: matchedTeacher.id,
        status: 'HADIR',
        checkInTime: nowTime,
        method: 'QR',
        isLocationValid: true,
        notes: 'Check-In via Scan Kamera / Barcode Gerbang',
        createdAt: new Date().toISOString()
      });

      playBeep(true);
      const successMsg = `Guru: ${matchedTeacher.name} (NIP: ${matchedTeacher.nip || matchedTeacher.nuptk || '-'}) berhasil check-in HADIR pukul ${nowTime} WIB.`;
      setScanResult({
        success: true,
        title: 'Presensi Guru Berhasil',
        message: successMsg
      });

      setRecentScans(prev => [
        {
          id: `scan-${Date.now()}`,
          name: matchedTeacher.name,
          code: matchedTeacher.nip || matchedTeacher.nuptk || code,
          type: 'GURU',
          status: 'HADIR',
          time: nowTime,
          message: 'Check-In Guru HADIR'
        },
        ...prev.slice(0, 9)
      ]);
      return;
    }

    // CASE 4: Unknown barcode or code
    playBeep(false);
    setScanResult({
      success: false,
      title: 'Kode Tidak Dikenali',
      message: `Kode "${code}" tidak cocok dengan NISN Siswa, NIP Guru, ataupun Token QR Sesi Pelajaran yang valid.`
    });
  }, [currentUser, genClassId, genSessionId, genSubjectId, playBeep, selectedStudentId, todayStr]);

  // Continuous Native BarcodeDetector loop on active video stream
  useEffect(() => {
    let intervalId: any = null;

    if (isCameraActive && 'BarcodeDetector' in window) {
      try {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a']
        });

        intervalId = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState >= 2 && isCameraActive) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                processScannedCode(barcodes[0].rawValue);
              }
            } catch {
              // frame decode error ignored
            }
          }
        }, 350);
      } catch {
        // BarcodeDetector constructor failed
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isCameraActive, processScannedCode]);

  // Handle Hardware / Manual input submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processScannedCode(manualCode.trim());
    setManualCode('');
  };

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

  const selectedCls = classes.find(c => c.id === genClassId);
  const selectedSub = subjects.find(s => s.id === genSubjectId);
  const selectedSes = sessions.find(s => s.id === genSessionId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-700" />
            <span>Sistem Presensi Berbasis QR Code &amp; Barcode Scanner</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mendukung pemindaian langsung melalui kamera HP/webcam, alat scanner hardware (USB barcode gun), dan kartu pelajar NISN.
          </p>
        </div>

        {/* Live Camera Status Indicator */}
        <div className="flex items-center gap-2">
          {isCameraActive ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Kamera Aktif (Live Stream)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-medium">
              <VideoOff className="w-3.5 h-3.5 text-slate-400" />
              Kamera Nonaktif
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: QR Code Generator Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Generate QR Code Sesi Dinamis</span>
            </h3>
            <button
              onClick={handleGenerate}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
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
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
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
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
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
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
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
              <div className="w-48 h-48 bg-slate-900 rounded-lg p-2.5 flex flex-col justify-between mx-auto shadow-inner relative group">
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
                <div className="flex justify-between items-end">
                  <div className="w-12 h-12 border-4 border-white bg-slate-900 p-1">
                    <div className="w-full h-full bg-white" />
                  </div>
                  <div className="w-10 h-10 border-2 border-emerald-400 p-1 flex items-center justify-center text-[10px] text-white font-mono font-bold bg-emerald-900/60 rounded">
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

            {/* Token Hash & Copy */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 truncate max-w-xs shadow-2xs">
                {qrToken}
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                title="Salin Token"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin Token'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Active Live Camera Scanner & Barcode Reader */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Scan className="w-4 h-4 text-emerald-600" />
              <span>Pemindai Kamera &amp; Barcode Scanner</span>
            </h3>

            {/* Mode Tabs */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActiveScanMode('CAMERA')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  activeScanMode === 'CAMERA'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kamera Langsung
              </button>
              <button
                type="button"
                onClick={() => setActiveScanMode('HARDWARE')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  activeScanMode === 'HARDWARE'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Barcode / Gun
              </button>
              <button
                type="button"
                onClick={() => setActiveScanMode('TEST')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  activeScanMode === 'TEST'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Simulasi ID
              </button>
            </div>
          </div>

          {/* MODE 1: LIVE ACTIVE CAMERA */}
          {activeScanMode === 'CAMERA' && (
            <div className="space-y-3">
              {/* Camera Video Viewfinder */}
              <div className="relative w-full aspect-video bg-slate-950 rounded-xl overflow-hidden border-2 border-slate-800 shadow-inner flex items-center justify-center">
                {/* Live Video Element */}
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    isCameraActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Overlaid Viewfinder Reticle & Laser */}
                {isCameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* Darkened edges */}
                    <div className="absolute inset-0 bg-black/25" />

                    {/* Scanning Target Box */}
                    <div className="relative w-64 h-64 border-2 border-dashed border-emerald-400/70 rounded-2xl flex items-center justify-center shadow-2xl">
                      {/* Corner Target Markers */}
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br" />

                      {/* Animated Laser Scanning Beam */}
                      <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-bounce" />

                      <span className="text-[11px] font-mono text-emerald-300 bg-slate-900/80 px-2.5 py-1 rounded-full border border-emerald-500/40 backdrop-blur-xs">
                        Arahkan QR / Barcode NISN
                      </span>
                    </div>
                  </div>
                )}

                {/* Camera Inactive / Error Overlay */}
                {(!isCameraActive || cameraError) && (
                  <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-white space-y-3 z-10">
                    <Camera className="w-12 h-12 text-slate-500" />
                    <div>
                      <h4 className="font-bold text-sm">
                        {cameraError ? 'Akses Kamera Perlu Diizinkan' : 'Kamera Dalam Status Nonaktif'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        {cameraError || 'Klik tombol di bawah untuk menyalakan streaming video kamera secara aktif.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => startCamera()}
                      disabled={isStartingCamera}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      <span>{isStartingCamera ? 'Menghubungkan...' : 'Aktifkan Kamera Sekarang'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Camera Action Toolbar */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isCameraActive
                        ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {isCameraActive ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                    <span>{isCameraActive ? 'Jeda Kamera' : 'Nyalakan Kamera'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={switchFacing}
                    disabled={!isCameraActive}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <SwitchCamera className="w-3.5 h-3.5" />
                    <span>Ganti Kamera ({cameraFacing === 'environment' ? 'Belakang' : 'Depan'})</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  Mode Pindai Otomatis Aktif
                </span>
              </div>
            </div>
          )}

          {/* MODE 2: HARDWARE BARCODE SCANNER / SCANNER GUN */}
          {activeScanMode === 'HARDWARE' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Barcode className="w-4 h-4 text-emerald-700" />
                  <span>Dukungan Alat Pemindai Fisik (Hardware Barcode Gun)</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Hubungkan scanner barcode USB atau Bluetooth. Arahkan sinar laser scanner ke kartu pelajar (NISN) atau kartu ID guru, hasil scan akan otomatis terekam dan mencatat kehadiran.
                </p>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Input Barcode / NISN Siswa / NIP Guru:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Barcode className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      autoFocus
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="Scan kartu dengan alat barcode gun atau ketik NISN..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-emerald-600 focus:bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>Proses Scan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MODE 3: SIMULASI CEPAT BERDASARKAN DATABASE */}
          {activeScanMode === 'TEST' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px]">
                Uji langsung proses presensi dengan memilih data siswa atau guru terdaftar di database:
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTestTargetType('SISWA')}
                  className={`py-2 rounded-lg font-bold border text-center transition-colors cursor-pointer ${
                    testTargetType === 'SISWA'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Presensi Siswa (NISN)
                </button>
                <button
                  type="button"
                  onClick={() => setTestTargetType('GURU')}
                  className={`py-2 rounded-lg font-bold border text-center transition-colors cursor-pointer ${
                    testTargetType === 'GURU'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Presensi Guru (NIP)
                </button>
              </div>

              {testTargetType === 'SISWA' ? (
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Pilih Siswa:</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium text-xs"
                  >
                    {storage.getStudents().map(s => {
                      const cls = storage.getClassById(s.classId);
                      return (
                        <option key={s.id} value={s.id}>
                          {s.name} (NISN: {s.nisn} · Kelas {cls?.name})
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Pilih Guru:</label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium text-xs"
                  >
                    {storage.getTeachers().map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} (NIP: {t.nip || t.nuptk || '-'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (testTargetType === 'SISWA') {
                    const std = storage.getStudentById(selectedStudentId);
                    if (std) processScannedCode(std.nisn);
                  } else {
                    const tch = storage.getTeacherById(selectedTeacherId);
                    if (tch) processScannedCode(tch.nip || tch.nuptk || tch.id);
                  }
                }}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Simulasikan Scan ID Terpilih</span>
              </button>
            </div>
          )}

          {/* Scan Result Feedback Banner */}
          {scanResult && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 text-xs animate-in fade-in duration-200 ${
                scanResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {scanResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">
                <div className="font-bold text-sm">{scanResult.title}</div>
                <div className="mt-0.5">{scanResult.message}</div>
              </div>
            </div>
          )}

          {/* Recent Live Scan Feed */}
          {recentScans.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Riwayat Pemindaian Sesi Ini:</span>
                <span className="text-[11px] font-normal text-slate-500">{recentScans.length} data</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {recentScans.map((log) => (
                  <div
                    key={log.id}
                    className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {log.type}
                      </span>
                      <span className="font-semibold text-slate-900">{log.name}</span>
                      <span className="text-slate-500 font-mono text-[11px]">({log.code})</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-700 font-semibold">{log.time} WIB</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
