import React, { useState } from 'react';
import { ShieldCheck, Plus, Edit2, KeyRound, CheckCircle, X, Users } from 'lucide-react';
import { UserAccount, UserRole } from '../../types';
import { storage } from '../../services/storageService';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>(storage.getUsers());
  const teachers = storage.getTeachers();
  const students = storage.getStudents();
  const parents = storage.getParents();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('GURU');
  const [formRelatedTeacherId, setFormRelatedTeacherId] = useState('');
  const [formRelatedStudentId, setFormRelatedStudentId] = useState('');
  const [formRelatedParentId, setFormRelatedParentId] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const refreshList = () => {
    setUsers(storage.getUsers());
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormUsername('');
    setFormPassword('sekolah123');
    setFormName('');
    setFormEmail('');
    setFormRole('GURU');
    setFormRelatedTeacherId(teachers[0]?.id || '');
    setShowModal(true);
  };

  const handleOpenEdit = (u: UserAccount) => {
    setEditingId(u.id);
    setFormUsername(u.username);
    setFormPassword(u.password || '');
    setFormName(u.name);
    setFormEmail(u.email);
    setFormRole(u.role);
    setFormRelatedTeacherId(u.relatedTeacherId || '');
    setFormRelatedStudentId(u.relatedStudentId || '');
    setFormRelatedParentId(u.relatedParentId || '');
    setShowModal(true);
  };

  const handleResetPassword = (u: UserAccount) => {
    const newPass = prompt(`Reset kata sandi untuk pengguna ${u.username}:`, 'sekolah123');
    if (newPass) {
      storage.saveUser({
        ...u,
        password: newPass
      });
      refreshList();
      setToastMsg(`Kata sandi untuk ${u.username} berhasil direset.`);
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userData: UserAccount = {
      id: editingId || `usr-${Date.now()}`,
      username: formUsername,
      password: formPassword,
      name: formName,
      email: formEmail,
      role: formRole,
      relatedTeacherId: formRole === 'GURU' || formRole === 'WALI_KELAS' ? formRelatedTeacherId : undefined,
      relatedStudentId: formRole === 'SISWA' ? formRelatedStudentId : undefined,
      relatedParentId: formRole === 'ORANG_TUA' ? formRelatedParentId : undefined,
      isActive: true
    };

    storage.saveUser(userData);
    refreshList();
    setShowModal(false);
    setToastMsg(`Akun pengguna ${formUsername} berhasil disimpan.`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const roleBadges: Record<UserRole, string> = {
    ADMIN: 'bg-rose-100 text-rose-800',
    GURU: 'bg-blue-100 text-blue-800',
    WALI_KELAS: 'bg-emerald-100 text-emerald-800',
    SISWA: 'bg-amber-100 text-amber-800',
    ORANG_TUA: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>Manajemen Pengguna & Hak Akses (RBAC)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola akun otentikasi login untuk Admin, Guru, Wali Kelas, Siswa, dan Orang Tua/Wali Murid.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Username</th>
                <th className="p-3">Nama Lengkap</th>
                <th className="p-3">Email Akun</th>
                <th className="p-3">Peran (Role)</th>
                <th className="p-3">Entitas Terhubung</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => {
                let relatedInfo = '-';
                if (u.relatedTeacherId) {
                  const t = storage.getTeacherById(u.relatedTeacherId);
                  relatedInfo = `Guru: ${t?.name}`;
                } else if (u.relatedStudentId) {
                  const s = storage.getStudentById(u.relatedStudentId);
                  relatedInfo = `Siswa: ${s?.name}`;
                } else if (u.relatedParentId) {
                  const p = storage.getParentById(u.relatedParentId);
                  relatedInfo = `Wali: ${p?.fatherName || p?.motherName}`;
                }

                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{u.username}</td>
                    <td className="p-3 font-medium text-slate-900">{u.name}</td>
                    <td className="p-3 text-slate-500">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${roleBadges[u.role] || 'bg-slate-100'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{relatedInfo}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Aktif
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleResetPassword(u)}
                          className="p-1 text-slate-400 hover:text-amber-600"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1 text-slate-400 hover:text-blue-700"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                {editingId ? 'Edit Akun Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Username Login</label>
                <input
                  type="text"
                  required
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Tampilan</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Peran (Role Akses)</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  <option value="ADMIN">ADMIN (Akses Penuh Sistem)</option>
                  <option value="GURU">GURU (Presensi & Jadwal Mengajar)</option>
                  <option value="WALI_KELAS">WALI_KELAS (Kelas Binaan & Rekap)</option>
                  <option value="SISWA">SISWA (Presensi & Jadwal Pribadi)</option>
                  <option value="ORANG_TUA">ORANG_TUA (Portal Presensi Anak)</option>
                </select>
              </div>

              {(formRole === 'GURU' || formRole === 'WALI_KELAS') && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tautkan Data Guru</label>
                  <select
                    value={formRelatedTeacherId}
                    onChange={(e) => setFormRelatedTeacherId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="">-- Pilih Guru --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.position})</option>
                    ))}
                  </select>
                </div>
              )}

              {formRole === 'SISWA' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tautkan Data Siswa</label>
                  <select
                    value={formRelatedStudentId}
                    onChange={(e) => setFormRelatedStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>
                    ))}
                  </select>
                </div>
              )}

              {formRole === 'ORANG_TUA' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tautkan Data Orang Tua</label>
                  <select
                    value={formRelatedParentId}
                    onChange={(e) => setFormRelatedParentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="">-- Pilih Orang Tua --</option>
                    {parents.map(p => (
                      <option key={p.id} value={p.id}>{p.fatherName || p.motherName}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold">
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
