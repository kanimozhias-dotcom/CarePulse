import React, { useMemo } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Stethoscope, 
  Calendar, 
  Clock, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight,
  TrendingUp,
  Settings,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const appointments = useMemo(() => storage.getAppointments(), []);
  const doctors = useMemo(() => storage.getDoctors(), []);
  const patients = useMemo(() => storage.getPatients(), []);
  const departments = useMemo(() => storage.getDepartments(), []);
  const auditLogs = useMemo(() => storage.getAuditLogs(), []);
  const waitlist = useMemo(() => storage.getWaitingList(), []);
  const queueTokens = useMemo(() => storage.getQueueTokens(), []);

  const pendingWaitlist = waitlist.filter((w) => w.status === 'pending').length;
  const activeQueueCount = queueTokens.filter((t) => t.status === 'waiting' || t.status === 'in-consultation').length;

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/30">
              Admin Executive Command
            </span>
            <span className="text-xs text-slate-400">Hospital Operational Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            Hospital System Overview
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Real-time multi-department outpatient orchestration, clinical capacity utilization, and security audit trail.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('analytics')}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Workload Analytics</span>
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* KPI 4-Card Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('patient-management')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Registered Patients</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{patients.length + 180}</div>
          <p className="text-[10px] text-teal-600 font-semibold mt-1">EMR charts & allergies linked</p>
        </div>

        <div 
          onClick={() => onNavigate('doctor-management')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Medical Specialists</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{doctors.length}</div>
          <p className="text-[10px] text-sky-600 font-semibold mt-1">Across 6 hospital clinics</p>
        </div>

        <div 
          onClick={() => onNavigate('queue')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Queue Tokens</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{activeQueueCount}</div>
          <p className="text-[10px] text-slate-400 mt-1">Checked in at outpatient rooms</p>
        </div>

        <div 
          onClick={() => onNavigate('waiting-list')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Waitlist Candidates</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 mt-2">{pendingWaitlist}</div>
          <p className="text-[10px] text-purple-600 font-semibold mt-1">Auto-matched on cancellations</p>
        </div>
      </div>

      {/* Two Column Grid: Master Clinical Load & Recent Security Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Department Clinical Capacity (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Hospital Clinical Departments</h3>
              <p className="text-xs text-slate-500">Active outpatient wings and head clinicians</p>
            </div>
            <button
              onClick={() => onNavigate('settings')}
              className="text-xs text-teal-600 font-semibold hover:underline"
            >
              Configure
            </button>
          </div>

          <div className="space-y-2.5">
            {departments.map((dept) => {
              const docCount = doctors.filter((d) => d.departmentId === dept.id).length;
              return (
                <div
                  key={dept.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-[10px] border border-teal-200">
                        {dept.code}
                      </span>
                      <h4 className="font-bold text-slate-900">{dept.name}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{dept.location}</p>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-slate-800">{docCount} Clinicians</span>
                    <span className="block text-[10px] text-emerald-600">Active</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Security & Operational Audit Log Activity (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-purple-600" />
                Recent Security Audit Events
              </h3>
              <p className="text-xs text-slate-500">Live immutable administrative trace</p>
            </div>
            <button
              onClick={() => onNavigate('audit-logs')}
              className="text-xs text-purple-600 font-semibold hover:underline"
            >
              View Full Trail
            </button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {auditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-[10px] bg-slate-200/80 px-1.5 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 mt-1 line-clamp-1">{log.description}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Actor: {log.actorName} ({log.actorRole})
                  </p>
                </div>

                <Badge variant={log.severity === 'critical' ? 'rose' : log.severity === 'warning' ? 'amber' : 'blue'} size="sm">
                  {log.severity}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
