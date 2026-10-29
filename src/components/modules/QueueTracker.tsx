import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  Volume2, 
  UserCheck, 
  CheckCircle, 
  AlertCircle, 
  RotateCw, 
  Search, 
  Filter, 
  Activity,
  Play,
  SkipForward,
  Info
} from 'lucide-react';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { QueueToken } from '../../types';
import { Badge, getStatusBadgeVariant } from '../common/Badge';

export const QueueTracker: React.FC = () => {
  const { role, user, doctorProfile } = useAuth();
  const { showToast } = useNotification();

  const [tokens, setTokens] = useState<QueueToken[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [callingAnimation, setCallingAnimation] = useState<string | null>(null);

  const doctors = useMemo(() => storage.getDoctors(), []);

  const loadTokens = () => {
    setTokens(storage.getQueueTokens());
    setLastRefreshed(new Date());
  };

  useEffect(() => {
    loadTokens();
    // Periodic refresh every 15s to simulate real-time queue synchronization
    const timer = setInterval(() => {
      loadTokens();
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const filteredTokens = useMemo(() => {
    if (selectedDoctorId === 'all') return tokens;
    return tokens.filter((t) => t.doctorId === selectedDoctorId);
  }, [tokens, selectedDoctorId]);

  const currentlyConsulting = filteredTokens.find((t) => t.status === 'in-consultation');
  const waitingTokens = filteredTokens.filter((t) => t.status === 'waiting');
  const completedTokens = filteredTokens.filter((t) => t.status === 'completed');
  const delayedTokens = filteredTokens.filter((t) => t.status === 'delayed');

  const handleCallNext = () => {
    const targetDoctorId = doctorProfile?.id || (selectedDoctorId !== 'all' ? selectedDoctorId : doctors[0].id);
    const called = storage.callNextToken(targetDoctorId);
    if (called) {
      setCallingAnimation(called.displayCode);
      showToast('success', 'Token Called', `Calling Token ${called.displayCode} (${called.patientName}) into consultation room.`);
      setTimeout(() => setCallingAnimation(null), 3000);
      loadTokens();
    } else {
      showToast('warning', 'Queue Empty', 'No patients currently waiting in this queue.');
    }
  };

  const handleMarkDelayed = (tokenId: string) => {
    storage.updateTokenStatus(tokenId, 'delayed');
    showToast('info', 'Status Updated', 'Patient marked as delayed.');
    loadTokens();
  };

  const handleMarkCompleted = (tokenId: string) => {
    storage.updateTokenStatus(tokenId, 'completed');
    showToast('success', 'Consultation Finished', 'Token marked as completed.');
    loadTokens();
  };

  const isStaff = role === 'doctor' || role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Digital Queue & Token Tracker</h2>
            <Badge variant="teal" size="sm">Module 2</Badge>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time outpatient queue status, live waiting estimations, and token calling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadTokens}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Refreshed: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </button>

          {isStaff && (
            <button
              onClick={handleCallNext}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:scale-102"
            >
              <Volume2 className="w-4 h-4" />
              <span>Call Next Token</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter by Clinic/Doctor */}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-100 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700">Filter Queue by Specialist:</span>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:bg-white focus:outline-hidden"
          >
            <option value="all">All Clinics & Specialists</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                Dr. {d.name} ({d.departmentName})
              </option>
            ))}
          </select>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Waiting times are estimates calculated from clinic pace</span>
        </div>
      </div>

      {/* High-visibility Live Digital Board Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Big Screen "Now Calling" Box */}
        <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl border border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <span className="text-[11px] font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-teal-400" /> NOW IN CONSULTATION
              </span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">
                ROOM ACTIVE
              </span>
            </div>

            {currentlyConsulting ? (
              <div className={`my-8 text-center transition-transform ${callingAnimation ? 'scale-110' : ''}`}>
                <div className="text-5xl sm:text-6xl font-black font-mono tracking-wider text-teal-400 drop-shadow-md">
                  {currentlyConsulting.displayCode}
                </div>
                <div className="text-base font-bold text-white mt-2">
                  {currentlyConsulting.patientName}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Dr. {currentlyConsulting.doctorName} • {currentlyConsulting.departmentName}
                </div>
                <div className="mt-3 inline-block px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold">
                  Called at {currentlyConsulting.calledTime || '09:02 AM'}
                </div>
              </div>
            ) : (
              <div className="my-12 text-center text-slate-400">
                <Clock className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-semibold">No patient currently inside room</p>
                <p className="text-xs text-slate-500 mt-1">Ready to call next patient from queue</p>
              </div>
            )}
          </div>

          {/* Quick Doctor Controls */}
          {isStaff && currentlyConsulting && (
            <div className="pt-4 border-t border-slate-700/80 flex gap-2">
              <button
                onClick={() => handleMarkCompleted(currentlyConsulting.id)}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark Completed</span>
              </button>
              <button
                onClick={() => handleMarkDelayed(currentlyConsulting.id)}
                className="py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                title="Move to delayed buffer"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Delay</span>
              </button>
            </div>
          )}
        </div>

        {/* Right 2 Columns: Patients in Line Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-teal-600" />
                Waiting Room Queue ({waitingTokens.length} in line)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Patients holding confirmed tokens ordered by arrival and check-in timestamp.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-sky-50 text-sky-700 rounded-lg font-semibold">
                Avg wait: ~18m / consult
              </span>
            </div>
          </div>

          {waitingTokens.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
              <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-xs font-bold text-slate-700">All patients have been served!</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Queue is currently clear.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Token #</th>
                    <th className="pb-3">Patient Name</th>
                    <th className="pb-3">Attending Doctor</th>
                    <th className="pb-3">Check-In</th>
                    <th className="pb-3">Est. Wait</th>
                    <th className="pb-3">Status</th>
                    {isStaff && <th className="pb-3 text-right pr-2">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {waitingTokens.map((tok, idx) => (
                    <tr key={tok.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 pl-2">
                        <span className="font-mono font-extrabold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                          {tok.displayCode}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-slate-800">{tok.patientName}</td>
                      <td className="py-3 text-slate-600">Dr. {tok.doctorName}</td>
                      <td className="py-3 text-slate-500">{tok.checkInTime}</td>
                      <td className="py-3">
                        <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                          ~{tok.estimatedWaitMinutes} mins*
                        </span>
                      </td>
                      <td className="py-3">
                        <Badge variant="blue" size="sm" dot>
                          Waiting ({idx + 1} in line)
                        </Badge>
                      </td>
                      {isStaff && (
                        <td className="py-3 text-right pr-2">
                          <button
                            onClick={() => {
                              storage.callNextToken(tok.doctorId);
                              loadTokens();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[11px] shadow-2xs"
                          >
                            Call Now
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Completed / History Tab Section */}
          {completedTokens.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <h5 className="text-xs font-bold text-slate-700 mb-2">Completed Consultations Today</h5>
              <div className="flex flex-wrap gap-2">
                {completedTokens.map((tok) => (
                  <div
                    key={tok.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px]"
                  >
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    <span className="font-mono font-bold">{tok.displayCode}</span>
                    <span>({tok.patientName})</span>
                    <span className="text-[10px] text-slate-400">@ {tok.completedTime}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
