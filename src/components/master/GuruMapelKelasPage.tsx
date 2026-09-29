import React, { useState } from 'react';
import { Share2, Plus, Trash2, X, CheckCircle, School, BookOpen, Users } from 'lucide-react';
import { TeacherAssignment } from '../../types';
import { storage } from '../../services/storageService';

export const GuruMapelKelasPage: React.FC = () => {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>(
    storage.getTeacherAssignments()
  );
  const teachers = storage.getTeachers();
  const subjects = storage.getSubjects();
  const classes = storage.getClasses();
  const activeAy = storage.getActiveAcademicYear()?.id || 'ay-2025-2026';
  const activeSem = storage.getActiveSemester()?.id || 'sem-1';

  const [showModal, setShowModal] = useState(false);
  const [formTeacherId, setFormTeacherId] = useState(teachers[0]?.id || 'tch-2');
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || 'sb-mtk');
  const [formClassId, setFormClassId] = useState(classes[0]?.id || 'cls-7a');
  const [toastMsg, setToastMsg] = useState('');

  const refreshList = () => {
    setAssignments(storage.getTeacherAssignments());
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus penugasan mengajar ini?')) {
      storage.deleteTeacherAssignment(id);
      refreshList();
      setToastMsg('Penugasan guru mengajar berhasil dihapus.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const asgData: TeacherAssignment = {
      id: `asg-${Date.now()}`,
      academicYearId: activeAy,
      semesterId: activeSem,
      teacherId: formTeacherId,
      subjectId: formSubjectId,
      classId: formClassId,
      isActive: true
    };
    storage.saveTeacherAssignment(asgData);
    refreshList();
    setShowModal(false);
    setToastMsg('Penugasan guru mengajar berhasil disimpan.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-700" />
            <span>Pemetaan Guru Mengajar (Guru - Mapel - Kelas)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur relasi penugasan mata pelajaran ke guru dan kelas. Guru hanya dapat melakukan absensi pada kelas yang ditugaskan di sini.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Penugasan Mengajar</span>
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
                <th className="p-3 w-10 text-center">No</th>
                <th className="p-3">Nama Guru Pengampu</th>
                <th className="p-3">Mata Pelajaran</th>
                <th className="p-3">Kelas / Rombel</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.map((asg, idx) => {
                const teacher = storage.getTeacherById(asg.teacherId);
                const subject = storage.getSubjectById(asg.subjectId);
                const classroom = storage.getClassById(asg.classId);

                return (
                  <tr key={asg.id} className="hover:bg-slate-50">
                    <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900">
                      <div>{teacher?.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{teacher?.nip || '-'}</div>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-800">{subject?.name}</span>
                      <span className="text-[10px] text-slate-400 ml-1">({subject?.code})</span>
                    </td>
                    <td className="p-3 font-semibold text-emerald-800">
                      Kelas {classroom?.name}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Aktif
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDelete(asg.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Hapus Relasi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                Tambah Penugasan Guru Mengajar
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pilih Guru</label>
                <select
                  value={formTeacherId}
                  onChange={(e) => setFormTeacherId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.subjectTaught})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pilih Mata Pelajaran</label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>[{s.code}] {s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pilih Kelas / Rombel</label>
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

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold">
                  Simpan Relasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
