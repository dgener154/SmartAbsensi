import React, { useState } from 'react';
import { DoorOpen, Plus, Edit2, X, CheckCircle } from 'lucide-react';
import { Room } from '../../types';
import { storage } from '../../services/storageService';

export const DataRuangPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>(storage.getRooms());
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formCapacity, setFormCapacity] = useState(32);
  const [formType, setFormType] = useState<any>('Kelas');
  const [toastMsg, setToastMsg] = useState('');

  const refreshList = () => {
    setRooms(storage.getRooms());
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormName('Ruang Multimedia');
    setFormNumber('303');
    setFormCapacity(36);
    setFormType('Laboratorium');
    setShowModal(true);
  };

  const handleOpenEdit = (r: Room) => {
    setEditingId(r.id);
    setFormName(r.name);
    setFormNumber(r.roomNumber);
    setFormCapacity(r.capacity);
    setFormType(r.type);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rData: Room = {
      id: editingId || `rm-${Date.now()}`,
      name: formName,
      roomNumber: formNumber,
      capacity: formCapacity,
      type: formType,
      isActive: true
    };
    storage.saveRoom(rData);
    refreshList();
    setShowModal(false);
    setToastMsg(`Ruang ${formName} berhasil disimpan.`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-emerald-700" />
            <span>Data Ruang Belajar & Fasilitas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar ruang kelas, laboratorium, perpustakaan, aula, dan lapangan sarana pembelajaran.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Ruang Baru</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {rooms.map(r => (
          <div key={r.id} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">{r.name}</span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                No. {r.roomNumber}
              </span>
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <div>Jenis: <strong>{r.type}</strong></div>
              <div>Kapasitas Maksimal: <span className="font-mono">{r.capacity}</span> siswa</div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => handleOpenEdit(r)}
                className="text-xs text-slate-500 hover:text-blue-700 flex items-center gap-1 font-semibold"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                {editingId ? 'Edit Data Ruang' : 'Tambah Ruang Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Ruang</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Lab Komputer 2"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nomor Ruang / Kode</label>
                  <input
                    type="text"
                    required
                    value={formNumber}
                    onChange={(e) => setFormNumber(e.target.value)}
                    placeholder="101"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kapasitas (Orang)</label>
                  <input
                    type="number"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Jenis Ruang</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  <option value="Kelas">Kelas</option>
                  <option value="Laboratorium">Laboratorium</option>
                  <option value="Perpustakaan">Perpustakaan</option>
                  <option value="Aula">Aula</option>
                  <option value="Lapangan">Lapangan</option>
                  <option value="Ruang Guru">Ruang Guru</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold">
                  Simpan Ruang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
