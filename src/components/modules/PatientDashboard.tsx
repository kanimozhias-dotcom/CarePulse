import React, { useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Heart, 
  AlertCircle, 
  CheckCircle, 
  FlaskConical, 
  Plus, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  Video,
  UserCheck
} from 'lucide-react';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Badge } from '../common/Badge';

interface PatientDashboardProps {
  onBookAppointment: () => void;
  onNavigate: (view: string) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  onBookAppointment,
  onNavigate,
}) => {
  const { user, patientProfile } = useAuth();
  const { showToast } = useNotification();

  const myPatientId = patientProfile?.id || 'pat-1';

  const myAppointments = useMemo(() => {
    return storage.getAppointments().filter((a) => a.patientId === myPatientId);
  }, [myPatientId]);

  const upcomingAppt = useMemo(() => {
    return myAppointments.find(
      (a) => a.status === 'scheduled' || a.status === 'confirmed' || a.status === 'in-consultation'
    );
  }, [myAppointments]);

  const myLabReports = useMemo(() => {
    return storage.getLabReports().filter((r) => r.patientId === myPatientId);
  }, [myPatientId]);

  const myTokens = useMemo(() => {
    return storage.getQueueTokens().filter((t) => t.patientId === myPatientId && t.status !== 'completed');
  }, [myPatientId]);

  const activeToken = myTokens[0];

  const handleSelfCheckIn = (appointmentId: string) => {
    const tok = storage.checkInAndGenerateToken(appointmentId);
    if (tok) {
      showToast('success', 'Token Assigned', `Checked in! Your digital queue token is ${tok.displayCode}.`);
      onNavigate('queue');
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-sky-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full text-teal-100">
            CarePulse Patient Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
            Welcome back, {patientProfile?.name || user?.name || 'Sarah'}
          </h1>
          <p className="text-xs sm:text-sm text-teal-50 mt-1 leading-relaxed">
            Manage your consultations, access clinical lab diagnostics, track live waiting tokens, and connect with verified medical specialists.
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={onBookAppointment}
              className="px-4 py-2.5 rounded-xl bg-white text-teal-800 text-xs font-bold shadow-md hover:bg-teal-50 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Book New Consultation</span>
            </button>
            <button
              onClick={() => onNavigate('queue')}
              className="px-4 py-2.5 rounded-xl bg-teal-800/60 hover:bg-teal-800 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 transition-all flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4" />
              <span>Track Live Queue</span>
            </button>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 translate-x-8 translate-y-8 pointer-events-none">
          <Heart className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* Allergies / Medical Safety Alert Strip */}
      {patientProfile?.allergies && patientProfile.allergies.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-between text-xs text-rose-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold">Recorded Allergies on Medical Chart: </span>
              <span className="font-semibold">{patientProfile.allergies.join(', ')}</span>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Automatically flagged to all attending physicians during clinical orders.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('profile')}
            className="text-xs font-bold text-rose-700 hover:underline shrink-0"
          >
            Update Chart
          </button>
        </div>
      )}

      {/* Main Grid: Active Token & Upcoming Appointment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Token Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-600" />
                Active Digital Queue Token
              </h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Live Sensor
              </span>
            </div>

            {activeToken ? (
              <div className="py-6 text-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Your Turn In Line
                </span>
                <div className="text-4xl sm:text-5xl font-mono font-extrabold text-teal-700 bg-teal-50/70 inline-block px-5 py-2 rounded-2xl border border-teal-200">
                  {activeToken.displayCode}
                </div>
                <div className="mt-3 text-xs font-bold text-slate-800">
                  Dr. {activeToken.doctorName} • {activeToken.departmentName}
                </div>
                <div className="mt-2 text-xs text-amber-600 font-semibold bg-amber-50 inline-block px-3 py-1 rounded-full">
                  Estimated Waiting: ~{activeToken.estimatedWaitMinutes} minutes*
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Checked in at {activeToken.checkInTime}. Estimated wait time updates dynamically based on consultation pace.
                </p>
              </div>
            ) : upcomingAppt ? (
              <div className="py-6 text-center">
                <UserCheck className="w-10 h-10 text-teal-600 mx-auto mb-2" />
                <h4 className="font-bold text-xs text-slate-800">Upcoming Visit Ready for Check-In</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Dr. {upcomingAppt.doctorName} ({upcomingAppt.date} @ {upcomingAppt.startTime})
                </p>
                <button
                  onClick={() => handleSelfCheckIn(upcomingAppt.id)}
                  className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Check In & Generate Token
                </button>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">
                <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-medium">No active waiting token</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Tokens generate upon hospital arrival check-in.</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Department: Cardiology / Outpatient</span>
            <button
              onClick={() => onNavigate('queue')}
              className="text-teal-600 font-bold hover:underline flex items-center gap-1"
            >
              <span>View Full Queue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Next Appointment Details (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" />
                Next Scheduled Consultation
              </h3>
              {upcomingAppt && (
                <Badge variant={upcomingAppt.type === 'teleconsult' ? 'purple' : 'teal'} size="sm">
                  {upcomingAppt.type === 'teleconsult' ? 'Teleconsult' : 'In-Person'}
                </Badge>
              )}
            </div>

            {upcomingAppt ? (
              <div className="py-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      Dr. {upcomingAppt.doctorName}
                    </h4>
                    <p className="text-xs text-slate-500">{upcomingAppt.doctorSpecialization}</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                    {upcomingAppt.appointmentNumber}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Date & Time:</span>
                    <p className="font-bold text-slate-900">{upcomingAppt.date} ({upcomingAppt.startTime} - {upcomingAppt.endTime})</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Status:</span>
                    <p className="font-bold text-teal-700 capitalize">{upcomingAppt.status}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 font-medium">Reason for Visit:</span>
                    <p className="text-slate-700 mt-0.5">{upcomingAppt.reasonForVisit}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">
                <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-medium">No upcoming consultations scheduled</p>
                <button
                  onClick={onBookAppointment}
                  className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors"
                >
                  Book Appointment Now
                </button>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigate('my-appointments')}
              className="text-teal-600 font-bold hover:underline flex items-center gap-1"
            >
              <span>View Appointment History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-slate-400">Total Visits: {myAppointments.length}</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Diagnostic Vault Reports */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-teal-600" />
              Recent Diagnostic Lab Records ({myLabReports.length})
            </h3>
            <p className="text-xs text-slate-500">Validated reports released to your personal vault</p>
          </div>

          <button
            onClick={() => onNavigate('lab-reports')}
            className="text-xs text-teal-600 font-bold hover:underline flex items-center gap-1"
          >
            <span>Open Vault</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myLabReports.slice(0, 2).map((rep) => (
            <div
              key={rep.id}
              className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-start justify-between text-xs"
            >
              <div>
                <span className="font-mono text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-bold">
                  {rep.reportNumber}
                </span>
                <h4 className="font-bold text-slate-900 mt-1">{rep.testName}</h4>
                <p className="text-[11px] text-slate-500">{rep.testDate} • Dr. {rep.doctorName}</p>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">{rep.resultsSummary}</p>
              </div>

              <button
                onClick={() => onNavigate('lab-reports')}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
