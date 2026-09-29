import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Printer,
  Edit2,
  Trash2,
  ArrowRight,
  X,
  CheckCircle,
  Eye,
  ArrowUpCircle
} from 'lucide-react';
import { Student, StudentStatus, Classroom } from '../../types';
import { storage } from '../../services/storageService';
import { CsvImportModal } from '../common/CsvImportModal';
import { KopSurat } from '../common/KopSurat';

export const DataSiswaPage: React.FC = () => {
  const classes = storage.getClasses();
  const schoolProfile = storage.getSchoolProfile();

  const [students, setStudents] = useState<Student[]>(storage.getStudents());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterGender, setFilterGender] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Modals
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showNaikKelasModal, setShowNaikKelasModal] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formNis, setFormNis] = useState('');
  const [formNisn, setFormNisn] = useState('');
  const [formNik, setFormNik] = useState('');
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<'L' | 'P'>('L');
  const [formBirthPlace, setFormBirthPlace] = useState('Jakarta');
  const [formBirthDate, setFormBirthDate] = useState('2012-01-01');
  const [formReligion, setFormReligion] = useState('Islam');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formClassId, setFormClassId] = useState(classes[0]?.id || 'cls-7a');
  const [formStatus, setFormStatus] = useState<StudentStatus>('AKTIF');

  // Orang tua form state
  const [formFatherName, setFormFatherName] = useState('');
  const [formMotherName, setFormMotherName] = useState('');
  const [formParentPhone, setFormParentPhone] = useState('');

  // Naik kelas target state
  const [targetClassId, setTargetClassId] = useState<string>(classes[0]?.id || 'cls-7a');

  const [toastMsg, setToastMsg] = useState<string>('');

  const refreshList = () => {
    setStudents(storage.getStudents());
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormNis(`252607${String(students.length + 1).padStart(3, '0')}`);
    setFormNisn(`011234${String(students.length + 1).padStart(4, '0')}`);
    setFormNik('3174000000000000');
    setFormName('');
    setFormGender('L');
    setFormBirthPlace('Jakarta');
    setFormBirthDate('2012-01-01');
    setFormReligion('Islam');
    setFormAddress('Jl. Kemang Timur No. 10');
    setFormPhone('081234567890');
    setFormEmail('');
    setFormClassId(classes[0]?.id || 'cls-7a');
    setFormStatus('AKTIF');
    setFormFatherName('');
    setFormMotherName('');
    setFormParentPhone('081234567890');
    setShowFormModal(true);
  };

  const handleOpenEdit = (st: Student) => {
    setEditingId(st.id);
    setFormNis(st.nis);
    setFormNisn(st.nisn);
    setFormNik(st.nik);
    setFormName(st.name);
    setFormGender(st.gender);
    setFormBirthPlace(st.birthPlace);
    setFormBirthDate(st.birthDate);
    setFormReligion(st.religion);
    setFormAddress(st.address);
    setFormPhone(st.phone);
    setFormEmail(st.email);
    setFormClassId(st.classId);
    setFormStatus(st.status);

    const parent = st.parentId
      ? storage.getParentById(st.parentId)
      : storage.getParents().find(p => p.studentIds.includes(st.id));
    setFormFatherName(parent?.fatherName && parent.fatherName !== '-' ? parent.fatherName : '');
    setFormMotherName(parent?.motherName && parent.motherName !== '-' ? parent.motherName : '');
    setFormParentPhone(parent?.phone || parent?.fatherPhone || parent?.motherPhone || st.phone || '');

    setShowFormModal(true);
  };

  const handleOpenDetail = (st: Student) => {
    setSelectedStudent(st);
    setShowDetailModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
      storage.deleteStudent(id);
      refreshList();
      setToastMsg('Data siswa berhasil dihapus.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const stData: Student = {
      id: editingId || `std-${Date.now()}`,
      nis: formNis,
      nisn: formNisn,
      nik: formNik,
      name: formName,
      nickName: formName.split(' ')[0],
      gender: formGender,
      birthPlace: formBirthPlace,
      birthDate: formBirthDate,
      religion: formReligion,
      address: formAddress,
      village: 'Bangka',
      district: 'Mampang Prapatan',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      familyCardNo: '3174000000000000',
      phone: formPhone || formParentPhone,
      email: formEmail || `${formNis}@siswa.smpitalhikmah.sch.id`,
      classId: formClassId,
      rombel: 'A',
      entryYear: '2025',
      status: formStatus
    };

    // Auto-sync ke Data Orang Tua
    storage.saveStudent(stData, {
      fatherName: formFatherName,
      motherName: formMotherName,
      phone: formParentPhone || formPhone
    });

    refreshList();
    setShowFormModal(false);
    setToastMsg(`Data siswa ${formName} & data orang tua berhasil disimpan.`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Naik Kelas / Pindah Kelas Massal
  const handleBulkPromote = () => {
    if (!filterClass || filterClass === 'ALL') {
      alert('Pilih kelas asal terlebih dahulu pada filter kelas.');
      return;
    }
    setShowNaikKelasModal(true);
  };

  const executePromote = () => {
    const studentsInClass = students.filter(s => s.classId === filterClass);
    studentsInClass.forEach(s => {
      storage.saveStudent({
        ...s,
        classId: targetClassId
      });
    });
    refreshList();
    setShowNaikKelasModal(false);
    const originCls = classes.find(c => c.id === filterClass)?.name;
    const destCls = classes.find(c => c.id === targetClassId)?.name;
    setToastMsg(`Berhasil memindahkan ${studentsInClass.length} siswa dari Kelas ${originCls} ke Kelas ${destCls}.`);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleExportCsv = () => {
    let csv = 'NIS,NISN,NIK,Nama Lengkap,Jenis Kelamin,Tempat Lahir,Tanggal Lahir,Agama,Alamat,Kelas,Status,Nama Ayah,Nama Ibu,No Telepon\n';
    filtered.forEach(s => {
      const cls = storage.getClassById(s.classId);
      const parent = s.parentId ? storage.getParentById(s.parentId) : storage.getParents().find(p => p.studentIds.includes(s.id));
      const fName = parent?.fatherName || '-';
      const mName = parent?.motherName || '-';
      const phone = parent?.phone || parent?.fatherPhone || s.phone || '-';

      csv += `"${s.nis}","${s.nisn}","${s.nik}","${s.name}","${s.gender}","${s.birthPlace}","${s.birthDate}","${s.religion}","${s.address}","${cls?.name || '-'}","${s.status}","${fName}","${mName}","${phone}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `data_siswa_dan_orangtua_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter
  const filtered = students.filter(s => {
    if (filterClass !== 'ALL' && s.classId !== filterClass) return false;
    if (filterGender !== 'ALL' && s.gender !== filterGender) return false;
    if (filterStatus !== 'ALL' && s.status !== filterStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match = s.name.toLowerCase().includes(q) || s.nis.includes(q) || s.nisn.includes(q);
      if (!match) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Letterhead on print */}
      <div className="print-only">
        <KopSurat
          profile={schoolProfile}
          title="DAFTAR INDUK DATA SISWA"
          subTitle={`Tahun Pelajaran: ${storage.getActiveAcademicYear()?.name || '2025/2026'}`}
        />
      </div>

      {/* Header controls (no-print) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-700" />
              <span>Data Induk Siswa & Rombel</span>
            </h2>
            <p className="text-xs text-slate-500">
              Kelola data profil siswa, nomor identitas (NIS/NISN/NIK), pindah kelas, kenaikan tingkat, dan status keaktifan.
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
              onClick={handleBulkPromote}
              className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="Pindah / Naik Kelas Siswa Satu Rombel"
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              <span>Naik / Pindah Kelas</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Siswa</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Cari Nama / NIS / NISN</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Cari siswa..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-emerald-600 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Filter Kelas</label>
            <select
              value={filterClass}
              onChange={(e) => { setFilterClass(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-emerald-600 font-medium"
            >
              <option value="ALL">Semua Kelas</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>Kelas {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Jenis Kelamin</label>
            <select
              value={filterGender}
              onChange={(e) => { setFilterGender(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-emerald-600 font-medium"
            >
              <option value="ALL">Semua L/P</option>
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Status Siswa</label>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-emerald-600 font-medium"
            >
              <option value="ALL">Semua Status</option>
              <option value="AKTIF">Aktif</option>
              <option value="MUTASI_MASUK">Mutasi Masuk</option>
              <option value="MUTASI_KELUAR">Mutasi Keluar</option>
              <option value="LULUS">Lulus</option>
              <option value="TIDAK_AKTIF">Tidak Aktif</option>
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
                <th className="p-3">NIS / NISN</th>
                <th className="p-3">Nama Lengkap Siswa</th>
                <th className="p-3 text-center">L/P</th>
                <th className="p-3">Kelas</th>
                <th className="p-3">TTL</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Tidak ditemukan data siswa yang sesuai filter.
                  </td>
                </tr>
              ) : (
                paginated.map((st, idx) => {
                  const cls = storage.getClassById(st.classId);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="p-3 text-center font-mono text-slate-400">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="p-3 font-mono">
                        <div className="font-semibold text-slate-900">{st.nis}</div>
                        <div className="text-[10px] text-slate-400">{st.nisn}</div>
                      </td>
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                        {st.name}
                      </td>
                      <td className="p-3 text-center font-semibold">
                        <span className={st.gender === 'L' ? 'text-blue-600' : 'text-pink-600'}>
                          {st.gender}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-emerald-800">
                        Kelas {cls?.name || '-'}
                      </td>
                      <td className="p-3 whitespace-nowrap text-slate-600">
                        {st.birthPlace}, {st.birthDate}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          st.status === 'AKTIF'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {st.status}
                        </span>
                      </td>
                      <td className="p-3 text-right no-print">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenDetail(st)}
                            className="p-1 text-slate-500 hover:text-emerald-700"
                            title="Detail Siswa"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(st)}
                            className="p-1 text-slate-500 hover:text-blue-700"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(st.id)}
                            className="p-1 text-slate-500 hover:text-rose-700"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 no-print">
          <div>
            Menampilkan {paginated.length} dari {filtered.length} siswa
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono">Hal. {currentPage} / {totalPages}</span>
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              className="px-2 py-1 bg-white border border-slate-200 rounded disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              className="px-2 py-1 bg-white border border-slate-200 rounded disabled:opacity-40"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Form Add/Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                {editingId ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 overflow-y-auto flex-1 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">NIS (Nomor Induk)</label>
                  <input
                    type="text"
                    required
                    value={formNis}
                    onChange={(e) => setFormNis(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">NISN Nasional</label>
                  <input
                    type="text"
                    required
                    value={formNisn}
                    onChange={(e) => setFormNisn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">NIK Siswa (KTP/KK)</label>
                  <input
                    type="text"
                    value={formNik}
                    onChange={(e) => setFormNik(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Muhammad Rizky Pratama"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                />
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
                  <label className="block text-slate-700 font-semibold mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formBirthPlace}
                    onChange={(e) => setFormBirthPlace(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formBirthDate}
                    onChange={(e) => setFormBirthDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kelas / Rombel</label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>Kelas {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status Keaktifan</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="AKTIF">Aktif</option>
                    <option value="MUTASI_MASUK">Mutasi Masuk</option>
                    <option value="MUTASI_KELUAR">Mutasi Keluar</option>
                    <option value="LULUS">Lulus</option>
                    <option value="TIDAK_AKTIF">Tidak Aktif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nomor Telepon / WA</label>
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
                <label className="block text-slate-700 font-semibold mb-1">Alamat Tempat Tinggal</label>
                <textarea
                  rows={2}
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Jl. Kemang Timur No..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              {/* Data Orang Tua (Satu Paket dengan Data Siswa) */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-emerald-800">
                    <span>Data Orang Tua / Wali Murid</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Otomatis sinkron ke menu Data Orang Tua</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Nama Ayah</label>
                    <input
                      type="text"
                      value={formFatherName}
                      onChange={(e) => setFormFatherName(e.target.value)}
                      placeholder="Nama lengkap ayah..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Nama Ibu</label>
                    <input
                      type="text"
                      value={formMotherName}
                      onChange={(e) => setFormMotherName(e.target.value)}
                      placeholder="Nama lengkap ibu..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    No. Telepon / WA Komunikasi Orang Tua
                  </label>
                  <input
                    type="text"
                    value={formParentPhone}
                    onChange={(e) => setFormParentPhone(e.target.value)}
                    placeholder="Contoh: 081234567890 (satu nomor perwakilan)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-medium"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Nomor ini menjadi satu-satunya kontak utama untuk komunikasi presensi dan pengumuman sekolah.
                  </p>
                </div>
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
                  Simpan Data Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Biodata Lengkap Siswa</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Nama Siswa</span>
                <span className="font-bold text-slate-900">{selectedStudent.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">NIS / NISN</span>
                <span className="font-mono text-slate-900">{selectedStudent.nis} / {selectedStudent.nisn}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Kelas</span>
                <span className="font-semibold text-emerald-800">
                  Kelas {storage.getClassById(selectedStudent.classId)?.name}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Jenis Kelamin</span>
                <span>{selectedStudent.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Tempat, Tanggal Lahir</span>
                <span>{selectedStudent.birthPlace}, {selectedStudent.birthDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Agama</span>
                <span>{selectedStudent.religion}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Telepon</span>
                <span className="font-mono">{selectedStudent.phone || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Email Siswa</span>
                <span>{selectedStudent.email || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Alamat</span>
                <span className="text-right max-w-xs">{selectedStudent.address}</span>
              </div>
              {(() => {
                const parent = selectedStudent.parentId
                  ? storage.getParentById(selectedStudent.parentId)
                  : storage.getParents().find(p => p.studentIds.includes(selectedStudent.id));
                return (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 my-2">
                    <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide text-emerald-800">
                      Data Kontak Orang Tua
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nama Ayah:</span>
                      <span className="font-semibold text-slate-900">{parent?.fatherName || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nama Ibu:</span>
                      <span className="font-semibold text-slate-900">{parent?.motherName || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">No. Telepon:</span>
                      <span className="font-mono font-bold text-emerald-700">{parent?.phone || parent?.fatherPhone || selectedStudent.phone || '-'}</span>
                    </div>
                  </div>
                );
              })()}
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Status Keaktifan</span>
                <span className="font-bold text-emerald-700">{selectedStudent.status}</span>
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

      {/* Naik/Pindah Kelas Modal */}
      {showNaikKelasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">
              Proses Naik / Pindah Kelas Satu Rombel
            </h3>
            <p className="text-slate-600">
              Seluruh siswa dari kelas <strong>{classes.find(c => c.id === filterClass)?.name}</strong> akan dialihkan ke kelas tujuan:
            </p>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Kelas Tujuan</label>
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>Kelas {c.name}</option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setShowNaikKelasModal(false)} className="px-3 py-1.5 text-slate-600">
                Batal
              </button>
              <button
                onClick={executePromote}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold"
              >
                Konfirmasi Pindah Kelas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        importType="SISWA"
        onSuccess={() => {
          refreshList();
          setToastMsg('Import data siswa via CSV berhasil diselesaikan.');
          setTimeout(() => setToastMsg(''), 4000);
        }}
      />
    </div>
  );
};
