import {
  SchoolProfile,
  AcademicYear,
  Semester,
  UserAccount,
  Teacher,
  Student,
  Parent,
  Classroom,
  Subject,
  TeacherAssignment,
  Room,
  SchoolSession,
  ScheduleItem,
  ScheduleSlotTemplate,
  StudentAttendance,
  TeacherAttendance,
  LeaveRequest,
  AppNotification,
  AuditLog,
  AttendanceStatus,
  UserRole
} from '../types';

import {
  INITIAL_SCHOOL_PROFILE,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_SEMESTERS,
  INITIAL_ROOMS,
  INITIAL_SUBJECTS,
  INITIAL_TEACHERS,
  INITIAL_CLASSES,
  INITIAL_PARENTS,
  INITIAL_STUDENTS,
  INITIAL_TEACHER_ASSIGNMENTS,
  INITIAL_SESSIONS,
  INITIAL_SCHEDULES,
  INITIAL_SCHEDULE_SLOTS,
  INITIAL_USERS,
  generatePastAttendance,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_TEACHER_ATTENDANCES
} from '../data/initialData';

const STORAGE_KEYS = {
  PROFILE: 'sas_school_profile',
  ACADEMIC_YEARS: 'sas_academic_years',
  SEMESTERS: 'sas_semesters',
  ROOMS: 'sas_rooms',
  SUBJECTS: 'sas_subjects',
  TEACHERS: 'sas_teachers',
  CLASSES: 'sas_classes',
  PARENTS: 'sas_parents',
  STUDENTS: 'sas_students',
  ASSIGNMENTS: 'sas_assignments',
  SESSIONS: 'sas_sessions',
  SCHEDULES: 'sas_schedules',
  SCHEDULE_SLOTS: 'sas_schedule_slots',
  USERS: 'sas_users',
  STUDENT_ATTENDANCE: 'sas_student_attendance',
  TEACHER_ATTENDANCE: 'sas_teacher_attendance',
  LEAVE_REQUESTS: 'sas_leave_requests',
  NOTIFICATIONS: 'sas_notifications',
  AUDIT_LOGS: 'sas_audit_logs',
  CURRENT_USER: 'sas_current_user',
  SEEDED: 'sas_data_seeded_v1'
};

// Haversine formula to calculate distance between two GPS coordinates in meters
export function calculateGpsDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

class StorageService {
  constructor() {
    this.initDatabase();
  }

