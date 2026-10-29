import React, { useState } from 'react';
import { 
  HeartPulse, 
  Bell, 
  User as UserIcon, 
  ShieldCheck, 
  Stethoscope, 
  LogOut, 
  ChevronDown, 
  Sparkles,
  CalendarCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenBooking: () => void;
  onNavigate: (view: string) => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking, onNavigate }) => {
  const { user, role, switchRole, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleRoleChange = (newRole: UserRole) => {
    switchRole(newRole);
    setShowRoleMenu(false);
    // Navigate to appropriate default view
    if (newRole === 'patient') onNavigate('patient-dashboard');
    else if (newRole === 'doctor') onNavigate('doctor-dashboard');
    else onNavigate('admin-dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Brand */}
        <div 
          onClick={() => onNavigate(role === 'patient' ? 'patient-dashboard' : role === 'doctor' ? 'doctor-dashboard' : 'admin-dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-sky-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900">CarePulse</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-teal-100 text-teal-800 uppercase tracking-wider">HOSPITAL</span>
            </div>
            <p className="text-[11px] text-slate-600 hidden sm:block">Intelligent Patient & Clinical Operations</p>
          </div>
        </div>

        {/* Center / Quick actions */}
        <div className="hidden md:flex items-center gap-2">
          {role === 'patient' && (
            <button
              onClick={onOpenBooking}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs shadow-teal-600/20 transition-all hover:shadow-sm"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('queue')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/80 text-slate-700 text-xs font-medium transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Queue Board</span>
          </button>
        </div>

        {/* Right tools: Role Switcher, Notification Center, User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Quick Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowNotifMenu(false);
                setShowUserMenu(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-medium border border-slate-200/60 transition-colors"
              title="Switch user role for testing"
            >
              {role === 'patient' && <UserIcon className="w-3.5 h-3.5 text-teal-600" />}
              {role === 'doctor' && <Stethoscope className="w-3.5 h-3.5 text-sky-600" />}
              {role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />}
              <span className="capitalize font-semibold text-slate-800">{role}</span>
              <span className="text-[10px] text-slate-600 border-l border-slate-300 pl-1.5">Switch</span>
              <ChevronDown className="w-3 h-3 text-slate-600" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-100 p-1.5 z-50 text-xs animate-fade-in">
                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 border-b border-slate-100 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-teal-600" /> Select Active Persona
                </div>
                <button
                  onClick={() => handleRoleChange('patient')}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                    role === 'patient' ? 'bg-teal-50 text-teal-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-[10px]">P</div>
                    <div>
                      <div>Patient View</div>
                      <div className="text-[10px] text-slate-600 font-normal">Sarah Jenkins (Book & View)</div>
                    </div>
                  </div>
                  {role === 'patient' && <span className="text-teal-600 text-xs">●</span>}
                </button>

                <button
                  onClick={() => handleRoleChange('doctor')}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                    role === 'doctor' ? 'bg-sky-50 text-sky-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-[10px]">D</div>
                    <div>
                      <div>Doctor Desk</div>
                      <div className="text-[10px] text-slate-600 font-normal">Dr. Marcus Vance (Cardio)</div>
                    </div>
                  </div>
                  {role === 'doctor' && <span className="text-sky-600 text-xs">●</span>}
                </button>

                <button
                  onClick={() => handleRoleChange('admin')}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                    role === 'admin' ? 'bg-purple-50 text-purple-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px]">A</div>
                    <div>
                      <div>Hospital Administrator</div>
                      <div className="text-[10px] text-slate-600 font-normal">Alexander Cross (Full Control)</div>
                    </div>
                  </div>
                  {role === 'admin' && <span className="text-purple-600 text-xs">●</span>}
                </button>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowRoleMenu(false);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-xl border border-slate-100 p-2 z-50 animate-fade-in">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-teal-600" /> Notifications
                    {unreadCount > 0 && <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded-full">{unreadCount} new</span>}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 py-1">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-600">No notifications yet</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.link) onNavigate(n.link.replace('/', ''));
                          setShowNotifMenu(false);
                        }}
                        className={`p-3 hover:bg-slate-50 cursor-pointer rounded-lg transition-colors ${
                          !n.read ? 'bg-teal-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h6 className={`text-xs ${!n.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                            {n.title}
                          </h6>
                          <span className="text-[10px] text-slate-600 whitespace-nowrap">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      onNavigate('notifications');
                      setShowNotifMenu(false);
                    }}
                    className="text-xs text-teal-600 font-semibold hover:underline"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowRoleMenu(false);
                setShowNotifMenu(false);
              }}
              className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-teal-100 flex items-center justify-center">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-4 h-4 text-teal-700" />
                )}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">{user?.name || 'Account'}</div>
                <div className="text-[10px] text-slate-600 uppercase tracking-wider">{role}</div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-600 pr-1" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl border border-slate-100 p-1.5 z-50 text-xs animate-fade-in">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-800 truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-600 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    onNavigate('profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-600" /> Profile & Health Data
                </button>
                {role === 'admin' && (
                  <button
                    onClick={() => {
                      onNavigate('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-600" /> System Settings
                  </button>
                )}
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
