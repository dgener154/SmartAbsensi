import React, { useState, useEffect } from 'react';
import { Search, X, User, GraduationCap, BookOpen, School, Calendar, ArrowRight } from 'lucide-react';
import { storage } from '../../services/storageService';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (category: string, id: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    students: any[];
    teachers: any[];
    classes: any[];
    subjects: any[];
    schedules: any[];
  }>({
    students: [],
    teachers: [],
    classes: [],
    subjects: [],
    schedules: []
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle or open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ students: [], teachers: [], classes: [], subjects: [], schedules: [] });
      return;
    }

    const q = query.toLowerCase().trim();
    const students = storage.getStudents().filter(s => 
      s.name.toLowerCase().includes(q) || s.nis.includes(q) || s.nisn.includes(q)
    ).slice(0, 5);

    const teachers = storage.getTeachers().filter(t => 
      t.name.toLowerCase().includes(q) || t.nip.includes(q) || t.subjectTaught.toLowerCase().includes(q)
    ).slice(0, 5);

    const classes = storage.getClasses().filter(c => 
      c.name.toLowerCase().includes(q)
    ).slice(0, 5);

    const subjects = storage.getSubjects().filter(s => 
      s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    ).slice(0, 5);

    const schedules = storage.getSchedules().filter(sch => {
      const cls = storage.getClassById(sch.classId);
      const sub = storage.getSubjectById(sch.subjectId);
      return (
        sch.day.toLowerCase().includes(q) ||
        cls?.name.toLowerCase().includes(q) ||
        sub?.name.toLowerCase().includes(q)
      );
    }).slice(0, 5);

    setResults({ students, teachers, classes, subjects, schedules });
  }, [query]);

  if (!isOpen) return null;

  const totalResults = results.students.length + results.teachers.length + results.classes.length + results.subjects.length + results.schedules.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        {/* Input Bar */}
        <div className="relative flex items-center px-4 border-b border-slate-200 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari siswa (NIS/Nama), guru, kelas, mata pelajaran..."
            className="w-full px-3 py-3.5 bg-transparent text-sm text-slate-900 focus:outline-none placeholder:text-slate-400"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="ml-2 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded">
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Ketikkan kata kunci pencarian seperti nama siswa, guru, kode mapel, atau kelas.
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Tidak ditemukan data yang sesuai dengan "{query}".
            </div>
          ) : (
            <>
              {results.students.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Siswa ({results.students.length})
                  </div>
                  <div className="space-y-1">
                    {results.students.map(s => {
                      const cls = storage.getClassById(s.classId);
                      return (
                        <div
                          key={s.id}
                          onClick={() => { onSelectResult('students', s.id); onClose(); }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                        >
                          <div>
                            <div className="text-sm font-medium text-slate-900">{s.name}</div>
                            <div className="text-xs text-slate-500">
                              NIS: {s.nis} · Kelas {cls?.name || '-'}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {results.teachers.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">
                    <User className="w-3.5 h-3.5" />
                    Guru & Staf ({results.teachers.length})
                  </div>
                  <div className="space-y-1">
                    {results.teachers.map(t => (
                      <div
                        key={t.id}
                        onClick={() => { onSelectResult('teachers', t.id); onClose(); }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-900">{t.name}</div>
                          <div className="text-xs text-slate-500">
                            {t.position} · {t.subjectTaught} · NIP: {t.nip || '-'}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.classes.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">
                    <School className="w-3.5 h-3.5" />
                    Kelas / Rombel ({results.classes.length})
                  </div>
                  <div className="space-y-1">
                    {results.classes.map(c => {
                      const wali = storage.getTeacherById(c.homeroomTeacherId);
                      return (
                        <div
                          key={c.id}
                          onClick={() => { onSelectResult('classes', c.id); onClose(); }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                        >
                          <div>
                            <div className="text-sm font-medium text-slate-900">Kelas {c.name}</div>
                            <div className="text-xs text-slate-500">
                              Wali Kelas: {wali?.name || '-'} · Ruang: {c.roomName}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {results.subjects.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    Mata Pelajaran ({results.subjects.length})
                  </div>
                  <div className="space-y-1">
                    {results.subjects.map(sub => (
                      <div
                        key={sub.id}
                        onClick={() => { onSelectResult('subjects', sub.id); onClose(); }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-900">[{sub.code}] {sub.name}</div>
                          <div className="text-xs text-slate-500">
                            Kelompok: {sub.category} · {sub.weeklyHours} JP
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.schedules.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Jadwal Pelajaran ({results.schedules.length})
                  </div>
                  <div className="space-y-1">
                    {results.schedules.map(sch => {
                      const cls = storage.getClassById(sch.classId);
                      const sub = storage.getSubjectById(sch.subjectId);
                      const tch = storage.getTeacherById(sch.teacherId);
                      return (
                        <div
                          key={sch.id}
                          onClick={() => { onSelectResult('schedule', sch.id); onClose(); }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                        >
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {sch.day} · {sub?.name} ({cls?.name})
                            </div>
                            <div className="text-xs text-slate-500">
                              {sch.startTime} - {sch.endTime} · Guru: {tch?.name}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
