import React, { useState } from 'react';
import { School, Plus, Edit2, X, CheckCircle, Users } from 'lucide-react';
import { Classroom, Teacher } from '../../types';
import { storage } from '../../services/storageService';

export const DataKelasPage: React.FC = () => {
  const [classes, setClasses] = useState<Classroom[]>(storage.getClasses());
  const teachers = storage.getTeachers();
  const rooms = storage.getRooms();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState('VII-C');
  const [formGrade, setFormGrade] = useState('7');
  const [formRombel, setFormRombel] = useState('C');
  const [formMajor, setFormMajor] = useState('Reguler Terpadu');
  const [formTeacherId, setFormTeacherId] = useState(teachers[0]?.id || 'tch-2');
  const [formRoomName, setFormRoomName] = useState('Ruang 103');
  const [toastMsg, setToastMsg] = useState('');

  const refreshList = () => {
    setClasses(storage.getClasses());
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormName('VIII-B');
    setFormGrade('8');
    setFormRombel('B');
    setFormMajor('Reguler Terpadu');
    setFormTeacherId(teachers[0]?.id || 'tch-2');
    setFormRoomName('Ruang 202');
    setShowModal(true);
  };

  const handleOpenEdit = (c: Classroom) => {
    setEditingId(c.id);
    setFormName(c.name);
    setFormGrade(c.grade);
    setFormRombel(c.rombel);
    setFormMajor(c.major || 'Reguler Terpadu');
    setFormTeacherId(c.homeroomTeacherId);
    setFormRoomName(c.roomName);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const classData: Classroom = {
      id: editingId || `cls-${Date.now()}`,
      name: formName,
      grade: formGrade,
      rombel: formRombel,
      major: formMajor,
      homeroomTeacherId: formTeacherId,
      academicYearId: 'ay-2025-2026',
      roomName: formRoomName,
      isActive: true
    };

    storage.saveClass(classData);
    refreshList();
    setShowModal(false);
    setToastMsg(`Kelas ${formName} berhasil disimpan.`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <School className="w-5 h-5 text-emerald-700" />
            <span>Data Kelas & Rombongan Belajar (Rombel)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dukung jumlah kelas dan tingkatan yang dinamis beserta penugasan wali kelas dan ruang belajar.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kelas Baru</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Grid Cards of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {classes.map(c => {
          const wali = storage.getTeacherById(c.homeroomTeacherId);
          const studentCount = storage.getStudentsByClass(c.id).length;
          const recap = storage.getClassRecap(c.id);

          return (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-slate-900">Kelas {c.name}</span>
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Tingkat {c.grade}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5">
                <div>Wali Kelas: <strong>{wali?.name || 'Belum Ditentukan'}</strong></div>
                <div>Program / Jurusan: {c.major || 'Umum'}</div>
                <div>Ruang Belajar: {c.roomName}</div>
                <div className="flex items-center gap-1 text-emerald-700 font-semibold pt-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{studentCount} Siswa Terdaftar</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Kehadiran: {recap.avgPercentage}%</span>
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-1 text-slate-500 hover:text-blue-700 flex items-center gap-1 font-semibold"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                {editingId ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Nama Kelas</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: VII-A, VIII-B"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tingkat</label>
                  <input
                    type="text"
                    required
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value)}
                    placeholder="7 / 8 / 9"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Wali Kelas</label>
                <select
                  value={formTeacherId}
                  onChange={(e) => setFormTeacherId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.position})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ruang</label>
                  <input
                    type="text"
                    value={formRoomName}
                    onChange={(e) => setFormRoomName(e.target.value)}
                    placeholder="Ruang 101"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Program / Peminatan</label>
                  <input
                    type="text"
                    value={formMajor}
                    onChange={(e) => setFormMajor(e.target.value)}
                    placeholder="Reguler / Terpadu"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold">
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
