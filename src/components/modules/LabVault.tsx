import React, { useState, useMemo } from 'react';
import { 
  FlaskConical, 
  UploadCloud, 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  User, 
  Stethoscope, 
  HardDrive
} from 'lucide-react';
import { LabReport } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const LabVault: React.FC = () => {
  const { user, role, patientProfile, doctorProfile } = useAuth();
  const { showToast } = useNotification();

  const [reports, setReports] = useState<LabReport[]>(() => storage.getLabReports());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewReport, setPreviewReport] = useState<LabReport | null>(null);

  // Upload Form State
  const patients = useMemo(() => storage.getPatients(), []);
  const doctors = useMemo(() => storage.getDoctors(), []);

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorProfile?.id || doctors[0]?.id || '');
  const [testName, setTestName] = useState('');
  const [category, setCategory] = useState<LabReport['category']>('Biochemistry');
  const [resultsSummary, setResultsSummary] = useState('');
  const [isCritical, setIsCritical] = useState(false);
  const [fileName, setFileName] = useState('');

  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      // Role access control: If patient, show only their reports
      if (role === 'patient') {
        const myPatientId = patientProfile?.id || 'pat-1';
        if (rep.patientId !== myPatientId) return false;
      }

      const matchesSearch =
        rep.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rep.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rep.reportNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = selectedCategory === 'all' || rep.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [reports, searchTerm, selectedCategory, role, patientProfile]);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) {
      showToast('error', 'Missing Test Name', 'Please specify the diagnostic test title.');
      return;
    }

    const patientObj = patients.find((p) => p.id === selectedPatientId) || patients[0];
    const docObj = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

    const newReport = storage.saveLabReport({
      patientId: patientObj.id,
      patientName: patientObj.name,
      doctorId: docObj.id,
      doctorName: docObj.name,
      testName,
      category,
      testDate: new Date().toISOString().split('T')[0],
      status: isCritical ? 'critical' : 'completed',
      resultsSummary: resultsSummary || 'Specimen processed according to hospital laboratory standard protocols.',
      fileUrl: '#download-blob',
      fileName: fileName || `${testName.toLowerCase().replace(/\s+/g, '_')}_report.pdf`,
      fileSizeBytes: Math.floor(200000 + Math.random() * 800000),
      criticalValuesFlag: isCritical,
      referenceRanges: 'Standard clinical reference values applied',
    });

    setReports(storage.getLabReports());
    setShowUploadModal(false);
    showToast('success', 'Report Uploaded', `Document ${newReport.reportNumber} registered to secure vault.`);

    // Reset fields
    setTestName('');
    setResultsSummary('');
    setIsCritical(false);
  };

  const handleDownload = (report: LabReport) => {
    showToast('info', 'Secure Download', `Simulated secure PDF download initiated for ${report.fileName}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Lab & Diagnostics Vault</h2>
            <Badge variant="teal" size="sm">Module 4</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Encrypted diagnostic archive for pathology, hematology, MRI scans, and ECG telemetry records.
          </p>
        </div>

        {(role === 'doctor' || role === 'admin') && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Diagnostic Document</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reports by test title, patient, or reference number..."
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium text-slate-700"
          >
            <option value="all">All Diagnostic Disciplines</option>
            <option value="Biochemistry">Biochemistry</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Radiology">Radiology</option>
            <option value="Hematology">Hematology</option>
            <option value="Microbiology">Microbiology</option>
            <option value="Pathology">Pathology</option>
          </select>
        </div>
      </div>

      {/* Reports Table / Card List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50">
                <th className="py-3.5 pl-4">Report Ref</th>
                <th className="py-3.5">Diagnostic Test & Discipline</th>
                <th className="py-3.5">Patient Details</th>
                <th className="py-3.5">Ordering Clinician</th>
                <th className="py-3.5">Date</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No diagnostic reports match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredReports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 pl-4">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border text-[11px]">
                        {rep.reportNumber}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <div className="font-bold text-slate-900">{rep.testName}</div>
                      <div className="text-[11px] text-teal-600 font-medium">{rep.category}</div>
                    </td>
                    <td className="py-3.5">
                      <div className="font-semibold text-slate-800">{rep.patientName}</div>
                      <div className="text-[10px] text-slate-400">ID: {rep.patientId}</div>
                    </td>
                    <td className="py-3.5 text-slate-700">Dr. {rep.doctorName}</td>
                    <td className="py-3.5 text-slate-500">{rep.testDate}</td>
                    <td className="py-3.5">
                      {rep.criticalValuesFlag ? (
                        <Badge variant="rose" size="sm" dot>Critical Flag</Badge>
                      ) : (
                        <Badge variant="emerald" size="sm" dot>{rep.status}</Badge>
                      )}
                    </td>
                    <td className="py-3.5 text-right pr-4 space-x-2">
                      <button
                        onClick={() => setPreviewReport(rep)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                        title="View clinical findings"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(rep)}
                        className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition-colors"
                        title="Download verified PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewReport && (
        <Modal
          isOpen={!!previewReport}
          onClose={() => setPreviewReport(null)}
          title={previewReport.testName}
          subtitle={`Report ${previewReport.reportNumber} • Attending: Dr. ${previewReport.doctorName}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 font-medium">Patient:</span>
                <p className="font-bold text-slate-900">{previewReport.patientName}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Category:</span>
                <p className="font-bold text-teal-700">{previewReport.category}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Test Date:</span>
                <p className="font-bold text-slate-900">{previewReport.testDate}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Document File:</span>
                <p className="font-mono text-slate-700">{previewReport.fileName} ({Math.round(previewReport.fileSizeBytes / 1024)} KB)</p>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-800 mb-1">Diagnostic Laboratory Findings & Values</h5>
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 leading-relaxed font-mono text-[11px]">
                {previewReport.resultsSummary}
              </div>
            </div>

            {previewReport.referenceRanges && (
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-sky-900">
                <span className="font-bold">Standard Reference Ranges: </span>
                {previewReport.referenceRanges}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setPreviewReport(null)}
                className="px-4 py-2 border rounded-xl hover:bg-slate-50 font-semibold text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownload(previewReport);
                  setPreviewReport(null);
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Diagnostic Document"
        subtitle="File validated pathology or imaging records into the patient vault"
        maxWidth="lg"
      >
        <form onSubmit={handleUpload} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Patient</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Discipline Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              >
                <option value="Biochemistry">Biochemistry</option>
                <option value="Hematology">Hematology</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Radiology">Radiology</option>
                <option value="Microbiology">Microbiology</option>
                <option value="Pathology">Pathology</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Ordering Doctor</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>Dr. {d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Test Name / Panel</label>
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="e.g. Complete Blood Count (CBC) with Differential"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Findings Summary / Analyte Quantities</label>
            <textarea
              rows={3}
              value={resultsSummary}
              onChange={(e) => setResultsSummary(e.target.value)}
              placeholder="Hemoglobin: 14.2 g/dL. Platelets: 250,000 /mcL. WBC: 6,800..."
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>

          <label className="flex items-center gap-2 font-medium text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 cursor-pointer">
            <input
              type="checkbox"
              checked={isCritical}
              onChange={(e) => setIsCritical(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
            />
            <span>Mark as Critical Value (Alerts Attending Physician Immediately)</span>
          </label>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="px-4 py-2 border rounded-xl hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs"
            >
              Upload to Vault
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