  public initDatabase(forceReset = false): void {
    if (typeof window === 'undefined') return;

    const isSeeded = localStorage.getItem(STORAGE_KEYS.SEEDED);
    if (!isSeeded || forceReset) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_SCHOOL_PROFILE));
      localStorage.setItem(STORAGE_KEYS.ACADEMIC_YEARS, JSON.stringify(INITIAL_ACADEMIC_YEARS));
      localStorage.setItem(STORAGE_KEYS.SEMESTERS, JSON.stringify(INITIAL_SEMESTERS));
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(INITIAL_SUBJECTS));
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
      localStorage.setItem(STORAGE_KEYS.PARENTS, JSON.stringify(INITIAL_PARENTS));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(INITIAL_TEACHER_ASSIGNMENTS));
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
      localStorage.setItem(STORAGE_KEYS.SCHEDULE_SLOTS, JSON.stringify(INITIAL_SCHEDULE_SLOTS));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      localStorage.setItem(STORAGE_KEYS.STUDENT_ATTENDANCE, JSON.stringify(generatePastAttendance()));
      localStorage.setItem(STORAGE_KEYS.TEACHER_ATTENDANCE, JSON.stringify(INITIAL_TEACHER_ATTENDANCES));
      localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(INITIAL_LEAVE_REQUESTS));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
      
      // Default logged in user to Admin for first open
      if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || forceReset) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
      }

      localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
    }
  }

  // --- GENERIC HELPERS ---
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key}`, e);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing ${key}`, e);
    }
  }

  // --- SCHOOL PROFILE ---
  public getSchoolProfile(): SchoolProfile {
    return this.getItem<SchoolProfile>(STORAGE_KEYS.PROFILE, INITIAL_SCHOOL_PROFILE);
  }

  public updateSchoolProfile(profile: Partial<SchoolProfile>): SchoolProfile {
    const current = this.getSchoolProfile();
    const updated = { ...current, ...profile };
    this.setItem(STORAGE_KEYS.PROFILE, updated);
    this.addAuditLog('UPDATE_PROFILE', 'Pengaturan Sekolah', 'Memperbarui identitas dan pengaturan sekolah');
    return updated;
  }

  // --- ACADEMIC YEARS & SEMESTERS ---
  public getAcademicYears(): AcademicYear[] {
    return this.getItem<AcademicYear[]>(STORAGE_KEYS.ACADEMIC_YEARS, INITIAL_ACADEMIC_YEARS);
  }

  public getActiveAcademicYear(): AcademicYear | undefined {
    return this.getAcademicYears().find(y => y.isActive);
  }

  public setAcademicYears(years: AcademicYear[]): void {
    this.setItem(STORAGE_KEYS.ACADEMIC_YEARS, years);
  }

  public activateAcademicYear(id: string): void {
    const years = this.getAcademicYears().map(y => ({
      ...y,
      isActive: y.id === id
    }));
    this.setItem(STORAGE_KEYS.ACADEMIC_YEARS, years);
    this.addAuditLog('ACTIVATE_AY', 'Tahun Pelajaran', `Mengaktifkan tahun pelajaran ID: ${id}`);
  }

  public getSemesters(): Semester[] {
    return this.getItem<Semester[]>(STORAGE_KEYS.SEMESTERS, INITIAL_SEMESTERS);
  }

  public getActiveSemester(): Semester | undefined {
    return this.getSemesters().find(s => s.isActive);
  }

  public activateSemester(id: string): void {
    const semesters = this.getSemesters().map(s => ({
      ...s,
      isActive: s.id === id
    }));
    this.setItem(STORAGE_KEYS.SEMESTERS, semesters);
    this.addAuditLog('ACTIVATE_SEMESTER', 'Semester', `Mengaktifkan semester ID: ${id}`);
  }

  // --- USERS & AUTH ---
  public getUsers(): UserAccount[] {
    return this.getItem<UserAccount[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public getCurrentUser(): UserAccount {
    return this.getItem<UserAccount>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  }

  public setCurrentUser(user: UserAccount): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER, user);
  }

  public login(username: string, password?: string): UserAccount | null {
    const users = this.getUsers();
    const found = users.find(u => u.username.toLowerCase() === username.toLowerCase().trim());
    if (!found) return null;
    if (password && found.password && found.password !== password) return null;

    this.setCurrentUser(found);
    this.addAuditLog('LOGIN', 'Autentikasi', `Pengguna ${found.username} (${found.role}) login ke sistem`);
    return found;
  }

  public logout(): void {
    const current = this.getCurrentUser();
    if (current) {
      this.addAuditLog('LOGOUT', 'Autentikasi', `Pengguna ${current.username} logout dari sistem`);
    }
    // Switch to null or admin
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  public saveUser(user: UserAccount): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.setItem(STORAGE_KEYS.USERS, users);
    this.addAuditLog('SAVE_USER', 'Manajemen Pengguna', `Menyimpan data pengguna ${user.username}`);
  }

  public deleteUser(id: string): void {
    const users = this.getUsers().filter(u => u.id !== id);
    this.setItem(STORAGE_KEYS.USERS, users);
    this.addAuditLog('DELETE_USER', 'Manajemen Pengguna', `Menghapus pengguna ID: ${id}`);
  }

  // --- TEACHERS ---
  public getTeachers(): Teacher[] {
    return this.getItem<Teacher[]>(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
  }

  public getTeacherById(id: string): Teacher | undefined {
    return this.getTeachers().find(t => t.id === id);
  }

  public saveTeacher(teacher: Teacher): void {
    const teachers = this.getTeachers();
    const idx = teachers.findIndex(t => t.id === teacher.id);
    if (idx >= 0) {
      teachers[idx] = teacher;
    } else {
      teachers.push(teacher);
    }
    this.setItem(STORAGE_KEYS.TEACHERS, teachers);
    this.addAuditLog('SAVE_TEACHER', 'Data Guru', `Menyimpan guru ${teacher.name}`);
  }

  public deleteTeacher(id: string): void {
    const teachers = this.getTeachers().filter(t => t.id !== id);
    this.setItem(STORAGE_KEYS.TEACHERS, teachers);
    this.addAuditLog('DELETE_TEACHER', 'Data Guru', `Menghapus guru ID: ${id}`);
  }

  // --- STUDENTS ---
  public getStudents(): Student[] {
    return this.getItem<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  }

  public getStudentById(id: string): Student | undefined {
    return this.getStudents().find(s => s.id === id);
  }

  public getStudentsByClass(classId: string): Student[] {
    return this.getStudents().filter(s => s.classId === classId && s.status === 'AKTIF');
  }

  public saveStudent(student: Student, parentInfo?: { fatherName?: string; motherName?: string; phone?: string }): void {
    const students = this.getStudents();
    const parents = this.getParents();

    if (parentInfo && (parentInfo.fatherName || parentInfo.motherName || parentInfo.phone)) {
      const fName = parentInfo.fatherName?.trim() || '-';
      const mName = parentInfo.motherName?.trim() || '-';
      const ph = parentInfo.phone?.trim() || student.phone || '-';

      let parentIdx = parents.findIndex(p =>
        (student.parentId && p.id === student.parentId) ||
        (ph !== '-' && p.phone === ph) ||
        (fName !== '-' && p.fatherName.toLowerCase() === fName.toLowerCase()) ||
        (mName !== '-' && p.motherName.toLowerCase() === mName.toLowerCase())
      );

      if (parentIdx >= 0) {
        if (!parents[parentIdx].studentIds.includes(student.id)) {
          parents[parentIdx].studentIds.push(student.id);
        }
        if (ph !== '-') parents[parentIdx].phone = ph;
        if (fName !== '-') parents[parentIdx].fatherName = fName;
        if (mName !== '-') parents[parentIdx].motherName = mName;
        student.parentId = parents[parentIdx].id;
      } else {
        const newParentId = `prt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newParent: Parent = {
          id: newParentId,
          fatherName: fName,
          motherName: mName,
          phone: ph,
          relationship: 'Orang Tua Kandung',
          username: `ortu.${(fName !== '-' ? fName : (mName !== '-' ? mName : student.name)).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)}`,
          isActive: true,
          studentIds: [student.id]
        };
        parents.push(newParent);
        student.parentId = newParentId;
      }
      this.setItem(STORAGE_KEYS.PARENTS, parents);
    }

    const idx = students.findIndex(s => s.id === student.id);
    if (idx >= 0) {
      students[idx] = student;
    } else {
      students.push(student);
    }
    this.setItem(STORAGE_KEYS.STUDENTS, students);
    this.addAuditLog('SAVE_STUDENT', 'Data Siswa', `Menyimpan siswa ${student.name}`);
  }

  public bulkSaveStudents(newStudents: (Student & { parentFatherName?: string; parentMotherName?: string; parentPhone?: string })[]): void {
    const students = this.getStudents();
    const parents = this.getParents();

    newStudents.forEach(newS => {
      const existingIdx = students.findIndex(s => s.id === newS.id || s.nis === newS.nis);
      const studentId = existingIdx >= 0 ? students[existingIdx].id : newS.id;

      // Check if parent data is provided in template
      const fatherName = newS.parentFatherName?.trim() || '';
      const motherName = newS.parentMotherName?.trim() || '';
      const pPhone = newS.parentPhone?.trim() || '';

      if (fatherName || motherName || pPhone) {
        // Find existing parent by phone or name
        let parentIdx = parents.findIndex(p => 
          (pPhone && p.phone === pPhone) ||
          (fatherName && p.fatherName.toLowerCase() === fatherName.toLowerCase()) ||
          (motherName && p.motherName.toLowerCase() === motherName.toLowerCase())
        );

        if (parentIdx >= 0) {
          if (!parents[parentIdx].studentIds.includes(studentId)) {
            parents[parentIdx].studentIds.push(studentId);
          }
          if (pPhone) parents[parentIdx].phone = pPhone;
          if (fatherName && (!parents[parentIdx].fatherName || parents[parentIdx].fatherName === '-')) {
            parents[parentIdx].fatherName = fatherName;
          }
          if (motherName && (!parents[parentIdx].motherName || parents[parentIdx].motherName === '-')) {
            parents[parentIdx].motherName = motherName;
          }
          newS.parentId = parents[parentIdx].id;
        } else {
          const newParentId = `prt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const newParent: Parent = {
            id: newParentId,
            fatherName: fatherName || '-',
            motherName: motherName || '-',
            phone: pPhone || '-',
            relationship: 'Orang Tua Kandung',
            username: `ortu.${(fatherName || motherName || newS.name).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)}`,
            isActive: true,
            studentIds: [studentId]
          };
          parents.push(newParent);
          newS.parentId = newParentId;
        }
      }

      if (existingIdx >= 0) {
        students[existingIdx] = { ...students[existingIdx], ...newS };
      } else {
        students.push(newS);
      }
    });

    this.setItem(STORAGE_KEYS.STUDENTS, students);
    this.setItem(STORAGE_KEYS.PARENTS, parents);
    this.addAuditLog('IMPORT_STUDENTS', 'Data Siswa', `Mengimpor ${newStudents.length} siswa beserta sinkronisasi data orang tua`);
  }

  public deleteStudent(id: string): void {
    const students = this.getStudents().filter(s => s.id !== id);
    this.setItem(STORAGE_KEYS.STUDENTS, students);
    this.addAuditLog('DELETE_STUDENT', 'Data Siswa', `Menghapus siswa ID: ${id}`);
  }

  // --- PARENTS ---
  public getParents(): Parent[] {
    return this.getItem<Parent[]>(STORAGE_KEYS.PARENTS, INITIAL_PARENTS);
  }

  public getParentById(id: string): Parent | undefined {
    return this.getParents().find(p => p.id === id);
  }

  public saveParent(parent: Parent): void {
    const parents = this.getParents();
    const idx = parents.findIndex(p => p.id === parent.id);
    if (idx >= 0) {
      parents[idx] = parent;
    } else {
      parents.push(parent);
    }
    this.setItem(STORAGE_KEYS.PARENTS, parents);
    this.addAuditLog('SAVE_PARENT', 'Data Orang Tua', `Menyimpan wali murid ${parent.fatherName || parent.motherName}`);
  }

  public saveParents(parents: Parent[]): void {
    this.setItem(STORAGE_KEYS.PARENTS, parents);
  }

  public deleteParent(id: string): void {
    const parents = this.getParents().filter(p => p.id !== id);
    this.setItem(STORAGE_KEYS.PARENTS, parents);
    this.addAuditLog('DELETE_PARENT', 'Data Orang Tua', `Menghapus wali murid ID: ${id}`);
  }

  // --- CLASSES ---
  public getClasses(): Classroom[] {
    return this.getItem<Classroom[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
  }

  public getClassById(id: string): Classroom | undefined {
    return this.getClasses().find(c => c.id === id);
  }

  public saveClass(cls: Classroom): void {
    const classes = this.getClasses();
    const idx = classes.findIndex(c => c.id === cls.id);
    if (idx >= 0) {
      classes[idx] = cls;
    } else {
      classes.push(cls);
    }
    this.setItem(STORAGE_KEYS.CLASSES, classes);
    this.addAuditLog('SAVE_CLASS', 'Data Kelas', `Menyimpan kelas ${cls.name}`);
  }

  // --- SUBJECTS ---
  public getSubjects(): Subject[] {
    return this.getItem<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  }

  public getSubjectById(id: string): Subject | undefined {
    return this.getSubjects().find(s => s.id === id);
  }

  public saveSubject(subject: Subject): void {
    const subjects = this.getSubjects();
    const idx = subjects.findIndex(s => s.id === subject.id);
    if (idx >= 0) {
      subjects[idx] = subject;
    } else {
      subjects.push(subject);
    }
    this.setItem(STORAGE_KEYS.SUBJECTS, subjects);
    this.addAuditLog('SAVE_SUBJECT', 'Mata Pelajaran', `Menyimpan mapel ${subject.name}`);
  }

  // --- ROOMS ---
  public getRooms(): Room[] {
    return this.getItem<Room[]>(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
  }

  public saveRoom(room: Room): void {
    const rooms = this.getRooms();
    const idx = rooms.findIndex(r => r.id === room.id);
    if (idx >= 0) {
      rooms[idx] = room;
    } else {
      rooms.push(room);
    }
    this.setItem(STORAGE_KEYS.ROOMS, rooms);
    this.addAuditLog('SAVE_ROOM', 'Data Ruang', `Menyimpan ruang ${room.name}`);
  }

  // --- SESSIONS ---
  public getSessions(): SchoolSession[] {
    return this.getItem<SchoolSession[]>(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
  }

  public saveSession(session: SchoolSession): void {
    const sessions = this.getSessions();
    const idx = sessions.findIndex(s => s.id === session.id);
    if (idx >= 0) {
      sessions[idx] = session;
    } else {
      sessions.push(session);
    }
    this.setItem(STORAGE_KEYS.SESSIONS, sessions);
    this.addAuditLog('SAVE_SESSION', 'Jam Pelajaran', `Menyimpan sesi ${session.name}`);
  }

  // --- TEACHER ASSIGNMENTS (GURU MENGAJAR) ---
  public getTeacherAssignments(): TeacherAssignment[] {
    return this.getItem<TeacherAssignment[]>(STORAGE_KEYS.ASSIGNMENTS, INITIAL_TEACHER_ASSIGNMENTS);
  }

  public saveTeacherAssignment(asg: TeacherAssignment): void {
    const asgs = this.getTeacherAssignments();
    const idx = asgs.findIndex(a => a.id === asg.id);
    if (idx >= 0) {
      asgs[idx] = asg;
    } else {
      asgs.push(asg);
    }
    this.setItem(STORAGE_KEYS.ASSIGNMENTS, asgs);
    this.addAuditLog('SAVE_ASSIGNMENT', 'Guru Mengajar', `Menyimpan penugasan guru-mapel-kelas`);
  }

  public deleteTeacherAssignment(id: string): void {
    const asgs = this.getTeacherAssignments().filter(a => a.id !== id);
    this.setItem(STORAGE_KEYS.ASSIGNMENTS, asgs);
    this.addAuditLog('DELETE_ASSIGNMENT', 'Guru Mengajar', `Menghapus relasi guru-mapel-kelas`);
  }

  // --- SCHEDULES & CONFLICT VALIDATION ---
  public getSchedules(): ScheduleItem[] {
    return this.getItem<ScheduleItem[]>(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
  }

  public validateScheduleConflict(newSchedule: ScheduleItem): { hasConflict: boolean; reason?: string } {
    const all = this.getSchedules().filter(s => s.id !== newSchedule.id && s.day === newSchedule.day && s.sessionId === newSchedule.sessionId);

    for (const item of all) {
      // 1. Guru cannot teach 2 classes at the same time
      if (item.teacherId === newSchedule.teacherId) {
        const teacher = this.getTeacherById(item.teacherId);
        return {
          hasConflict: true,
          reason: `Jadwal bentrok: Guru ${teacher?.name || 'tersebut'} sudah mengajar di kelas lain pada sesi dan hari yang sama.`
        };
      }

      // 2. Room cannot be used by 2 classes at the same time
      if (item.roomId === newSchedule.roomId) {
        const room = this.getRooms().find(r => r.id === item.roomId);
        return {
          hasConflict: true,
          reason: `Jadwal bentrok: Ruangan ${room?.name || 'tersebut'} sudah digunakan kelas lain pada sesi yang sama.`
        };
      }

      // 3. Class cannot have 2 subjects at the same time
      if (item.classId === newSchedule.classId) {
        const cls = this.getClassById(item.classId);
        return {
          hasConflict: true,
          reason: `Jadwal bentrok: Kelas ${cls?.name || 'tersebut'} sudah memiliki mata pelajaran pada sesi ini.`
        };
      }
    }

    return { hasConflict: false };
  }

  public saveSchedule(schedule: ScheduleItem): { success: boolean; message?: string } {
    const validation = this.validateScheduleConflict(schedule);
    if (validation.hasConflict) {
      return { success: false, message: validation.reason };
    }

    const schedules = this.getSchedules();
    const idx = schedules.findIndex(s => s.id === schedule.id);
    if (idx >= 0) {
      schedules[idx] = schedule;
    } else {
      schedules.push(schedule);
    }
    this.setItem(STORAGE_KEYS.SCHEDULES, schedules);
    this.addAuditLog('SAVE_SCHEDULE', 'Jadwal Pelajaran', `Menyimpan jadwal hari ${schedule.day}`);
    return { success: true };
  }

  public deleteSchedule(id: string): void {
    const schedules = this.getSchedules().filter(s => s.id !== id);
    this.setItem(STORAGE_KEYS.SCHEDULES, schedules);
    this.addAuditLog('DELETE_SCHEDULE', 'Jadwal Pelajaran', `Menghapus jadwal ID: ${id}`);
  }

  // --- SCHEDULE SLOT TEMPLATES ---
  public getScheduleSlotTemplates(): ScheduleSlotTemplate[] {
    return this.getItem<ScheduleSlotTemplate[]>(STORAGE_KEYS.SCHEDULE_SLOTS, INITIAL_SCHEDULE_SLOTS);
  }

  public saveScheduleSlotTemplate(slot: ScheduleSlotTemplate): void {
    const slots = this.getScheduleSlotTemplates();
    const idx = slots.findIndex(s => s.id === slot.id);
    if (idx >= 0) {
      slots[idx] = slot;
    } else {
      slots.push(slot);
    }
    this.setItem(STORAGE_KEYS.SCHEDULE_SLOTS, slots);
    this.addAuditLog('SAVE_SLOT', 'Template Jadwal', `Menyimpan template slot jadwal ${slot.name}`);
  }

  public setScheduleSlotTemplates(slots: ScheduleSlotTemplate[]): void {
    this.setItem(STORAGE_KEYS.SCHEDULE_SLOTS, slots);
    this.addAuditLog('UPDATE_SLOTS', 'Template Jadwal', `Memperbarui daftar slot template jadwal (${slots.length} slot)`);
  }

  public deleteScheduleSlotTemplate(id: string): void {
    const slots = this.getScheduleSlotTemplates().filter(s => s.id !== id);
    this.setItem(STORAGE_KEYS.SCHEDULE_SLOTS, slots);
    this.addAuditLog('DELETE_SLOT', 'Template Jadwal', `Menghapus template slot ID: ${id}`);
  }

  // --- STUDENT ATTENDANCE ---
  public getStudentAttendances(): StudentAttendance[] {
    return this.getItem<StudentAttendance[]>(STORAGE_KEYS.STUDENT_ATTENDANCE, []);
  }

  public getAttendanceByFilter(date: string, classId: string, sessionId?: string, subjectId?: string): StudentAttendance[] {
    return this.getStudentAttendances().filter(a => {
      const matchDate = a.date === date;
      const matchClass = a.classId === classId;
      const matchSession = sessionId ? a.sessionId === sessionId : true;
      const matchSubject = subjectId ? a.subjectId === subjectId : true;
      return matchDate && matchClass && matchSession && matchSubject;
    });
  }

  public saveStudentAttendanceBatch(
    records: { studentId: string; status: AttendanceStatus; notes?: string; checkInTime?: string }[],
    meta: {
      date: string;
      classId: string;
      sessionId: string;
      subjectId?: string;
      scheduleId?: string;
      teacherId: string;
    },
    changeReason?: string
  ): void {
    const all = this.getStudentAttendances();
    const activeAy = this.getActiveAcademicYear()?.id || 'ay-2025-2026';
    const activeSem = this.getActiveSemester()?.id || 'sem-1';
    const now = new Date().toISOString();
    const user = this.getCurrentUser();

    records.forEach(rec => {
      const existingIdx = all.findIndex(a => 
        a.date === meta.date && 
        a.classId === meta.classId && 
        a.sessionId === meta.sessionId && 
        a.studentId === rec.studentId
      );

      const defaultTime = rec.status === 'HADIR' || rec.status === 'TERLAMBAT'
        ? (rec.checkInTime || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }))
        : '-';

      if (existingIdx >= 0) {
        const oldRec = all[existingIdx];
        if (oldRec.status !== rec.status) {
          this.addAuditLog(
            'UPDATE_ATTENDANCE',
            'Absensi Siswa',
            `Pengguna ${user.name} mengubah status absensi siswa (ID: ${rec.studentId}) dari ${oldRec.status} menjadi ${rec.status}. Alasan: ${changeReason || 'Koreksi kehadiran'}`,
            `Status: ${oldRec.status}, Catatan: ${oldRec.notes || '-'}`,
            `Status: ${rec.status}, Catatan: ${rec.notes || '-'}`
          );
        }

        all[existingIdx] = {
          ...oldRec,
          status: rec.status,
          checkInTime: defaultTime,
          notes: rec.notes ?? oldRec.notes,
          recordedByTeacherId: meta.teacherId,
          updatedAt: now
        };
      } else {
        all.push({
          id: `att-${rec.studentId}-${meta.date}-${meta.sessionId}`,
          date: meta.date,
          academicYearId: activeAy,
          semesterId: activeSem,
          classId: meta.classId,
          subjectId: meta.subjectId,
          scheduleId: meta.scheduleId,
          sessionId: meta.sessionId,
          studentId: rec.studentId,
          status: rec.status,
          checkInTime: defaultTime,
          notes: rec.notes || '',
          recordedByTeacherId: meta.teacherId,
          isLocked: false,
          createdAt: now,
          updatedAt: now
        });
      }
    });

    this.setItem(STORAGE_KEYS.STUDENT_ATTENDANCE, all);
  }

  public setAttendanceLock(date: string, classId: string, sessionId: string, isLocked: boolean): void {
    const all = this.getStudentAttendances().map(a => {
      if (a.date === date && a.classId === classId && a.sessionId === sessionId) {
        return { ...a, isLocked };
      }
      return a;
    });
    this.setItem(STORAGE_KEYS.STUDENT_ATTENDANCE, all);
    this.addAuditLog(
      isLocked ? 'LOCK_ATTENDANCE' : 'UNLOCK_ATTENDANCE',
      'Absensi Siswa',
      `${isLocked ? 'Mengunci' : 'Membuka kunci'} absensi tanggal ${date}, kelas ${classId}, sesi ${sessionId}`
    );
  }

  // --- TEACHER ATTENDANCE ---
  public getTeacherAttendances(): TeacherAttendance[] {
    return this.getItem<TeacherAttendance[]>(STORAGE_KEYS.TEACHER_ATTENDANCE, INITIAL_TEACHER_ATTENDANCES);
  }

  public saveTeacherAttendance(att: TeacherAttendance): void {
    const all = this.getTeacherAttendances();
    const idx = all.findIndex(a => a.id === att.id || (a.date === att.date && a.teacherId === att.teacherId));
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...att };
    } else {
      all.push(att);
    }
    this.setItem(STORAGE_KEYS.TEACHER_ATTENDANCE, all);
    this.addAuditLog('TEACHER_ATTENDANCE', 'Absensi Guru', `Pencatatan absensi guru ${att.teacherId} (${att.status}) via ${att.method}`);
  }

  // --- LEAVE REQUESTS ---
  public getLeaveRequests(): LeaveRequest[] {
    return this.getItem<LeaveRequest[]>(STORAGE_KEYS.LEAVE_REQUESTS, INITIAL_LEAVE_REQUESTS);
  }

  public saveLeaveRequest(request: LeaveRequest): void {
    const all = this.getLeaveRequests();
    const idx = all.findIndex(r => r.id === request.id);
    if (idx >= 0) {
      all[idx] = request;
    } else {
      all.unshift(request);
      // Dispatch notification to teachers & admin
      this.addNotification({
        id: `notif-${Date.now()}`,
        title: 'Pengajuan Izin/Sakit Baru',
        message: `Pengajuan izin baru diajukan untuk siswa ${request.studentId} (${request.type}) tanggal ${request.startDate}`,
        type: 'INFO',
        targetRole: 'WALI_KELAS',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }
    this.setItem(STORAGE_KEYS.LEAVE_REQUESTS, all);
    this.addAuditLog('LEAVE_SUBMIT', 'Pengajuan Izin', `Pengajuan ${request.type} diajukan untuk siswa ${request.studentId}`);
  }

  public processLeaveRequest(id: string, status: 'DISETUJUI' | 'DITOLAK', reviewNotes?: string, teacherId?: string): void {
    const all = this.getLeaveRequests();
    const idx = all.findIndex(r => r.id === id);
    if (idx >= 0) {
      const req = all[idx];
      req.status = status;
      req.reviewNotes = reviewNotes;
      req.reviewedByTeacherId = teacherId || this.getCurrentUser().relatedTeacherId || 'admin';
      req.reviewedAt = new Date().toISOString();
      all[idx] = req;
      this.setItem(STORAGE_KEYS.LEAVE_REQUESTS, all);

      // If approved, sync to attendance records
      if (status === 'DISETUJUI') {
        const student = this.getStudentById(req.studentId);
        if (student) {
          const attendanceStatus: AttendanceStatus = req.type === 'SAKIT' ? 'SAKIT' : 'IZIN';
          this.saveStudentAttendanceBatch(
            [{ studentId: student.id, status: attendanceStatus, notes: `Pengajuan ${req.type} disetujui: ${req.reason}` }],
            {
              date: req.startDate,
              classId: student.classId,
              sessionId: 'ses-1',
              teacherId: req.reviewedByTeacherId
            },
            'Persetujuan pengajuan izin resmi'
          );
        }
      }

      this.addNotification({
        id: `notif-${Date.now()}`,
        title: `Pengajuan Izin ${status === 'DISETUJUI' ? 'Disetujui' : 'Ditolak'}`,
        message: `Pengajuan ${req.type} untuk siswa ${req.studentId} telah ${status.toLowerCase()}.`,
        type: status === 'DISETUJUI' ? 'SUCCESS' : 'WARNING',
        targetRole: 'ALL',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      this.addAuditLog('LEAVE_PROCESS', 'Pengajuan Izin', `Status izin siswa ${req.studentId} diubah menjadi ${status}`);
    }
  }

  // --- NOTIFICATIONS ---
  public getNotifications(): AppNotification[] {
    return this.getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  public addNotification(notification: AppNotification): void {
    const all = this.getNotifications();
    all.unshift(notification);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, all);
  }

  public markNotificationAsRead(id: string): void {
    const all = this.getNotifications().map(n => n.id === id ? { ...n, isRead: true } : n);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, all);
  }

  public markAllNotificationsAsRead(): void {
    const all = this.getNotifications().map(n => ({ ...n, isRead: true }));
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, all);
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  public addAuditLog(
    action: string,
    module: string,
    details: string,
    previousData?: string,
    newData?: string
  ): void {
    const user = this.getCurrentUser();
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: user?.id || 'sys',
      userName: user?.name || 'Sistem Otomatis',
      userRole: user?.role || 'ADMIN',
      action,
      module,
      details,
      previousData,
      newData,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1'
    };

    const logs = this.getAuditLogs();
    logs.unshift(newLog);
    // Keep max 200 logs
    if (logs.length > 200) logs.pop();
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  // --- RECAP CALCULATIONS ---
  public getStudentRecap(studentId: string, filterOptions?: { month?: string; academicYearId?: string; semesterId?: string }) {
    let records = this.getStudentAttendances().filter(a => a.studentId === studentId);
    
    if (filterOptions?.month) {
      records = records.filter(a => a.date.startsWith(filterOptions.month!));
    }
    if (filterOptions?.academicYearId) {
      records = records.filter(a => a.academicYearId === filterOptions.academicYearId);
    }
    if (filterOptions?.semesterId) {
      records = records.filter(a => a.semesterId === filterOptions.semesterId);
    }

    const total = records.length;
    const hadir = records.filter(a => a.status === 'HADIR').length;
    const terlambat = records.filter(a => a.status === 'TERLAMBAT').length;
    const izin = records.filter(a => a.status === 'IZIN').length;
    const sakit = records.filter(a => a.status === 'SAKIT').length;
    const alpa = records.filter(a => a.status === 'ALPA').length;

    // Attendance percentage: (Hadir + Terlambat) / Total
    const effectivePresent = hadir + terlambat;
    const percentage = total > 0 ? Math.round((effectivePresent / total) * 1000) / 10 : 100;

    const minPercentage = this.getSchoolProfile().minAttendancePercentage || 80;
    const needsAttention = percentage < minPercentage || alpa >= 3 || terlambat >= 5;

    return {
      total,
      hadir,
      terlambat,
      izin,
      sakit,
      alpa,
      percentage,
      needsAttention
    };
  }

  public getClassRecap(classId: string, filterOptions?: { month?: string }) {
    const students = this.getStudentsByClass(classId);
    let totalHadir = 0;
    let totalTerlambat = 0;
    let totalIzin = 0;
    let totalSakit = 0;
    let totalAlpa = 0;
    let totalSessions = 0;

    const studentRecaps = students.map(s => {
      const recap = this.getStudentRecap(s.id, filterOptions);
      totalHadir += recap.hadir;
      totalTerlambat += recap.terlambat;
      totalIzin += recap.izin;
      totalSakit += recap.sakit;
      totalAlpa += recap.alpa;
      totalSessions += recap.total;
      return {
        student: s,
        ...recap
      };
    });

    const totalRecords = totalSessions;
    const avgPercentage = totalRecords > 0 
      ? Math.round(((totalHadir + totalTerlambat) / totalRecords) * 1000) / 10 
      : 100;

    return {
      classId,
      studentCount: students.length,
      totalHadir,
      totalTerlambat,
      totalIzin,
      totalSakit,
      totalAlpa,
      totalSessions,
      avgPercentage,
      studentRecaps
    };
  }
}

export const storage = new StorageService();
