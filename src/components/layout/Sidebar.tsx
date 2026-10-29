import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Calendar, 
  Clock, 
  FileText, 
  FlaskConical, 
  BarChart3, 
  ShieldAlert, 
  ListOrdered, 
  Bell, 
  Settings, 
  FolderHeart,
  ChevronLeft,
  ChevronRight,
  Globe,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onResetData: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  roles: UserRole[];
  moduleTag?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  collapsed,
  onToggleCollapse,
  onResetData,
}) => {
  const { role } = useAuth();

  const navItems: NavItem[] = [
    // Dashboards
    {
      id: 'patient-dashboard',
      label: 'Patient Portal',
      icon: LayoutDashboard,
      roles: ['patient'],
      moduleTag: 'Core',
    },
    {
      id: 'doctor-dashboard',
      label: 'Clinician Desk',
      icon: LayoutDashboard,
      roles: ['doctor'],
      moduleTag: 'Core',
    },
    {
      id: 'admin-dashboard',
      label: 'Admin Overview',
      icon: LayoutDashboard,
      roles: ['admin'],
      moduleTag: 'Core',
    },

    // Module 1: Clinician Directory & Smart Booking
    {
      id: 'doctors',
      label: 'Doctors & Booking',
      icon: Stethoscope,
      roles: ['patient', 'doctor', 'admin'],
      moduleTag: 'M1',
    },

    // Module 2: Digital Queue & Token Tracker
    {
      id: 'queue',
      label: 'Digital Queue & Token',
      icon: Clock,
      roles: ['patient', 'doctor', 'admin'],
      badge: 'Live',
      moduleTag: 'M2',
    },

    // Module 3: Clinical Desk & Teleconsult
    {
      id: 'clinical-desk',
      label: 'Consultation Room',
      icon: FolderHeart,
      roles: ['doctor', 'admin'],
      moduleTag: 'M3',
    },

    // Patient's own records & appointments
    {
      id: 'my-appointments',
      label: 'My Appointments',
      icon: Calendar,
      roles: ['patient'],
      moduleTag: 'M1',
    },
    {
      id: 'my-records',
      label: 'My Medical Records',
      icon: FileText,
      roles: ['patient'],
      moduleTag: 'M3/M9',
    },

    // Module 4: Lab & Diagnostics Vault
    {
      id: 'lab-reports',
      label: 'Lab & Diagnostics',
      icon: FlaskConical,
      roles: ['patient', 'doctor', 'admin'],
      moduleTag: 'M4',
    },

    // Module 5: Clinician Schedule & Leave Roster
    {
      id: 'schedules',
      label: 'Schedule & Roster',
      icon: Calendar,
      roles: ['doctor', 'admin'],
      moduleTag: 'M5',
    },

    // Module 6: Hospital Analytics & Workload
    {
      id: 'analytics',
      label: 'Analytics & Workload',
      icon: BarChart3,
      roles: ['admin'],
      moduleTag: 'M6',
    },

    // Module 8: Waiting-List & Conflict Diagnostics
    {
      id: 'waiting-list',
      label: 'Waiting List & Conflicts',
      icon: ListOrdered,
      roles: ['patient', 'doctor', 'admin'],
      moduleTag: 'M8',
    },

    // Module 9: Patient Management
    {
      id: 'patient-management',
      label: 'Patient Registry',
      icon: Users,
      roles: ['doctor', 'admin'],
      moduleTag: 'M9',
    },

    // Doctor Management (Admin)
    {
      id: 'doctor-management',
      label: 'Doctor Management',
      icon: Stethoscope,
      roles: ['admin'],
      moduleTag: 'M1',
    },

    // Master Appointment Manager (Admin)
    {
      id: 'appointment-management',
      label: 'Master Appointments',
      icon: Calendar,
      roles: ['admin'],
      moduleTag: 'M1/M8',
    },

    // Module 10: Notifications & Reminders
    {
      id: 'notifications',
      label: 'Notifications Hub',
      icon: Bell,
      roles: ['patient', 'doctor', 'admin'],
      moduleTag: 'M10',
    },

    // Module 7: Security & RBAC System Audit Trail
    {
      id: 'audit-logs',
      label: 'Security Audit Trail',
      icon: ShieldAlert,
      roles: ['admin'],
      moduleTag: 'M7',
    },

    // Module 11: Admin & System Settings
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      roles: ['admin'],
      moduleTag: 'M11',
    },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={`relative z-30 flex flex-col bg-slate-900 text-slate-300 transition-all duration-300 border-r border-slate-800 ${
        collapsed ? 'w-16' : 'w-64'
      } shrink-0 min-h-[calc(100vh-53px)]`}
    >
      {/* Role Indicator Banner */}
      <div className={`p-3 border-b border-slate-800 ${collapsed ? 'text-center' : 'px-4'}`}>
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                ACTIVE PORTAL
              </span>
              <div className="text-xs font-bold text-white capitalize flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                {role} Workspace
              </div>
            </div>
            <button
              onClick={onToggleCollapse}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="w-full flex justify-center text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-teal-600 text-white font-semibold shadow-xs shadow-teal-700/40'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-100'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'
                }`}
              />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between text-left truncate">
                  <span className="truncate">{item.label}</span>
                  <div className="flex items-center gap-1">
                    {item.moduleTag && !isActive && (
                      <span className="text-[9px] px-1 py-0.2 rounded-sm bg-slate-800 text-slate-400 font-mono">
                        {item.moduleTag}
                      </span>
                    )}
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-bold animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Public Landing Link & Reset Demo Data */}
      <div className="p-2 border-t border-slate-800 space-y-1">
        <button
          onClick={() => onNavigate('landing')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          title="Hospital Public Home & Services"
        >
          <Globe className="w-4 h-4 text-sky-400 shrink-0" />
          {!collapsed && <span>Public Landing Page</span>}
        </button>

        <button
          onClick={onResetData}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-amber-300 hover:bg-amber-950/20 transition-colors"
          title="Reset sample clinical data"
        >
          <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
          {!collapsed && <span>Reset Demo Data</span>}
        </button>

        {!collapsed && (
          <div className="px-3 py-2 mt-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-teal-300">
              <Sparkles className="w-3 h-3" /> Deterministic Engine
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-snug">
              Rules active: buffer checks, conflict diagnosis, & queue tokens.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
