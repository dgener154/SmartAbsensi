import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  UserCheck,
  History,
  BarChart3,
  Calendar,
  Clock,
  FileText,
  Users,
  GraduationCap,
  School,
  BookOpen,
  DoorOpen,
  Share2,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  ClipboardList,
  LogOut,
  QrCode,
  HeartHandshake,
  Layers
} from 'lucide-react';
import { UserRole } from '../../types';
import { storage } from '../../services/storageService';

interface SidebarProps {
  currentRole: UserRole;
  activeMenu: string;
  onSelectMenu: (menu: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  schoolName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeMenu,
  onSelectMenu,
  isOpen,
  onCloseMobile,
  onLogout,
  schoolName
}) => {
  // Navigation items grouped by category with role permissions
  const navSections = [
    {
      title: 'UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'GURU', 'WALI_KELAS', 'SISWA', 'ORANG_TUA'] }
      ]
    },
    {
      title: 'ABSENSI & KEHADIRAN',
      items: [
        { id: 'absensi_siswa', label: 'Absensi Siswa', icon: CalendarCheck, roles: ['ADMIN', 'GURU', 'WALI_KELAS'] },
        { id: 'absensi_guru', label: 'Absensi Guru (GPS/QR)', icon: UserCheck, roles: ['ADMIN', 'GURU', 'WALI_KELAS'] },
        { id: 'qr_scanner', label: 'Scanner QR Presensi', icon: QrCode, roles: ['ADMIN', 'GURU', 'WALI_KELAS', 'SISWA'] },
        { id: 'riwayat_absensi', label: 'Riwayat Absensi', icon: History, roles: ['ADMIN', 'GURU', 'WALI_KELAS', 'SISWA', 'ORANG_TUA'] },
        { id: 'rekap_absensi', label: 'Rekap Presensi', icon: BarChart3, roles: ['ADMIN', 'GURU', 'WALI_KELAS'] }
      ]
    },
    {
      title: 'JADWAL & SESI',
      items: [
        { id: 'jadwal', label: 'Jadwal Pelajaran', icon: Calendar, roles: ['ADMIN', 'GURU', 'WALI_KELAS', 'SISWA', 'ORANG_TUA'] },
        { id: 'template_jadwal', label: 'Template Jadwal (Slot)', icon: Layers, roles: ['ADMIN'] },
        { id: 'sesi_jam', label: 'Jam Pelajaran / Sesi', icon: Clock, roles: ['ADMIN'] }
      ]
    },
    {
      title: 'PENGAJUAN & DISPENSASI',
      items: [
        { id: 'pengajuan_izin', label: 'Izin & Sakit Siswa', icon: FileText, roles: ['ADMIN', 'GURU', 'WALI_KELAS', 'SISWA', 'ORANG_TUA'] }
      ]
    },
    {
      title: 'DATA MASTER',
      items: [
        { id: 'master_siswa', label: 'Data Siswa', icon: GraduationCap, roles: ['ADMIN', 'WALI_KELAS'] },
        { id: 'master_guru', label: 'Data Guru', icon: Users, roles: ['ADMIN'] },
        { id: 'master_orang_tua', label: 'Data Orang Tua', icon: HeartHandshake, roles: ['ADMIN'] },
        { id: 'master_kelas', label: 'Data Kelas & Rombel', icon: School, roles: ['ADMIN'] },
        { id: 'master_mapel', label: 'Mata Pelajaran', icon: BookOpen, roles: ['ADMIN'] },
        { id: 'master_ruang', label: 'Data Ruang', icon: DoorOpen, roles: ['ADMIN'] },
        { id: 'master_guru_mapel', label: 'Guru Mengajar (Mapel)', icon: Share2, roles: ['ADMIN'] }
      ]
    },
    {
      title: 'LAPORAN & DOKUMEN',
      items: [
        { id: 'laporan', label: 'Laporan Presensi Sekolah', icon: FileSpreadsheet, roles: ['ADMIN', 'GURU', 'WALI_KELAS'] }
      ]
    },
    {
      title: 'ADMINISTRASI & SISTEM',
      items: [
        { id: 'tahun_pelajaran', label: 'Tahun Pelajaran & Sem.', icon: Calendar, roles: ['ADMIN'] },
        { id: 'manajemen_user', label: 'Pengguna & Akses (RBAC)', icon: ShieldCheck, roles: ['ADMIN'] },
        { id: 'audit_log', label: 'Audit Log Aktivitas', icon: ClipboardList, roles: ['ADMIN'] },
        { id: 'pengaturan', label: 'Pengaturan Sekolah & GPS', icon: Settings, roles: ['ADMIN'] }
      ]
    }
  ];

  const handleSelect = (id: string) => {
    onSelectMenu(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand / Logo */}
        <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-800 bg-slate-950/60">
          {storage.getSchoolProfile()?.logoUrl ? (
            <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
              <img
                src={storage.getSchoolProfile().logoUrl}
                alt="Logo Sekolah"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
              <School className="w-5 h-5" />
            </div>
          )}
          <div className="overflow-hidden">
            <h1 className="text-xs font-bold tracking-tight text-white uppercase truncate">
              {schoolName}
            </h1>
            <p className="text-[10px] text-emerald-400 font-mono tracking-wider">
              SISTEM ABSENSI SEKOLAH
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {navSections.map((section, sIdx) => {
            const visibleItems = section.items.filter(item => item.roles.includes(currentRole));
            if (visibleItems.length === 0) return null;

            return (
              <div key={sIdx} className="space-y-1">
                <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* User Footer / Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Aplikasi</span>
          </button>
        </div>
      </aside>
    </>
  );
};
