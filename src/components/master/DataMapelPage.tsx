import React, { useState } from 'react';
import { BookOpen, Plus, Edit2, X, CheckCircle } from 'lucide-react';
import { Subject } from '../../types';
import { storage } from '../../services/storageService';

export const DataMapelPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>(storage.getSubjects());
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<any>('Matematika');
  const [formHours, setFormHours] = useState(4);
  const [toastMsg, setToastMsg] = useState('');

  const refreshList = () => {
    setSubjects(storage.getSubjects());
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormCode('BK');
    setFormName('Bimbingan Konseling (BK)');
    setFormCategory('Lainnya');
    setFormHours(2);
    setShowModal(true);
  };

  const handleOpenEdit = (s: Subject) => {
    setEditingId(s.id);
    setFormCode(s.code);
    setFormName(s.name);
    setFormCategory(s.category);
    setFormHours(s.weeklyHours);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subjectData: Subject = {
      id: editingId || `sb-${Date.now()}`,
      code: formCode,
      name: formName,
      category: formCategory,
      weeklyHours: formHours,
      isActive: true
    };
    storage.saveSubject(subjectData);
    refreshList();
    setShowModal(false);
    setToastMsg(`Mata pelajaran ${formName} berhasil disimpan.`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-700" />
            <span>Data Mata Pelajaran (Kurikulum)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar mata pelajaran, alokasi jam pelajaran (JP/minggu), dan kelompok bidang studi.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Mata Pelajaran</span>
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
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3 w-16">Kode</th>
                <th className="p-3">Nama Mata Pelajaran</th>
                <th className="p-3">Kelompok</th>
                <th className="p-3 text-center">Beban (JP/Minggu)</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-emerald-800">{s.code}</td>
                  <td className="p-3 font-bold text-slate-900">{s.name}</td>
                  <td className="p-3 text-slate-600">{s.category}</td>
                  <td className="p-3 text-center font-mono font-bold">{s.weeklyHours} JP</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="p-1 text-slate-500 hover:text-blue-700 inline-flex items-center gap-1 font-semibold"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                {editingId ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kode Mapel</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="MTK"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Nama Mata Pelajaran</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Matematika"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kelompok Mapel</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="Pendidikan Agama">Pendidikan Agama</option>
                    <option value="Bahasa">Bahasa</option>
                    <option value="Matematika">Matematika</option>
                    <option value="IPA">IPA</option>
                    <option value="IPS">IPS</option>
                    <option value="PJOK">PJOK</option>
                    <option value="Seni">Seni</option>
                    <option value="Informatika">Informatika</option>
                    <option value="Muatan Lokal">Muatan Lokal</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Beban (JP / Minggu)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formHours}
                    onChange={(e) => setFormHours(parseInt(e.target.value) || 2)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold">
                  Simpan Mapel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
