import React, { useState, useMemo } from 'react';
import { 
  Stethoscope, 
  Calendar, 
  Video, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  PhoneOff, 
  FileText, 
  Pill, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  Heart,
  User,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { Appointment, Consultation, PrescriptionItem } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Badge } from '../common/Badge';

export const ClinicalDesk: React.FC = () => {
  const { user, role, doctorProfile } = useAuth();
  const { showToast } = useNotification();

  const [appointments, setAppointments] = useState<Appointment[]>(() => storage.getAppointments());
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>(() => {
    const list = storage.getAppointments();
    const inProg = list.find((a) => a.status === 'in-consultation');
    return inProg ? inProg.id : list[0]?.id || '';
  });

  // Teleconsult Simulated Controls
  const [inCall, setInCall] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);

  // Clinical Consultation Form State
  const [vitals, setVitals] = useState({
    bloodPressure: '120/80',
    heartRate: 72,
    temperature: 98.6,
    weightKg: 65,
    spo2: 99,
  });
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      id: 'rx-new-1',
      medicationName: '',
      dosage: '',
      frequency: 'Once daily after breakfast',
      durationDays: 14,
      instructions: 'Take with plenty of water',
    },
  ]);

  const activeAppointment = useMemo(() => {
    return appointments.find((a) => a.id === selectedAppointmentId);
  }, [appointments, selectedAppointmentId]);

  const patient = useMemo(() => {
    if (!activeAppointment) return null;
    return storage.getPatientById(activeAppointment.patientId);
  }, [activeAppointment]);

  const handleAddPrescriptionItem = () => {
    setPrescriptions((prev) => [
      ...prev,
      {
        id: `rx-${Date.now()}`,
        medicationName: '',
        dosage: '',
        frequency: 'Twice daily',
        durationDays: 7,
        instructions: '',
      },
    ]);
  };

  const handleRemovePrescriptionItem = (id: string) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdatePrescription = (id: string, field: keyof PrescriptionItem, val: any) => {
    setPrescriptions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleSaveConsultation = () => {
    if (!activeAppointment) return;
    if (!diagnosis.trim()) {
      showToast('error', 'Diagnosis Required', 'Please enter a diagnosis or clinical assessment.');
      return;
    }

    const validRx = prescriptions.filter((p) => p.medicationName.trim() !== '');

    storage.saveConsultation({
      appointmentId: activeAppointment.id,
      patientId: activeAppointment.patientId,
      doctorId: activeAppointment.doctorId,
      date: new Date().toISOString().split('T')[0],
      vitals,
      symptoms: activeAppointment.reasonForVisit ? [activeAppointment.reasonForVisit] : ['Consultation assessment'],
      diagnosis,
      clinicalNotes,
      treatmentPlan,
      followUpDate: followUpDate || undefined,
      prescriptions: validRx,
    });

    // Mark appointment completed
    storage.updateAppointment(activeAppointment.id, { status: 'completed' }, {
      id: user?.id || 'doc-1',
      name: user?.name || 'Dr. Vance',
      role: 'doctor',
    });

    setAppointments(storage.getAppointments());
    showToast('success', 'Consultation Saved', 'Notes, diagnosis, and prescriptions logged to medical ledger.');
    setInCall(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Clinical Desk & Teleconsult</h2>
            <Badge variant="teal" size="sm">Module 3</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Comprehensive physician examination workspace, diagnostics recorder, and simulated teleconsult room.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="purple" size="md">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Authorized Clinical Access
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Daily Schedule Queue (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              Today's Patients ({appointments.length})
            </h3>
            <span className="text-[10px] text-slate-400">Click to load chart</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {appointments.map((appt) => {
              const isSelected = appt.id === selectedAppointmentId;
              return (
                <div
                  key={appt.id}
                  onClick={() => setSelectedAppointmentId(appt.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/60 shadow-xs'
                      : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{appt.patientName}</span>
                    <Badge variant={appt.type === 'teleconsult' ? 'purple' : 'teal'} size="sm">
                      {appt.type === 'teleconsult' ? 'Teleconsult' : 'In-Person'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 mt-1 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {appt.date} ({appt.startTime} - {appt.endTime})
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{appt.appointmentNumber}</span>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-1.5 truncate">
                    Reason: {appt.reasonForVisit}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Dr. {appt.doctorName}</span>
                    <Badge variant={appt.status === 'in-consultation' ? 'teal' : appt.status === 'completed' ? 'emerald' : 'blue'} size="sm" dot>
                      {appt.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Clinical Record / Teleconsult Room (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {activeAppointment ? (
            <>
              {/* Patient Banner */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-base">
                    {activeAppointment.patientName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold text-slate-900">
                        {activeAppointment.patientName}
                      </h4>
                      <Badge variant="slate" size="sm">{patient?.gender || 'Female'} • DOB: {patient?.dob || '1988-06-14'}</Badge>
                      <Badge variant="rose" size="sm">Blood: {patient?.bloodGroup || 'A+'}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Phone: {activeAppointment.patientPhone} • Email: {activeAppointment.patientEmail}
                    </p>
                  </div>
                </div>

                {activeAppointment.type === 'teleconsult' && (
                  <button
                    onClick={() => setInCall(!inCall)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors ${
                      inCall
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-sky-600 hover:bg-sky-700 text-white'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>{inCall ? 'Leave Teleconsult' : 'Launch Teleconsult Room'}</span>
                  </button>
                )}
              </div>

              {/* Teleconsultation Screen (When Active) */}
              {inCall && (
                <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-xl relative overflow-hidden animate-fade-in">
                  <div className="aspect-video w-full rounded-xl bg-slate-800 flex flex-col items-center justify-center relative border border-slate-700">
                    {camOff ? (
                      <div className="text-center text-slate-400">
                        <CameraOff className="w-12 h-12 mx-auto mb-2 text-slate-500" />
                        <p className="text-xs">Doctor camera is switched off</p>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-radial from-slate-800 to-slate-950">
                        <div className="text-center">
                          <div className="w-20 h-20 rounded-full bg-teal-500/20 text-teal-300 border-2 border-teal-400 flex items-center justify-center text-xl font-bold mx-auto mb-3 animate-pulse">
                            {activeAppointment.patientName.charAt(0)}
                          </div>
                          <p className="text-sm font-bold text-white">{activeAppointment.patientName} (Remote)</p>
                          <p className="text-xs text-emerald-400 font-mono mt-1">● Encrypted HD Stream Connected</p>
                        </div>
                      </div>
                    )}

                    {/* Floating Doctor PiP */}
                    <div className="absolute bottom-3 right-3 w-32 h-24 rounded-lg bg-slate-700 border border-slate-600 overflow-hidden shadow-lg flex items-center justify-center">
                      <span className="text-[10px] text-slate-300 font-medium">Attending Clinician (You)</span>
                    </div>

                    {/* Bottom Teleconsult Controls */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700">
                      <button
                        onClick={() => setMicMuted(!micMuted)}
                        className={`p-2 rounded-xl transition-colors ${micMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                      >
                        {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setCamOff(!camOff)}
                        className={`p-2 rounded-xl transition-colors ${camOff ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                      >
                        {camOff ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setInCall(false)}
                        className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                        title="End call"
                      >
                        <PhoneOff className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 text-center mt-2">
                    Notice: Teleconsult session operates over WebRTC channel with simulated end-to-end clinical encryption.
                  </p>
                </div>
              )}

              {/* Vitals Recording Strip */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs">
                <h5 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-600" /> Patient Vitals Assessment
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Blood Pressure</label>
                    <input
                      type="text"
                      value={vitals.bloodPressure}
                      onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                      placeholder="120/80"
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      value={vitals.heartRate}
                      onChange={(e) => setVitals({ ...vitals, heartRate: Number(e.target.value) })}
                      placeholder="72"
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Body Temp (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={vitals.temperature}
                      onChange={(e) => setVitals({ ...vitals, temperature: Number(e.target.value) })}
                      placeholder="98.6"
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={vitals.weightKg}
                      onChange={(e) => setVitals({ ...vitals, weightKg: Number(e.target.value) })}
                      placeholder="65"
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">SpO2 (%)</label>
                    <input
                      type="number"
                      value={vitals.spo2}
                      onChange={(e) => setVitals({ ...vitals, spo2: Number(e.target.value) })}
                      placeholder="99"
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnosis & Notes */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
                <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-600" /> Clinical Assessment & Notes
                </h5>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Diagnosis / ICD Clinical Finding <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Mild Essential Hypertension (ICD-10 I10), Acute Rhinitis"
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subjective & Objective Notes
                    </label>
                    <textarea
                      rows={3}
                      value={clinicalNotes}
                      onChange={(e) => setClinicalNotes(e.target.value)}
                      placeholder="Patient reports symptoms improving. Heart sounds normal. No peripheral edema noted..."
                      className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Treatment Plan & Advice
                    </label>
                    <textarea
                      rows={3}
                      value={treatmentPlan}
                      onChange={(e) => setTreatmentPlan(e.target.value)}
                      placeholder="Maintain low sodium diet, avoid strenuous exertion, continue daily blood pressure monitoring log..."
                      className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Scheduled Follow-Up Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Digital Prescription Builder */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-teal-600" /> Digital Prescription Generator (Rx)
                  </h5>
                  <button
                    onClick={handleAddPrescriptionItem}
                    className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Medication
                  </button>
                </div>

                <div className="space-y-2">
                  {prescriptions.map((rx, idx) => (
                    <div
                      key={rx.id}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                    >
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          placeholder="Medication Name (e.g. Amoxicillin)"
                          value={rx.medicationName}
                          onChange={(e) => handleUpdatePrescription(rx.id, 'medicationName', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Dosage (500mg)"
                          value={rx.dosage}
                          onChange={(e) => handleUpdatePrescription(rx.id, 'dosage', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          placeholder="Frequency (Twice daily)"
                          value={rx.frequency}
                          onChange={(e) => handleUpdatePrescription(rx.id, 'frequency', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          placeholder="Days (14)"
                          value={rx.durationDays}
                          onChange={(e) => handleUpdatePrescription(rx.id, 'durationDays', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      <div className="sm:col-span-1 text-right">
                        <button
                          onClick={() => handleRemovePrescriptionItem(rx.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleSaveConsultation}
                  className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all hover:scale-102"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finalize & Sign Clinical Encounter</span>
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center">
              <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-700">No Patient Encounter Selected</h4>
              <p className="text-xs text-slate-400 mt-1">Select an appointment from the queue to start consultation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
