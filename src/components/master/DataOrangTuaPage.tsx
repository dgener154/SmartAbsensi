import React, { useState } from 'react';
import { HeartHandshake, Plus, Search, Edit2, Trash2, X, CheckCircle, Users } from 'lucide-react';
import { Parent, Student } from '../../types';
import { storage } from '../../services/storageService';

export const DataOrangTuaPage: React.FC = () => {
  const [parents, setParents] = useState<Parent[]>(storage.getParents());
  const [students] = useState<Student[]>(storage.getStudents());
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [formFatherName, setFormFatherName] = useState('');
  const [formMotherName, setFormMotherName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRelationship, setFormRelationship] = useState('Orang Tua Kandung');
  const [formSelectedStudentIds, setFormSelectedStudentIds] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState('');

  const refreshList = () => {
    setParents(storage.getParents());
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormFatherName('');
    setFormMotherName('');
    setFormPhone('081234567890');
    setFormRelationship('Orang Tua Kandung');
    setFormSelectedStudentIds(students[0] ? [students[0].id] : []);
    setShowModal(true);
  };

  const handleOpenEdit = (p: Parent) => {
    setEditingId(p.id);
    setFormFatherName(p.fatherName && p.fatherName !== '-' ? p.fatherName : '');
    setFormMotherName(p.motherName && p.motherName !== '-' ? p.motherName : '');
    setFormPhone(p.phone || p.fatherPhone || p.motherPhone || '');
    setFormRelationship(p.relationship || 'Orang Tua Kandung');
    setFormSelectedStudentIds(p.studentIds || []);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data orang tua/wali ini?')) {
      const updated = parents.filter(p => p.id !== id);
      storage.saveParents(updated);
      refreshList();
      setToastMsg('Data orang tua berhasil dihapus.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parentData: Parent = {
      id: editingId || `prt-${Date.now()}`,
      fatherName: formFatherName || '-',
      fatherNik: '3174000000000000',
      fatherPhone: formPhone,
      fatherEmail: `${(formFatherName || 'ortu').toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      motherName: formMotherName || '-',
      motherNik: '3174000000000000',
      motherPhone: formPhone,
      motherEmail: '',
      phone: formPhone, // Nomor telepon tunggal perwakilan komunikasi
      relationship: formRelationship,
      username: `ortu.${(formFatherName || formMotherName || 'wali').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)}`,
      isActive: true,
      studentIds: formSelectedStudentIds
    };

    storage.saveParent(parentData);
    refreshList();
    setShowModal(false);
    setToastMsg('Data orang tua/wali berhasil disimpan.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filtered = parents.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const myKids = (p.studentIds || []).map(id => storage.getStudentById(id)).filter(Boolean) as Student[];
    const kidNames = myKids.map(k => k.name.toLowerCase()).join(' ');
    const kidNisns = myKids.map(k => k.nisn.toLowerCase()).join(' ');
    const phone = (p.phone || p.fatherPhone || p.motherPhone || '').toLowerCase();

    return (
      (p.fatherName && p.fatherName.toLowerCase().includes(q)) ||
      (p.motherName && p.motherName.toLowerCase().includes(q)) ||
      phone.includes(q) ||
      kidNames.includes(q) ||
      kidNisns.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-700" />
            <span>Data Orang Tua & Wali Murid</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar perwakilan orang tua murid yang otomatis terhubung dengan data siswa dan NISN anak.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Orang Tua</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari NISN, Nama Siswa, Ayah, Ibu, No Telp..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-emerald-600 font-medium"
            />
          </div>
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            Total: <strong>{filtered.length}</strong> Orang Tua
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            {/* Header sesuai permintaan user: (NISN, NAMA SISWA, NAMA AYAH, NAMA IBU, NO TELEPON) */}
            <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">NISN</th>
                <th className="p-3">NAMA SISWA</th>
                <th className="p-3">NAMA AYAH</th>
                <th className="p-3">NAMA IBU</th>
                <th className="p-3">NO TELEPON</th>
                <th className="p-3 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    Tidak ada data orang tua yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map(p => {
                  const myKids = (p.studentIds || [])
                    .map(id => storage.getStudentById(id))
                    .filter(Boolean) as Student[];
                  const primaryPhone = p.phone || p.fatherPhone || p.motherPhone || '-';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      {/* NISN */}
                      <td className="p-3 font-mono font-medium text-slate-900 align-top">
                        {myKids.length > 0 ? (
                          <div className="space-y-1">
                            {myKids.map(k => (
                              <div key={k.id} className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold text-slate-700 w-fit">
                                {k.nisn || '-'}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>

                      {/* NAMA SISWA */}
                      <td className="p-3 align-top">
                        {myKids.length > 0 ? (
                          <div className="space-y-1.5">
                            {myKids.map(k => (
                              <div key={k.id} className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-slate-900">{k.name}</span>
                                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                                  Kelas {storage.getClassById(k.classId)?.name || k.classId}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum terhubung siswa</span>
                        )}
                      </td>

                      {/* NAMA AYAH */}
                      <td className="p-3 font-medium text-slate-900 align-top">
                        {p.fatherName && p.fatherName !== '-' ? p.fatherName : <span className="text-slate-400">-</span>}
                      </td>

                      {/* NAMA IBU */}
                      <td className="p-3 font-medium text-slate-900 align-top">
                        {p.motherName && p.motherName !== '-' ? p.motherName : <span className="text-slate-400">-</span>}
                      </td>

                      {/* NO TELEPON (Satu nomor perwakilan komunikasi) */}
                      <td className="p-3 font-mono text-emerald-800 font-semibold align-top">
                        {primaryPhone !== '-' ? (
                          <a
                            href={`https://wa.me/${primaryPhone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1"
                            title="Hubungi via WhatsApp / Telepon"
                          >
                            <span>{primaryPhone}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* AKSI */}
                      <td className="p-3 text-right align-top">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
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
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                {editingId ? 'Edit Data Orang Tua / Wali' : 'Tambah Data Orang Tua / Wali'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
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
                  Nomor Telepon / WA (Perwakilan Komunikasi)
                </label>
                <input
                  type="text"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-semibold"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Cukup masukkan satu nomor telepon utama yang aktif untuk komunikasi informasi sekolah dan absensi.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Hubungan dengan Siswa</label>
                <select
                  value={formRelationship}
                  onChange={(e) => setFormRelationship(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  <option value="Orang Tua Kandung">Orang Tua Kandung</option>
                  <option value="Wali Murid">Wali Murid</option>
                  <option value="Kakek/Nenek">Kakek / Nenek</option>
                  <option value="Paman/Bibi">Paman / Bibi</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Pilih Siswa / Anak yang Terhubung ({formSelectedStudentIds.length} terpilih)
                </label>
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1 bg-slate-50">
                  {students.map(st => {
                    const isChecked = formSelectedStudentIds.includes(st.id);
                    return (
                      <label key={st.id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormSelectedStudentIds([...formSelectedStudentIds, st.id]);
                            } else {
                              setFormSelectedStudentIds(formSelectedStudentIds.filter(id => id !== st.id));
                            }
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="text-xs">
                          <span className="font-semibold text-slate-900">{st.name}</span>{' '}
                          <span className="text-slate-500 font-mono">({st.nisn || st.nis})</span> -{' '}
                          <span className="text-emerald-700 font-medium">Kelas {storage.getClassById(st.classId)?.name}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:text-slate-900">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-sm">
                  Simpan Data Orang Tua
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
