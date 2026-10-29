import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Heart, 
  AlertCircle, 
  Calendar, 
  FileText, 
  Phone, 
  Mail, 
  CheckCircle,
  Eye,
  ShieldAlert
} from 'lucide-react';
import { Patient, Appointment, Consultation } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const PatientManagement: React.FC = () => {
  const { user, role } = useAuth();
  const { showToast } = useNotification();

  const [patients, setPatients] = useState<Patient[]>(() => storage.getPatients());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // New Patient Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<Patient['gender']>('female');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [address, setAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [allergiesText, setAllergiesText] = useState('');
  const [historyText, setHistoryText] = useState('');

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      return (
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [patients, searchTerm]);

  // Associated records for selected patient
  const patientAppointments = useMemo(() => {
    if (!selectedPatient) return [];
    return storage.getAppointments().filter((a) => a.patientId === selectedPatient.id);
  }, [selectedPatient]);

  const patientConsultations = useMemo(() => {
    if (!selectedPatient) return [];
    return storage.getConsultations().filter((c) => c.patientId === selectedPatient.id);
  }, [selectedPatient]);

  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate patient record by email or phone
    const existingEmail = patients.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
    if (existingEmail) {
      showToast('error', 'Duplicate Record Warning', `A patient profile with email ${email} is already registered (${existingEmail.name}).`);
      return;
    }

    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      userId: `user-pat-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      dob: dob || '1990-01-01',
      gender,
      bloodGroup,
      address: address.trim() || 'Metro City Residential Area',
      emergencyContact: {
        name: emergencyName.trim() || 'Family Member',
        relationship: emergencyRel.trim() || 'Relative',
        phone: emergencyPhone.trim() || phone.trim(),
      },
      allergies: allergiesText ? allergiesText.split(',').map((s) => s.trim()).filter(Boolean) : [],
      medicalHistory: historyText ? [historyText.trim()] : [],
      createdAt: new Date().toISOString(),
    };

    storage.savePatient(newPatient);
    setPatients(storage.getPatients());
    setShowRegisterModal(false);
    showToast('success', 'Patient Registered', `Record created for ${newPatient.name}.`);

    // Reset
    setName('');
    setEmail('');
    setPhone('');
    setAllergiesText('');
    setHistoryText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Patient Registry & Medical Profiles</h2>
            <Badge variant="teal" size="sm">Module 9</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Electronic Medical Records (EMR) repository, allergy tracking, emergency contacts, and deduplication guard.
          </p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patients by name, email, phone number, or patient MRN ID..."
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Patients Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPatients.map((pat) => (
          <div
            key={pat.id}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-800 font-extrabold flex items-center justify-center text-sm">
                    {pat.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{pat.name}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>ID: {pat.id}</span>
                      <span>•</span>
                      <span className="capitalize">{pat.gender}</span>
                    </div>
                  </div>
                </div>

                <Badge variant="rose" size="sm">
                  {pat.bloodGroup}
                </Badge>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{pat.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{pat.email}</span>
                </div>
              </div>

              {/* Allergies tag strip */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Documented Allergies
                </span>
                {pat.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {pat.allergies.map((allg, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 px-2 py-0.5 rounded-md"
                      >
                        ⚠️ {allg}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400">No known allergies</span>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Emergency: {pat.emergencyContact.name} ({pat.emergencyContact.relationship})
              </span>
              <button
                onClick={() => setSelectedPatient(pat)}
                className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold rounded-lg transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Chart</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <Modal
          isOpen={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          title={`Clinical Chart: ${selectedPatient.name}`}
          subtitle={`Patient MRN: ${selectedPatient.id} • Registered: ${new Date(selectedPatient.createdAt).toLocaleDateString()}`}
          maxWidth="3xl"
        >
          <div className="space-y-5 text-xs">
            {/* Vitals / Demographics Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-500 font-medium">Date of Birth:</span>
                <p className="font-bold text-slate-900">{selectedPatient.dob}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Blood Group:</span>
                <p className="font-bold text-rose-600">{selectedPatient.bloodGroup}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Phone:</span>
                <p className="font-bold text-slate-900">{selectedPatient.phone}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Emergency Contact:</span>
                <p className="font-bold text-slate-900">
                  {selectedPatient.emergencyContact.name} ({selectedPatient.emergencyContact.phone})
                </p>
              </div>
            </div>

            {/* Allergies & Medical History */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200">
                <h5 className="font-bold text-rose-900 mb-1.5 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" /> Allergies & Contraindications
                </h5>
                {selectedPatient.allergies.length > 0 ? (
                  <ul className="list-disc list-inside text-rose-800 space-y-0.5">
                    {selectedPatient.allergies.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">No known contraindications recorded.</p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-sky-50/50 border border-sky-200">
                <h5 className="font-bold text-sky-900 mb-1.5 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-sky-600" /> Chronic Conditions & History
                </h5>
                {selectedPatient.medicalHistory.length > 0 ? (
                  <ul className="list-disc list-inside text-sky-800 space-y-0.5">
                    {selectedPatient.medicalHistory.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">No previous medical conditions filed.</p>
                )}
              </div>
            </div>

            {/* Past Encounters */}
            <div>
              <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" /> Appointment Encounter History ({patientAppointments.length})
              </h5>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {patientAppointments.map((appt) => (
                  <div key={appt.id} className="p-2.5 rounded-lg border bg-white flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{appt.date} ({appt.startTime})</span>
                      <span className="text-slate-500 ml-2">with Dr. {appt.doctorName}</span>
                      <p className="text-[11px] text-slate-500">{appt.reasonForVisit}</p>
                    </div>
                    <Badge variant="teal" size="sm">{appt.status}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Consultations notes & Rx */}
            {patientConsultations.length > 0 && (
              <div>
                <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-600" /> Filed Consultation Diagnoses
                </h5>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {patientConsultations.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg bg-teal-50/60 border border-teal-200/80">
                      <div className="flex justify-between font-bold text-teal-900">
                        <span>{c.diagnosis}</span>
                        <span className="text-[11px] text-teal-700">{c.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">{c.treatmentPlan}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 border rounded-xl hover:bg-slate-50 font-semibold"
              >
                Close Record
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Register Modal */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Register New Patient Record"
        subtitle="Include complete demographic details, emergency contacts, and allergy alerts."
        maxWidth="2xl"
      >
        <form onSubmit={handleRegisterPatient} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Legal Name <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address <span className="text-rose-500">*</span></label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane.doe@example.com"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number <span className="text-rose-500">*</span></label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              >
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h6 className="font-bold text-slate-800">Emergency Contact Details</h6>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Contact Name"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                className="p-2 rounded-lg border bg-white text-xs"
              />
              <input
                type="text"
                placeholder="Relationship (e.g. Spouse)"
                value={emergencyRel}
                onChange={(e) => setEmergencyRel(e.target.value)}
                className="p-2 rounded-lg border bg-white text-xs"
              />
              <input
                type="tel"
                placeholder="Contact Phone"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="p-2 rounded-lg border bg-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Documented Allergies (Comma separated)</label>
            <input
              type="text"
              value={allergiesText}
              onChange={(e) => setAllergiesText(e.target.value)}
              placeholder="e.g. Penicillin, Peanuts, Latex"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowRegisterModal(false)}
              className="px-4 py-2 border rounded-xl hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs"
            >
              Register Patient Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
