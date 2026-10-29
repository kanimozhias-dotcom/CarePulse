import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Video, 
  Sparkles, 
  ChevronRight,
  ListOrdered
} from 'lucide-react';
import { Doctor, AppointmentType, SlotRecommendation } from '../../types';
import { storage } from '../../services/storage';
import { 
  generateDoctorDailySlots, 
  diagnoseSchedulingConflict, 
  findSmartAlternativeSlots 
} from '../../services/scheduler';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Modal } from '../common/Modal';

interface BookingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDoctorId?: string;
  onSuccess?: (appointmentId: string) => void;
}

export const BookingWizardModal: React.FC<BookingWizardModalProps> = ({
  isOpen,
  onClose,
  initialDoctorId,
  onSuccess,
}) => {
  const { user, patientProfile } = useAuth();
  const { showToast } = useNotification();

  const doctors = useMemo(() => storage.getDoctors(), [isOpen]);
  const departments = useMemo(() => storage.getDepartments(), [isOpen]);
  const leaves = useMemo(() => storage.getDoctorLeaves(), [isOpen]);
  const appointments = useMemo(() => storage.getAppointments(), [isOpen]);

  // Form State
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(initialDoctorId || doctors[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('in-person');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Select Doctor & Slot, 2: Patient Info & Notes, 3: Confirmation
  const [createdAppointmentNumber, setCreatedAppointmentNumber] = useState<string>('');
  const [showWaitlistOption, setShowWaitlistOption] = useState(false);

  useEffect(() => {
    if (initialDoctorId) {
      setSelectedDoctorId(initialDoctorId);
    }
  }, [initialDoctorId]);

  const activeDoctor = useMemo(() => {
    return doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
  }, [doctors, selectedDoctorId]);

  // Compute discrete slots for selected doctor & date
  const dailySlots = useMemo(() => {
    if (!activeDoctor || !selectedDate) return [];
    return generateDoctorDailySlots(activeDoctor, selectedDate, appointments, leaves);
  }, [activeDoctor, selectedDate, appointments, leaves]);

  // Diagnose conflict if user manually enters or clicks a slot
  const conflictDiagnosis = useMemo(() => {
    if (!activeDoctor || !selectedDate || !selectedSlot) return null;
    const currentPatientId = patientProfile?.id || user?.id || 'guest-patient';
    return diagnoseSchedulingConflict(
      activeDoctor,
      currentPatientId,
      selectedDate,
      selectedSlot.start,
      selectedSlot.end,
      appointments,
      leaves
    );
  }, [activeDoctor, selectedDate, selectedSlot, appointments, leaves, patientProfile, user]);

  // Smart Alternative Slot Recommendations
  const alternativeSlots: SlotRecommendation[] = useMemo(() => {
    if (!activeDoctor || !selectedDate) return [];
    const preferredTime = selectedSlot ? selectedSlot.start : '10:00';
    return findSmartAlternativeSlots(
      activeDoctor,
      selectedDate,
      preferredTime,
      doctors,
      appointments,
      leaves,
      3
    );
  }, [activeDoctor, selectedDate, selectedSlot, doctors, appointments, leaves]);

  const handleSelectAlternative = (alt: SlotRecommendation) => {
    setSelectedDoctorId(alt.doctorId);
    setSelectedDate(alt.date);
    setSelectedSlot({ start: alt.startTime, end: alt.endTime });
    showToast('info', 'Slot Applied', `Selected alternative with Dr. ${alt.doctorName} on ${alt.date} at ${alt.startTime}`);
  };

  const handleJoinWaitingList = () => {
    const currentPatientId = patientProfile?.id || user?.id || 'pat-1';
    const patientName = patientProfile?.name || user?.name || 'Sarah Jenkins';
    const patientPhone = patientProfile?.phone || '+1 (555) 912-3456';
    const patientEmail = patientProfile?.email || user?.email || 'patient@example.com';

    storage.addToWaitingList({
      patientId: currentPatientId,
      patientName,
      patientPhone,
      patientEmail,
      doctorId: activeDoctor?.id,
      doctorName: activeDoctor?.name,
      departmentId: activeDoctor?.departmentId || 'dept-1',
      preferredDate: selectedDate,
      preferredTimeRange: 'any',
    });

    showToast('success', 'Joined Waiting List', 'You will be notified immediately when a slot opens up!');
    onClose();
  };

  const handleConfirmBooking = () => {
    if (!activeDoctor || !selectedSlot) {
      showToast('error', 'Incomplete Selection', 'Please select an available appointment time slot.');
      return;
    }

    const currentPatientId = patientProfile?.id || user?.id || 'pat-1';
    const patientName = patientProfile?.name || user?.name || 'Sarah Jenkins';
    const patientPhone = patientProfile?.phone || '+1 (555) 912-3456';
    const patientEmail = patientProfile?.email || user?.email || 'patient@example.com';

    // Double check on server/storage to prevent race conditions
    const finalCheck = diagnoseSchedulingConflict(
      activeDoctor,
      currentPatientId,
      selectedDate,
      selectedSlot.start,
      selectedSlot.end,
      storage.getAppointments(),
      storage.getDoctorLeaves()
    );

    if (!finalCheck.isValid) {
      showToast('error', 'Booking Conflict Detected', finalCheck.message);
      return;
    }

    const newAppt = storage.createAppointment({
      patientId: currentPatientId,
      patientName,
      patientPhone,
      patientEmail,
      doctorId: activeDoctor.id,
      doctorName: activeDoctor.name,
      doctorSpecialization: activeDoctor.specialization,
      departmentId: activeDoctor.departmentId,
      date: selectedDate,
      startTime: selectedSlot.start,
      endTime: selectedSlot.end,
      type: appointmentType,
      status: 'scheduled',
      reasonForVisit: reasonForVisit || 'Routine Consultation & Assessment',
      fee: activeDoctor.consultationFee,
      paid: true,
      teleconsultUrl: appointmentType === 'teleconsult' ? `https://carepulse.hospital/teleconsult/room-${Date.now()}` : undefined,
    });

    setCreatedAppointmentNumber(newAppt.appointmentNumber);
    setStep(3);
    showToast('success', 'Appointment Confirmed', `Booking ${newAppt.appointmentNumber} successfully placed.`);
    if (onSuccess) onSuccess(newAppt.id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 3 ? 'Booking Confirmed!' : 'Smart Appointment Booking Wizard'}
      subtitle={
        step === 1
          ? 'Select clinical department, clinician, and conflict-checked time slot.'
          : step === 2
          ? 'Review clinical details, symptom notes, and patient profile.'
          : 'Your consultation has been locked into the hospital operational ledger.'
      }
      maxWidth="3xl"
    >
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 text-xs">
        <div className={`flex items-center gap-1.5 font-bold ${step >= 1 ? 'text-teal-600' : 'text-slate-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-teal-600 text-white' : 'bg-slate-200'}`}>1</span>
          <span>Clinician & Slot</span>
        </div>
        <div className="w-8 h-px bg-slate-200" />
        <div className={`flex items-center gap-1.5 font-bold ${step >= 2 ? 'text-teal-600' : 'text-slate-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-teal-600 text-white' : 'bg-slate-200'}`}>2</span>
          <span>Details & Reason</span>
        </div>
        <div className="w-8 h-px bg-slate-200" />
        <div className={`flex items-center gap-1.5 font-bold ${step === 3 ? 'text-teal-600' : 'text-slate-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-teal-600 text-white' : 'bg-slate-200'}`}>3</span>
          <span>Confirmation</span>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-5">
          {/* Doctor selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Attending Clinician
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => {
                  setSelectedDoctorId(e.target.value);
                  setSelectedSlot(null);
                }}
                className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    Dr. {doc.name} - {doc.specialization} (${doc.consultationFee})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Appointment Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                }}
                className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Active Doctor Card Snippet */}
          {activeDoctor && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-teal-50/60 border border-teal-100 text-xs">
              <img
                src={activeDoctor.avatarUrl}
                alt={activeDoctor.name}
                className="w-12 h-12 rounded-xl object-cover border border-teal-200"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 truncate">Dr. {activeDoctor.name}</h4>
                  <span className="text-[10px] font-semibold bg-teal-100 text-teal-800 px-2 py-0.2 rounded-md">
                    {activeDoctor.departmentName}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 truncate">{activeDoctor.specialization} • Room {activeDoctor.roomNumber}</p>
                <p className="text-[10px] text-teal-700 mt-0.5">
                  Working hours: {activeDoctor.workingHours.start} - {activeDoctor.workingHours.end} • Duration: {activeDoctor.slotDurationMinutes} min
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-teal-800">${activeDoctor.consultationFee}</span>
                <p className="text-[10px] text-slate-500">Standard Visit</p>
              </div>
            </div>
          )}

          {/* Consultation Modality */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Consultation Modality
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAppointmentType('in-person')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                  appointmentType === 'in-person'
                    ? 'border-teal-500 bg-teal-50 text-teal-800 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <User className="w-4 h-4 text-teal-600" />
                <span>In-Person Hospital Visit</span>
              </button>

              <button
                type="button"
                onClick={() => setAppointmentType('teleconsult')}
                disabled={!activeDoctor.teleconsultAvailable}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                  appointmentType === 'teleconsult'
                    ? 'border-teal-500 bg-teal-50 text-teal-800 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                } ${!activeDoctor.teleconsultAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Video className="w-4 h-4 text-sky-600" />
                <span>Teleconsult (Video Room)</span>
              </button>
            </div>
          </div>

          {/* Generated Discrete Slots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" /> Available Appointment Slots ({dailySlots.filter((s) => s.available).length} available)
              </label>
              <span className="text-[11px] text-slate-500">Includes {activeDoctor.bufferMinutes}m clinic buffer</span>
            </div>

            {dailySlots.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Clinician Unavailable on this Date
                </div>
                <p className="mt-1 text-[11px]">
                  Dr. {activeDoctor.name} does not have standard clinical hours on this date or is scheduled on verified leave.
                </p>
                <button
                  type="button"
                  onClick={handleJoinWaitingList}
                  className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors"
                >
                  <ListOrdered className="w-3.5 h-3.5" /> Join Waiting List for This Date
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                {dailySlots.map((slot, idx) => {
                  const isSelected = selectedSlot?.start === slot.startTime;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot({ start: slot.startTime, end: slot.endTime })}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : slot.available
                          ? 'bg-white border-slate-200 text-slate-800 hover:border-teal-400 hover:bg-teal-50/50'
                          : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                      }`}
                    >
                      {slot.startTime} - {slot.endTime}
                      {!slot.available && (
                        <span className="block text-[9px] uppercase tracking-wider text-rose-500 font-normal no-underline">
                          Booked
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Conflict Diagnostics Alert (if any) */}
          {conflictDiagnosis && !conflictDiagnosis.isValid && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs animate-shake">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                Scheduling Conflict Diagnostics: {conflictDiagnosis.conflictType}
              </div>
              <p className="mt-1 text-[11px] leading-relaxed">{conflictDiagnosis.message}</p>
            </div>
          )}

          {/* Smart Alternative Slots Recommendations */}
          {alternativeSlots.length > 0 && (!selectedSlot || (conflictDiagnosis && !conflictDiagnosis.isValid)) && (
            <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Smart Alternative Slot Suggestions
                </h5>
                <span className="text-[10px] text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-md font-mono">
                  Ranked by Closeness
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mb-3">
                Calculated based on preferred time, nearest working shift, and department colleague capacity.
              </p>
              <div className="space-y-2">
                {alternativeSlots.map((alt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-sky-200/60 hover:border-sky-400 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {alt.date} • {alt.startTime} - {alt.endTime}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Dr. {alt.doctorName} ({alt.specialization})
                      </div>
                      <div className="text-[10px] text-teal-600 font-medium">{alt.matchReason}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectAlternative(alt)}
                      className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                    >
                      Select Slot
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleJoinWaitingList}
              className="text-xs text-teal-600 font-semibold hover:underline flex items-center gap-1"
            >
              <ListOrdered className="w-3.5 h-3.5" /> Join Waiting List Instead
            </button>

            <button
              type="button"
              disabled={!selectedSlot || (conflictDiagnosis !== null && !conflictDiagnosis.isValid)}
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span>Next: Clinical Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <h5 className="font-bold text-slate-900">Appointment Summary</h5>
            <div className="grid grid-cols-2 gap-2 mt-2 text-slate-600">
              <div><span className="font-semibold text-slate-700">Doctor:</span> Dr. {activeDoctor.name}</div>
              <div><span className="font-semibold text-slate-700">Department:</span> {activeDoctor.departmentName}</div>
              <div><span className="font-semibold text-slate-700">Date & Time:</span> {selectedDate} ({selectedSlot?.start} - {selectedSlot?.end})</div>
              <div><span className="font-semibold text-slate-700">Modality:</span> {appointmentType === 'in-person' ? 'In-Person (Room ' + activeDoctor.roomNumber + ')' : 'Secure Teleconsult'}</div>
            </div>
          </div>

          {/* Patient Details Confirmation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Patient Full Name & Contact
            </label>
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-800">{patientProfile?.name || user?.name || 'Sarah Jenkins'}</p>
              <p className="text-slate-500">{patientProfile?.email || user?.email || 'patient@example.com'} • {patientProfile?.phone || '+1 (555) 912-3456'}</p>
              {patientProfile?.allergies && patientProfile.allergies.length > 0 && (
                <div className="mt-2 text-[11px] text-rose-600 font-medium">
                  Recorded Allergies: {patientProfile.allergies.join(', ')}
                </div>
              )}
            </div>
          </div>

          {/* Reason for visit */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reason for Visit / Primary Symptoms <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
              placeholder="e.g. Mild shortness of breath when walking, persistent cough for 4 days, medication follow-up..."
              className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-teal-900">Total Consultation Fee</div>
              <div className="text-[11px] text-teal-700">Pre-authorized under clinic standard tier</div>
            </div>
            <div className="text-base font-extrabold text-teal-800">${activeDoctor.consultationFee}.00</div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleConfirmBooking}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Lock Appointment</span>
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center text-center py-4 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h4 className="text-lg font-bold text-slate-900">Appointment Successfully Booked!</h4>
            <p className="text-xs text-slate-500 mt-1">
              Your record is confirmed and synched with the hospital queue.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 w-full max-w-md text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Booking Reference</span>
              <span className="font-mono font-bold text-slate-900">{createdAppointmentNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Attending Doctor</span>
              <span className="font-semibold text-slate-800">Dr. {activeDoctor.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Date & Slot</span>
              <span className="font-semibold text-slate-800">{selectedDate} ({selectedSlot?.start})</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Location</span>
              <span className="font-semibold text-slate-800">
                {appointmentType === 'in-person' ? `Room ${activeDoctor.roomNumber}` : 'Teleconsult Link Active'}
              </span>
            </div>
          </div>

          <div className="flex gap-3 w-full max-w-md pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                // trigger check-in if same day
                const currentAppt = storage.getAppointments().find((a) => a.appointmentNumber === createdAppointmentNumber);
                if (currentAppt) {
                  storage.checkInAndGenerateToken(currentAppt.id);
                  showToast('success', 'Token Generated', 'You have been checked in to the digital queue.');
                }
              }}
              className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Check-In & Get Token
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
