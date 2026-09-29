import React, { useState } from 'react';
import { Upload, Download, CheckCircle, AlertTriangle, X, FileSpreadsheet } from 'lucide-react';
import { storage } from '../../services/storageService';
import { Student } from '../../types';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  importType: 'SISWA' | 'GURU' | 'KELAS';
  onSuccess: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  importType,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const downloadTemplate = () => {
    let header = '';
    let sampleRow = '';
    let filename = '';

    if (importType === 'SISWA') {
      filename = 'template_siswa_dan_orangtua.csv';
      header = 'nis,nisn,nik,nama,jenis_kelamin,kelas,tempat_lahir,tanggal_lahir,alamat,no_kk,nama_ayah,nama_ibu,telepon\n';
      sampleRow = '252607999,0112349999,3174010101120001,Ahmad Fauzi Contoh,L,cls-7a,Jakarta,2012-05-15,Jl. Kemang Timur No. 10,3174010101000001,Bambang Hidayat,Siti Aminah,08123456789\n';
    } else if (importType === 'GURU') {
      filename = 'template_guru.csv';
      header = 'nip,nik,nama,gelar_depan,gelar_belakang,jenis_kelamin,telepon,email,mapel,jabatan\n';
      sampleRow = '199001012020011001,3174010101900001,Hidayat Pratama,,S.Pd.,L,081299887766,hidayat@sekolah.id,Matematika,Guru\n';
    } else {
      filename = 'template_kelas.csv';
      header = 'id_kelas,nama_kelas,tingkat,rombel,ruang\n';
      sampleRow = 'cls-7c,VII-C,7,C,Ruang 103\n';
    }

    const blob = new Blob([header + sampleRow], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const reader = new FileReader();

    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (!content) return;

      const lines = content.split('\n').filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        setErrors(['File CSV tidak memiliki baris data (hanya header atau kosong).']);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const dataRows = lines.slice(1);
      const parsed: any[] = [];
      const newErrors: string[] = [];

      dataRows.forEach((row, idx) => {
        const values = row.split(',').map(v => v.trim());
        if (values.length < headers.length) {
          newErrors.push(`Baris ${idx + 2}: Kolom kurang lengkap.`);
          return;
        }

        const obj: any = {};
        headers.forEach((h, i) => {
          obj[h] = values[i] || '';
        });

        // Basic validations
        if (importType === 'SISWA') {
          if (!obj.nis || !obj.nama) {
            newErrors.push(`Baris ${idx + 2}: NIS dan Nama wajib diisi.`);
          }
        }
        parsed.push(obj);
      });

      setErrors(newErrors);
      setParsedData(parsed);
    };

    reader.readAsText(uploadedFile);
  };

  const handleCommit = () => {
    setIsProcessing(true);
    try {
      if (importType === 'SISWA') {
        const newStudents = parsedData.map((row, i) => ({
          id: `std-imp-${Date.now()}-${i}`,
          nis: row.nis || `NIS-${Date.now()}-${i}`,
          nisn: row.nisn || `NISN-${i}`,
          nik: row.nik || '3174000000000000',
          name: row.nama || 'Siswa Baru',
          nickName: (row.nama || 'Siswa').split(' ')[0],
          gender: (row.jenis_kelamin?.toUpperCase() === 'P' ? 'P' : 'L') as ('L' | 'P'),
          birthPlace: row.tempat_lahir || 'Jakarta',
          birthDate: row.tanggal_lahir || '2012-01-01',
          religion: 'Islam',
          address: row.alamat || 'Alamat Siswa',
          village: 'Bangka',
          district: 'Mampang Prapatan',
          city: 'Jakarta Selatan',
          province: 'DKI Jakarta',
          familyCardNo: row.no_kk || '3174000000000000',
          phone: row.telepon || row.no_telepon || '08123456789',
          email: `${row.nis || 'siswa'}@siswa.smpitalhikmah.sch.id`,
          classId: row.kelas || 'cls-7a',
          rombel: 'A',
          entryYear: '2025',
          status: 'AKTIF' as any,
          parentFatherName: row.nama_ayah || row.ayah || '',
          parentMotherName: row.nama_ibu || row.ibu || '',
          parentPhone: row.telepon || row.no_telepon || ''
        }));
        storage.bulkSaveStudents(newStudents);
      }

      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      setErrors(['Gagal menyimpan data import. Pastikan format CSV sesuai.']);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-slate-900">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-lg">Import Data {importType} via CSV</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Instructions */}
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-sm text-emerald-900">
            <p className="font-semibold mb-1">Panduan Import Data:</p>
            <ol className="list-decimal list-inside space-y-1 text-emerald-800 text-xs">
              <li>Unduh template file CSV standar terlebih dahulu.</li>
              <li>Isi data Anda menggunakan Excel atau Google Sheets, lalu simpan sebagai file <strong>.CSV</strong> (UTF-8).</li>
              <li>Pilih file untuk melihat preview dan validasi data sebelum disimpan ke database.</li>
            </ol>
            <button
              onClick={downloadTemplate}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Template CSV ({importType})
            </button>
          </div>

          {/* File Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Pilih Berkas CSV
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-1">
              <div className="flex items-center gap-1 font-semibold text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Peringatan Validasi ({errors.length}):</span>
              </div>
              {errors.slice(0, 4).map((err, i) => (
                <p key={i}>• {err}</p>
              ))}
              {errors.length > 4 && <p className="text-slate-500">...dan {errors.length - 4} kesalahan lainnya.</p>}
            </div>
          )}

          {/* Data Preview */}
          {parsedData.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Pratinjau Data ({parsedData.length} baris terbaca)
                </h4>
                <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Format siap diproses
                </span>
              </div>
              <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-48">
                <table className="min-w-full text-xs text-slate-700 text-left">
                  <thead className="bg-slate-100 border-b border-slate-200 sticky top-0">
                    <tr>
                      {Object.keys(parsedData[0]).map((key) => (
                        <th key={key} className="px-3 py-2 font-medium capitalize">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedData.slice(0, 6).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        {Object.values(row).map((val: any, j) => (
                          <td key={j} className="px-3 py-1.5 whitespace-nowrap">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.length > 6 && (
                <p className="text-xs text-slate-500 mt-1 italic">
                  Menampilkan 6 dari {parsedData.length} baris data.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            disabled={parsedData.length === 0 || isProcessing}
            onClick={handleCommit}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            {isProcessing ? 'Memproses...' : `Simpan ${parsedData.length} Data`}
          </button>
        </div>
      </div>
    </div>
  );
};
