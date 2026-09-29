import React, { useState, useEffect } from 'react';
import { UserAccount, UserRole } from './types';
import { storage } from './services/storageService';

// Layout & Common
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

// Auth
import { LoginPage } from './components/auth/LoginPage';

// Dashboards
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { GuruDashboard } from './components/dashboards/GuruDashboard';
import { WaliKelasDashboard } from './components/dashboards/WaliKelasDashboard';
import { SiswaDashboard } from './components/dashboards/SiswaDashboard';
import { OrangTuaDashboard } from './components/dashboards/OrangTuaDashboard';

// Attendance
import { AbsensiSiswaPage } from './components/attendance/AbsensiSiswaPage';
import { AbsensiGuruPage } from './components/attendance/AbsensiGuruPage';
import { QrAttendancePage } from './components/attendance/QrAttendancePage';
import { RiwayatAbsensiPage } from './components/attendance/RiwayatAbsensiPage';
import { RekapAbsensiPage } from './components/attendance/RekapAbsensiPage';

// Leaves
import { PengajuanIzinPage } from './components/leaves/PengajuanIzinPage';

// Schedule
import { JadwalPelajaranPage } from './components/schedule/JadwalPelajaranPage';
import { JamPelajaranPage } from './components/schedule/JamPelajaranPage';
import { TemplateJadwalPage } from './components/schedule/TemplateJadwalPage';

// Master Data
import { DataSiswaPage } from './components/master/DataSiswaPage';
import { DataGuruPage } from './components/master/DataGuruPage';
import { DataOrangTuaPage } from './components/master/DataOrangTuaPage';
import { DataKelasPage } from './components/master/DataKelasPage';
import { DataMapelPage } from './components/master/DataMapelPage';
import { DataRuangPage } from './components/master/DataRuangPage';
import { GuruMapelKelasPage } from './components/master/GuruMapelKelasPage';

