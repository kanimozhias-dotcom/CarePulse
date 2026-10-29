import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  ShieldCheck,
  CalendarX
} from 'lucide-react';
import { Doctor, DoctorLeave } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const ScheduleRoster: React.FC = () => {
  const { user, role, doctorProfile } = useAuth();
  const { showToast } = useNotification();

  const doctors = useMemo(() => storage.getDoctors(), []);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    doctorProfile?.id || doctors[0]?.id || ''
  );

  const [leaves, setLeaves] = useState<DoctorLeave[]>(() => storage.getDoctorLeaves());
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Leave Form State
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  // Working Hours Editor
  const activeDoctor = useMemo(() => {
    return doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
  }, [doctors, selectedDoctorId]);

  const [startTime, setStartTime] = useState(activeDoctor?.workingHours.start || '09:00');
  const [endTime, setEndTime] = useState(activeDoctor?.workingHours.end || '17:00');
  const [slotDuration, setSlotDuration] = useState(activeDoctor?.slotDurationMinutes || 20);
  const [bufferDuration, setBufferDuration] = useState(activeDoctor?.bufferMinutes || 5);
  const [workingDays, setWorkingDays] = useState<number[]>(activeDoctor?.workingDays || [1, 2, 3, 4, 5]);

  const doctorLeaves = useMemo(() => {
    return leaves.filter((l) => l.doctorId === activeDoctor?.id);
  }, [leaves, activeDoctor]);

  const handleDayToggle = (dayIndex: number) => {
    if (workingDays.includes(dayIndex)) {
      setWorkingDays(workingDays.filter((d) => d !== dayIndex));
    } else {
      setWorkingDays([...workingDays, dayIndex].sort());
    }
  };

  const handleSaveSchedule = () => {
    if (!activeDoctor) return;
    const updated: Doctor = {
      ...activeDoctor,
      workingHours: { start: startTime, end: endTime },
      slotDurationMinutes: Number(slotDuration),
      bufferMinutes: Number(bufferDuration),
      workingDays,
    };
    storage.saveDoctor(updated);
    storage.recordAudit({
      actorId: user?.id || 'admin',
      actorName: user?.name || 'Administrator',
      actorRole: role,
      action: 'SCHEDULE_MODIFIED',
      resourceType: 'Doctor',
      resourceId: activeDoctor.id,
      description: `Updated clinical schedule for Dr. ${activeDoctor.name}: ${startTime}-${endTime}, ${slotDuration}m slot, ${bufferDuration}m buffer.`,
      severity: 'info',
    });
    showToast('success', 'Roster Updated', 'Clinician operating parameters successfully committed.');
  };

  const handleAddLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoctor || !leaveStartDate || !leaveEndDate) {
      showToast('error', 'Incomplete Form', 'Please select valid start and end dates.');
      return;
    }
    if (leaveStartDate > leaveEndDate) {
      showToast('error', 'Invalid Date Range', 'Start date cannot be after end date.');
      return;
    }

    const newLeave = storage.addDoctorLeave({
      doctorId: activeDoctor.id,
      doctorName: activeDoctor.name,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      reason: leaveReason || 'Annual Clinical Leave',
      approved: true,
    });

    setLeaves(storage.getDoctorLeaves());
    setShowLeaveModal(false);
    showToast('success', 'Leave Registered', `Dates ${leaveStartDate} through ${leaveEndDate} blocked from bookings.`);

    // Check if any existing appointments conflict and notify
    const appts = storage.getAppointments();
    const impacted = appts.filter(
      (a) =>
        a.doctorId === activeDoctor.id &&
        a.date >= leaveStartDate &&
        a.date <= leaveEndDate &&
        a.status !== 'cancelled'
    );

    if (impacted.length > 0) {
      showToast('warning', 'Existing Bookings Affected', `${impacted.length} patient appointment(s) coincide with this leave period and will require rescheduling.`);
    }

    setLeaveStartDate('');
    setLeaveEndDate('');
    setLeaveReason('');
  };

  const handleCancelLeave = (id: string) => {
    storage.cancelDoctorLeave(id);
    setLeaves(storage.getDoctorLeaves());
    showToast('info', 'Leave Revoked', 'Clinician availability restored for the selected period.');
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Clinician Schedule & Leave Roster</h2>
            <Badge variant="teal" size="sm">Module 5</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure working hours, slot granularities, buffer intervals, and official leave blocking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedDoctorId}
            onChange={(e) => {
              setSelectedDoctorId(e.target.value);
              const doc = doctors.find((d) => d.id === e.target.value);
              if (doc) {
                setStartTime(doc.workingHours.start);
                setEndTime(doc.workingHours.end);
                setSlotDuration(doc.slotDurationMinutes);
                setBufferDuration(doc.bufferMinutes);
                setWorkingDays(doc.workingDays);
              }
            }}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800"
          >
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>Dr. {d.name} ({d.departmentName})</option>
            ))}
          </select>

          <button
            onClick={() => setShowLeaveModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <CalendarX className="w-3.5 h-3.5" />
            <span>Add Leave Period</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Working hours config (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Weekly Clinical Hours & Capacity</h3>
              <p className="text-xs text-slate-500">Dr. {activeDoctor.name} • {activeDoctor.specialization}</p>
            </div>
            <span className="font-mono text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded-md font-bold">
              Room {activeDoctor.roomNumber}
            </span>
          </div>

          {/* Working Days Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Designated Clinical Days
            </label>
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day, idx) => {
                const isActive = workingDays.includes(idx);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(idx)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      isActive
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shift Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Shift Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Shift End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Slot Duration and Buffer */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Consultation Slot Duration (mins)
              </label>
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              >
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes (Standard)</option>
                <option value={30}>30 Minutes (Comprehensive)</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Clinic Disinfection & Buffer (mins)
              </label>
              <select
                value={bufferDuration}
                onChange={(e) => setBufferDuration(Number(e.target.value))}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              >
                <option value={0}>0 Minutes (Zero buffer)</option>
                <option value={5}>5 Minutes (Standard)</option>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveSchedule}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Save Schedule Settings
            </button>
          </div>
        </div>

        {/* Right: Leave dates & blocked slots (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              <CalendarX className="w-4 h-4 text-rose-600" />
              Approved Leaves ({doctorLeaves.length})
            </h3>
            <span className="text-[10px] text-slate-400">Blocks new bookings</span>
          </div>

          {doctorLeaves.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border border-dashed rounded-xl">
              <CheckCircle className="w-8 h-8 mx-auto text-teal-500 mb-2" />
              <p className="text-xs font-bold text-slate-700">Full Availability</p>
              <p className="text-[11px] text-slate-400 mt-0.5">No leave registered on file.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {doctorLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200/80 flex items-start justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-rose-900">
                      {leave.startDate} to {leave.endDate}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                      Reason: {leave.reason}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                      <ShieldCheck className="w-3 h-3" /> System Verified Leave
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancelLeave(leave.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                    title="Revoke leave"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <div className="font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Auto-Conflict Resolution
            </div>
            <p className="text-[11px] mt-1 leading-relaxed">
              When a clinician logs an emergency leave, the system highlights booked slots on the admin console to expedite automated alternative recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* Add Leave Modal */}
      <Modal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        title="Schedule Clinician Leave"
        subtitle={`Register leave for Dr. ${activeDoctor.name} to block patient scheduling`}
        maxWidth="md"
      >
        <form onSubmit={handleAddLeave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={leaveStartDate}
                onChange={(e) => setLeaveStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={leaveEndDate}
                onChange={(e) => setLeaveEndDate(e.target.value)}
                min={leaveStartDate || new Date().toISOString().split('T')[0]}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason for Leave</label>
            <input
              type="text"
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="e.g. Medical Symposium, Personal Leave, Surgical Training"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowLeaveModal(false)}
              className="px-4 py-2 border rounded-xl hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xs"
            >
              Submit & Block Slots
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
