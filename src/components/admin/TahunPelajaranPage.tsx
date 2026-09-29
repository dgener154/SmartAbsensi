import React, { useState } from 'react';
import { Calendar, Plus, CheckCircle2, Check, X } from 'lucide-react';
import { AcademicYear, Semester } from '../../types';
import { storage } from '../../services/storageService';

export const TahunPelajaranPage: React.FC = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(storage.getAcademicYears());
  const [semesters, setSemesters] = useState<Semester[]>(storage.getSemesters());
  const [showModal, setShowModal] = useState(false);
  const [newYearName, setNewYearName] = useState('2026/2027');
  const [startDate, setStartDate] = useState('2026-07-13');
  const [endDate, setEndDate] = useState('2027-06-18');
  const [toastMsg, setToastMsg] = useState('');

  const refreshList = () => {
    setAcademicYears(storage.getAcademicYears());
    setSemesters(storage.getSemesters());
  };

  const handleActivateYear = (id: string) => {
    storage.activateAcademicYear(id);
    refreshList();
    setToastMsg('Tahun pelajaran aktif berhasil diperbarui.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleActivateSemester = (id: string) => {
    storage.activateSemester(id);
    refreshList();
    setToastMsg('Semester aktif berhasil diperbarui.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleAddYear = (e: React.FormEvent) => {
    e.preventDefault();
    const newY: AcademicYear = {
      id: `ay-${Date.now()}`,
      name: newYearName,
      startDate,
      endDate,
      isActive: false,
      notes: 'Tahun Pelajaran Baru'
    };

    const updated = [...academicYears, newY];
    storage.setAcademicYears(updated);
    refreshList();
    setShowModal(false);
    setToastMsg(`Tahun Pelajaran ${newYearName} berhasil ditambahkan.`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-700" />
            <span>Tahun Pelajaran & Semester Aktif</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tahun pelajaran dan semester aktif menjadi dasar penyimpanan jadwal, presensi, dan rekapitulasi data.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tahun Pelajaran</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Grid: Academic Years & Semesters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tahun Pelajaran */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-900">Daftar Tahun Pelajaran</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {academicYears.map(y => (
              <div key={y.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{y.name}</span>
                    {y.isActive && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        SEDANG AKTIF
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Periode: {y.startDate} s.d {y.endDate}
                  </div>
                  {y.notes && <div className="text-[11px] text-slate-400 mt-0.5">{y.notes}</div>}
                </div>

                {!y.isActive && (
                  <button
                    onClick={() => handleActivateYear(y.id)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Aktifkan
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Semester */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-900">Daftar Semester (Tahun Berjalan)</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {semesters.map(s => (
              <div key={s.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Semester {s.name}</span>
                    {s.isActive && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        SEDANG AKTIF
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Mulai: {s.startDate} · Selesai: {s.endDate}
                  </div>
                </div>

                {!s.isActive && (
                  <button
                    onClick={() => handleActivateSemester(s.id)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Aktifkan
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Year Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Tambah Tahun Pelajaran Baru</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddYear} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tahun Pelajaran (Contoh: 2026/2027)</label>
                <input
                  type="text"
                  required
                  value={newYearName}
                  onChange={(e) => setNewYearName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold">
                  Simpan Tahun Pelajaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
