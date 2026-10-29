import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Video, 
  Clock, 
  CalendarCheck, 
  Award, 
  Stethoscope,
  Info
} from 'lucide-react';
import { Doctor } from '../../types';
import { storage } from '../../services/storage';
import { Badge } from '../common/Badge';

interface ClinicianDirectoryProps {
  onBookDoctor: (doctorId: string) => void;
  onViewDoctorProfile?: (doctorId: string) => void;
}

export const ClinicianDirectory: React.FC<ClinicianDirectoryProps> = ({
  onBookDoctor,
  onViewDoctorProfile,
}) => {
  const doctors = useMemo(() => storage.getDoctors(), []);
  const departments = useMemo(() => storage.getDepartments(), []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [teleconsultOnly, setTeleconsultOnly] = useState(false);
  const [selectedDoctorDetail, setSelectedDoctorDetail] = useState<Doctor | null>(null);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.departmentName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = selectedDept === 'all' || doc.departmentId === selectedDept;
      const matchesTele = !teleconsultOnly || doc.teleconsultAvailable;

      return matchesSearch && matchesDept && matchesTele;
    });
  }, [doctors, searchTerm, selectedDept, teleconsultOnly]);

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Clinician Directory & Booking</h2>
            <Badge variant="teal" size="sm">Module 1</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse verified medical specialists, check available slots, and book conflict-free consultations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">
            {filteredDoctors.length} Clinicians available
          </span>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by doctor name, specialty, clinical focus..."
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-medium text-slate-700"
          >
            <option value="all">All Departments ({departments.length})</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors shrink-0">
            <input
              type="checkbox"
              checked={teleconsultOnly}
              onChange={(e) => setTeleconsultOnly(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 h-3.5 w-3.5"
            />
            <Video className="w-3.5 h-3.5 text-sky-600" />
            <span>Teleconsult Only</span>
          </label>
        </div>
      </div>

      {/* Clinicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="group bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              {/* Top row with avatar & rating */}
              <div className="flex items-start gap-3.5">
                <img
                  src={doc.avatarUrl}
                  alt={doc.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-xs shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <Badge variant="teal" size="sm">
                      {doc.departmentName}
                    </Badge>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{doc.rating}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({doc.reviewCount})</span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 mt-1 truncate">
                    Dr. {doc.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{doc.specialization}</p>
                </div>
              </div>

              {/* Bio & credentials */}
              <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                {doc.bio}
              </p>

              {/* Badges / metadata */}
              <div className="mt-3.5 space-y-1.5 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Room {doc.roomNumber} • Experience: {doc.experienceYears} yrs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Working Hours: {doc.workingHours.start} - {doc.workingHours.end}</span>
                </div>
                {doc.teleconsultAvailable && (
                  <div className="flex items-center gap-1.5 text-sky-700 font-medium">
                    <Video className="w-3.5 h-3.5 shrink-0" />
                    <span>Teleconsultation Enabled</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price and Action */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <div>
                <span className="text-base font-extrabold text-slate-900">${doc.consultationFee}</span>
                <span className="text-[10px] text-slate-400 block">per consultation</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDoctorDetail(doc)}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                  title="View qualifications & full profile"
                >
                  <Info className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onBookDoctor(doc.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Book Slot</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Doctor Detailed Profile Modal */}
      {selectedDoctorDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-100 shadow-2xl space-y-4">
            <div className="flex items-start gap-4">
              <img
                src={selectedDoctorDetail.avatarUrl}
                alt={selectedDoctorDetail.name}
                className="w-16 h-16 rounded-2xl object-cover border"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <Badge variant="teal">{selectedDoctorDetail.departmentName}</Badge>
                  <button
                    onClick={() => setSelectedDoctorDetail(null)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
                  >
                    ✕
                  </button>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Dr. {selectedDoctorDetail.name}
                </h3>
                <p className="text-xs text-slate-500">{selectedDoctorDetail.specialization}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h5 className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-teal-600" /> Qualifications & Board Certifications
                </h5>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                  {selectedDoctorDetail.qualifications.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" /> Clinical Focus & Bio
                </h5>
                <p className="text-slate-600 leading-relaxed">{selectedDoctorDetail.bio}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 font-medium">Room Location:</span>
                  <p className="font-bold text-slate-800">{selectedDoctorDetail.roomNumber}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Slot Duration:</span>
                  <p className="font-bold text-slate-800">{selectedDoctorDetail.slotDurationMinutes} min + {selectedDoctorDetail.bufferMinutes}m buffer</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDoctorDetail(null)}
                className="flex-1 py-2 text-xs font-semibold border rounded-xl hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = selectedDoctorDetail.id;
                  setSelectedDoctorDetail(null);
                  onBookDoctor(id);
                }}
                className="flex-1 py-2 text-xs font-bold bg-teal-600 text-white rounded-xl hover:bg-teal-700 shadow-xs"
              >
                Book with Dr. {selectedDoctorDetail.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
