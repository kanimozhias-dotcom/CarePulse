import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  UserCheck, 
  Video, 
  XCircle, 
  RotateCw, 
  CheckCircle, 
  ChevronRight, 
  AlertTriangle,
  Plus
} from 'lucide-react';
import { Appointment } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface MyAppointmentsProps {
  onBookAppointment: () => void;
  onNavigate: (view: string) => void;
}

export const MyAppointments: React.FC<MyAppointmentsProps> = ({
  onBookAppointment,
  onNavigate,
}) => {
  const { user, patientProfile } = useAuth();
  const { showToast } = useNotification();

  const [appointments, setAppointments] = useState<Appointment[]>(() => storage.getAppointments());
  const [filterTab, setFilterTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [cancellingAppt, setCancellingAppt] = useState<Appointment | null>(null);

  const myPatientId = patientProfile?.id || 'pat-1';

  const myAppointments = useMemo(() => {
    return appointments.filter((a) => a.patientId === myPatientId);
  }, [appointments, myPatientId]);

  const filteredAppointments = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return myAppointments.filter((a) => {
      if (filterTab === 'upcoming') {
        return a.date >= todayStr && a.status !== 'cancelled' && a.status !== 'completed';
      }
      if (filterTab === 'past') {
        return a.date < todayStr || a.status === 'completed' || a.status === 'cancelled';
      }
      return true;
    });
  }, [myAppointments, filterTab]);

  const handleConfirmCancel = () => {
    if (!cancellingAppt) return;
    storage.updateAppointment(
      cancellingAppt.id,
      { status: 'cancelled' },
      { id: user?.id || 'pat-1', name: user?.name || 'Sarah Jenkins', role: 'patient' }
    );
    setAppointments(storage.getAppointments());
    showToast('info', 'Appointment Cancelled', 'Slot released. Any waiting list patients have been notified.');
    setCancellingAppt(null);
  };

  const handleSelfCheckIn = (appt: Appointment) => {
    const tok = storage.checkInAndGenerateToken(appt.id);
    if (tok) {
      showToast('success', 'Checked In!', `Token #${tok.tokenNumber} (${tok.displayCode}) issued.`);
      onNavigate('queue');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">My Consultations & History</h2>
            <Badge variant="teal" size="sm">Patient Portal</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review your confirmed appointments, join digital queue upon arrival, or reschedule.
          </p>
        </div>

        <button
          onClick={onBookAppointment}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs font-semibold">
        {[
          { id: 'upcoming', label: 'Upcoming Consultations' },
          { id: 'past', label: 'Past / Completed' },
          { id: 'all', label: `All Records (${myAppointments.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl border transition-all ${
              filterTab === tab.id
                ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointment Cards */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center text-xs text-slate-400">
            <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No appointments in this view</p>
            <p className="text-[11px] text-slate-400 mt-1">Schedule a consultation with our clinician directory.</p>
          </div>
        ) : (
          filteredAppointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold shrink-0 border border-teal-100">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {appt.appointmentNumber}
                    </span>
                    <Badge variant={appt.type === 'teleconsult' ? 'purple' : 'teal'} size="sm">
                      {appt.type === 'teleconsult' ? 'Teleconsult' : 'In-Person'}
                    </Badge>
                    <Badge variant={appt.status === 'completed' ? 'emerald' : appt.status === 'cancelled' ? 'rose' : 'blue'} size="sm" dot>
                      {appt.status}
                    </Badge>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 mt-1">
                    Dr. {appt.doctorName}
                  </h3>
                  <p className="text-xs text-slate-500">{appt.doctorSpecialization}</p>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {appt.date} ({appt.startTime} - {appt.endTime})
                    </span>
                    <span>•</span>
                    <span className="text-[11px] text-slate-500 italic">"{appt.reasonForVisit}"</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                  <>
                    <button
                      onClick={() => handleSelfCheckIn(appt)}
                      className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Check In</span>
                    </button>

                    <button
                      onClick={() => setCancellingAppt(appt)}
                      className="px-3 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Cancel Slot
                    </button>
                  </>
                )}

                {appt.type === 'teleconsult' && appt.status !== 'cancelled' && (
                  <button
                    onClick={() => onNavigate('clinical-desk')}
                    className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Room</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cancellation Dialog */}
      {cancellingAppt && (
        <ConfirmDialog
          isOpen={!!cancellingAppt}
          onClose={() => setCancellingAppt(null)}
          onConfirm={handleConfirmCancel}
          title="Cancel Scheduled Consultation?"
          message={`Are you sure you want to release your appointment with Dr. ${cancellingAppt.doctorName} on ${cancellingAppt.date} at ${cancellingAppt.startTime}? This slot will immediately be made available to waiting-list patients.`}
          confirmLabel="Yes, Cancel Appointment"
          variant="danger"
        />
      )}
    </div>
  );
};
