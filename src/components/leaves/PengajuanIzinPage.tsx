import React, { useState } from 'react';
import {
  FileText,
  FilePlus,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  Filter,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { LeaveRequest, LeaveType, LeaveStatus, UserAccount } from '../../types';
import { storage } from '../../services/storageService';

interface PengajuanIzinPageProps {
  currentUser: UserAccount;
  initialStudentId?: string;
}

export const PengajuanIzinPage: React.FC<PengajuanIzinPageProps> = ({
  currentUser,
  initialStudentId
}) => {
  const students = storage.getStudents();
  const teachers = storage.getTeachers();

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(
    storage.getLeaveRequests()
  );

  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Submit form state
  const defaultStudentId = initialStudentId || currentUser.relatedStudentId || (students[0]?.id ?? 'std-101');
  const [formStudentId, setFormStudentId] = useState<string>(defaultStudentId);
  const [formType, setFormType] = useState<LeaveType>('IZIN');
  const [formStartDate, setFormStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [formEndDate, setFormEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [formReason, setFormReason] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formAttachmentName, setFormAttachmentName] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string>('');

  const refreshList = () => {
    setLeaveRequests(storage.getLeaveRequests());
  };

  const handleApprove = (id: string) => {
    storage.processLeaveRequest(
      id,
      'DISETUJUI',
      'Disetujui oleh ' + currentUser.name,
      currentUser.relatedTeacherId || 'admin'
    );
    refreshList();
    setToastMsg('Pengajuan izin berhasil disetujui dan disinkronkan ke rekap presensi.');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleReject = (id: string) => {
    const reason = prompt('Masukkan alasan penolakan pengajuan izin:');
    if (reason !== null) {
      storage.processLeaveRequest(
        id,
        'DITOLAK',
        reason || 'Ditolak oleh ' + currentUser.name,
        currentUser.relatedTeacherId || 'admin'
      );
      refreshList();
      setToastMsg('Pengajuan izin telah ditolak.');
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formReason.trim()) {
      alert('Mohon isi alasan pengajuan.');
      return;
    }

    const newReq: LeaveRequest = {
      id: `lve-${Date.now()}`,
      studentId: formStudentId,
      type: formType,
      startDate: formStartDate,
      endDate: formEndDate,
      reason: formReason,
      notes: formNotes,
      attachmentName: formAttachmentName || (formType === 'SAKIT' ? 'surat_keterangan_dokter.pdf' : 'surat_izin_orangtua.pdf'),
      submittedBy: currentUser.role === 'ORANG_TUA' ? 'ORANG_TUA' : 'SISWA',
      submittedByUserId: currentUser.id,
      submittedAt: new Date().toISOString(),
      status: 'MENUNGGU'
    };

    storage.saveLeaveRequest(newReq);
    refreshList();
    setShowSubmitModal(false);
    setFormReason('');
    setFormNotes('');
    setFormAttachmentName('');
    setToastMsg('Permohonan izin berhasil diajukan dan sedang menunggu verifikasi.');
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Filter list
  const filtered = leaveRequests.filter(req => {
    // If student logged in, only see own leaves
    if (currentUser.role === 'SISWA' && currentUser.relatedStudentId) {
      if (req.studentId !== currentUser.relatedStudentId) return false;
    }
    // If parent logged in, only see own children
    if (currentUser.role === 'ORANG_TUA') {
      const parent = storage.getParentById(currentUser.relatedParentId || '');
      if (parent && !parent.studentIds.includes(req.studentId)) return false;
    }

    if (filterStatus !== 'ALL' && req.status !== filterStatus) return false;
    return true;
  });

  const canReview = ['ADMIN', 'GURU', 'WALI_KELAS'].includes(currentUser.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            <span>Pengajuan & Dispensasi Izin / Sakit</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola surat permohonan izin tidak masuk sekolah atau sakit dengan verifikasi wali kelas & guru piket.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <FilePlus className="w-4 h-4" />
          <span>Ajukan Izin / Sakit Baru</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start text-xs font-semibold">
        {(['ALL', 'MENUNGGU', 'DISETUJUI', 'DITOLAK'] as const).map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterStatus === st ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {st === 'ALL' ? 'Semua Pengajuan' : st}
          </button>
        ))}
      </div>

      {/* Requests Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 bg-white p-12 text-center text-xs text-slate-400 rounded-xl border border-slate-200">
            Tidak ada permohonan izin/sakit pada kategori ini.
          </div>
        ) : (
          filtered.map(req => {
            const student = storage.getStudentById(req.studentId);
            const cls = student ? storage.getClassById(student.classId) : null;
            const reviewer = req.reviewedByTeacherId ? storage.getTeacherById(req.reviewedByTeacherId) : null;

            const statusBadges: Record<LeaveStatus, { label: string; style: string }> = {
              MENUNGGU: { label: 'Menunggu Persetujuan', style: 'bg-amber-100 text-amber-800 border-amber-200' },
              DISETUJUI: { label: 'Disetujui', style: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
              DITOLAK: { label: 'Ditolak', style: 'bg-rose-100 text-rose-800 border-rose-200' },
            };

            return (
              <div key={req.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-sm text-slate-900">{student?.name}</span>
                    <span className="text-xs text-slate-500 block">
                      Kelas {cls?.name} · NIS: {student?.nis}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${statusBadges[req.status].style}`}>
                    {statusBadges[req.status].label}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold text-slate-700">Jenis Permohonan:</span>
                    <span className="font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800">
                      {req.type === 'SAKIT' ? '🟣 Sakit' : '🔵 Izin'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold text-slate-700">Rentang Tanggal:</span>
                    <span className="font-mono text-slate-900">{req.startDate} s.d {req.endDate}</span>
                  </div>

                  <div className="pt-1 text-slate-700">
                    <strong className="block text-slate-900">Alasan:</strong>
                    <span>{req.reason}</span>
                  </div>

                  {req.notes && (
                    <div className="pt-0.5 text-slate-600 italic">
                      Catatan: {req.notes}
                    </div>
                  )}

                  {req.attachmentName && (
                    <div className="pt-1 text-emerald-700 font-medium">
                      📎 Lampiran Bukti: {req.attachmentName}
                    </div>
                  )}
                </div>

                {/* Reviewer notes */}
                {req.status !== 'MENUNGGU' && (
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span>Diverifikasi oleh: {reviewer?.name || 'Administrator'}</span>
                    <span>{req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString('id-ID') : ''}</span>
                  </div>
                )}

                {/* Actions for Teachers & Admin */}
                {canReview && req.status === 'MENUNGGU' && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      Tolak
                    </button>
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Setujui Izin
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Submit Leave Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                Formulir Pengajuan Izin / Sakit Siswa
              </h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNew} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pilih Siswa</label>
                <select
                  disabled={currentUser.role === 'SISWA'}
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  {students.map(s => {
                    const c = storage.getClassById(s.classId);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} (Kelas {c?.name})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jenis Dispensasi</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as LeaveType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="IZIN">🔵 Izin (Keperluan Keluarga/Acara)</option>
                    <option value="SAKIT">🟣 Sakit (Surat Dokter/Rawat)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nama Berkas Lampiran</label>
                  <input
                    type="text"
                    value={formAttachmentName}
                    onChange={(e) => setFormAttachmentName(e.target.value)}
                    placeholder={formType === 'SAKIT' ? 'surat_dokter.pdf' : 'surat_orang_tua.pdf'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Alasan Utama (Wajib)</label>
                <input
                  type="text"
                  required
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="Contoh: Mengikuti acara pernikahan keluarga di luar kota / Demam tinggi..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Keterangan Tambahan</label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Informasikan detail tambahan jika diperlukan..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-sm"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
