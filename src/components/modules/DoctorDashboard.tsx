import React, { useState, useMemo } from 'react';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  UserCheck, 
  Video, 
  CheckCircle, 
  FileText, 
  Volume2, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  CalendarX,
  Activity
} from 'lucide-react';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Badge } from '../common/Badge';

interface DoctorDashboardProps {
  onNavigate: (view: string) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onNavigate }) => {
  const { user, doctorProfile } = useAuth();
  const { showToast } = useNotification();

  const currentDoctor = doctorProfile || storage.getDoctors()[0];

  const appointments = useMemo(() => {
    return storage.getAppointments().filter((a) => a.doctorId === currentDoctor.id);
  }, [currentDoctor.id]);

  const queueTokens = useMemo(() => {
    return storage.getQueueTokens().filter((t) => t.doctorId === currentDoctor.id);
  }, [currentDoctor.id]);

  const waitingTokens = queueTokens.filter((t) => t.status === 'waiting');
  const activeToken = queueTokens.find((t) => t.status === 'in-consultation');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter((a) => a.date === todayStr);

  const completedToday = todayAppts.filter((a) => a.status === 'completed').length;
  const inConsultToday = todayAppts.filter((a) => a.status === 'in-consultation').length;
  const scheduledToday = todayAppts.filter((a) => a.status === 'scheduled' || a.status === 'confirmed').length;

  const handleCallNext = () => {
    const called = storage.callNextToken(currentDoctor.id);
    if (called) {
      showToast('success', 'Token Called', `Calling ${called.patientName} (${called.displayCode}) into consultation room.`);
      onNavigate('clinical-desk');
    } else {
      showToast('warning', 'Queue Empty', 'No patients currently waiting in your queue.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentDoctor.avatarUrl}
            alt={currentDoctor.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500 shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 px-2.5 py-0.5 rounded-full">
                Attending Staff
              </span>
              <span className="text-xs text-slate-400">Room {currentDoctor.roomNumber}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-1">
              Dr. {currentDoctor.name}
            </h1>
            <p className="text-xs text-slate-300">{currentDoctor.specialization} • {currentDoctor.departmentName}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleCallNext}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            <span>Call Next Patient</span>
          </button>
          <button
            onClick={() => onNavigate('clinical-desk')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-2"
          >
            <Stethoscope className="w-4 h-4 text-teal-400" />
            <span>Open Clinical Desk</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs text-slate-500">Today's Total Patients</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{todayAppts.length}</div>
          <span className="text-[10px] text-teal-600 font-semibold">{currentDoctor.slotDurationMinutes}m slot intervals</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs text-slate-500">Patients in Queue</span>
          <div className="text-2xl font-extrabold text-sky-600 mt-1">{waitingTokens.length}</div>
          <span className="text-[10px] text-slate-400">Checked in at waiting lounge</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs text-slate-500">Completed Encounters</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{completedToday}</div>
          <span className="text-[10px] text-slate-400">Diagnosis & Rx filed</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs text-slate-500">Teleconsult Capacity</span>
          <div className="text-2xl font-extrabold text-purple-600 mt-1">
            {currentDoctor.teleconsultAvailable ? 'Active' : 'Disabled'}
          </div>
          <span className="text-[10px] text-slate-400">Encrypted WebRTC Room</span>
        </div>
      </div>

      {/* Grid: Live Consultation / Queue Calling + Schedule Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Consultation Box (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-600" />
                Active In-Room Patient
              </h3>
              <Badge variant="teal" size="sm" dot>In-Consultation</Badge>
            </div>

            {activeToken ? (
              <div className="py-6 text-center">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">
                  Active Clinical Token
                </span>
                <div className="text-5xl font-mono font-black text-teal-700 bg-teal-50 px-5 py-2.5 rounded-2xl inline-block border border-teal-200">
                  {activeToken.displayCode}
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-3">{activeToken.patientName}</h4>
                <p className="text-xs text-slate-500">Checked in: {activeToken.checkInTime} • Called: {activeToken.calledTime || 'Just now'}</p>

                <div className="mt-5 flex gap-2 justify-center">
                  <button
                    onClick={() => onNavigate('clinical-desk')}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    Open Examination Form
                  </button>
                  <button
                    onClick={() => {
                      storage.updateTokenStatus(activeToken.id, 'completed');
                      showToast('success', 'Encounter Completed', 'Token marked as finished.');
                      onNavigate('doctor-dashboard');
                    }}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Finish Visit
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No patient currently in examination room</p>
                <p className="text-[11px] text-slate-400 mt-1">Ready to call the next waiting token.</p>
                {waitingTokens.length > 0 && (
                  <button
                    onClick={handleCallNext}
                    className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors"
                  >
                    Call Token {waitingTokens[0].displayCode}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Shift: {currentDoctor.workingHours.start} - {currentDoctor.workingHours.end}</span>
            <button
              onClick={() => onNavigate('schedules')}
              className="text-teal-600 font-bold hover:underline flex items-center gap-1"
            >
              <span>Manage Shift & Leave</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Today's Full Schedule (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" />
                Today's Outpatient Appointments ({todayAppts.length})
              </h3>
              <p className="text-xs text-slate-500">Conflict-checked appointments scheduled for today</p>
            </div>

            <button
              onClick={() => onNavigate('schedules')}
              className="text-xs font-semibold text-teal-600 hover:underline"
            >
              Roster Calendar
            </button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {todayAppts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No appointments booked for today.
              </div>
            ) : (
              todayAppts.map((appt) => (
                <div
                  key={appt.id}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{appt.patientName}</span>
                      <span className="font-mono text-[10px] text-slate-400">({appt.startTime} - {appt.endTime})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{appt.reasonForVisit}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={appt.status === 'in-consultation' ? 'teal' : appt.status === 'completed' ? 'emerald' : 'blue'} size="sm" dot>
                      {appt.status}
                    </Badge>
                    <button
                      onClick={() => onNavigate('clinical-desk')}
                      className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-[11px]"
                    >
                      Chart
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
