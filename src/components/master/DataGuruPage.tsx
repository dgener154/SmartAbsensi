import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Printer,
  Edit2,
  Trash2,
  Eye,
  X,
  CheckCircle
} from 'lucide-react';
import { Teacher } from '../../types';
import { storage } from '../../services/storageService';
import { CsvImportModal } from '../common/CsvImportModal';
import { KopSurat } from '../common/KopSurat';

export const DataGuruPage: React.FC = () => {
  const schoolProfile = storage.getSchoolProfile();
  const [teachers, setTeachers] = useState<Teacher[]>(storage.getTeachers());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPosition, setFilterPosition] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [formNip, setFormNip] = useState('');
  const [formNuptk, setFormNuptk] = useState('');
  const [formNik, setFormNik] = useState('');
  const [formName, setFormName] = useState('');
  const [formFrontTitle, setFormFrontTitle] = useState('');
  const [formBackTitle, setFormBackTitle] = useState('');
  const [formGender, setFormGender] = useState<'L' | 'P'>('L');
  const [formBirthPlace, setFormBirthPlace] = useState('Jakarta');
  const [formBirthDate, setFormBirthDate] = useState('1985-01-01');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formEmployment, setFormEmployment] = useState<any>('GTY');
  const [formPosition, setFormPosition] = useState<any>('Guru');
  const [formSubject, setFormSubject] = useState('Matematika');
  const [toastMsg, setToastMsg] = useState('');

  const refreshList = () => {
    setTeachers(storage.getTeachers());
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormNip('199001012020011001');
    setFormNuptk('1234567890123456');
    setFormNik('3174000000000000');
    setFormName('');
    setFormFrontTitle('');
    setFormBackTitle('S.Pd.');
    setFormGender('L');
    setFormBirthPlace('Jakarta');
    setFormBirthDate('1988-05-12');
    setFormAddress('Jl. Mampang Prapatan No. 50');
    setFormPhone('081299887766');
    setFormEmail('');
    setFormEmployment('GTY');
    setFormPosition('Guru');
    setFormSubject('Matematika');
    setShowFormModal(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingId(t.id);
    setFormNip(t.nip);
    setFormNuptk(t.nuptk);
    setFormNik(t.nik);
    setFormName(t.name);
    setFormFrontTitle(t.frontTitle || '');
    setFormBackTitle(t.backTitle || '');
    setFormGender(t.gender);
    setFormBirthPlace(t.birthPlace);
    setFormBirthDate(t.birthDate);
    setFormAddress(t.address);
    setFormPhone(t.phone);
    setFormEmail(t.email);
    setFormEmployment(t.employmentStatus);
    setFormPosition(t.position);
    setFormSubject(t.subjectTaught);
    setShowFormModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data guru ini?')) {
      storage.deleteTeacher(id);
      refreshList();
      setToastMsg('Data guru berhasil dihapus.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const teacherData: Teacher = {
      id: editingId || `tch-${Date.now()}`,
      nip: formNip,
      nuptk: formNuptk,
      nik: formNik,
      name: formName,
      frontTitle: formFrontTitle,
      backTitle: formBackTitle,
      gender: formGender,
      birthPlace: formBirthPlace,
      birthDate: formBirthDate,
      address: formAddress,
      phone: formPhone,
      email: formEmail || `${formName.toLowerCase().replace(/\s+/g, '.')}@smpitalhikmah.sch.id`,
      username: formName.toLowerCase().split(' ')[0] + '.guru',
      employmentStatus: formEmployment,
      position: formPosition,
      subjectTaught: formSubject,
      isHomeroomTeacher: formPosition === 'Wali Kelas',
      isActive: true
    };

    storage.saveTeacher(teacherData);
    refreshList();
    setShowFormModal(false);
    setToastMsg(`Data guru ${formName} berhasil disimpan.`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleExportCsv = () => {
    let csv = 'NIP,NUPTK,Nama Lengkap,Gelar Depan,Gelar Belakang,JK,Status Kepegawaian,Jabatan,Mapel,Telepon,Email\n';
    filtered.forEach(t => {
      csv += `"${t.nip}","${t.nuptk}","${t.name}","${t.frontTitle || ''}","${t.backTitle || ''}","${t.gender}","${t.employmentStatus}","${t.position}","${t.subjectTaught}","${t.phone}","${t.email}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `data_guru_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = teachers.filter(t => {
    if (filterPosition !== 'ALL' && t.position !== filterPosition) return false;
    if (filterStatus !== 'ALL' && (filterStatus === 'AKTIF' ? !t.isActive : t.isActive)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match = t.name.toLowerCase().includes(q) || t.nip.includes(q) || t.subjectTaught.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Letterhead on print */}
      <div className="print-only">
        <KopSurat
          profile={schoolProfile}
          title="DAFTAR GURU DAN TENAGA KEPENDIDIKAN"
          subTitle={`Tahun Pelajaran: ${storage.getActiveAcademicYear()?.name || '2025/2026'}`}
        />
      </div>

      {/* Header controls (no-print) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-700" />
              <span>Data Guru & Tenaga Kependidikan</span>
            </h2>
            <p className="text-xs text-slate-500">
              Kelola data guru pengampu, NIP, NUPTK, status kepegawaian, jabatan struktural, dan wali kelas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import CSV</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Guru</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Cari Guru / NIP / Mapel</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari guru..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Jabatan</label>
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-emerald-600 font-medium"
            >
              <option value="ALL">Semua Jabatan</option>
              <option value="Kepala Sekolah">Kepala Sekolah</option>
              <option value="Wakil Kepala">Wakil Kepala</option>
              <option value="Guru">Guru</option>
              <option value="Wali Kelas">Wali Kelas</option>
              <option value="Guru BK">Guru BK</option>
              <option value="Tenaga Kependidikan">Tenaga Kependidikan</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Status Keaktifan</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-emerald-600 font-medium"
            >
              <option value="ALL">Semua Status</option>
              <option value="AKTIF">Aktif</option>
              <option value="NONAKTIF">Non-Aktif</option>
            </select>
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3 w-10 text-center">No</th>
                <th className="p-3">NIP / NUPTK</th>
                <th className="p-3">Nama Lengkap & Gelar</th>
                <th className="p-3 text-center">L/P</th>
                <th className="p-3">Jabatan</th>
                <th className="p-3">Mata Pelajaran</th>
                <th className="p-3">Kepegawaian</th>
                <th className="p-3 text-right no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t, idx) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                  <td className="p-3 font-mono">
                    <div className="font-semibold text-slate-900">{t.nip || '-'}</div>
                    <div className="text-[10px] text-slate-400">{t.nuptk || '-'}</div>
                  </td>
                  <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                    {t.frontTitle ? `${t.frontTitle} ` : ''}{t.name}{t.backTitle ? `, ${t.backTitle}` : ''}
                  </td>
                  <td className="p-3 text-center font-semibold">
                    <span className={t.gender === 'L' ? 'text-blue-600' : 'text-pink-600'}>
                      {t.gender}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-800">{t.position}</td>
                  <td className="p-3 text-emerald-800 font-medium">{t.subjectTaught}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {t.employmentStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right no-print">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setSelectedTeacher(t); setShowDetailModal(true); }}
                        className="p-1 text-slate-500 hover:text-emerald-700"
                        title="Detail"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-1 text-slate-500 hover:text-blue-700"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1 text-slate-500 hover:text-rose-700"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                {editingId ? 'Edit Data Guru' : 'Tambah Guru / Staf Baru'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">NIP</label>
                  <input
                    type="text"
                    value={formNip}
                    onChange={(e) => setFormNip(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">NUPTK</label>
                  <input
                    type="text"
                    value={formNuptk}
                    onChange={(e) => setFormNuptk(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">NIK (KTP)</label>
                  <input
                    type="text"
                    value={formNik}
                    onChange={(e) => setFormNik(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Gelar Depan</label>
                  <input
                    type="text"
                    value={formFrontTitle}
                    onChange={(e) => setFormFrontTitle(e.target.value)}
                    placeholder="Drs. / H. / Dr."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Nama tanpa gelar..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Gelar Belakang</label>
                  <input
                    type="text"
                    value={formBackTitle}
                    onChange={(e) => setFormBackTitle(e.target.value)}
                    placeholder="S.Pd. / M.Pd."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jenis Kelamin</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jabatan</label>
                  <select
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="Kepala Sekolah">Kepala Sekolah</option>
                    <option value="Wakil Kepala">Wakil Kepala</option>
                    <option value="Guru">Guru</option>
                    <option value="Wali Kelas">Wali Kelas</option>
                    <option value="Guru BK">Guru BK</option>
                    <option value="Tenaga Kependidikan">Tenaga Kependidikan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status Kepegawaian</label>
                  <select
                    value={formEmployment}
                    onChange={(e) => setFormEmployment(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="PNS">PNS</option>
                    <option value="PPPK">PPPK</option>
                    <option value="GTY">GTY (Guru Tetap Yayasan)</option>
                    <option value="GTT">GTT (Guru Tidak Tetap)</option>
                    <option value="HONORER">Honorer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mata Pelajaran Utama</label>
                  <input
                    type="text"
                    required
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="Contoh: Matematika"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nomor HP / WhatsApp</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Alamat Rumah</label>
                <textarea
                  rows={2}
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-sm"
                >
                  Simpan Data Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Profil Lengkap Guru</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Nama Lengkap</span>
                <span className="font-bold text-slate-900">
                  {selectedTeacher.frontTitle} {selectedTeacher.name} {selectedTeacher.backTitle}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">NIP / NUPTK</span>
                <span className="font-mono text-slate-900">{selectedTeacher.nip || '-'} / {selectedTeacher.nuptk || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Jabatan</span>
                <span className="font-semibold text-emerald-800">{selectedTeacher.position}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Mata Pelajaran</span>
                <span className="font-semibold">{selectedTeacher.subjectTaught}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Status Kepegawaian</span>
                <span>{selectedTeacher.employmentStatus}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">No. Telepon / WA</span>
                <span className="font-mono">{selectedTeacher.phone || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Email Resmi</span>
                <span>{selectedTeacher.email || '-'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Alamat</span>
                <span className="text-right max-w-xs">{selectedTeacher.address}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        importType="GURU"
        onSuccess={() => {
          refreshList();
          setToastMsg('Import data guru selesai.');
          setTimeout(() => setToastMsg(''), 4000);
        }}
      />
    </div>
  );
};
