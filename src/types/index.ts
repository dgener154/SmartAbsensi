export type UserRole = 'ADMIN' | 'GURU' | 'WALI_KELAS' | 'SISWA' | 'ORANG_TUA';

export type AttendanceStatus = 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'SAKIT' | 'ALPA';

export type TeacherAttendanceStatus = 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'SAKIT' | 'DINAS' | 'ALPA';

export type StudentStatus = 'AKTIF' | 'MUTASI_MASUK' | 'MUTASI_KELUAR' | 'LULUS' | 'TIDAK_AKTIF';

export type LeaveType = 'IZIN' | 'SAKIT';

export type LeaveStatus = 'MENUNGGU' | 'DISETUJUI' | 'DITOLAK';

export interface SchoolProfile {
  name: string;
  npsn: string;
  nsm: string;
  foundation: string;
  level: string; // SD, SMP, SMA, MTs, MA
  status: string; // Negeri / Swasta
  address: string;
  village: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  logoUrl?: string;
  loginBackgroundUrl?: string;
  principalName: string;
  principalNip: string;
  operatorName: string;
  operatorPhone: string;
  timezone: string;
  lateThresholdMinutes: number; // e.g. 15
  minAttendancePercentage: number; // e.g. 80
  schoolLat: number;
  schoolLng: number;
  maxGpsRadiusMeters: number; // e.g. 150
  qrAttendanceEnabled: boolean;
  weeklyHolidays: string[]; // e.g. ['Minggu']
  defaultSessionDurationMinutes: number; // e.g. 40
  breakDurationMinutes: number; // e.g. 20
  schoolHours: {
    start: string; // "07:00"
    end: string;   // "15:00"
  };
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2025/2026"
  startDate: string;
  endDate: string;
  isActive: boolean;
  notes?: string;
}

export interface Semester {
  id: string;
  academicYearId: string;
  name: 'Ganjil' | 'Genap';
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  role: UserRole;
  relatedTeacherId?: string;
  relatedStudentId?: string;
  relatedParentId?: string;
  isActive: boolean;
  avatar?: string;
}

export interface Teacher {
  id: string;
  nip: string;
  nuptk: string;
  nik: string;
  name: string;
  frontTitle?: string;
  backTitle?: string;
  gender: 'L' | 'P';
  birthPlace: string;
  birthDate: string;
  address: string;
  phone: string;
  email: string;
  username: string;
  employmentStatus: 'PNS' | 'PPPK' | 'GTY' | 'GTT' | 'HONORER';
  position: 'Kepala Sekolah' | 'Wakil Kepala' | 'Guru' | 'Guru BK' | 'Operator' | 'Wali Kelas' | 'Tenaga Kependidikan';
  subjectTaught: string;
  isHomeroomTeacher: boolean;
  homeroomClassId?: string;
  isActive: boolean;
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  nik: string;
  name: string;
  nickName: string;
  gender: 'L' | 'P';
  birthPlace: string;
  birthDate: string;
  religion: string;
  address: string;
  village: string;
  district: string;
  city: string;
  province: string;
  familyCardNo: string;
  phone: string;
  email: string;
  classId: string;
  rombel: string;
  entryYear: string;
  status: StudentStatus;
  parentId?: string;
}

export interface Parent {
  id: string;
  fatherName: string;
  fatherNik?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  motherName: string;
  motherNik?: string;
  motherPhone?: string;
  motherEmail?: string;
  phone: string; // Nomor telepon perwakilan keluarga untuk komunikasi
  guardianName?: string;
  guardianPhone?: string;
  relationship: string;
  username: string;
  isActive: boolean;
  studentIds: string[]; // List of children
}

export interface ScheduleSlotTemplate {
  id: string;
  name: string; // e.g. "Slot Pagi 1 (07:00 - 07:45)"
  sessionId: string;
  startTime: string;
  endTime: string;
  applicableDays: ('Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu')[];
  isActive: boolean;
}

export interface Classroom {
  id: string;
  name: string; // e.g. "VII-A"
  grade: string; // "7", "8", "9" or "X", "XI", "XII"
  rombel: string; // "A", "B", etc.
  major?: string; // Umum, IPA, IPS
  homeroomTeacherId: string;
  academicYearId: string;
  roomName: string;
  isActive: boolean;
}

export interface Subject {
  id: string;
  code: string; // e.g. "PAI", "MTK", "IND"
  name: string;
  category: 'Pendidikan Agama' | 'Bahasa' | 'Matematika' | 'IPA' | 'IPS' | 'PJOK' | 'Seni' | 'Informatika' | 'Muatan Lokal' | 'Lainnya';
  weeklyHours: number; // e.g. 4 JP
  isActive: boolean;
}

export interface TeacherAssignment {
  id: string;
  academicYearId: string;
  semesterId: string;
  teacherId: string;
  subjectId: string;
  classId: string;
  isActive: boolean;
}

export interface Room {
  id: string;
  name: string;
  roomNumber: string;
  capacity: number;
  type: 'Kelas' | 'Laboratorium' | 'Perpustakaan' | 'Aula' | 'Lapangan' | 'Ruang Guru' | 'Lainnya';
  isActive: boolean;
}

export interface SchoolSession {
  id: string;
  sessionNumber: number; // 1, 2, 3...
  name: string; // "Sesi 1", "Istirahat 1", "Sholat Dzuhur"
  startTime: string; // "07:00"
  endTime: string;   // "07:45"
  type: 'Pelajaran' | 'Istirahat' | 'Sholat' | 'Upacara' | 'Kegiatan Khusus';
  isActive: boolean;
}

export interface ScheduleItem {
  id: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  sessionId: string;
  startTime: string;
  endTime: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  roomId: string;
  academicYearId: string;
  semesterId: string;
  isActive: boolean;
}

export interface StudentAttendance {
  id: string;
  date: string; // YYYY-MM-DD
  academicYearId: string;
  semesterId: string;
  classId: string;
  subjectId?: string;
  scheduleId?: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  checkInTime: string; // "07:05"
  notes?: string;
  recordedByTeacherId: string;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherAttendance {
  id: string;
  date: string; // YYYY-MM-DD
  teacherId: string;
  status: TeacherAttendanceStatus;
  checkInTime: string;
  checkOutTime?: string;
  method: 'MANUAL' | 'QR' | 'GPS' | 'FINGERPRINT';
  latitude?: number;
  longitude?: number;
  distanceMeters?: number;
  isLocationValid?: boolean;
  notes?: string;
  createdAt: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  notes?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  submittedBy: 'SISWA' | 'ORANG_TUA';
  submittedByUserId: string;
  submittedAt: string;
  status: LeaveStatus;
  reviewedByTeacherId?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  targetRole?: UserRole | 'ALL';
  targetUserId?: string;
  isRead: boolean;
  createdAt: string;
  linkUrl?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
  previousData?: string;
  newData?: string;
  timestamp: string;
  ipAddress?: string;
}
