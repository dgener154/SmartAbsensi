import React, { useState } from 'react';
import { Search, Bell, Menu, Shield, LogOut, RefreshCw, UserCheck, ChevronDown } from 'lucide-react';
import { UserAccount, UserRole } from '../../types';
import { storage } from '../../services/storageService';

interface HeaderProps {
  currentUser: UserAccount;
  onSwitchUser: (user: UserAccount) => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onToggleSidebar: () => void;
  activeMenuTitle: string;
  unreadNotificationsCount: number;
  onResetDemoData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchUser,
  onOpenSearch,
  onOpenNotifications,
  onToggleSidebar,
  activeMenuTitle,
  unreadNotificationsCount,
  onResetDemoData
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const users = storage.getUsers();
  const activeAy = storage.getActiveAcademicYear()?.name || '2025/2026';
  const activeSem = storage.getActiveSemester()?.name || 'Ganjil';

  const roleLabels: Record<UserRole, { label: string; color: string }> = {
    ADMIN: { label: 'Admin', color: 'bg-rose-100 text-rose-800' },
    GURU: { label: 'Guru Mapel', color: 'bg-blue-100 text-blue-800' },
    WALI_KELAS: { label: 'Wali Kelas', color: 'bg-emerald-100 text-emerald-800' },
    SISWA: { label: 'Siswa', color: 'bg-amber-100 text-amber-800' },
    ORANG_TUA: { label: 'Orang Tua', color: 'bg-purple-100 text-purple-800' },
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between no-print">
      {/* Zone 1: Sidebar Toggle + Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900 tracking-tight">
              {activeMenuTitle}
            </span>
            <span className="hidden sm:inline-block text-slate-400">·</span>
            <span className="hidden sm:inline-block text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              TP {activeAy} ({activeSem})
            </span>
          </div>
          <div className="text-xs text-slate-500 hidden md:block">
            SMP IT AL-HIKMAH · SISTEM ABSENSI SEKOLAH TERPADU
          </div>
        </div>
      </div>

      {/* Zone 2: Search shortcut bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-xs mx-6">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200/70 rounded-lg border border-slate-200 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Cari siswa, guru, kelas...</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white rounded border border-slate-300 text-slate-500 shadow-2xs">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Zone 3: Actions & Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile Search button */}
        <button
          onClick={onOpenSearch}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden"
          title="Pencarian Global"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          title="Notifikasi"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          )}
        </button>

        {/* Role Switcher (Simulasi Cepat 5 Role) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs text-slate-800 transition-colors"
            title="Ganti Peran Pengguna (Demo Role Switcher)"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <div className="text-left hidden sm:block">
              <span className="font-semibold block leading-tight truncate max-w-[110px]">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-500">
                {roleLabels[currentUser.role]?.label || currentUser.role}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Pilih Akun Demo (5 Role)
                </p>
                <p className="text-xs text-slate-400">
                  Ganti role seketika untuk menguji tampilan & hak akses:
                </p>
              </div>

              <div className="py-1 space-y-1">
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      u.id === currentUser.id
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-[10px] text-slate-400">
                        user: {u.username}
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${roleLabels[u.role]?.color}`}>
                      {roleLabels[u.role]?.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between px-2">
                <button
                  onClick={() => {
                    if (confirm('Reset seluruh data demo ke kondisi awal?')) {
                      onResetDemoData();
                      setShowRoleMenu(false);
                    }
                  }}
                  className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1 p-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset Database Demo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
