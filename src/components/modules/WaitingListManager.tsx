import React, { useState, useMemo } from 'react';
import { 
  ListOrdered, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  User, 
  Bell, 
  Sparkles, 
  ArrowRight, 
  X,
  Stethoscope,
  ShieldCheck
} from 'lucide-react';
import { WaitingListEntry, Doctor } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const WaitingListManager: React.FC = () => {
  const { user, role, patientProfile } = useAuth();
  const { showToast } = useNotification();

  const [waitlist, setWaitlist] = useState<WaitingListEntry[]>(() => storage.getWaitingList());
  const doctors = useMemo(() => storage.getDoctors(), []);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || '');
  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [preferredTimeRange, setPreferredTimeRange] = useState<WaitingListEntry['preferredTimeRange']>('morning');

  const filteredList = useMemo(() => {
    if (role === 'patient') {
      const myId = patientProfile?.id || user?.id || 'pat-1';
      return waitlist.filter((w) => w.patientId === myId);
    }
    return waitlist;
  }, [waitlist, role, patientProfile, user]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
    const patId = patientProfile?.id || user?.id || 'pat-1';
    const patName = patientProfile?.name || user?.name || 'Sarah Jenkins';
    const patPhone = patientProfile?.phone || '+1 (555) 912-3456';
    const patEmail = patientProfile?.email || user?.email || 'patient@example.com';

    storage.addToWaitingList({
      patientId: patId,
      patientName: patName,
      patientPhone: patPhone,
      patientEmail: patEmail,
      doctorId: doc.id,
      doctorName: doc.name,
      departmentId: doc.departmentId,
      preferredDate,
      preferredTimeRange,
    });

    setWaitlist(storage.getWaitingList());
    setShowAddModal(false);
    showToast('success', 'Joined Waiting List', `Queued for Dr. ${doc.name} on ${preferredDate}.`);
  };

  const handleSimulateSlotFreed = (entry: WaitingListEntry) => {
    // Simulate a cancellation freeing up a slot
    storage.checkWaitingListForSlot(
      entry.doctorId || doctors[0].id,
      entry.preferredDate,
      '11:00',
      '11:20'
    );
    setWaitlist(storage.getWaitingList());
    showToast('success', 'Slot Release Simulated', `Notification dispatched to ${entry.patientName} for ${entry.preferredDate} at 11:00 AM.`);
  };

  const handleBookFromMatched = (entry: WaitingListEntry) => {
    if (!entry.matchedSlot) return;
    const doc = doctors.find((d) => d.id === entry.doctorId) || doctors[0];

    const appt = storage.createAppointment({
      patientId: entry.patientId,
      patientName: entry.patientName,
      patientPhone: entry.patientPhone,
      patientEmail: entry.patientEmail,
      doctorId: doc.id,
      doctorName: doc.name,
      doctorSpecialization: doc.specialization,
      departmentId: doc.departmentId,
      date: entry.matchedSlot.date,
      startTime: entry.matchedSlot.startTime,
      endTime: entry.matchedSlot.endTime,
      type: 'in-person',
      status: 'confirmed',
      reasonForVisit: 'Priority booking via automated waiting list match',
      fee: doc.consultationFee,
      paid: true,
    });

    // Update waitlist entry status to booked
    const currentList = storage.getWaitingList();
    const target = currentList.find((w) => w.id === entry.id);
    if (target) {
      target.status = 'booked';
      // persist updated list
      setWaitlist([...currentList]);
    }

    showToast('success', 'Appointment Created', `Booked from waiting list: ${appt.appointmentNumber}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Waiting-List & Smart Conflict Diagnostics</h2>
            <Badge variant="teal" size="sm">Module 8</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic matching engine that recovers cancelled clinic capacity and resolves double-booking anomalies.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <ListOrdered className="w-4 h-4" />
          <span>Join Priority Waiting List</span>
        </button>
      </div>

      {/* Diagnostics Explanation Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Deterministic Slot Recovery</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              When an appointment is cancelled, the engine instantly scans for registered waitlist patients whose preferences match the freed slot.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Zero-Collision Booking Lock</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Rules strictly enforce: No double booking, no overlapping patient encounters, no bookings during doctor leaves or outside working shifts.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Automated Patient Alerting</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Waiting-list patients receive instantaneous notification badges with one-click direct reservation of the opened appointment slot.
            </p>
          </div>
        </div>
      </div>

      {/* Waiting List Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900">
            Active Priority Waiting List ({filteredList.length})
          </h3>
          <span className="text-xs text-slate-400">Ordered by request timestamp</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50">
                <th className="py-3 pl-4">Patient</th>
                <th className="py-3">Requested Clinician</th>
                <th className="py-3">Preferred Date</th>
                <th className="py-3">Time Window</th>
                <th className="py-3">Status</th>
                <th className="py-3">Matched Slot</th>
                <th className="py-3 text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No active waiting list entries currently recorded.
                  </td>
                </tr>
              ) : (
                filteredList.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 pl-4">
                      <div className="font-bold text-slate-900">{entry.patientName}</div>
                      <div className="text-[10px] text-slate-400">{entry.patientPhone}</div>
                    </td>
                    <td className="py-3.5 text-slate-700">Dr. {entry.doctorName || 'Any Available'}</td>
                    <td className="py-3.5 font-medium text-slate-800">{entry.preferredDate}</td>
                    <td className="py-3.5 capitalize text-slate-600">{entry.preferredTimeRange || 'Any'}</td>
                    <td className="py-3.5">
                      <Badge
                        variant={
                          entry.status === 'notified'
                            ? 'amber'
                            : entry.status === 'booked'
                            ? 'emerald'
                            : 'blue'
                        }
                        size="sm"
                        dot
                      >
                        {entry.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5">
                      {entry.matchedSlot ? (
                        <div className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md inline-block">
                          {entry.matchedSlot.date} @ {entry.matchedSlot.startTime}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Pending release</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right pr-4 space-x-2">
                      {entry.status === 'notified' && (
                        <button
                          onClick={() => handleBookFromMatched(entry)}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors"
                        >
                          Lock Slot
                        </button>
                      )}

                      {(role === 'admin' || role === 'doctor') && entry.status === 'pending' && (
                        <button
                          onClick={() => handleSimulateSlotFreed(entry)}
                          className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold transition-colors"
                          title="Simulate cancelled slot matching this patient"
                        >
                          Simulate Slot Release
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Join Priority Waiting List"
        subtitle="We will immediately notify you when a slot opens due to rescheduling or cancellation."
        maxWidth="md"
      >
        <form onSubmit={handleJoin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Preferred Specialist</label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>Dr. {d.name} ({d.specialization})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Date</label>
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Preferred Time of Day</label>
            <select
              value={preferredTimeRange}
              onChange={(e) => setPreferredTimeRange(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            >
              <option value="any">Any Available Time (Fastest Match)</option>
              <option value="morning">Morning (09:00 - 12:00)</option>
              <option value="afternoon">Afternoon (12:00 - 15:00)</option>
              <option value="evening">Late Afternoon / Evening (15:00+)</option>
            </select>
          </div>

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
              Enroll in Waitlist
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
