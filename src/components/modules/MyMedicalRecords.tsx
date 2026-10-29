import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Pill, 
  FlaskConical, 
  Download, 
  Calendar, 
  Stethoscope, 
  ShieldCheck, 
  CheckCircle,
  Eye
} from 'lucide-react';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';

export const MyMedicalRecords: React.FC = () => {
  const { user, patientProfile } = useAuth();
  const [tab, setTab] = useState<'prescriptions' | 'consultations' | 'labs'>('prescriptions');

  const myPatientId = patientProfile?.id || 'pat-1';

  const consultations = useMemo(() => {
    return storage.getConsultations().filter((c) => c.patientId === myPatientId);
  }, [myPatientId]);

  const labReports = useMemo(() => {
    return storage.getLabReports().filter((l) => l.patientId === myPatientId);
  }, [myPatientId]);

  // Aggregate prescriptions
  const allPrescriptions = useMemo(() => {
    const list: any[] = [];
    consultations.forEach((c) => {
      c.prescriptions.forEach((p) => {
        list.push({
          ...p,
          date: c.date,
          diagnosis: c.diagnosis,
        });
      });
    });
    return list;
  }, [consultations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Personal Medical Records & Vault</h2>
            <Badge variant="teal" size="sm">Patient Health File</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Certified clinical diagnoses, digital prescription orders (Rx), and verified diagnostic laboratory results.
          </p>
        </div>

        <Badge variant="purple" size="md">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Encrypted Patient Chart
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 text-xs font-semibold">
        <button
          onClick={() => setTab('prescriptions')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border transition-all ${
            tab === 'prescriptions'
              ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Active Prescriptions ({allPrescriptions.length})</span>
        </button>

        <button
          onClick={() => setTab('consultations')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border transition-all ${
            tab === 'consultations'
              ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Consultation Diagnoses ({consultations.length})</span>
        </button>

        <button
          onClick={() => setTab('labs')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border transition-all ${
            tab === 'labs'
              ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Diagnostic Reports ({labReports.length})</span>
        </button>
      </div>

      {/* Content */}
      {tab === 'prescriptions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allPrescriptions.length === 0 ? (
            <div className="col-span-2 bg-white p-12 rounded-2xl border text-center text-xs text-slate-400">
              No prescriptions on file.
            </div>
          ) : (
            allPrescriptions.map((rx) => (
              <div key={rx.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{rx.medicationName}</h4>
                      <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                        Dosage: {rx.dosage}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{rx.date}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <p className="text-slate-700 font-medium"><span className="text-slate-400">Frequency:</span> {rx.frequency}</p>
                  <p className="text-slate-700"><span className="text-slate-400">Duration:</span> {rx.durationDays} Days</p>
                  <p className="text-slate-600 text-[11px] mt-1 italic">"{rx.instructions}"</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'consultations' && (
        <div className="space-y-4">
          {consultations.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border text-center text-xs text-slate-400">
              No consultation records logged yet.
            </div>
          ) : (
            consultations.map((c) => (
              <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Clinical Encounter</span>
                    <h3 className="font-extrabold text-base text-slate-900 mt-0.5">{c.diagnosis}</h3>
                    <p className="text-xs text-slate-500">Date: {c.date}</p>
                  </div>
                  <Badge variant="emerald" size="sm" dot>Signed & Locked</Badge>
                </div>

                {c.vitals && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 border">BP: <span className="font-bold">{c.vitals.bloodPressure || '120/80'}</span></div>
                    <div className="p-2 rounded-lg bg-slate-50 border">HR: <span className="font-bold">{c.vitals.heartRate || 72} bpm</span></div>
                    <div className="p-2 rounded-lg bg-slate-50 border">Temp: <span className="font-bold">{c.vitals.temperature || 98.6}°F</span></div>
                    <div className="p-2 rounded-lg bg-slate-50 border">SpO2: <span className="font-bold">{c.vitals.spo2 || 99}%</span></div>
                  </div>
                )}

                <div className="text-xs text-slate-700 space-y-2">
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">Clinical Examination Notes:</span>
                    <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">{c.clinicalNotes}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">Therapeutic Plan & Follow-up:</span>
                    <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">{c.treatmentPlan}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'labs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {labReports.map((lab) => (
            <div key={lab.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {lab.reportNumber}
                  </span>
                  <Badge variant={lab.criticalValuesFlag ? 'rose' : 'emerald'} size="sm" dot>
                    {lab.status}
                  </Badge>
                </div>

                <h4 className="font-extrabold text-sm text-slate-900 mt-2">{lab.testName}</h4>
                <p className="text-xs text-teal-700 font-semibold">{lab.category} • {lab.testDate}</p>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">{lab.resultsSummary}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-slate-400">{lab.fileName}</span>
                <button className="flex items-center gap-1 text-teal-600 font-bold hover:underline">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
