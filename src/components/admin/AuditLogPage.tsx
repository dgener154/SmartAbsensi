import React, { useState } from 'react';
import { ClipboardList, Search, Filter, ShieldCheck, Clock, ShieldAlert } from 'lucide-react';
import { AuditLog } from '../../types';
import { storage } from '../../services/storageService';

export const AuditLogPage: React.FC = () => {
  const [logs] = useState<AuditLog[]>(storage.getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState('ALL');

  const filtered = logs.filter(l => {
    if (filterModule !== 'ALL' && l.module !== filterModule) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match = l.userName.toLowerCase().includes(q) ||
                    l.details.toLowerCase().includes(q) ||
                    l.action.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const modules = Array.from(new Set(logs.map(l => l.module)));

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-700" />
            <span>Audit Log & Jejak Aktivitas Sistem</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log permanen (append-only) mencatat riwayat perubahan data absensi, persetujuan izin, dan aktivitas administratif.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Audit Log Dilindungi (Read-Only)</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari user, aksi, rincian log..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-emerald-600 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="text-slate-600 font-semibold">Filter Modul:</label>
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
          >
            <option value="ALL">Semua Modul</option>
            {modules.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Waktu Kejadian</th>
                <th className="p-3">Pengguna</th>
                <th className="p-3">Peran (Role)</th>
                <th className="p-3">Modul</th>
                <th className="p-3">Aksi</th>
                <th className="p-3">Rincian Perubahan Data</th>
                <th className="p-3 font-mono">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 font-sans">
                  <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                    {log.userName}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-emerald-800 whitespace-nowrap">{log.module}</td>
                  <td className="p-3 font-mono font-semibold text-slate-700 whitespace-nowrap">{log.action}</td>
                  <td className="p-3 text-slate-700 max-w-md">
                    <div>{log.details}</div>
                    {log.previousData && (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Sebelum: <span className="font-mono text-rose-700">{log.previousData}</span>
                      </div>
                    )}
                    {log.newData && (
                      <div className="text-[10px] text-slate-400">
                        Sesudah: <span className="font-mono text-emerald-700">{log.newData}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-mono text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
