import React, { useState, useMemo } from 'react';
import { 
  Stethoscope, 
  Search, 
  UserPlus, 
  MapPin, 
  Video, 
  Clock, 
  Award, 
  Trash2, 
  Edit3, 
  CheckCircle,
  Plus
} from 'lucide-react';
import { Doctor } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const DoctorManagement: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [doctors, setDoctors] = useState<Doctor[]>(() => storage.getDoctors());
  const departments = useMemo(() => storage.getDepartments(), []);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [qualificationsText, setQualificationsText] = useState('');
  const [experienceYears, setExperienceYears] = useState(10);
  const [bio, setBio] = useState('');
  const [consultationFee, setConsultationFee] = useState(150);
  const [roomNumber, setRoomNumber] = useState('A-101');
  const [teleconsultAvailable, setTeleconsultAvailable] = useState(true);

  const filteredDoctors = useMemo(() => {
    return doctors.filter(
      (d) =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.departmentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [doctors, searchTerm]);

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find((d) => d.id === departmentId) || departments[0];

    const newDoc: Doctor = {
      id: `doc-${Date.now()}`,
      userId: `user-doc-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+1 (555) 000-0000',
      specialization: specialization.trim(),
      departmentId: dept.id,
      departmentName: dept.name,
      qualifications: qualificationsText ? qualificationsText.split(',').map((s) => s.trim()) : ['MD', 'Board Certified'],
      experienceYears: Number(experienceYears),
      bio: bio.trim() || 'Experienced medical practitioner committed to clinical excellence and patient well-being.',
      consultationFee: Number(consultationFee),
      rating: 4.9,
      reviewCount: 1,
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
      roomNumber: roomNumber.trim(),
      teleconsultAvailable,
      workingDays: [1, 2, 3, 4, 5],
      workingHours: { start: '09:00', end: '17:00' },
      slotDurationMinutes: 20,
      bufferMinutes: 5,
    };

    storage.saveDoctor(newDoc);
    setDoctors(storage.getDoctors());
    setShowAddModal(false);
    showToast('success', 'Doctor Onboarded', `Dr. ${newDoc.name} registered to ${newDoc.departmentName}.`);

    // Reset
    setName('');
    setEmail('');
    setSpecialization('');
    setQualificationsText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Clinician Staff & Department Roster</h2>
            <Badge variant="teal" size="sm">Admin Portal</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage physician credentials, assigned consultation rooms, fees, and teleconsultation capabilities.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Clinician</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search clinician by name, clinical department, or specialty..."
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Clinicians Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50">
                <th className="py-3.5 pl-4">Clinician</th>
                <th className="py-3.5">Department</th>
                <th className="py-3.5">Specialization</th>
                <th className="py-3.5">Room & Teleconsult</th>
                <th className="py-3.5">Fee</th>
                <th className="py-3.5">Experience</th>
                <th className="py-3.5 text-right pr-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDoctors.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 pl-4 flex items-center gap-3">
                    <img
                      src={doc.avatarUrl}
                      alt={doc.name}
                      className="w-10 h-10 rounded-xl object-cover border"
                    />
                    <div>
                      <div className="font-bold text-slate-900">Dr. {doc.name}</div>
                      <div className="text-[10px] text-slate-400">{doc.email}</div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <Badge variant="teal" size="sm">{doc.departmentName}</Badge>
                  </td>
                  <td className="py-3.5 text-slate-700 font-medium">{doc.specialization}</td>
                  <td className="py-3.5 text-slate-600">
                    <div>Room {doc.roomNumber}</div>
                    <span className="text-[10px] text-slate-400">
                      {doc.teleconsultAvailable ? 'Teleconsult Active' : 'In-Person Only'}
                    </span>
                  </td>
                  <td className="py-3.5 font-bold text-slate-900">${doc.consultationFee}</td>
                  <td className="py-3.5 text-slate-600">{doc.experienceYears} Years</td>
                  <td className="py-3.5 text-right pr-4">
                    <Badge variant="emerald" size="sm" dot>Active Staff</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Doctor Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Onboard Medical Clinician"
        subtitle="Add a licensed physician to hospital scheduling rosters and appointment books."
        maxWidth="2xl"
      >
        <form onSubmit={handleAddDoctor} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Doctor Full Name <span className="text-rose-500">*</span></label>
              <input
                type="text"
                placeholder="Marcus Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Hospital Email <span className="text-rose-500">*</span></label>
              <input
                type="email"
                placeholder="m.vance@carepulse.hospital"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Clinical Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Specialization Title <span className="text-rose-500">*</span></label>
              <input
                type="text"
                placeholder="e.g. Senior Pediatric Neurologist"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Consultation Fee ($)</label>
              <input
                type="number"
                value={consultationFee}
                onChange={(e) => setConsultationFee(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Room Number</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="B-204"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Qualifications (Comma separated)</label>
            <input
              type="text"
              placeholder="MD (Harvard), FACC, Board Certified"
              value={qualificationsText}
              onChange={(e) => setQualificationsText(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Clinician Bio</label>
            <textarea
              rows={2}
              placeholder="Specialist overview..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={teleconsultAvailable}
              onChange={(e) => setTeleconsultAvailable(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
            />
            <span>Enable Teleconsultation WebRTC Room for this Clinician</span>
          </label>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border rounded-xl hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs"
            >
              Register Clinician
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