// Reports & Administration
import { LaporanPage } from './components/reports/LaporanPage';
import { TahunPelajaranPage } from './components/admin/TahunPelajaranPage';
import { UserManagementPage } from './components/admin/UserManagementPage';
import { AuditLogPage } from './components/admin/AuditLogPage';
import { PengaturanSekolahPage } from './components/admin/PengaturanSekolahPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    return storage.getCurrentUser();
  });

  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [menuParams, setMenuParams] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState(() => storage.getNotifications());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const school = storage.getSchoolProfile();

  const handleRefresh = () => {
    setNotifications(storage.getNotifications());
    setRefreshTrigger(prev => prev + 1);
  };

  const handleNavigate = (menu: string, params?: any) => {
    setActiveMenu(menu);
    setMenuParams(params || null);
    setIsSidebarOpen(false);
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    storage.setCurrentUser(user);
    setActiveMenu('dashboard');
    handleRefresh();
  };

  const handleLogout = () => {
    storage.logout();
    setCurrentUser(null);
  };

  const handleSwitchUser = (user: UserAccount) => {
    storage.setCurrentUser(user);
    setCurrentUser(user);
    setActiveMenu('dashboard');
    handleRefresh();
  };

  const handleResetDemoData = () => {
    storage.initDatabase(true);
    setCurrentUser(storage.getCurrentUser());
    setActiveMenu('dashboard');
    handleRefresh();
    alert('Database demo berhasil direset ke kondisi awal.');
  };

  const handleSelectSearchResult = (category: string, id: string) => {
    if (category === 'students') {
      handleNavigate('master_siswa');
    } else if (category === 'teachers') {
      handleNavigate('master_guru');
    } else if (category === 'classes') {
      handleNavigate('master_kelas');
    } else if (category === 'subjects') {
      handleNavigate('master_mapel');
    } else if (category === 'schedule') {
      handleNavigate('jadwal');
    }
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Determine current active page title for header breadcrumb
  const menuTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    absensi_siswa: 'Absensi Siswa',
    absensi_guru: 'Absensi Guru (GPS/QR)',
    qr_scanner: 'Scanner QR Presensi',
    riwayat_absensi: 'Riwayat Presensi',
    rekap_absensi: 'Rekap Presensi',
    jadwal: 'Jadwal Pelajaran',
    template_jadwal: 'Template Slot Jadwal Pelajaran',
    sesi_jam: 'Jam Pelajaran & Sesi',
    pengajuan_izin: 'Pengajuan Izin & Sakit',
    master_siswa: 'Data Siswa',
    master_guru: 'Data Guru',
    master_orang_tua: 'Data Orang Tua',
    master_kelas: 'Data Kelas & Rombel',
    master_mapel: 'Mata Pelajaran',
    master_ruang: 'Data Ruang',
    master_guru_mapel: 'Guru Mengajar',
    laporan: 'Laporan Presensi Sekolah',
    tahun_pelajaran: 'Tahun Pelajaran & Semester',
    manajemen_user: 'Manajemen Pengguna (RBAC)',
    audit_log: 'Audit Log Sistem',
    pengaturan: 'Pengaturan Sekolah'
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentRole={currentUser.role}
        activeMenu={activeMenu}
        onSelectMenu={(menu) => handleNavigate(menu)}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        schoolName={school.name}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          onSwitchUser={handleSwitchUser}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          activeMenuTitle={menuTitles[activeMenu] || 'Sistem Absensi'}
          unreadNotificationsCount={unreadCount}
          onResetDemoData={handleResetDemoData}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {/* Dashboard router depending on role */}
          {activeMenu === 'dashboard' && (
            <>
              {currentUser.role === 'ADMIN' && (
                <AdminDashboard onNavigate={handleNavigate} />
              )}
              {currentUser.role === 'GURU' && (
                <GuruDashboard currentUser={currentUser} onNavigate={handleNavigate} />
              )}
              {currentUser.role === 'WALI_KELAS' && (
                <WaliKelasDashboard currentUser={currentUser} onNavigate={handleNavigate} onRefresh={handleRefresh} />
              )}
              {currentUser.role === 'SISWA' && (
                <SiswaDashboard currentUser={currentUser} onNavigate={handleNavigate} />
              )}
              {currentUser.role === 'ORANG_TUA' && (
                <OrangTuaDashboard currentUser={currentUser} onNavigate={handleNavigate} />
              )}
            </>
          )}

          {/* Core Attendance Modules */}
          {activeMenu === 'absensi_siswa' && (
            <AbsensiSiswaPage currentUser={currentUser} initialParams={menuParams} />
          )}

          {activeMenu === 'absensi_guru' && (
            <AbsensiGuruPage currentUser={currentUser} />
          )}

          {activeMenu === 'qr_scanner' && (
            <QrAttendancePage currentUser={currentUser} />
          )}

          {activeMenu === 'riwayat_absensi' && (
            <RiwayatAbsensiPage currentUser={currentUser} initialParams={menuParams} />
          )}

          {activeMenu === 'rekap_absensi' && (
            <RekapAbsensiPage currentUser={currentUser} initialParams={menuParams} />
          )}

          {/* Schedule */}
          {activeMenu === 'jadwal' && (
            <JadwalPelajaranPage currentUser={currentUser} />
          )}

          {activeMenu === 'template_jadwal' && (
            <TemplateJadwalPage
              currentUser={currentUser}
              onNavigateToJadwal={() => handleNavigate('jadwal')}
            />
          )}

          {activeMenu === 'sesi_jam' && (
            <JamPelajaranPage currentUser={currentUser} />
          )}

          {/* Leaves */}
          {activeMenu === 'pengajuan_izin' && (
            <PengajuanIzinPage currentUser={currentUser} initialStudentId={menuParams?.studentId} />
          )}

          {/* Master Data */}
          {activeMenu === 'master_siswa' && (
            <DataSiswaPage />
          )}

          {activeMenu === 'master_guru' && (
            <DataGuruPage />
          )}

          {activeMenu === 'master_orang_tua' && (
            <DataOrangTuaPage />
          )}

          {activeMenu === 'master_kelas' && (
            <DataKelasPage />
          )}

          {activeMenu === 'master_mapel' && (
            <DataMapelPage />
          )}

          {activeMenu === 'master_ruang' && (
            <DataRuangPage />
          )}

          {activeMenu === 'master_guru_mapel' && (
            <GuruMapelKelasPage />
          )}

          {/* Reports */}
          {activeMenu === 'laporan' && (
            <LaporanPage currentUser={currentUser} />
          )}

          {/* Admin & System Configuration */}
          {activeMenu === 'tahun_pelajaran' && (
            <TahunPelajaranPage />
          )}

          {activeMenu === 'manajemen_user' && (
            <UserManagementPage />
          )}

          {activeMenu === 'audit_log' && (
            <AuditLogPage />
          )}

          {activeMenu === 'pengaturan' && (
            <PengaturanSekolahPage />
          )}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
